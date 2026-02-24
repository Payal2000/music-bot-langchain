import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'

export interface SpotifyDevice {
  id: string
  name: string
  type: string
  is_active: boolean
}

export interface PlayerState {
  devices: SpotifyDevice[]
  activeDeviceId: string | null
  isReady: boolean
  isPaused: boolean
  currentTrackId: string | null
  currentTrackName: string | null
  currentTrackArtist: string | null
  currentTrackImage: string | null
  positionMs: number
  durationMs: number
}

export interface SpotifyPlayerHook extends PlayerState {
  play: (spotifyUri: string) => Promise<void>
  togglePlay: () => void
  seek: (ms: number) => void
  previousTrack: () => void
  nextTrack: () => void
  selectDevice: (deviceId: string) => void
  refreshDevices: () => Promise<void>
}

const BASE = 'https://api.spotify.com/v1'

export function useSpotifyPlayer(): SpotifyPlayerHook {
  const { getValidToken } = useAuthStore()
  const playerRef = useRef<Spotify.Player | null>(null)
  const deviceIdRef = useRef<string | null>(null)
  const positionTimerRef = useRef<ReturnType<typeof setInterval>>()

  const [state, setState] = useState<PlayerState>({
    devices: [],
    activeDeviceId: null,
    isReady: false,
    isPaused: true,
    currentTrackId: null,
    currentTrackName: null,
    currentTrackArtist: null,
    currentTrackImage: null,
    positionMs: 0,
    durationMs: 0,
  })

  useEffect(() => {
    let player: Spotify.Player

    function initPlayer() {
      getValidToken().then((token) => {
        if (!token) return

        player = new window.Spotify.Player({
          name: 'MyVibe Player',
          getOAuthToken: async (cb) => {
            const t = await getValidToken()
            if (t) cb(t)
          },
          volume: 0.8,
        })

        player.addListener('ready', ({ device_id }) => {
          deviceIdRef.current = device_id
          setState((s) => ({ ...s, isReady: true, activeDeviceId: device_id }))
        })

        player.addListener('not_ready', () => {
          setState((s) => ({ ...s, isReady: false }))
        })

        player.addListener('player_state_changed', (ps) => {
          if (!ps) return
          const track = ps.track_window?.current_track
          setState((s) => ({
            ...s,
            isPaused: ps.paused,
            positionMs: ps.position,
            durationMs: ps.duration,
            currentTrackId: track?.id ?? null,
            currentTrackName: track?.name ?? null,
            currentTrackArtist: track?.artists?.[0]?.name ?? null,
            currentTrackImage: track?.album?.images?.[0]?.url ?? null,
          }))
        })

        player.addListener('initialization_error', ({ message }) => console.error('Init error:', message))
        player.addListener('authentication_error', ({ message }) => console.error('Auth error:', message))
        player.addListener('account_error', ({ message }) => {
          console.error('Account error:', message)
          alert('Spotify Premium is required for playback.')
        })

        player.connect()
        playerRef.current = player
      })
    }

    if (window.Spotify) {
      initPlayer()
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer
    }

    // Tick position forward every second when playing
    positionTimerRef.current = setInterval(() => {
      setState((s) => {
        if (!s.isPaused && s.positionMs < s.durationMs) {
          return { ...s, positionMs: Math.min(s.positionMs + 1000, s.durationMs) }
        }
        return s
      })
    }, 1000)

    return () => {
      clearInterval(positionTimerRef.current)
      playerRef.current?.disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function apiCall(endpoint: string, method = 'PUT', body?: object) {
    const token = await getValidToken()
    if (!token) return
    const res = await fetch(`${BASE}${endpoint}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}))
      console.error('Spotify API error', res.status, err)
      if (res.status === 403) alert('Playback failed: Spotify Premium is required.')
      else if (res.status === 404) alert('No active Spotify device found. Open Spotify on your phone or desktop first.')
      else if (res.status === 401) alert('Session expired. Please log out and back in.')
    }
  }

  async function play(spotifyUri: string) {
    const deviceId = deviceIdRef.current
    if (!deviceId) {
      alert('Player not ready yet. Wait a moment and try again.')
      return
    }
    await apiCall(`/me/player/play?device_id=${deviceId}`, 'PUT', { uris: [spotifyUri] })
  }

  function togglePlay() {
    playerRef.current?.togglePlay()
  }

  function seek(ms: number) {
    playerRef.current?.seek(Math.floor(ms))
  }

  function previousTrack() {
    playerRef.current?.previousTrack()
  }

  function nextTrack() {
    playerRef.current?.nextTrack()
  }

  function selectDevice(_deviceId: string) {
    // SDK manages its own device; no-op for external devices
  }

  async function refreshDevices() {
    // Not needed for SDK — the SDK registers itself as a device automatically
  }

  return {
    ...state,
    play,
    togglePlay,
    seek,
    previousTrack,
    nextTrack,
    selectDevice,
    refreshDevices,
  }
}

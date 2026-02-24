import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

export interface PlayerState {
  deviceId: string | null
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
}


export function useSpotifyPlayer(): SpotifyPlayerHook {
  const { getValidToken } = useAuthStore()
  const playerRef = useRef<Spotify.Player | null>(null)
  const [state, setState] = useState<PlayerState>({
    deviceId: null,
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
    let active = true

    function initPlayer() {
      if (!active) return
      const player = new window.Spotify.Player({
        name: 'MyVibe Player',
        getOAuthToken: async (cb) => {
          const token = await getValidToken()
          if (token) cb(token)
        },
        volume: 0.7,
      })

      player.addListener('ready', (data) => {
        const { device_id } = data as { device_id: string }
        setState((s) => ({ ...s, deviceId: device_id, isReady: true }))
      })

      player.addListener('not_ready', () => {
        setState((s) => ({ ...s, isReady: false }))
      })

      player.addListener('player_state_changed', (data) => {
        if (!data) return
        const ps = data as {
          paused: boolean
          position: number
          duration: number
          track_window: {
            current_track: {
              id: string
              name: string
              artists: Array<{ name: string }>
              album: { images: Array<{ url: string }> }
            }
          }
        }
        const track = ps.track_window.current_track
        setState((s) => ({
          ...s,
          isPaused: ps.paused,
          positionMs: ps.position,
          durationMs: ps.duration,
          currentTrackId: track.id,
          currentTrackName: track.name,
          currentTrackArtist: track.artists[0]?.name ?? '',
          currentTrackImage: track.album.images[0]?.url ?? null,
        }))
      })

      player.connect()
      playerRef.current = player
    }

    if (window.Spotify) {
      initPlayer()
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer
    }

    return () => {
      active = false
      playerRef.current?.disconnect()
      playerRef.current = null
    }
  }, [getValidToken])

  async function play(spotifyUri: string) {
    const { deviceId } = state
    if (!deviceId) {
      alert('Player not ready yet. Wait a moment and try again.')
      return
    }
    const token = await getValidToken()
    if (!token) return
    const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [spotifyUri] }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Spotify play error:', res.status, err)
      if (res.status === 403) alert('Playback failed: Make sure you have Spotify Premium.')
      else if (res.status === 401) alert('Session expired. Please log out and log back in.')
      else alert(`Playback error ${res.status}. Check the browser console for details.`)
    }
  }

  function togglePlay() {
    playerRef.current?.togglePlay()
  }

  function seek(ms: number) {
    playerRef.current?.seek(ms)
  }

  function previousTrack() {
    playerRef.current?.previousTrack()
  }

  function nextTrack() {
    playerRef.current?.nextTrack()
  }

  return { ...state, play, togglePlay, seek, previousTrack, nextTrack }
}

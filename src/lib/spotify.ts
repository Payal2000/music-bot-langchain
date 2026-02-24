import type { SpotifyArtist, SpotifyTrack } from '../types/spotify'

const BASE = 'https://api.spotify.com/v1'

async function spotifyFetch<T>(
  endpoint: string,
  token: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE}${endpoint}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Spotify API error ${res.status}`)
  return res.json()
}

export interface CombinedSearchResult {
  artists: SpotifyArtist[]
  tracks: SpotifyTrack[]
}

export async function searchAll(
  query: string,
  token: string
): Promise<CombinedSearchResult> {
  const data = await spotifyFetch<{
    artists: { items: SpotifyArtist[] }
    tracks: { items: SpotifyTrack[] }
  }>('/search', token, {
    q: query,
    type: 'artist,track',
    limit: '5',
  })
  return {
    artists: data.artists.items.filter((a) => a.images.length > 0).slice(0, 4),
    tracks: data.tracks.items.filter((t) => t.album.images.length > 0).slice(0, 5),
  }
}

export async function getArtistTopTracks(
  artistId: string,
  token: string,
  market = 'US'
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ tracks: SpotifyTrack[] }>(
    `/artists/${artistId}/top-tracks`,
    token,
    { market }
  )
  return data.tracks
}

export async function getArtist(artistId: string, token: string): Promise<SpotifyArtist> {
  return spotifyFetch<SpotifyArtist>(`/artists/${artistId}`, token)
}

export function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

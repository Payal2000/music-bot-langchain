export interface SpotifyImage {
  url: string
  height: number
  width: number
}

export interface SpotifyArtist {
  id: string
  name: string
  images: SpotifyImage[]
  genres: string[]
  followers: { total: number }
  popularity: number
  external_urls: { spotify: string }
}

export interface SpotifyTrack {
  id: string
  name: string
  duration_ms: number
  preview_url: string | null
  explicit: boolean
  popularity: number
  album: {
    id: string
    name: string
    images: SpotifyImage[]
    release_date: string
  }
  artists: Array<{ id: string; name: string }>
  external_urls: { spotify: string }
}

export interface SpotifySearchResult {
  artists: {
    items: SpotifyArtist[]
    total: number
  }
  tracks?: {
    items: SpotifyTrack[]
    total: number
  }
}

export type ReactionType = 'like' | 'dislike'

export interface RatedTrack {
  track: SpotifyTrack
  artist: SpotifyArtist
  reaction: ReactionType
  ratedAt: number
}

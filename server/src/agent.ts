import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'

interface CuratorInput {
  likedTrackIds: string[]
  topGenres: string[]
  topArtists: string[]
  topArtistIds: string[]
  ratedTrackIds: string[]
  spotifyToken: string
}

interface SpotifyTrackRaw {
  id: string
  name: string
  artists: Array<{ id: string; name: string }>
  album: {
    id: string
    name: string
    release_date: string
    images: Array<{ url: string; width: number; height: number }>
  }
  duration_ms: number
  popularity: number
  external_urls: { spotify: string }
  preview_url: string | null
}

async function searchArtists(query: string, token: string): Promise<Array<{ id: string; name: string }>> {
  const params = new URLSearchParams({ q: query, type: 'artist', limit: '3' })
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  const data = await res.json() as { artists: { items: Array<{ id: string; name: string }> } }
  return data.artists?.items ?? []
}

async function getArtistTopTracks(artistId: string, token: string): Promise<SpotifyTrackRaw[]> {
  const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  const data = await res.json() as { tracks: SpotifyTrackRaw[] }
  return data.tracks ?? []
}

const ArtistQueriesSchema = z.object({
  queries: z.array(z.string()).describe('6-8 artist search queries to discover new music similar to the user taste'),
  reasoning: z.string(),
})

export async function runCuratorAgent(input: CuratorInput): Promise<SpotifyTrackRaw[]> {
  const { topGenres, topArtists, ratedTrackIds, spotifyToken } = input
  const ratedSet = new Set(ratedTrackIds)

  // Step 1: Use LLM to generate artist search queries based on taste
  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
  })

  const llmWithSchema = llm.withStructuredOutput(ArtistQueriesSchema)
  const result = await llmWithSchema.invoke([
    {
      role: 'system',
      content: `You are a music curator. Given a user's taste profile, suggest 6-8 artist names to search on Spotify to discover similar music they haven't heard.
Include a mix of:
- Artists very similar to their favourites
- Artists in the same genre but less mainstream
- One or two wild cards in adjacent genres
Do NOT include the user's existing favourite artists.`,
    },
    {
      role: 'user',
      content: `Favourite artists: ${topArtists.join(', ') || 'unknown'}\nTop genres: ${topGenres.join(', ') || 'unknown'}\n\nSuggest artists to discover.`,
    },
  ])

  console.log('LLM reasoning:', result.reasoning)
  console.log('Artist queries:', result.queries)

  // Step 2: Search Spotify for those artists
  const artistSearchResults = await Promise.all(
    result.queries.map((q) => searchArtists(q, spotifyToken))
  )

  // Flatten + deduplicate artists, excluding already-known ones
  const knownArtistNames = new Set(topArtists.map((a) => a.toLowerCase()))
  const seenIds = new Set<string>()
  const discoveredArtists: Array<{ id: string; name: string }> = []

  for (const artists of artistSearchResults) {
    for (const a of artists) {
      if (!seenIds.has(a.id) && !knownArtistNames.has(a.name.toLowerCase())) {
        seenIds.add(a.id)
        discoveredArtists.push(a)
      }
    }
  }

  console.log(`Discovered ${discoveredArtists.length} artists:`, discoveredArtists.map((a) => a.name))

  if (discoveredArtists.length === 0) return []

  // Step 3: Fetch top tracks from discovered artists
  const trackResults = await Promise.all(
    discoveredArtists.slice(0, 10).map((a) => getArtistTopTracks(a.id, spotifyToken))
  )

  // Flatten, deduplicate, filter already-rated
  const seen = new Set<string>()
  const tracks: SpotifyTrackRaw[] = []
  for (const artistTracks of trackResults) {
    for (const t of artistTracks) {
      if (!seen.has(t.id) && !ratedSet.has(t.id)) {
        seen.add(t.id)
        tracks.push({
          id: t.id,
          name: t.name,
          artists: t.artists,
          album: t.album,
          duration_ms: t.duration_ms,
          popularity: t.popularity,
          external_urls: t.external_urls,
          preview_url: t.preview_url,
        })
      }
    }
  }

  // Sort by popularity, return top 20
  tracks.sort((a, b) => b.popularity - a.popularity)
  const final = tracks.slice(0, 20)
  console.log(`Curated ${final.length} tracks`)
  return final
}

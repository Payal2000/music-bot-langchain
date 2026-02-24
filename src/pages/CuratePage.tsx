import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Music2, AlertCircle, ChevronRight, Wand2 } from 'lucide-react'
import { useVibeStore } from '../store/useVibeStore'
import { useAuthStore } from '../store/useAuthStore'
import type { SpotifyTrack } from '../types/spotify'

export default function CuratePage() {
  const navigate = useNavigate()
  const { getLiked, getTopGenres, getTopArtists, ratings, setCurrentTracks, setCurrentArtist, setLoadingTracks } = useVibeStore()
  const { getValidToken } = useAuthStore()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [trackCount, setTrackCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const liked = getLiked()
  const topGenres = getTopGenres()
  const topArtists = getTopArtists()
  const hasEnoughData = liked.length >= 3

  async function handleCurate() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const token = await getValidToken()
      if (!token) throw new Error('Not authenticated')

      // Build unique artist IDs from liked ratings (preserving top-artist order)
      const artistIdMap: Record<string, string> = {}
      liked.forEach((r) => { artistIdMap[r.artist.name] = r.artist.id })
      const topArtistIds = topArtists.slice(0, 5).map((a) => artistIdMap[a.name]).filter(Boolean)

      const body = {
        spotifyToken: token,
        likedTrackIds: liked.map((r) => r.track.id),
        topGenres: topGenres.slice(0, 5).map((g) => g.genre),
        topArtists: topArtists.slice(0, 5).map((a) => a.name),
        topArtistIds,
        ratedTrackIds: ratings.map((r) => r.track.id),
      }

      const res = await fetch('/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)

      const { tracks } = await res.json() as { tracks: SpotifyTrack[] }

      if (!tracks?.length) throw new Error('Agent returned no tracks')

      // Build a synthetic artist from the first track for the swipe feed
      const firstTrack = tracks[0]
      const syntheticArtist = {
        id: firstTrack.artists[0].id,
        name: 'AI Curated',
        genres: topGenres.map((g) => g.genre),
        images: firstTrack.album.images,
        followers: { total: 0 },
        external_urls: { spotify: '' },
        popularity: 0,
      }

      setLoadingTracks(true)
      setCurrentArtist(syntheticArtist)
      setCurrentTracks(tracks)
      setLoadingTracks(false)
      setTrackCount(tracks.length)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  function goExplore() {
    navigate('/search')
  }

  return (
    <div className="min-h-screen bg-vinyl-bg md:pl-56">
      <div className="sticky top-0 z-30 bg-vinyl-bg/90 backdrop-blur border-b border-vinyl-border px-6 py-4">
        <h1 className="font-display font-black text-vinyl-text text-2xl">AI Curator</h1>
        <p className="font-body text-vinyl-muted text-sm">Powered by Claude + LangChain</p>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10 pb-28 md:pb-12 space-y-6">

        {/* Taste summary */}
        <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5 space-y-4">
          <p className="font-mono text-vinyl-muted text-xs uppercase tracking-widest">Your Taste Profile</p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-vinyl-surface rounded-lg p-3">
              <p className="font-display font-bold text-vinyl-gold text-2xl">{liked.length}</p>
              <p className="font-body text-vinyl-muted text-xs mt-0.5">liked tracks</p>
            </div>
            <div className="bg-vinyl-surface rounded-lg p-3">
              <p className="font-display font-bold text-vinyl-gold text-2xl">{topGenres.length}</p>
              <p className="font-body text-vinyl-muted text-xs mt-0.5">genres</p>
            </div>
            <div className="bg-vinyl-surface rounded-lg p-3">
              <p className="font-display font-bold text-vinyl-gold text-2xl">{topArtists.length}</p>
              <p className="font-body text-vinyl-muted text-xs mt-0.5">artists</p>
            </div>
          </div>

          {topGenres.length > 0 && (
            <div>
              <p className="font-body text-vinyl-muted text-xs mb-2">Top genres</p>
              <div className="flex flex-wrap gap-2">
                {topGenres.slice(0, 5).map((g) => (
                  <span key={g.genre} className="font-body text-vinyl-text text-xs px-2.5 py-1 bg-vinyl-surface rounded-full border border-vinyl-border capitalize">
                    {g.genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Not enough data warning */}
        {!hasEnoughData && (
          <div className="flex items-start gap-3 bg-vinyl-amber/5 border border-vinyl-amber/20 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-vinyl-amber flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-vinyl-text text-sm font-medium">Need more data</p>
              <p className="font-body text-vinyl-muted text-xs mt-0.5">
                Like at least 3 tracks in Explore first so the agent can understand your taste.
              </p>
            </div>
          </div>
        )}

        {/* Curate button */}
        {status === 'idle' || status === 'error' ? (
          <button
            onClick={handleCurate}
            disabled={!hasEnoughData}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-vinyl-gold text-vinyl-bg font-display font-bold text-lg hover:bg-vinyl-amber transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Wand2 className="w-5 h-5" />
            Curate for me
          </button>
        ) : null}

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center py-10 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-vinyl-gold/20" />
              <div className="absolute inset-0 rounded-full border-2 border-vinyl-gold border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-vinyl-gold" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-body text-vinyl-text text-sm font-medium">Agent is curating…</p>
              <p className="font-body text-vinyl-muted text-xs mt-1">Analysing your taste + calling Spotify</p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex items-start gap-3 bg-vinyl-rose/5 border border-vinyl-rose/20 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-vinyl-rose flex-shrink-0 mt-0.5" />
            <p className="font-body text-vinyl-rose text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Done */}
        {status === 'done' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-8 gap-3 bg-vinyl-card border border-vinyl-border rounded-xl">
              <div className="w-14 h-14 rounded-full bg-vinyl-gold/10 border border-vinyl-gold/30 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-vinyl-gold" />
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-vinyl-text text-xl">Ready!</p>
                <p className="font-body text-vinyl-muted text-sm mt-1">
                  {trackCount} tracks curated just for you
                </p>
              </div>
            </div>

            <button
              onClick={goExplore}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-vinyl-gold text-vinyl-bg font-display font-bold text-lg hover:bg-vinyl-amber transition-all"
            >
              Start swiping
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleCurate}
              className="w-full py-3 rounded-xl border border-vinyl-border font-body text-vinyl-muted text-sm hover:text-vinyl-text hover:border-vinyl-muted transition-all"
            >
              Curate again
            </button>
          </div>
        )}

        {/* How it works */}
        {status === 'idle' && (
          <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5 space-y-3">
            <p className="font-mono text-vinyl-muted text-xs uppercase tracking-widest">How it works</p>
            {[
              'Claude reads your liked tracks, genres & artists',
              'It reasons about your taste and picks the best Spotify seeds',
              'Spotify returns 20 fresh recommendations',
              'You get a curated swipe feed just for you',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-mono text-vinyl-gold text-xs w-4 flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="font-body text-vinyl-muted text-sm">{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

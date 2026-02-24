import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Users, Music2 } from 'lucide-react'
import { searchArtists, searchTracks, getArtistTopTracks, formatFollowers, formatDuration } from '../lib/spotify'
import { useAuthStore } from '../store/useAuthStore'
import { useVibeStore } from '../store/useVibeStore'
import { usePlayer } from '../context/PlayerContext'
import type { SpotifyArtist, SpotifyTrack } from '../types/spotify'
import clsx from 'clsx'

export default function ArtistSearch() {
  const [query, setQuery] = useState('')
  const [artists, setArtists] = useState<SpotifyArtist[]>([])
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const { getValidToken } = useAuthStore()
  const { setCurrentArtist, setCurrentTracks, setLoadingTracks } = useVibeStore()
  const { play } = usePlayer()

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) { setArtists([]); setTracks([]); return }
      setLoading(true)
      setError('')
      try {
        const token = await getValidToken()
        if (!token) throw new Error('Not authenticated')
        const [artistResults, trackResults] = await Promise.all([
          searchArtists(q, token, 5),
          searchTracks(q, token, 5),
        ])
        setArtists(artistResults.filter((a) => a.images.length > 0))
        setTracks(trackResults)
      } catch {
        setError('Search failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [getValidToken]
  )

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 350)
    return () => clearTimeout(debounceRef.current)
  }, [query, doSearch])

  function closeDropdown() {
    setArtists([])
    setTracks([])
    setQuery('')
  }

  async function selectArtist(artist: SpotifyArtist) {
    closeDropdown()
    setCurrentArtist(artist)
    setLoadingTracks(true)
    try {
      const token = await getValidToken()
      if (!token) return
      const topTracks = await getArtistTopTracks(artist.id, token)
      setCurrentTracks(topTracks)
    } catch {
      setError('Could not load tracks.')
    } finally {
      setLoadingTracks(false)
    }
  }

  async function selectTrack(track: SpotifyTrack) {
    closeDropdown()
    await play(`spotify:track:${track.id}`)
  }

  const hasResults = artists.length > 0 || tracks.length > 0

  return (
    <div className="relative w-full max-w-xl">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vinyl-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists or songs…"
          className="w-full bg-vinyl-card border border-vinyl-border rounded-xl pl-11 pr-10 py-3.5 font-body text-vinyl-text text-sm placeholder-vinyl-muted/60 focus:outline-none focus:border-vinyl-gold/50 focus:ring-1 focus:ring-vinyl-gold/20 transition-all"
        />
        {query && !loading && (
          <button
            onClick={closeDropdown}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-vinyl-muted hover:text-vinyl-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-vinyl-gold border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {hasResults && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-vinyl-card border border-vinyl-border rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/60">

          {/* Artists section */}
          {artists.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-vinyl-border/40">
                <span className="font-mono text-vinyl-muted text-xs uppercase tracking-widest">Artists</span>
              </div>
              {artists.map((artist, i) => (
                <button
                  key={artist.id}
                  onClick={() => selectArtist(artist)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 hover:bg-vinyl-surface transition-colors duration-150 text-left',
                    i !== 0 && 'border-t border-vinyl-border/30'
                  )}
                >
                  <img
                    src={artist.images[artist.images.length - 1]?.url}
                    alt={artist.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-vinyl-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-vinyl-text text-sm truncate">{artist.name}</p>
                    <p className="font-body text-vinyl-muted text-xs truncate">
                      {artist.genres.slice(0, 2).join(', ') || 'Artist'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-vinyl-muted flex-shrink-0">
                    <Users className="w-3 h-3" />
                    <span className="font-mono text-xs">{formatFollowers(artist.followers.total)}</span>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Tracks section */}
          {tracks.length > 0 && (
            <>
              <div className={clsx('px-4 py-2 border-b border-vinyl-border/40', artists.length > 0 && 'border-t border-vinyl-border')}>
                <span className="font-mono text-vinyl-muted text-xs uppercase tracking-widest">Songs</span>
              </div>
              {tracks.map((track, i) => (
                <button
                  key={track.id}
                  onClick={() => selectTrack(track)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 hover:bg-vinyl-surface transition-colors duration-150 text-left',
                    i !== 0 && 'border-t border-vinyl-border/30'
                  )}
                >
                  {track.album.images[track.album.images.length - 1]?.url ? (
                    <img
                      src={track.album.images[track.album.images.length - 1].url}
                      alt={track.name}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-vinyl-border"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-vinyl-surface flex items-center justify-center flex-shrink-0 border border-vinyl-border">
                      <Music2 className="w-4 h-4 text-vinyl-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-vinyl-text text-sm truncate">{track.name}</p>
                    <p className="font-body text-vinyl-muted text-xs truncate">{track.artists[0]?.name}</p>
                  </div>
                  <span className="font-mono text-vinyl-muted text-xs flex-shrink-0">{formatDuration(track.duration_ms)}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {error && <p className="mt-2 font-body text-vinyl-rose text-xs">{error}</p>}
    </div>
  )
}

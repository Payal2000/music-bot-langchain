import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Users, Music, Mic2 } from 'lucide-react'
import { searchAll, formatFollowers, formatDuration } from '../lib/spotify'
import { useAuthStore } from '../store/useAuthStore'
import { useVibeStore } from '../store/useVibeStore'
import { getArtistTopTracks } from '../lib/spotify'
import type { SpotifyArtist, SpotifyTrack } from '../types/spotify'
import { usePlayer } from '../context/PlayerContext'
import clsx from 'clsx'

export default function ArtistSearch() {
  const [query, setQuery] = useState('')
  const [artists, setArtists] = useState<SpotifyArtist[]>([])
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)
  const { getValidToken } = useAuthStore()
  const { setCurrentArtist, setCurrentTracks, setLoadingTracks } = useVibeStore()
  const player = usePlayer()

  const hasResults = (artists.length > 0 || tracks.length > 0) && focused
  const flatItems = [
    ...artists.map((a) => ({ type: 'artist' as const, data: a })),
    ...tracks.map((t) => ({ type: 'track' as const, data: t })),
  ]

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setArtists([]); setTracks([]); return }
    setLoading(true)
    setError('')
    try {
      const token = await getValidToken()
      if (!token) throw new Error('Not authenticated')
      const res = await searchAll(q, token)
      setArtists(res.artists)
      setTracks(res.tracks)
      setActiveIdx(-1)
    } catch {
      setError('Search failed. Try again.')
    } finally {
      setLoading(false)
    }
  }, [getValidToken])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 320)
    return () => clearTimeout(debounceRef.current)
  }, [query, doSearch])

  async function selectArtist(artist: SpotifyArtist) {
    setQuery(''); setArtists([]); setTracks([]); setFocused(false)
    setCurrentArtist(artist)
    setLoadingTracks(true)
    try {
      const token = await getValidToken()
      if (!token) return
      const t = await getArtistTopTracks(artist.id, token)
      setCurrentTracks(t)
    } catch {
      setError('Could not load tracks.')
    } finally {
      setLoadingTracks(false)
    }
  }

  async function selectTrack(track: SpotifyTrack) {
    setQuery(''); setArtists([]); setTracks([]); setFocused(false)
    await player.play(`spotify:track:${track.id}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!hasResults) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      const item = flatItems[activeIdx]
      if (item.type === 'artist') selectArtist(item.data as SpotifyArtist)
      else selectTrack(item.data as SpotifyTrack)
    } else if (e.key === 'Escape') {
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vinyl-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setFocused(true) }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search artists, songs, bands…"
          autoComplete="off"
          className="w-full bg-vinyl-card border border-vinyl-border rounded-xl pl-11 pr-10 py-3.5 font-body text-vinyl-text text-sm placeholder-vinyl-muted/60 focus:outline-none focus:border-vinyl-gold/50 focus:ring-1 focus:ring-vinyl-gold/20 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); setArtists([]); setTracks([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-vinyl-muted hover:text-vinyl-text">
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-vinyl-gold border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {hasResults && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-vinyl-card border border-vinyl-border rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/60 max-h-[440px] overflow-y-auto">

          {artists.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-vinyl-surface/50 sticky top-0">
                <Mic2 className="w-3 h-3 text-vinyl-muted" />
                <span className="font-mono text-vinyl-muted text-xs uppercase tracking-widest">Artists</span>
              </div>
              {artists.map((artist, i) => (
                <button
                  key={artist.id}
                  onMouseDown={() => selectArtist(artist)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 text-left border-b border-vinyl-border/30 transition-colors',
                    activeIdx === i ? 'bg-vinyl-gold/10' : 'hover:bg-vinyl-surface'
                  )}
                >
                  <img src={artist.images[artist.images.length - 1]?.url} alt={artist.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-vinyl-border" />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-vinyl-text text-sm truncate">{artist.name}</p>
                    <p className="font-body text-vinyl-muted text-xs truncate">{artist.genres.slice(0, 2).join(', ') || 'Artist'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-vinyl-muted flex-shrink-0">
                    <Users className="w-3 h-3" />
                    <span className="font-mono text-xs">{formatFollowers(artist.followers.total)}</span>
                  </div>
                </button>
              ))}
            </>
          )}

          {tracks.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-vinyl-surface/50 sticky top-0">
                <Music className="w-3 h-3 text-vinyl-muted" />
                <span className="font-mono text-vinyl-muted text-xs uppercase tracking-widest">Songs — click to play instantly</span>
              </div>
              {tracks.map((track, i) => {
                const gIdx = artists.length + i
                return (
                  <button
                    key={track.id}
                    onMouseDown={() => selectTrack(track)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 text-left border-b border-vinyl-border/30 last:border-0 transition-colors',
                      activeIdx === gIdx ? 'bg-vinyl-gold/10' : 'hover:bg-vinyl-surface'
                    )}
                  >
                    <img src={track.album.images[track.album.images.length - 1]?.url} alt={track.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-vinyl-border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-vinyl-text text-sm truncate">{track.name}</p>
                      <p className="font-body text-vinyl-muted text-xs truncate">{track.artists.map(a => a.name).join(', ')}</p>
                    </div>
                    <span className="font-mono text-vinyl-muted text-xs flex-shrink-0">{formatDuration(track.duration_ms)}</span>
                  </button>
                )
              })}
            </>
          )}
        </div>
      )}

      {error && <p className="mt-2 font-body text-vinyl-rose text-xs">{error}</p>}
    </div>
  )
}

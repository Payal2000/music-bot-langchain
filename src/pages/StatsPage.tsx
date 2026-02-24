import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts'
import { Heart, X, Music2, TrendingUp, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useVibeStore } from '../store/useVibeStore'
import { usePlayer } from '../context/PlayerContext'
import { useAuthStore } from '../store/useAuthStore'
import { getArtistTopTracks } from '../lib/spotify'
import type { SpotifyArtist } from '../types/spotify'

const GENRE_COLORS = ['#C8A876', '#E8833A', '#E84A6F', '#3ABFBF', '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981']

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-vinyl-card border border-vinyl-border rounded-lg px-3 py-1.5 shadow-xl">
      <p className="font-body text-vinyl-text text-xs">{payload[0].name}: <span className="font-bold text-vinyl-gold">{payload[0].value}</span></p>
    </div>
  )
}

export default function StatsPage() {
  const navigate = useNavigate()
  const { play, currentTrackId, isPaused } = usePlayer()
  const { getValidToken } = useAuthStore()
  const { getLiked, getDisliked, getTopGenres, getTopArtists, ratings, setCurrentArtist, setCurrentTracks, setLoadingTracks } = useVibeStore()

  const liked = getLiked()
  const disliked = getDisliked()
  const topGenres = getTopGenres()
  const topArtists = getTopArtists()
  const total = ratings.length
  const likedPct = total > 0 ? Math.round((liked.length / total) * 100) : 0

  const pieData = [
    { name: 'Liked', value: liked.length },
    { name: 'Skipped', value: disliked.length },
  ]

  const artistById: Record<string, SpotifyArtist> = {}
  liked.forEach((r) => { artistById[r.artist.name] = r.artist })

  async function handleArtistClick(artistName: string) {
    const artist = artistById[artistName]
    if (!artist) return
    setCurrentArtist(artist)
    setLoadingTracks(true)
    navigate('/search')
    try {
      const token = await getValidToken()
      if (!token) return
      const tracks = await getArtistTopTracks(artist.id, token)
      setCurrentTracks(tracks)
    } catch { /* ignore */ } finally {
      setLoadingTracks(false)
    }
  }

  if (total === 0) {
    return (
      <div className="min-h-screen bg-vinyl-bg md:pl-56 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-vinyl-card border border-vinyl-border flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-vinyl-muted" />
          </div>
          <h2 className="font-display font-bold text-vinyl-text text-2xl mb-2">No data yet</h2>
          <p className="font-body text-vinyl-muted text-sm max-w-xs mx-auto">
            Head to Explore and start rating tracks to see your taste stats.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vinyl-bg md:pl-56">
      <div className="sticky top-0 z-30 bg-vinyl-bg/90 backdrop-blur border-b border-vinyl-border px-6 py-4">
        <h1 className="font-display font-black text-vinyl-text text-2xl">Your Stats</h1>
        <p className="font-body text-vinyl-muted text-sm">{total} tracks rated</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 pb-28 md:pb-12 space-y-5">

        {/* Row 1 — summary + pie side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Summary stacked */}
          <div className="flex flex-col gap-4">
            <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-4 flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-lg bg-vinyl-gold/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-vinyl-gold" />
              </div>
              <div>
                <p className="font-body text-vinyl-muted text-xs">Liked</p>
                <p className="font-display font-bold text-vinyl-text text-2xl leading-tight">{liked.length}</p>
                <p className="font-body text-vinyl-muted/60 text-xs">{likedPct}% of rated</p>
              </div>
            </div>
            <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-4 flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-lg bg-vinyl-rose/10 flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4 text-vinyl-rose" />
              </div>
              <div>
                <p className="font-body text-vinyl-muted text-xs">Skipped</p>
                <p className="font-display font-bold text-vinyl-text text-2xl leading-tight">{disliked.length}</p>
                <p className="font-body text-vinyl-muted/60 text-xs">{100 - likedPct}% of rated</p>
              </div>
            </div>
          </div>

          {/* Vibe ratio donut */}
          <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-4 flex flex-col items-center justify-center">
            <p className="font-mono text-vinyl-muted text-xs uppercase tracking-widest mb-3">Vibe Ratio</p>
            <div className="relative">
              <PieChart width={120} height={120}>
                <Pie data={pieData} cx={55} cy={55} innerRadius={36} outerRadius={52} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  <Cell fill="#C8A876" />
                  <Cell fill="#E84A6F" />
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display font-black text-vinyl-gold text-lg leading-none">{likedPct}%</p>
                  <p className="font-body text-vinyl-muted text-xs">liked</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? '#C8A876' : '#E84A6F' }} />
                  <span className="font-body text-vinyl-muted text-xs">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Genres — custom bars */}
        {topGenres.length > 0 && (
          <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5">
            <p className="font-mono text-vinyl-muted text-xs uppercase tracking-widest mb-4">Top Genres</p>
            <div className="space-y-3">
              {topGenres.map((g, i) => (
                <div key={g.genre} className="flex items-center gap-3">
                  <span className="font-body text-vinyl-muted text-xs w-4 flex-shrink-0 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-vinyl-text text-sm truncate capitalize">{g.genre}</span>
                      <span className="font-mono text-vinyl-muted text-xs ml-2 flex-shrink-0">{g.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-vinyl-faint overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(g.count / topGenres[0].count) * 100}%`,
                          background: GENRE_COLORS[i % GENRE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5">
            <p className="font-mono text-vinyl-muted text-xs uppercase tracking-widest mb-4">Favourite Artists</p>
            <div className="space-y-1">
              {topArtists.map((a, i) => (
                <button
                  key={a.name}
                  onClick={() => handleArtistClick(a.name)}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-vinyl-surface transition-colors group"
                >
                  <span className="font-mono text-vinyl-muted/60 text-xs w-4 text-right flex-shrink-0">{i + 1}</span>
                  {a.image ? (
                    <img src={a.image} alt={a.name} className="w-9 h-9 rounded-full object-cover border border-vinyl-border flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-vinyl-surface flex items-center justify-center flex-shrink-0 border border-vinyl-border">
                      <Music2 className="w-4 h-4 text-vinyl-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-body text-vinyl-text text-sm truncate group-hover:text-vinyl-gold transition-colors">{a.name}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-vinyl-faint overflow-hidden">
                      <div
                        className="h-full rounded-full bg-vinyl-gold/60 group-hover:bg-vinyl-gold transition-all duration-500"
                        style={{ width: `${(a.count / topArtists[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-vinyl-gold text-xs flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    {a.count} {a.count === 1 ? 'track' : 'tracks'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recently Liked */}
        {liked.length > 0 && (
          <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-vinyl-muted text-xs uppercase tracking-widest">Recently Liked</p>
              <span className="font-mono text-vinyl-muted/50 text-xs">{liked.length} tracks</span>
            </div>
            <div className="space-y-1">
              {liked.slice().reverse().map((r, i) => {
                const isPlaying = currentTrackId === r.track.id && !isPaused
                return (
                  <button
                    key={r.track.id + i}
                    onClick={() => play(`spotify:track:${r.track.id}`)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-vinyl-surface transition-colors group"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={r.track.album.images[r.track.album.images.length - 1]?.url}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover border border-vinyl-border"
                      />
                      <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`font-body text-sm truncate transition-colors ${isPlaying ? 'text-vinyl-gold' : 'text-vinyl-text group-hover:text-vinyl-gold'}`}>
                        {r.track.name}
                      </p>
                      <p className="font-body text-vinyl-muted text-xs truncate">{r.artist.name}</p>
                    </div>
                    {isPlaying ? (
                      <div className="flex items-end gap-0.5 h-4 flex-shrink-0">
                        {[0, 150, 75].map((d, j) => (
                          <div key={j} className="w-0.5 rounded-full bg-vinyl-gold" style={{ height: '4px', animation: `wave 0.8s ease-in-out infinite`, animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    ) : (
                      <Heart className="w-3.5 h-3.5 text-vinyl-gold/40 group-hover:text-vinyl-gold flex-shrink-0 transition-colors" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

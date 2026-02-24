import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Heart, X, Music2, TrendingUp, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useVibeStore } from '../store/useVibeStore'
import { usePlayer } from '../context/PlayerContext'
import { useAuthStore } from '../store/useAuthStore'
import { getArtistTopTracks } from '../lib/spotify'
import type { SpotifyArtist } from '../types/spotify'

const COLORS = ['#C8A876', '#E8833A', '#E84A6F', '#3ABFBF', '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981']

function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5 flex items-center gap-4" style={{ animation: 'slide_up 0.4s ease-out both' }}>
      <div className="w-10 h-10 rounded-lg bg-vinyl-surface flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-body text-vinyl-muted text-xs">{label}</p>
        <p className="font-display font-bold text-vinyl-text text-2xl leading-tight">{value}</p>
        {sub && <p className="font-body text-vinyl-muted/70 text-xs">{sub}</p>}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-vinyl-card border border-vinyl-border rounded-lg px-3 py-2">
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

  // Build a map of artist name → full artist object from liked ratings
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

  async function handleTrackClick(trackId: string) {
    await play(`spotify:track:${trackId}`)
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

      <div className="max-w-2xl mx-auto px-6 py-8 pb-28 md:pb-10 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Liked" value={liked.length} sub={`${likedPct}% of rated`} icon={<Heart className="w-5 h-5 text-vinyl-gold" />} />
          <StatCard label="Skipped" value={disliked.length} sub={`${100 - likedPct}% of rated`} icon={<X className="w-5 h-5 text-vinyl-rose" />} />
        </div>

        {/* Vibe Ratio pie */}
        <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5" style={{ animation: 'slide_up 0.5s ease-out both' }}>
          <h2 className="font-display font-bold text-vinyl-text text-lg mb-4">Vibe Ratio</h2>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <PieChart width={140} height={140}>
                <Pie data={pieData} cx={65} cy={65} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  <Cell fill="#C8A876" />
                  <Cell fill="#E84A6F" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display font-black text-vinyl-gold text-xl leading-none">{likedPct}%</p>
                  <p className="font-body text-vinyl-muted text-xs">liked</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                  <span className="font-body text-vinyl-muted text-sm flex-1">{d.name}</span>
                  <span className="font-mono text-vinyl-text text-sm">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Genres */}
        {topGenres.length > 0 && (
          <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5" style={{ animation: 'slide_up 0.55s ease-out both' }}>
            <h2 className="font-display font-bold text-vinyl-text text-lg mb-4">Top Genres</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topGenres} layout="vertical" barSize={8}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="genre" width={110} tick={{ fill: '#6B7385', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1E2538' }} />
                <Bar dataKey="count" name="Tracks" radius={[0, 4, 4, 0]}>
                  {topGenres.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Artists — clickable */}
        {topArtists.length > 0 && (
          <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5" style={{ animation: 'slide_up 0.6s ease-out both' }}>
            <h2 className="font-display font-bold text-vinyl-text text-lg mb-4">Favourite Artists</h2>
            <div className="space-y-1">
              {topArtists.map((a, i) => (
                <button
                  key={a.name}
                  onClick={() => handleArtistClick(a.name)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-vinyl-surface transition-colors group"
                >
                  <span className="font-mono text-vinyl-muted text-xs w-4 text-right flex-shrink-0">{i + 1}</span>
                  {a.image ? (
                    <img src={a.image} alt={a.name} className="w-8 h-8 rounded-full object-cover border border-vinyl-border flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-vinyl-surface flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 text-vinyl-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-body text-vinyl-text text-sm truncate group-hover:text-vinyl-gold transition-colors">{a.name}</p>
                    <div className="mt-1 h-1 rounded-full bg-vinyl-faint overflow-hidden">
                      <div className="h-full rounded-full bg-vinyl-gold transition-all duration-700" style={{ width: `${(a.count / topArtists[0].count) * 100}%` }} />
                    </div>
                  </div>
                  <span className="font-mono text-vinyl-gold text-xs flex-shrink-0">{a.count} {a.count === 1 ? 'track' : 'tracks'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recently Liked — clickable to play */}
        {liked.length > 0 && (
          <div className="bg-vinyl-card border border-vinyl-border rounded-xl p-5" style={{ animation: 'slide_up 0.65s ease-out both' }}>
            <h2 className="font-display font-bold text-vinyl-text text-lg mb-4">Recently Liked</h2>
            <div className="space-y-1">
              {liked.slice(-10).reverse().map((r) => {
                const isPlaying = currentTrackId === r.track.id && !isPaused
                return (
                  <button
                    key={r.track.id}
                    onClick={() => handleTrackClick(r.track.id)}
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
                        {[0, 150, 75].map((d, i) => (
                          <div key={i} className="w-0.5 rounded-full bg-vinyl-gold" style={{ height: '4px', animation: `wave 0.8s ease-in-out infinite`, animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    ) : (
                      <Heart className="w-3.5 h-3.5 text-vinyl-gold flex-shrink-0 opacity-60 group-hover:opacity-0 transition-opacity" />
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

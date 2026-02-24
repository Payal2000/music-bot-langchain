import { useState } from 'react'
import { Heart, X, Play, Pause, RotateCcw, ExternalLink } from 'lucide-react'
import type { SpotifyTrack, SpotifyArtist } from '../types/spotify'
import { formatDuration } from '../lib/spotify'
import { usePlayer } from '../context/PlayerContext'
import clsx from 'clsx'

interface TrackCardProps {
  track: SpotifyTrack
  artist: SpotifyArtist
  onLike: () => void
  onDislike: () => void
  canUndo: boolean
  onUndo: () => void
  index: number
  total: number
}

export default function TrackCard({
  track,
  artist,
  onLike,
  onDislike,
  canUndo,
  onUndo,
  index,
  total,
}: TrackCardProps) {
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null)
  const player = usePlayer()
  const albumArt = track.album.images[0]?.url
  const smallArt = track.album.images[track.album.images.length - 1]?.url

  const isThisPlaying = player.currentTrackId === track.id && !player.isPaused

  function handleLike() {
    if (swipeDir) return
    setSwipeDir('right')
    setTimeout(onLike, 400)
  }

  function handleDislike() {
    if (swipeDir) return
    setSwipeDir('left')
    setTimeout(onDislike, 400)
  }

  async function handlePlayPause() {
    if (player.currentTrackId === track.id) {
      player.togglePlay()
    } else {
      await player.play(`spotify:track:${track.id}`)
    }
  }

  const year = track.album.release_date.slice(0, 4)

  return (
    <div className="w-full flex flex-col items-center">
      {/* Progress indicator */}
      <div className="flex gap-1.5 mb-5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'h-0.5 rounded-full transition-all duration-300',
              i < index
                ? 'bg-vinyl-gold w-4'
                : i === index
                ? 'bg-vinyl-gold w-8'
                : 'bg-vinyl-faint w-4'
            )}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className={clsx(
          'relative w-full max-w-sm rounded-2xl overflow-hidden border border-vinyl-border transition-all duration-400',
          swipeDir === 'right' && 'animate-swipe_right',
          swipeDir === 'left' && 'animate-swipe_left',
          !swipeDir && 'animate-slide_up'
        )}
        style={{ animationFillMode: 'both' }}
      >
        {/* Album art background */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={albumArt}
            alt={track.album.name}
            className="w-full h-full object-cover scale-110"
            style={{ filter: 'brightness(0.6)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-vinyl-card via-vinyl-card/20 to-transparent" />

          {/* Reaction overlays */}
          <div className={clsx('absolute top-4 left-4 px-3 py-1.5 rounded-full border-2 border-vinyl-rose font-body font-bold text-vinyl-rose text-sm rotate-[-12deg] transition-all duration-200', swipeDir === 'left' ? 'opacity-100' : 'opacity-0')}>
            SKIP
          </div>
          <div className={clsx('absolute top-4 right-4 px-3 py-1.5 rounded-full border-2 border-vinyl-teal font-body font-bold text-vinyl-teal text-sm rotate-[12deg] transition-all duration-200', swipeDir === 'right' ? 'opacity-100' : 'opacity-0')}>
            VIBE
          </div>

          {/* Play button */}
          <button
            onClick={handlePlayPause}
            disabled={!player.isReady}
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-vinyl-bg/70 backdrop-blur flex items-center justify-center text-vinyl-gold hover:bg-vinyl-gold hover:text-vinyl-bg transition-all disabled:opacity-40 border border-vinyl-gold/30"
          >
            {isThisPlaying
              ? <Pause className="w-5 h-5" />
              : <Play className="w-5 h-5 ml-0.5" />
            }
          </button>

          {/* Open in Spotify */}
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-vinyl-bg/60 backdrop-blur flex items-center justify-center text-vinyl-muted hover:text-vinyl-gold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Now playing bars */}
          {isThisPlaying && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-6">
              {[0, 150, 75, 225, 50].map((d, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-vinyl-gold"
                  style={{ height: '4px', animation: `wave 0.8s ease-in-out infinite`, animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="bg-vinyl-card px-5 py-4">
          <div className="flex items-start gap-3">
            <img src={smallArt} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-vinyl-border" />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-vinyl-text text-lg leading-tight truncate">{track.name}</h3>
              <p className="font-body text-vinyl-muted text-sm truncate">{artist.name}</p>
              <p className="font-body text-vinyl-muted/60 text-xs mt-0.5">{track.album.name} · {year}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="font-mono text-vinyl-muted text-xs">{formatDuration(track.duration_ms)}</span>
              <div className="flex items-center gap-1">
                <div className="h-1 rounded-full bg-vinyl-gold" style={{ width: `${(track.popularity / 100) * 36}px` }} />
                <span className="font-mono text-vinyl-muted/60 text-xs">{track.popularity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-6 mt-6">
        {canUndo && (
          <button onClick={onUndo} className="w-10 h-10 rounded-full bg-vinyl-card border border-vinyl-border flex items-center justify-center text-vinyl-muted hover:text-vinyl-text hover:border-vinyl-muted transition-all">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDislike}
          disabled={!!swipeDir}
          className="w-16 h-16 rounded-full bg-vinyl-card border-2 border-vinyl-rose/30 flex items-center justify-center text-vinyl-rose hover:bg-vinyl-rose hover:text-white hover:border-vinyl-rose hover:scale-110 transition-all duration-200 disabled:opacity-50"
        >
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <button
          onClick={handleLike}
          disabled={!!swipeDir}
          className="w-16 h-16 rounded-full bg-vinyl-gold/10 border-2 border-vinyl-gold/40 flex items-center justify-center text-vinyl-gold hover:bg-vinyl-gold hover:text-vinyl-bg hover:border-vinyl-gold hover:scale-110 transition-all duration-200 disabled:opacity-50"
        >
          <Heart className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>

      <p className="mt-3 font-body text-vinyl-muted/50 text-xs">{index + 1} of {total}</p>
    </div>
  )
}

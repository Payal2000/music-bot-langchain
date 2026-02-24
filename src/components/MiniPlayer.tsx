import { Play, Pause, Music2, SkipBack, SkipForward } from 'lucide-react'
import type { SpotifyPlayerHook } from '../hooks/useSpotifyPlayer'

interface MiniPlayerProps {
  player: SpotifyPlayerHook
}

function formatMs(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MiniPlayer({ player }: MiniPlayerProps) {
  const {
    isReady,
    isPaused,
    currentTrackName,
    currentTrackArtist,
    currentTrackImage,
    positionMs,
    durationMs,
    togglePlay,
    seek,
    previousTrack,
    nextTrack,
  } = player

  // Don't render if nothing is playing
  if (!currentTrackName) return null

  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seek(Math.floor(ratio * durationMs))
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-56 z-50 bg-vinyl-surface/95 backdrop-blur border-t border-vinyl-border relative">
      {/* Progress bar */}
      <div
        className="h-0.5 bg-vinyl-faint cursor-pointer group"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-vinyl-gold transition-all duration-1000 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-vinyl-gold opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Album art */}
        {currentTrackImage ? (
          <img
            src={currentTrackImage}
            alt=""
            className="w-10 h-10 rounded-lg object-cover border border-vinyl-border flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-vinyl-card border border-vinyl-border flex items-center justify-center flex-shrink-0">
            <Music2 className="w-4 h-4 text-vinyl-muted" />
          </div>
        )}

        {/* Track info — left */}
        <div className="flex-1 min-w-0">
          <p className="font-body font-medium text-vinyl-text text-sm truncate">{currentTrackName}</p>
          <p className="font-body text-vinyl-muted text-xs truncate">{currentTrackArtist}</p>
        </div>

        {/* Controls — centred absolutely */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button onClick={previousTrack} className="w-8 h-8 flex items-center justify-center text-vinyl-muted hover:text-vinyl-text transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!isReady}
            className="w-10 h-10 rounded-full bg-vinyl-gold flex items-center justify-center text-vinyl-bg hover:bg-vinyl-amber transition-all disabled:opacity-50"
          >
            {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
          </button>
          <button onClick={nextTrack} className="w-8 h-8 flex items-center justify-center text-vinyl-muted hover:text-vinyl-text transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Time — right */}
        <span className="font-mono text-vinyl-muted text-xs hidden sm:block flex-shrink-0 ml-auto">
          {formatMs(positionMs)} / {formatMs(durationMs)}
        </span>
      </div>
    </div>
  )
}

// Re-export the type for convenience
export type { SpotifyPlayerHook }

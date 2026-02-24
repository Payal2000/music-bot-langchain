import { useState } from 'react'
import { Play, Pause, Music2, SkipBack, SkipForward, Smartphone, Monitor, Speaker, ChevronUp } from 'lucide-react'
import type { SpotifyPlayerHook } from '../hooks/useSpotifyPlayer'

interface MiniPlayerProps {
  player: SpotifyPlayerHook
}

function formatMs(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function DeviceIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t === 'smartphone') return <Smartphone className="w-3.5 h-3.5" />
  if (t === 'computer') return <Monitor className="w-3.5 h-3.5" />
  return <Speaker className="w-3.5 h-3.5" />
}

export default function MiniPlayer({ player }: MiniPlayerProps) {
  const [showDevices, setShowDevices] = useState(false)
  const {
    isReady, isPaused, devices, activeDeviceId,
    currentTrackName, currentTrackArtist, currentTrackImage,
    positionMs, durationMs,
    togglePlay, seek, previousTrack, nextTrack, selectDevice,
  } = player

  const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0
  const activeDevice = devices.find((d) => d.id === activeDeviceId)

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    seek(Math.floor(((e.clientX - rect.left) / rect.width) * durationMs))
  }

  // Show device picker if no device found yet
  if (!isReady) {
    return (
      <div className="fixed bottom-0 left-0 right-0 md:left-56 z-50 bg-vinyl-surface/95 backdrop-blur border-t border-vinyl-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Speaker className="w-4 h-4 text-vinyl-muted flex-shrink-0" />
          <p className="font-body text-vinyl-muted text-xs flex-1">
            Open <span className="text-vinyl-gold">Spotify</span> on your phone or computer to enable playback
          </p>
          <button onClick={player.refreshDevices} className="font-mono text-vinyl-gold text-xs border border-vinyl-gold/30 rounded-lg px-2 py-1 hover:bg-vinyl-gold/10 transition-colors">
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-56 z-50">
      {/* Device picker dropdown */}
      {showDevices && (
        <div className="bg-vinyl-card border border-vinyl-border border-b-0 rounded-t-xl mx-2 overflow-hidden shadow-2xl">
          <div className="px-4 py-2 border-b border-vinyl-border flex items-center justify-between">
            <span className="font-mono text-vinyl-muted text-xs uppercase tracking-widest">Devices</span>
            <button onClick={() => setShowDevices(false)} className="text-vinyl-muted hover:text-vinyl-text">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          {devices.map((d) => (
            <button
              key={d.id}
              onClick={() => { selectDevice(d.id); setShowDevices(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-vinyl-surface transition-colors border-b border-vinyl-border/30 last:border-0 ${d.id === activeDeviceId ? 'text-vinyl-gold' : 'text-vinyl-text'}`}
            >
              <DeviceIcon type={d.type} />
              <span className="font-body text-sm flex-1 truncate">{d.name}</span>
              {d.id === activeDeviceId && <div className="w-2 h-2 rounded-full bg-vinyl-gold animate-pulse" />}
            </button>
          ))}
        </div>
      )}

      {/* Player bar */}
      <div className="bg-vinyl-surface/95 backdrop-blur border-t border-vinyl-border">
        {/* Progress bar */}
        {currentTrackName && (
          <div className="h-1 bg-vinyl-faint cursor-pointer group" onClick={handleSeek}>
            <div className="h-full bg-vinyl-gold transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-vinyl-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Album art / placeholder */}
          {currentTrackImage ? (
            <img src={currentTrackImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-vinyl-border flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-vinyl-card border border-vinyl-border flex items-center justify-center flex-shrink-0">
              <Music2 className="w-4 h-4 text-vinyl-muted" />
            </div>
          )}

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="font-body font-medium text-vinyl-text text-sm truncate">
              {currentTrackName ?? 'No track playing'}
            </p>
            <button
              onClick={() => setShowDevices((v) => !v)}
              className="flex items-center gap-1 text-vinyl-muted hover:text-vinyl-gold transition-colors"
            >
              {activeDevice && <DeviceIcon type={activeDevice.type} />}
              <span className="font-body text-xs truncate">{activeDevice?.name ?? currentTrackArtist ?? 'Select device'}</span>
            </button>
          </div>

          {/* Time */}
          {currentTrackName && (
            <span className="font-mono text-vinyl-muted text-xs hidden sm:block flex-shrink-0">
              {formatMs(positionMs)} / {formatMs(durationMs)}
            </span>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={previousTrack} className="w-8 h-8 rounded-full flex items-center justify-center text-vinyl-muted hover:text-vinyl-text transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-vinyl-gold flex items-center justify-center text-vinyl-bg hover:bg-vinyl-amber transition-all">
              {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
            </button>
            <button onClick={nextTrack} className="w-8 h-8 rounded-full flex items-center justify-center text-vinyl-muted hover:text-vinyl-text transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { SpotifyPlayerHook }

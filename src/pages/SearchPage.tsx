import { Music2 } from 'lucide-react'
import ArtistSearch from '../components/ArtistSearch'
import TrackCard from '../components/TrackCard'
import { useVibeStore } from '../store/useVibeStore'

export default function SearchPage() {
  const {
    currentArtist,
    currentTracks,
    currentTrackIndex,
    isLoadingTracks,
    likeTrack,
    dislikeTrack,
    undoLast,
    ratings,
  } = useVibeStore()

  const track = currentTracks[currentTrackIndex]
  const isDone = currentArtist && currentTrackIndex >= currentTracks.length && currentTracks.length > 0
  const canUndo = ratings.length > 0

  return (
    <div className="min-h-screen bg-vinyl-bg md:pl-56">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-vinyl-bg/90 backdrop-blur border-b border-vinyl-border px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display font-black text-vinyl-text text-2xl mb-3">
            Explore
          </h1>
          <ArtistSearch />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 pb-28 md:pb-10">
        {/* Loading */}
        {isLoadingTracks && (
          <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ animation: 'fade_in 0.3s ease-out' }}>
            <div className="w-12 h-12 rounded-full border-2 border-vinyl-gold border-t-transparent animate-spin" />
            <p className="font-body text-vinyl-muted text-sm">Loading tracks…</p>
          </div>
        )}

        {/* Track card */}
        {!isLoadingTracks && track && (
          <div style={{ animation: 'fade_in 0.3s ease-out' }}>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={currentArtist?.images[currentArtist.images.length - 1]?.url}
                alt={currentArtist?.name}
                className="w-8 h-8 rounded-full object-cover border border-vinyl-border"
              />
              <div>
                <p className="font-body font-medium text-vinyl-text text-sm">{currentArtist?.name}</p>
                <p className="font-body text-vinyl-muted text-xs">Top Tracks</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="font-mono text-vinyl-gold text-xs bg-vinyl-gold/10 px-2 py-1 rounded-full">
                  {currentTracks.length - currentTrackIndex} left
                </span>
              </div>
            </div>
            <TrackCard
              key={track.id}
              track={track}
              artist={currentArtist!}
              onLike={likeTrack}
              onDislike={dislikeTrack}
              canUndo={canUndo}
              onUndo={undoLast}
              index={currentTrackIndex}
              total={currentTracks.length}
            />
          </div>
        )}

        {/* All tracks rated */}
        {isDone && !isLoadingTracks && (
          <div className="flex flex-col items-center py-16 text-center gap-4" style={{ animation: 'slide_up 0.4s ease-out' }}>
            <div className="w-16 h-16 rounded-full bg-vinyl-gold/10 border border-vinyl-gold/30 flex items-center justify-center">
              <Music2 className="w-7 h-7 text-vinyl-gold" />
            </div>
            <div>
              <h3 className="font-display font-bold text-vinyl-text text-xl">All rated!</h3>
              <p className="font-body text-vinyl-muted text-sm mt-1">
                Search another artist or check your stats.
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!currentArtist && !isLoadingTracks && (
          <div className="flex flex-col items-center py-20 text-center gap-3">
            <div className="relative">
              {/* Decorative circles */}
              <div className="w-32 h-32 rounded-full border border-vinyl-border flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-vinyl-border flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-vinyl-gold/10 border border-vinyl-gold/30 flex items-center justify-center">
                    <Music2 className="w-5 h-5 text-vinyl-gold" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-display font-bold text-vinyl-text text-xl">
                Find your vibe
              </h3>
              <p className="font-body text-vinyl-muted text-sm mt-1 max-w-xs">
                Search for any artist above and start rating their tracks.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2 text-left max-w-xs">
              {['Swipe right or tap ♥ to like', 'Swipe left or tap ✕ to skip', 'Hit stats to see your taste profile'].map((tip) => (
                <div key={tip} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-vinyl-gold flex-shrink-0" />
                  <p className="font-body text-vinyl-muted text-xs">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

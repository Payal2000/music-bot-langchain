import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RatedTrack, SpotifyArtist, SpotifyTrack } from '../types/spotify'

interface VibeState {
  ratings: RatedTrack[]
  currentArtist: SpotifyArtist | null
  currentTracks: SpotifyTrack[]
  currentTrackIndex: number
  isLoadingTracks: boolean

  // Actions
  setCurrentArtist: (artist: SpotifyArtist) => void
  setCurrentTracks: (tracks: SpotifyTrack[]) => void
  setLoadingTracks: (loading: boolean) => void
  advanceTrack: () => void
  likeTrack: () => void
  dislikeTrack: () => void
  undoLast: () => void
  clearRatings: () => void

  // Derived helpers
  getLiked: () => RatedTrack[]
  getDisliked: () => RatedTrack[]
  getTopGenres: () => Array<{ genre: string; count: number }>
  getTopArtists: () => Array<{ name: string; count: number; image?: string }>
}

export const useVibeStore = create<VibeState>()(
  persist(
    (set, get) => ({
      ratings: [],
      currentArtist: null,
      currentTracks: [],
      currentTrackIndex: 0,
      isLoadingTracks: false,

      setCurrentArtist: (artist) => set({ currentArtist: artist }),
      setCurrentTracks: (tracks) => set({ currentTracks: tracks, currentTrackIndex: 0 }),
      setLoadingTracks: (loading) => set({ isLoadingTracks: loading }),

      advanceTrack: () =>
        set((s) => ({ currentTrackIndex: Math.min(s.currentTrackIndex + 1, s.currentTracks.length) })),

      likeTrack: () => {
        const { currentTracks, currentTrackIndex, currentArtist, advanceTrack } = get()
        const track = currentTracks[currentTrackIndex]
        if (!track || !currentArtist) return
        set((s) => ({
          ratings: [
            ...s.ratings.filter((r) => r.track.id !== track.id),
            { track, artist: currentArtist, reaction: 'like', ratedAt: Date.now() },
          ],
        }))
        advanceTrack()
      },

      dislikeTrack: () => {
        const { currentTracks, currentTrackIndex, currentArtist, advanceTrack } = get()
        const track = currentTracks[currentTrackIndex]
        if (!track || !currentArtist) return
        set((s) => ({
          ratings: [
            ...s.ratings.filter((r) => r.track.id !== track.id),
            { track, artist: currentArtist, reaction: 'dislike', ratedAt: Date.now() },
          ],
        }))
        advanceTrack()
      },

      undoLast: () =>
        set((s) => ({ ratings: s.ratings.slice(0, -1), currentTrackIndex: Math.max(0, s.currentTrackIndex - 1) })),

      clearRatings: () => set({ ratings: [] }),

      getLiked: () => get().ratings.filter((r) => r.reaction === 'like'),
      getDisliked: () => get().ratings.filter((r) => r.reaction === 'dislike'),

      getTopGenres: () => {
        const liked = get().getLiked()
        const counts: Record<string, number> = {}
        liked.forEach((r) => {
          r.artist.genres.forEach((g) => {
            counts[g] = (counts[g] ?? 0) + 1
          })
        })
        return Object.entries(counts)
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      },

      getTopArtists: () => {
        const liked = get().getLiked()
        const map: Record<string, { count: number; image?: string }> = {}
        liked.forEach((r) => {
          const name = r.artist.name
          map[name] = {
            count: (map[name]?.count ?? 0) + 1,
            image: r.artist.images[0]?.url,
          }
        })
        return Object.entries(map)
          .map(([name, { count, image }]) => ({ name, count, image }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      },
    }),
    {
      name: 'myvibe-data',
      partialize: (s) => ({ ratings: s.ratings }),
    }
  )
)

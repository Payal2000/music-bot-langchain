import { createContext, useContext } from 'react'
import type { SpotifyPlayerHook } from '../hooks/useSpotifyPlayer'

export const PlayerContext = createContext<SpotifyPlayerHook | null>(null)

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerContext')
  return ctx
}

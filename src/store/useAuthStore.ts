import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { refreshAccessToken } from '../lib/pkce'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
export const REDIRECT_URI = 'http://localhost:5173/callback'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string, expiresIn: number) => void
  logout: () => void
  getValidToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,

      setTokens: (access, refresh, expiresIn) => {
        set({
          accessToken: access,
          refreshToken: refresh,
          expiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false })
        sessionStorage.removeItem('pkce_verifier')
      },

      getValidToken: async () => {
        const { accessToken, refreshToken, expiresAt, setTokens } = get()
        if (!accessToken || !expiresAt) return null

        // If token expires in more than 60s, it's still valid
        if (Date.now() < expiresAt - 60_000) return accessToken

        // Refresh
        if (!refreshToken) return null
        try {
          const data = await refreshAccessToken(refreshToken, CLIENT_ID)
          setTokens(
            data.access_token,
            data.refresh_token ?? refreshToken,
            data.expires_in
          )
          return data.access_token
        } catch {
          set({ accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false })
          return null
        }
      },
    }),
    {
      name: 'myvibe-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)

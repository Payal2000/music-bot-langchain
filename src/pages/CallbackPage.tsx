import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForToken } from '../lib/pkce'
import { useAuthStore } from '../store/useAuthStore'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const REDIRECT_URI = 'http://localhost:5173/callback'

export default function CallbackPage() {
  const navigate = useNavigate()
  const { setTokens } = useAuthStore()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    const verifier = sessionStorage.getItem('pkce_verifier')

    if (error || !code || !verifier) {
      navigate('/', { replace: true })
      return
    }

    exchangeCodeForToken(code, verifier, CLIENT_ID, REDIRECT_URI)
      .then(({ access_token, refresh_token, expires_in }) => {
        sessionStorage.removeItem('pkce_verifier')
        setTokens(access_token, refresh_token, expires_in)
        navigate('/search', { replace: true })
      })
      .catch(() => navigate('/', { replace: true }))
  }, [navigate, setTokens])

  return (
    <div className="min-h-screen bg-vinyl-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-vinyl-gold border-t-transparent animate-spin" />
        <p className="font-body text-vinyl-muted text-sm">Connecting to Spotify…</p>
      </div>
    </div>
  )
}

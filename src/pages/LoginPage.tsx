import { useEffect } from 'react'
import { generateCodeVerifier, generateCodeChallenge, getSpotifyAuthUrl } from '../lib/pkce'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const REDIRECT_URI = 'http://localhost:5173/callback'

// Animated vinyl record SVG
function VinylRecord({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {/* Outer ring */}
      <circle cx="100" cy="100" r="98" fill="#1a1a2e" stroke="#C8A876" strokeWidth="1" />
      {/* Groove rings */}
      {[88, 76, 64, 52, 40, 28].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#C8A87622" strokeWidth="1" />
      ))}
      {/* Label */}
      <circle cx="100" cy="100" r="22" fill="#C8A876" />
      <circle cx="100" cy="100" r="16" fill="#0E1220" />
      {/* Center hole */}
      <circle cx="100" cy="100" r="4" fill="#07090F" />
      {/* Highlight */}
      <path d="M 40 60 Q 100 20 160 60" stroke="#ffffff10" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function WaveBar({ delay }: { delay: number }) {
  return (
    <div
      className="w-1 rounded-full bg-vinyl-gold"
      style={{
        height: '4px',
        animationDelay: `${delay}ms`,
        animation: 'wave 1s ease-in-out infinite',
      }}
    />
  )
}

export default function LoginPage() {
  const missingClientId = !CLIENT_ID || CLIENT_ID === 'your_spotify_client_id_here'

  async function handleLogin() {
    if (missingClientId) return
    const verifier = await generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    sessionStorage.setItem('pkce_verifier', verifier)
    window.location.href = getSpotifyAuthUrl(CLIENT_ID, REDIRECT_URI, challenge)
  }

  useEffect(() => {
    // Add CSS keyframe for wave animation dynamically
    if (!document.getElementById('wave-style')) {
      const style = document.createElement('style')
      style.id = 'wave-style'
      style.textContent = `
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 22px; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-vinyl-bg flex flex-col items-center justify-center px-6">
      {/* Background vinyl records (decorative) */}
      <div className="absolute -top-32 -left-32 opacity-10">
        <VinylRecord className="w-80 h-80 animate-spin_vslow" />
      </div>
      <div className="absolute -bottom-24 -right-24 opacity-10">
        <VinylRecord className="w-96 h-96 animate-spin_slow" />
      </div>
      <div className="absolute top-1/3 right-12 opacity-5">
        <VinylRecord className="w-48 h-48 animate-spin_vslow" />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-vinyl-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-vinyl-rose/5 blur-3xl pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-lg text-center" style={{ animation: 'slide_up 0.6s ease-out both' }}>
        {/* Logo vinyl */}
        <div className="mb-8 relative">
          <VinylRecord className="w-28 h-28 animate-spin_slow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-black text-vinyl-gold text-xs tracking-widest">MV</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-6xl text-vinyl-text leading-none mb-2">
          My<span className="text-vinyl-gold italic">Vibe</span>
        </h1>
        <p className="font-body text-vinyl-muted text-lg mb-2 tracking-wide">
          Your Music Taste, Decoded
        </p>

        {/* Wave animation */}
        <div className="flex items-end gap-1 h-8 my-4">
          {[0, 150, 75, 225, 50, 175, 100, 25].map((d, i) => (
            <WaveBar key={i} delay={d} />
          ))}
        </div>

        {/* Description */}
        <p className="font-body text-vinyl-muted/80 text-sm leading-relaxed mb-10 max-w-sm">
          Search artists, swipe through their top tracks, and discover what your musical instincts say about you.
        </p>

        {missingClientId ? (
          <div className="w-full p-4 rounded-xl border border-vinyl-amber/30 bg-vinyl-amber/5 text-left">
            <p className="font-mono text-vinyl-amber text-sm font-medium mb-1">Setup Required</p>
            <p className="font-body text-vinyl-muted text-xs leading-relaxed">
              Add your Spotify Client ID to a <code className="text-vinyl-gold">.env</code> file:
            </p>
            <code className="block mt-2 font-mono text-vinyl-gold text-xs bg-vinyl-surface rounded p-2">
              VITE_SPOTIFY_CLIENT_ID=your_id_here
            </code>
            <p className="font-body text-vinyl-muted text-xs mt-2">
              Get one at{' '}
              <span className="text-vinyl-gold">developer.spotify.com/dashboard</span>
            </p>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="group relative w-full max-w-xs py-4 px-8 rounded-full font-body font-medium text-vinyl-bg bg-vinyl-gold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(200,168,118,0.4)] active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-3 text-base">
              {/* Spotify icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Connect with Spotify
            </span>
            <div className="absolute inset-0 bg-vinyl-amber opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        )}

        <p className="mt-6 font-body text-vinyl-muted/50 text-xs">
          Only reads your public profile · No data stored on servers
        </p>
      </div>
    </div>
  )
}

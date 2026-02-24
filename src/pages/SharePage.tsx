import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Share2, Heart, Music2 } from 'lucide-react'
import { useVibeStore } from '../store/useVibeStore'
import { formatDuration } from '../lib/spotify'
import clsx from 'clsx'

const THEMES = [
  { id: 'midnight', label: 'Midnight', bg: '#07090F', card: '#0E1220', accent: '#C8A876', text: '#F2EDE4' },
  { id: 'rose', label: 'Rose', bg: '#1A0A10', card: '#2A1018', accent: '#E84A6F', text: '#F9E8EC' },
  { id: 'ocean', label: 'Ocean', bg: '#07100F', card: '#0D1A1A', accent: '#3ABFBF', text: '#E8F2F2' },
  { id: 'amber', label: 'Amber', bg: '#120C04', card: '#1E1508', accent: '#E8833A', text: '#F5EDE4' },
]

export default function SharePage() {
  const { getLiked } = useVibeStore()
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [theme, setTheme] = useState(THEMES[0])
  const liked = getLiked().slice(0, 5)

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 })
      const link = document.createElement('a')
      link.download = 'myvibe-top5.png'
      link.href = dataUrl
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  async function handleShare() {
    if (!cardRef.current || !navigator.share) {
      handleDownload()
      return
    }
    setDownloading(true)
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3 })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'myvibe-top5.png', { type: 'image/png' })
      await navigator.share({ files: [file], title: 'My Top 5 Vibes' })
    } finally {
      setDownloading(false)
    }
  }

  if (liked.length === 0) {
    return (
      <div className="min-h-screen bg-vinyl-bg md:pl-56 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-vinyl-card border border-vinyl-border flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-7 h-7 text-vinyl-muted" />
          </div>
          <h2 className="font-display font-bold text-vinyl-text text-2xl mb-2">Nothing to share yet</h2>
          <p className="font-body text-vinyl-muted text-sm max-w-xs mx-auto">
            Like at least one track in Explore to generate your share card.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vinyl-bg md:pl-56">
      <div className="sticky top-0 z-30 bg-vinyl-bg/90 backdrop-blur border-b border-vinyl-border px-6 py-4">
        <h1 className="font-display font-black text-vinyl-text text-2xl">Share Card</h1>
        <p className="font-body text-vinyl-muted text-sm">Your top {liked.length} vibes</p>
      </div>

      <div className="max-w-xl mx-auto px-6 py-8 pb-28 md:pb-10">
        {/* Theme picker */}
        <div className="flex gap-2 mb-6">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-body transition-all',
                theme.id === t.id
                  ? 'border-vinyl-gold text-vinyl-gold bg-vinyl-gold/5'
                  : 'border-vinyl-border text-vinyl-muted hover:border-vinyl-muted'
              )}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Share card (the exported element) */}
        <div
          ref={cardRef}
          style={{
            background: theme.bg,
            fontFamily: '"Playfair Display", serif',
            width: '100%',
            borderRadius: '20px',
            padding: '28px',
            border: `1px solid ${theme.accent}22`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative background circles */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: `1px solid ${theme.accent}18`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: `1px solid ${theme.accent}22`,
              pointerEvents: 'none',
            }}
          />

          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Heart style={{ width: '16px', height: '16px', color: theme.accent }} />
              <span
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '11px',
                  color: theme.accent,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                My Top Vibes
              </span>
            </div>
            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 900,
                fontSize: '28px',
                color: theme.text,
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              My<span style={{ color: theme.accent, fontStyle: 'italic' }}>Vibe</span>
            </h2>
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '12px',
                color: `${theme.text}66`,
                marginTop: '4px',
              }}
            >
              Taste profile · {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Track list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {liked.map((r, i) => (
              <div
                key={r.track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: theme.card,
                  borderRadius: '12px',
                  padding: '10px 12px',
                  border: `1px solid ${theme.accent}15`,
                }}
              >
                {/* Rank */}
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: i === 0 ? theme.accent : `${theme.text}33`,
                    width: '28px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>

                {/* Album art */}
                <img
                  src={r.track.album.images[r.track.album.images.length - 1]?.url}
                  alt=""
                  crossOrigin="anonymous"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: `1px solid ${theme.accent}22`,
                  }}
                />

                {/* Track info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: theme.text,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.track.name}
                  </p>
                  <p
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '11px',
                      color: `${theme.text}77`,
                      margin: '2px 0 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.artist.name}
                  </p>
                </div>

                {/* Duration */}
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '11px',
                    color: `${theme.text}44`,
                    flexShrink: 0,
                  }}
                >
                  {formatDuration(r.track.duration_ms)}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '10px', color: `${theme.text}33` }}>
              myvibe.app
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '4px',
                    borderRadius: '2px',
                    background: theme.accent,
                    opacity: 0.4 + i * 0.15,
                    height: `${8 + i * 4}px`,
                    alignSelf: 'flex-end',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-vinyl-gold text-vinyl-bg font-body font-medium text-sm hover:bg-vinyl-amber transition-all hover:scale-[1.02] disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleShare}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-vinyl-card border border-vinyl-border text-vinyl-text font-body text-sm hover:border-vinyl-gold/50 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
        </div>
        <p className="mt-3 text-center font-body text-vinyl-muted/50 text-xs">
          High-res PNG · Perfect for Instagram stories
        </p>
      </div>
    </div>
  )
}

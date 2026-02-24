import { NavLink, useNavigate } from 'react-router-dom'
import { Search, BarChart2, Share2, LogOut, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useVibeStore } from '../store/useVibeStore'
import clsx from 'clsx'

export default function Navbar() {
  const { logout } = useAuthStore()
  const { getLiked } = useVibeStore()
  const navigate = useNavigate()
  const likedCount = getLiked().length

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const links = [
    { to: '/search', icon: Search, label: 'Explore' },
    { to: '/curate', icon: Sparkles, label: 'Curate' },
    { to: '/stats', icon: BarChart2, label: 'Stats' },
    { to: '/share', icon: Share2, label: 'Share' },
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-56 bg-vinyl-surface border-r border-vinyl-border z-40 py-8 px-4">
        <div className="flex items-baseline gap-1 mb-10 px-2">
          <span className="font-display font-black text-2xl text-vinyl-text">My</span>
          <span className="font-display font-black text-2xl text-vinyl-gold italic">Vibe</span>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-lg font-body text-sm transition-all duration-200',
                  isActive
                    ? 'bg-vinyl-gold/10 text-vinyl-gold border border-vinyl-gold/20'
                    : 'text-vinyl-muted hover:text-vinyl-text hover:bg-vinyl-card'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>

        {likedCount > 0 && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-vinyl-card border border-vinyl-border">
            <p className="font-mono text-vinyl-gold text-xs">{likedCount} liked</p>
            <p className="font-body text-vinyl-muted text-xs">Keep exploring!</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg font-body text-sm text-vinyl-muted hover:text-vinyl-rose hover:bg-vinyl-rose/5 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-vinyl-surface/95 backdrop-blur border-t border-vinyl-border z-40 flex items-center justify-around px-2 py-3 safe-bottom">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all duration-200',
                isActive ? 'text-vinyl-gold' : 'text-vinyl-muted'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-body text-xs">{label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-1 rounded-lg text-vinyl-muted"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-body text-xs">Exit</span>
        </button>
      </nav>
    </>
  )
}

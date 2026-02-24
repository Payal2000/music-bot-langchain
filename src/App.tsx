import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer'
import { PlayerContext } from './context/PlayerContext'
import LoginPage from './pages/LoginPage'
import CallbackPage from './pages/CallbackPage'
import SearchPage from './pages/SearchPage'
import StatsPage from './pages/StatsPage'
import SharePage from './pages/SharePage'
import Navbar from './components/Navbar'
import MiniPlayer from './components/MiniPlayer'

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const player = useSpotifyPlayer()

  if (!isAuthenticated) return <Navigate to="/" replace />

  return (
    <PlayerContext.Provider value={player}>
      <Navbar />
      {children}
      <MiniPlayer player={player} />
    </PlayerContext.Provider>
  )
}

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/search" replace /> : <LoginPage />}
      />
      <Route path="/callback" element={<CallbackPage />} />

      <Route path="/search" element={<ProtectedLayout><SearchPage /></ProtectedLayout>} />
      <Route path="/stats" element={<ProtectedLayout><StatsPage /></ProtectedLayout>} />
      <Route path="/share" element={<ProtectedLayout><SharePage /></ProtectedLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

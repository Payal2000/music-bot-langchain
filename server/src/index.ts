import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../.env') })
import express from 'express'
import cors from 'cors'
import { runCuratorAgent } from './agent.js'

const app = express()
app.use(cors({ origin: 'http://127.0.0.1:5173' }))
app.use(express.json())

app.post('/api/curate', async (req, res) => {
  const { likedTrackIds, topGenres, topArtists, topArtistIds, spotifyToken, ratedTrackIds } = req.body

  if (!spotifyToken) {
    res.status(400).json({ error: 'spotifyToken is required' })
    return
  }

  try {
    const tracks = await runCuratorAgent({
      likedTrackIds: likedTrackIds ?? [],
      topGenres: topGenres ?? [],
      topArtists: topArtists ?? [],
      topArtistIds: topArtistIds ?? [],
      ratedTrackIds: ratedTrackIds ?? [],
      spotifyToken,
    })
    res.json({ tracks })
  } catch (err) {
    console.error('Agent error:', err)
    res.status(500).json({ error: 'Agent failed to curate tracks' })
  }
})

app.get('/health', (_req, res) => res.json({ ok: true }))

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => console.log(`🎵 MyVibe server running on http://localhost:${PORT}`))

# MyVibe 🎵

> Discover your music taste. Let AI curate what's next.

MyVibe is a full-stack music app that lets you swipe through tracks, build a personal taste profile, and get AI-curated recommendations — powered by Spotify and a **LangChain agent** backed by OpenAI.

> **LangChain powers the AI Curator:** the agent reads your taste profile, reasons about what artists you'd enjoy, searches Spotify, and returns a personalised swipe feed — all autonomously using LangChain's structured output + OpenAI GPT-4o-mini.

---

## Features

| Feature | Description |
|---|---|
| **Explore** | Search any artist or song, swipe to like or skip |
| **⚡ AI Curator** | **LangChain agent** (GPT-4o-mini) discovers new artists based on your taste — server-side, keys never exposed |
| **Stats** | Visual breakdown of top genres, artists, and liked tracks |
| **Share** | Export your vibe card as an image |
| **Mini Player** | Persistent playback bar with skip/prev via Spotify Web Playback SDK |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│            Vite · TypeScript · Tailwind · Zustand               │
│                                                                  │
│    /explore     /curate     /stats     /share                   │
│    (Swipe)    (AI Agent)  (Charts)   (Export)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │  POST /api/curate
                           │  { likedTrackIds, topGenres,
                           │    topArtists, spotifyToken }
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Node.js / Express Server                       │
│                      server/src/index.ts                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              LangChain Curator Agent                             │
│                  server/src/agent.ts                             │
│                                                                  │
│  1. GPT-4o-mini reads taste profile                              │
│  2. Suggests 6–8 artists to discover                             │
│  3. Searches Spotify for those artists                           │
│  4. Fetches their top tracks                                     │
│  5. Filters already-rated · sorts by popularity                  │
│  6. Returns top 20 fresh tracks                                  │
└──────────┬──────────────────────────────────┬───────────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────┐               ┌──────────────────────┐
│   OpenAI API     │               │   Spotify Web API    │
│  gpt-4o-mini     │               │  /search             │
│  (taste → seeds) │               │  /artists/top-tracks │
└──────────────────┘               └──────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| State | Zustand (persisted to localStorage) |
| Routing | React Router v6 |
| Charts | Recharts + custom CSS bars |
| Player | Spotify Web Playback SDK |
| Auth | Spotify PKCE OAuth (no backend secret needed) |
| Backend | Node.js + Express |
| **AI Agent** | **LangChain.js** + OpenAI GPT-4o-mini → structured output, artist search, top-track curation |
| Music API | Spotify Web API |

---

## Project Structure

```
music-bot/
├── .env                        ← secrets (never committed)
├── .env.example                ← template with placeholders
├── vite.config.ts              ← Vite + /api proxy to Express
│
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx       ← Spotify OAuth login
│   │   ├── CallbackPage.tsx    ← OAuth callback handler
│   │   ├── SearchPage.tsx      ← Explore / swipe feed
│   │   ├── CuratePage.tsx      ← AI Curator UI
│   │   ├── StatsPage.tsx       ← Taste stats + charts
│   │   └── SharePage.tsx       ← Vibe card export
│   ├── components/
│   │   ├── TrackCard.tsx       ← Swipeable track card
│   │   ├── ArtistSearch.tsx    ← Search artists + songs
│   │   ├── MiniPlayer.tsx      ← Persistent playback bar
│   │   └── Navbar.tsx          ← Sidebar + mobile nav
│   ├── store/
│   │   ├── useVibeStore.ts     ← Ratings + taste profile (Zustand)
│   │   └── useAuthStore.ts     ← Spotify token management
│   ├── hooks/
│   │   └── useSpotifyPlayer.ts ← Web Playback SDK hook
│   ├── context/
│   │   └── PlayerContext.tsx   ← Player context provider
│   └── lib/
│       └── spotify.ts          ← Spotify API helpers
│
└── server/
    ├── package.json
    └── src/
        ├── index.ts            ← Express server (POST /api/curate)
        └── agent.ts            ← LangChain AI curator agent
```

---

## Setup

### Prerequisites

- Node.js 18+
- A [Spotify Developer](https://developer.spotify.com/dashboard) account
- An [OpenAI](https://platform.openai.com) API key

### 1. Spotify App

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Add `http://127.0.0.1:5173/callback` as a **Redirect URI**
3. Copy the **Client ID**

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
OPENAI_API_KEY=your_openai_api_key_here
```

> The `.env` file is in `.gitignore` and will never be pushed to GitHub.

### 3. Install Dependencies

```bash
# Frontend
npm install

# Backend / agent server
cd server && npm install && cd ..
```

### 4. Run

Open two terminals:

```bash
# Terminal 1 — React app (http://127.0.0.1:5173)
npm run dev

# Terminal 2 — Agent server (http://localhost:3001)
cd server && npm run dev
```

---

## How the AI Curator Works

```
1. You like 3+ tracks in Explore
        ↓
2. Click "Curate for me" on the Curate page
        ↓
3. React sends your taste profile to POST /api/curate
   { likedTrackIds, topGenres, topArtists, ratedTrackIds, spotifyToken }
        ↓
4. GPT-4o-mini reads your profile and suggests 6–8 new artists to discover
        ↓
5. Server searches Spotify for each suggested artist
        ↓
6. Fetches top tracks · filters already-rated · sorts by popularity
        ↓
7. Returns 20 curated tracks → dropped into your swipe feed
```

---

## Security

| What | How it's protected |
|---|---|
| `OPENAI_API_KEY` | Server-side only — never sent to browser |
| `VITE_SPOTIFY_CLIENT_ID` | Public — safe to expose (PKCE, no client secret) |
| Spotify access token | Short-lived, sent only to your local server |
| `.env` file | In `.gitignore` — never committed or pushed |

---

## Branches

| Branch | Description |
|---|---|
| `main` | Stable, up-to-date |
| `feature/deepagent-curator` | Initial agent scaffold |
| `feature/functional-agent-langchain` | Working LangChain agent (merged into main) |

---

## License

MIT

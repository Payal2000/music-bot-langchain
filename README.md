# MyVibe 🎵

A music taste discovery app powered by Spotify + an AI curation agent built with LangChain and OpenAI.



## What It Does

MyVibe lets you swipe through tracks, rate them, and build a personal taste profile. The AI Curator agent then discovers new music you're likely to love — based on your liked tracks, top genres, and favourite artists.



## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                          │
│          (Vite + TypeScript + Tailwind + Zustand)           │
│                                                              │
│   Explore  │  Curate  │  Stats  │  Share                    │
│   (Swipe)  │  (Agent) │  (Charts)│  (Export)                │
└────────────────────────┬────────────────────────────────────┘
                         │ POST /api/curate
                         │ (taste profile: liked tracks,
                         │  genres, artists)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Node.js / Express Server                    │
│                    (server/src/index.ts)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               LangChain Agent (server/src/agent.ts)          │
│                                                              │
│  1. GPT-4o-mini analyses taste profile                       │
│  2. Suggests 6-8 similar artists to discover                 │
│  3. Searches Spotify for those artists                       │
│  4. Fetches their top tracks                                 │
│  5. Filters already-rated tracks                             │
│  6. Returns top 20 sorted by popularity                      │
└──────────┬────────────────────────────┬─────────────────────┘
           │                            │
           ▼                            ▼
┌─────────────────┐          ┌─────────────────────┐
│   OpenAI API    │          │    Spotify Web API   │
│  (gpt-4o-mini)  │          │  /search             │
│                 │          │  /artists/top-tracks │
└─────────────────┘          └─────────────────────┘
```



## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand (persisted to localStorage) |
| Routing | React Router v6 |
| Charts | Recharts + custom CSS bars |
| Player | Spotify Web Playback SDK |
| Auth | Spotify PKCE OAuth |
| Backend | Node.js + Express |
| Agent | LangChain.js + OpenAI GPT-4o-mini |
| Music Data | Spotify Web API |

---

## Features

- **Explore** — Search any artist or song and swipe through their tracks (like / skip)
- **AI Curator** — LangChain agent discovers new artists based on your taste profile
- **Stats** — Visual breakdown of your top genres, favourite artists, and liked tracks
- **Share** — Export your vibe card as an image
- **Mini Player** — Persistent playback bar with skip/prev controls



## Project Structure

```
music-bot/
├── src/
│   ├── pages/
│   │   ├── SearchPage.tsx      # Explore / swipe feed
│   │   ├── CuratePage.tsx      # AI Curator UI
│   │   ├── StatsPage.tsx       # Taste stats
│   │   ├── SharePage.tsx       # Share card
│   │   ├── LoginPage.tsx       # Spotify OAuth
│   │   └── CallbackPage.tsx    # OAuth callback
│   ├── components/
│   │   ├── TrackCard.tsx       # Swipeable track card
│   │   ├── ArtistSearch.tsx    # Search artists + songs
│   │   ├── MiniPlayer.tsx      # Persistent player bar
│   │   └── Navbar.tsx          # Sidebar + mobile nav
│   ├── store/
│   │   ├── useVibeStore.ts     # Ratings, taste profile (Zustand)
│   │   └── useAuthStore.ts     # Spotify token management
│   ├── hooks/
│   │   └── useSpotifyPlayer.ts # Web Playback SDK hook
│   ├── context/
│   │   └── PlayerContext.tsx   # Player context provider
│   └── lib/
│       └── spotify.ts          # Spotify API helpers
│
└── server/
    └── src/
        ├── index.ts            # Express server
        └── agent.ts            # LangChain curator agent
```



## Setup

### 1. Prerequisites

- Node.js 18+
- Spotify Developer account
- OpenAI API key

### 2. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Add `http://127.0.0.1:5173/callback` as a Redirect URI
4. Copy your **Client ID**

### 3. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
OPENAI_API_KEY=your_openai_api_key_here
```



### 4. Install & Run

```bash
# Install frontend deps
npm install

# Install server deps
cd server && npm install && cd ..

# Terminal 1 — React app
npm run dev

# Terminal 2 — Agent server
cd server && npm run dev
```

## Key Security Notes

- **`OPENAI_API_KEY`** — server-side only, never exposed to the browser
- **`VITE_SPOTIFY_CLIENT_ID`** — public, safe to expose (PKCE flow, no secret)
- **Spotify token** — stored in memory/localStorage, sent to the local server only
- **`.env`** — excluded from git via `.gitignore`
- **`.env.example`** — committed with placeholder values only



## Agent Flow (AI Curator)

```
User clicks "Curate for me"
        │
        ▼
React sends taste profile to POST /api/curate
  { likedTrackIds, topGenres, topArtists, topArtistIds, ratedTrackIds, spotifyToken }
        │
        ▼
GPT-4o-mini reasons about taste → suggests 6-8 artist names to discover
        │
        ▼
Server searches Spotify for each suggested artist
        │
        ▼
Fetches top tracks from discovered artists
        │
        ▼
Filters already-rated tracks → sorts by popularity → returns top 20
        │
        ▼
React drops curated tracks into existing swipe feed
```



## Branches

| Branch | Description |
|---|---|
| `main` | Stable base |
| `feature/deepagent-curator` | Initial agent scaffold |
| `feature/functional-agent-langchain` | **Working LangChain agent** (current) |

## License

MIT

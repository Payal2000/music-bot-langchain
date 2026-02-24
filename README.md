# MyVibe — Music Taste Tracker

> Discover, rate, and decode your music taste — powered by Spotify.

A beautiful vinyl-themed web app that lets you swipe through tracks, build your taste profile, and visualize what your musical instincts say about you.

---

## Features

| Feature | Description |
|---|---|
| **Spotify Login** | Secure OAuth 2.0 PKCE flow — no backend, no client secret |
| **Artist + Track Search** | Unified search with keyboard navigation (↑↓ Enter Esc) |
| **Swipe to Rate** | Drag right to like ♥, drag left to skip ✕ |
| **In-Browser Playback** | Spotify Web Playback SDK — plays directly in the browser tab |
| **Mini Player** | Persistent bottom bar with seek, prev/next, play/pause |
| **Stats Dashboard** | Vibe ratio, top genres (bar chart), favourite artists, recent likes |
| **Share Card** | Export a PNG card of your music taste to share anywhere |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS (custom `vinyl` theme) |
| State | Zustand with `persist` middleware (localStorage) |
| Routing | React Router v6 |
| Charts | Recharts (PieChart, BarChart) |
| Icons | Lucide React |
| Export | html-to-image |
| Auth | Spotify PKCE OAuth (browser-safe, no backend) |
| Playback | Spotify Web Playback SDK |
| Fonts | Playfair Display · DM Sans · JetBrains Mono |

---

## Project Structure

```
music-bot/
├── public/
│   └── vinyl.svg                  # Favicon
├── src/
│   ├── components/
│   │   ├── ArtistSearch.tsx       # Unified search dropdown (artists + tracks)
│   │   ├── MiniPlayer.tsx         # Persistent bottom player bar
│   │   ├── Navbar.tsx             # Sidebar navigation
│   │   └── TrackCard.tsx          # Swipeable track card with drag gesture
│   ├── context/
│   │   └── PlayerContext.tsx      # React context for player state sharing
│   ├── hooks/
│   │   └── useSpotifyPlayer.ts    # Spotify Web Playback SDK hook
│   ├── lib/
│   │   ├── pkce.ts                # PKCE OAuth helpers + token exchange
│   │   └── spotify.ts             # Spotify Web API calls (search, top tracks)
│   ├── pages/
│   │   ├── CallbackPage.tsx       # OAuth callback handler
│   │   ├── LoginPage.tsx          # Animated login screen
│   │   ├── SearchPage.tsx         # Main explore / swipe page
│   │   ├── SharePage.tsx          # Share card generator (PNG export)
│   │   └── StatsPage.tsx          # Charts & taste stats dashboard
│   ├── store/
│   │   ├── useAuthStore.ts        # Zustand: access/refresh tokens + auto-refresh
│   │   └── useVibeStore.ts        # Zustand: ratings, liked/disliked, derived stats
│   └── types/
│       └── spotify.ts             # TypeScript types for Spotify API responses
├── .env                           # Your secrets (gitignored)
├── .env.example                   # Template for required env vars
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js             # Custom vinyl color palette + animations
├── tsconfig.json
└── vite.config.ts
```

---

## Setup

### 1. Prerequisites

- Node.js 18+
- A **Spotify Premium** account (required for playback)
- A Spotify Developer app

### 2. Create a Spotify App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Set **Redirect URI** to: `http://localhost:5173/callback`
   - In the input field, type the URI and press **Enter** (don't click Add — just press Enter, then Save)
4. Copy your **Client ID**

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
```

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Important:** Use `localhost` (not `127.0.0.1`) — the Spotify Web Playback SDK only works on `localhost`.

---

## How It Works

### Authentication (PKCE)
No backend is needed. The app uses Spotify's PKCE flow:
1. Generate a random `code_verifier` → store in `sessionStorage`
2. Hash it to `code_challenge` → send to Spotify auth URL
3. Spotify redirects back with an authorization `code`
4. Exchange `code` + `verifier` for `access_token` + `refresh_token`
5. Tokens stored in `localStorage` via Zustand `persist`; auto-refreshed before expiry

### Playback (Web Playback SDK)
The app creates an in-browser Spotify player called **"MyVibe Player"**:
- On mount, the SDK fires a `ready` event with a `device_id`
- Clicking play sends the track URI to `/me/player/play?device_id=<id>`
- `player_state_changed` events update the mini player UI in real time
- Position ticks forward every second via a local interval

### Rating System
Ratings are stored in Zustand (persisted to `localStorage`):
- **Like** (swipe right / ♥ button): saves track + artist + timestamp
- **Dislike** (swipe left / ✕ button): saves with `reaction: 'dislike'`
- Stats are derived on-the-fly from the ratings array (top genres, top artists, vibe ratio)

---

## Scopes Requested

| Scope | Purpose |
|---|---|
| `streaming` | Web Playback SDK |
| `user-read-email` | Basic profile |
| `user-read-private` | Account info (Premium check) |
| `user-modify-playback-state` | Play, pause, seek, skip |
| `user-read-playback-state` | Read current playback |

---

## Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

---

## Roadmap / AI Agent Ideas

The app already has rich taste data (liked tracks, genres, artists, timestamps). Here's where an AI agent could plug in:

### 1. Vibe Analyst Agent
An LLM agent that reads your ratings and writes a personality-style music profile:
- _"You gravitate toward melancholic indie with driving rhythms — artists like Bon Iver but faster."_
- Input: liked track names, genres, artists → Output: narrative taste summary
- Model: Claude API (`claude-sonnet-4-6`) with structured ratings as context

### 2. Playlist Curator Agent
An agentic loop that generates Spotify playlist suggestions:
- Calls Spotify's `/recommendations` endpoint seeded from your top liked tracks
- Agent iterates, filters by genre preference, removes already-disliked artists
- Optionally creates the playlist directly via Spotify API

### 3. Daily Discover Agent (scheduled)
A backend agent (e.g. Cloudflare Worker or Vercel Cron) that:
- Reads your Spotify listening history
- Cross-references with your vibe profile
- Pushes a "Today's Pick" notification or email

### 4. Taste-Match Agent
Compares your vibe profile to friends' profiles:
- Share a profile token → agent finds overlap genres / divergence points
- _"You and Priya both love shoegaze but she leans more toward post-punk"_

### 5. Mood-to-Music Agent
Given a text prompt ("I want something for a late-night drive in rain"):
- Agent calls Claude to extract mood tags
- Passes tags to Spotify recommendations API
- Returns a curated list of tracks to swipe through

---

## Known Limitations

- **Spotify Premium required** — free accounts cannot use Web Playback SDK
- **localhost only** — the Spotify SDK's domain check rejects `127.0.0.1`; always use `http://localhost:5173`
- **No backend** — all data lives in the browser (`localStorage`); clearing storage resets ratings
- **10 top tracks per artist** — Spotify's API limit for `artist/top-tracks`

---

## License

MIT

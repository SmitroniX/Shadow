# 🎬 ShadowPlex — Movie & Web Series Streaming & Downloading Platform

<div align="center">

![ShadowPlex Banner](https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80)

**A high-performance, dark-cinema web platform for streaming and downloading 4K Ultra HD Movies and Web Series.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-emerald.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](#)

</div>

---

## ✨ Features

### 🌟 1. Cinema-Grade User Interface
- **Cyber-Noir Aesthetic**: Deep obsidian black palette with glowing neon purple and cyan accents, glassmorphic dropdowns, and backdrop blur cards.
- **Dynamic Hero Banner**: Auto-rotating carousel of featured titles with trailer preview, synopsis, IMDb score, 4K HDR badges, and quick actions.
- **Top 10 Today**: Netflix/Prime-style ranking with oversized stylized neon numbers (1 through 10) and interactive hover cards.
- **Category Rows & Carousels**:
  - Trending Now
  - Blockbuster Movies
  - Binge-Worthy Web Series
  - Cyberpunk & Sci-Fi
  - Action, Heist & Thriller
- **Watchlist & Continue Watching**:
  - Saved library in `localStorage`.
  - Continuous playback memory with visual percentage progress bar and 1-click resume.

### 🎥 2. ShadowPlayer — Custom Built-in Video Player
- Custom responsive HTML5 video player with modern sleek controls overlay:
  - **Playback Speed**: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
  - **Quick Seek**: 10s Rewind (← / J) and 10s Fast-Forward (→ / L)
  - **Series Smart Flow**: Auto-next episode button and auto-transition on episode end
  - **Multi-Server Streaming**: Switch between ShadowStream 4K VIP, Fast Cloud CDN, or external embed players (VidSrc/SuperEmbed)
  - **Keyboard Shortcuts**: Space (Play/Pause), F (Fullscreen), M (Mute), Arrows (Seek & Volume), Esc (Exit)
  - **Auto-Sync Progress**: Remembers your exact timestamp in seconds

### ⬇️ 3. Multi-Quality Download Hub
- **Multiple Quality Tiers**:
  - **4K Ultra HD (2160p 10-bit HDR)** — Highest bitrates (~14 GB)
  - **1080p Full HD (Bluray / x265)** — Balanced crisp fidelity (~3.8 GB)
  - **720p HD** — High efficiency (~1.4 GB)
  - **480p Mobile Save** — Ultra data saver (~650 MB)
- **Series Batch Downloader**: Download entire seasons in one click or select individual episodes.
- **In-App Download Manager Drawer**:
  - Real-time download progress bar, concurrent speed simulator (e.g. 28.5 MB/s), ETA timer.
  - Controls to Pause, Resume, Cancel, or Save completed files directly to disk.

### 🔍 4. Instant Live Search
- Global Command Palette (`Ctrl+K` or `/` shortcut).
- Real-time search by title, cast, director, synopsis, or genre.
- Direct instant stream or download actions straight from search results.

### 🛡️ 5. Admin CMS Dashboard
- Real-time platform statistics (Total Titles, Total Views, Total Downloads, Bandwidth Served).
- **Add New Title Form**:
  - Choose between Movie and Web Series.
  - Multi-season and episode builder with thumbnails and stream links.
  - Custom streaming server URLs & download mirrors.
- Catalog management table with live deletion and updates synced to persistent JSON database.

---

## 🚀 Getting Started

### 1. Requirements
- **Node.js** v18+ or v20+
- **npm** v9+

### 2. Quick Run

From the project root:

```bash
cd /home/ubuntu/ShadowPlex

# Production mode (Runs full-stack on port 5000)
npm start

# OR Development mode:
# Terminal 1 - Backend:
npm run backend

# Terminal 2 - Frontend:
npm run frontend
```

### 3. Ports:
- **Full-Stack Production App**: `http://localhost:5000`
- **Vite Development Server**: `http://localhost:3001` (or `3000`)
- **Backend API**: `http://localhost:5000/api`

---

## 🚀 Netlify Deployment Guide

ShadowPlex is configured for **1-click, zero-config deployment on Netlify**:

1. Log in to [Netlify](https://app.netlify.com/) and click **"Add new site"** > **"Import an existing project"**.
2. Connect your GitHub account and select **`SmitroniX/Shadow`**.
3. Netlify will auto-detect the configuration from [`netlify.toml`](file:///home/ubuntu/ShadowPlex/netlify.toml):
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist` (or `dist` when base is `frontend`)
4. Click **"Deploy Shadow"**.
5. SPA routing (`_redirects`) and client-side catalog fallbacks ensure instant, high-speed streaming & downloading on Netlify!

---


## 📂 Project Architecture

```
ShadowPlex/
├── backend/
│   ├── data/
│   │   └── catalog.json     # Persistent database for movies & series
│   ├── package.json
│   └── server.js            # Express REST API & static dist server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanelModal.jsx       # CMS management & stats
│   │   │   ├── ContinueWatchingRow.jsx   # Playback history resume
│   │   │   ├── DownloadManagerModal.jsx  # Active downloads drawer
│   │   │   ├── HeroBanner.jsx            # Featured hero carousel
│   │   │   ├── MediaCard.jsx             # Poster cards & hover actions
│   │   │   ├── MediaDetailModal.jsx      # Specs, episodes & download hub
│   │   │   ├── MediaRow.jsx              # Category carousel rows
│   │   │   ├── Navbar.jsx                # Responsive glass navigation
│   │   │   ├── SearchModal.jsx           # Command palette search
│   │   │   ├── ShadowPlayer.jsx          # Custom cinema video player
│   │   │   ├── Toast.jsx                 # Dynamic download toasts
│   │   │   └── Top10Row.jsx              # Oversized stylized ranking row
│   │   ├── context/
│   │   │   ├── DownloadContext.jsx       # Download queue & progress
│   │   │   └── WatchlistContext.jsx      # Watchlist & playback history
│   │   ├── services/
│   │   │   └── api.js                    # REST API client
│   │   ├── App.jsx                       # Main catalog & tab router
│   │   ├── index.css                     # Tailwind v4 & cinema styles
│   │   └── main.jsx                      # Application entry
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                    # Tailwind v4 & proxy config
└── package.json
```

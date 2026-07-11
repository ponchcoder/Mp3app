# Whisper Melody

A beautiful, offline-first Progressive Web App music player — a handcrafted gift wrapped in soft pastels, dreamy animations, and romantic details.

![Whisper Melody](public/icons/icon-512.png)

## Features

- **Offline-first PWA** — Install on iPhone or Android, works without internet
- **Local music library** — Upload MP3s via drag-and-drop or file browser
- **Full player** — Play, pause, shuffle, repeat, seek, volume, queue management
- **IndexedDB storage** — Songs, playlists, favorites, settings all stay on device
- **Animated environments** — 8 dreamy scenes that cycle every 3 minutes
- **Audio-reactive visuals** — Gentle animations that respond to your music
- **5 themes** — Light, Dark, Pink, Pastel, and Nature
- **Romantic surprises** — Floating hearts, encouraging messages, secret animations
- **Media Session API** — Lock screen controls on supported devices
- **Import/Export** — Backup and restore your entire library

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Installing as PWA

### iPhone (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home Screen"

## Project Structure

```
src/
├── animations/     # Background environments, particles, effects
├── app/            # Next.js app router (layout, page)
├── components/
│   ├── layout/     # Navigation, mini player
│   ├── screens/    # Home, Library, Player, Queue, Settings
│   └── ui/         # Reusable UI components
├── contexts/       # React contexts (Player, Library, Settings)
├── hooks/          # Custom hooks (audio analyzer, surprises, etc.)
├── services/       # Metadata extraction, media session, import/export
├── storage/        # IndexedDB layer
├── styles/         # Global CSS and theme variables
├── types/          # TypeScript type definitions
└── utils/          # Helpers, theme config, messages
public/
├── icons/          # PWA icons
├── manifest.json   # PWA manifest
└── sw.js           # Service worker
```

## Tech Stack

- **Next.js 15** — React framework with App Router
- **TypeScript** — Strict typing throughout
- **Tailwind CSS** — Utility-first styling with custom theme
- **Framer Motion** — Smooth animations
- **IndexedDB (idb)** — Client-side persistent storage
- **Web Audio API** — Audio-reactive visualizations
- **Media Session API** — System media controls

## Personalization

In Settings, you can:
- Set the recipient's name for personalized greetings
- Choose from 5 color themes
- Adjust animation intensity
- Enable vinyl mode for rotating album art
- Toggle reduced motion for accessibility

## Privacy

Everything stays on the device. No accounts, no cloud, no tracking. Your music is yours alone.

---

Made with love.

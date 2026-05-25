# Sync'n — Life OS
### *Stop sink'n and start Sync'n.*

A personal life operating system for Brendan "Beej" Mulholland. Built on React + Vite, deployed on Netlify.

Not a task manager. A purpose-aligned life OS.

---

## What It Does

Sync'n organises your life around **8 pillars** — not projects or tasks:

| Pillar | Colour | Sub-pillars |
|--------|--------|-------------|
| Family | Warm amber | Madden, Hardey, Noa, Relationship, Home |
| Film & Craft | Sync'n cyan | CROWE, THUNK, Blue Orchids, Acting, Writing |
| Business | Deep violet | Shadow Wolves, SLATR, SPOT'D, PITCH'D, Playbook |
| Health | Forest green | Physical, Mental, Sleep, Energy |
| Finance | Gold | Income, Teaching, Online Products, Budgeting |
| Creativity | Burnt orange | Kids Projects, Mantra Toys, Creative Den, Children's Books |
| Growth | Steel blue | Learning, Coaching, Identity, Reflection |
| Parking Lot | Muted slate | Everything parked |

---

## Screens

- **⚡ Mission Control** — Morning briefing, stats, today's schedule, urgent queue, life balance strip
- **📋 Today** — Hourly timeline with energy dots, postpone button, pinned next-priority footer
- **🗺 Life Map** — Pillar cards with progress, drill into sub-pillars, full task list
- **📅 Calendar** — 7-day view (Mon–Sun), week navigation, energy overlay, click-to-block, Google Calendar sync
- **✦ Compass** — AI life alignment coach: morning briefing, weekly reset, check-in, blocker analysis

---

## Deploy to Netlify

1. Push this repo to GitHub
2. **Netlify → New site → Import from GitHub** → select repo
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy — live in ~2 minutes

---

## Environment Variables

In **Netlify → Site → Environment Variables**, add:

| Key | Value | Purpose |
|-----|-------|---------|
| `VITE_ANTHROPIC_KEY` | Your Anthropic API key | Compass AI + AI Scheduling |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | Calendar sync |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Calendar sync |
| `GOOGLE_REFRESH_TOKEN` | From OAuth Playground | Calendar sync |

Get your Anthropic API key at: https://console.anthropic.com

---

## Google Calendar Sync Setup

### Step 1 — Google Cloud Console
1. Go to https://console.cloud.google.com
2. Create or select a project
3. Enable the **Google Calendar API**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorised redirect URIs: add `https://developers.google.com/oauthplayground`
7. Copy your **Client ID** and **Client Secret**
8. Go to **OAuth consent screen → Publishing status → In production**

### Step 2 — Get a Refresh Token
1. Go to https://developers.google.com/oauthplayground
2. Gear icon → check **"Use your own OAuth credentials"** → enter Client ID + Secret
3. Find **Google Calendar API v3** → select `https://www.googleapis.com/auth/calendar.readonly`
4. Click **Authorise APIs** → sign in as `brendanlukebyrne@gmail.com`
5. Click **Exchange authorisation code for tokens**
6. Copy the **Refresh token**

### Calendars Being Synced
- **Primary (Work):** `brendanlukebyrne@gmail.com` — shown in cyan
- **Byrne Family Calendar:** `mr6k6unuaegivoamfqbhfdaokh47384i@import.calendar.google.com` — shown in amber

After adding env vars, redeploy and hit the **↻ Sync** button in the app.

---

## Project Structure

```
syncn-app/
├── index.html                  # Entry point
├── netlify.toml                # Netlify build + redirect config
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                # React entry
│   └── App.jsx                 # Full app (1290 lines)
└── netlify/
    └── functions/
        └── sync-calendar.js    # Serverless Google Calendar sync
```

---

## Local Development

```bash
npm install
npm run dev
```

For calendar sync locally:
```bash
npm install -g netlify-cli
netlify dev
```

Create a `.env` file locally:
```
VITE_ANTHROPIC_KEY=your_key_here
```

---

## Key Features

- **Compass AI** — Purpose coach with long-term memory (localStorage). Direct, no fluff, calls out gaps between stated priorities and actual time.
- **Energy Profile** — Set per-hour energy levels; AI scheduler places high-priority tasks in your peak hours.
- **Blocker Detector** — Proactively surfaces tasks postponed 2+ times with 8 blocker reasons, routes to Compass.
- **Life Balance Warnings** — Flags pillars receiving less than 5% of scheduled time.
- **AI Scheduling** — Energy-aware, works around Google Calendar events.
- **7-Day Calendar** — Week navigation, overlapping events side-by-side, click-to-block.

---

## Notes

- All data is currently stored in React state (resets on refresh). Persistent storage requires a backend.
- Compass memory (stated priorities) persists via `localStorage`.
- Calendar events are fetched on demand via the ↻ Sync button.

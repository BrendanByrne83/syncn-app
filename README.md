# Sync'n
### *Stop sink'n and start Sync'n.*

A personal life operating system for Brendan "Beej" Mulholland. Built on React + Vite, deployed on Netlify. Not a task manager — a calm daily operating system built around purpose, pillars, and intelligent scheduling.

---

## Screens

| Screen | Purpose |
|--------|---------|
| **Today** | Merged mission + daily view. Morning/Afternoon/Evening accordions. Day or Week toggle. Life balance strip. |
| **Calendar** | 7-day week view (Mon–Sun), week navigation, Google Calendar sync, energy overlay, click-to-block. |
| **Life Map** | 8 life pillars with sub-pillars, progress rings, task drill-down. |
| **Compass** | AI life alignment coach. Morning briefing, weekly reset, task creation from pasted content. |

---

## Life Pillars

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

## Key Features

- **Smart conflict-aware AI scheduling** — builds a minute-accurate timeline of all occupied slots, validates every suggestion, finds the next genuinely free slot if Claude's suggestion conflicts. Max 4 hours of tasks per day, 15-minute buffers enforced.
- **Google Calendar sync** — pulls 6 weeks (1 week back, 5 weeks forward) from both Gmail and Byrne Family Calendar. Work events in cyan, family events in amber.
- **Compass AI** — paste any email or content and say "create tasks from this" — Compass extracts actionable tasks, assigns pillars/priorities, and adds them to your board with a confirmation card.
- **Recurring tasks** — Daily, Weekdays, Weekly (pick days Mon–Sun), Weekends. Edit this occurrence only or all future. Delete this occurrence or entire series.
- **Persistent storage** — All tasks and recurring tasks saved to localStorage. Deletions survive Netlify deploys.
- **Energy Rhythm** — Set Morning/Midday/Afternoon/Evening/Night energy levels. AI scheduling respects your peak periods.
- **Ignored events** — Hide Google Calendar events from Sync'n planning without removing them from Google Calendar.
- **Calendar block hierarchy** — Locked (calendar events), Scheduled (AI tasks), Recurring, Blocked time — each with distinct visual treatment.
- **Archive** — Completed tasks auto-archive after 7 days. Restore anytime.

---

## Deploy to Netlify

1. Push this repo to GitHub
2. **Netlify → New site → Import from GitHub** → select repo
3. Build settings auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy — live in ~2 minutes

---

## Environment Variables

In **Netlify → Site → Environment Variables**:

| Key | Value | Purpose |
|-----|-------|---------|
| `VITE_ANTHROPIC_KEY` | Anthropic API key from console.anthropic.com | Compass AI + ✨ Schedule |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | Calendar sync |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Calendar sync |
| `GOOGLE_REFRESH_TOKEN` | From OAuth Playground | Calendar sync |

---

## Google Calendar Setup

### Step 1 — Google Cloud Console
1. Go to https://console.cloud.google.com
2. Create or select a project
3. Enable the **Google Calendar API**
4. **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorised redirect URIs: add `https://developers.google.com/oauthplayground`
7. Copy **Client ID** and **Client Secret**
8. **OAuth consent screen → Publishing status → In production**

### Step 2 — Get a Refresh Token
1. Go to https://developers.google.com/oauthplayground
2. Gear icon → check **"Use your own OAuth credentials"** → enter Client ID + Secret
3. **Google Calendar API v3** → select `https://www.googleapis.com/auth/calendar.readonly`
4. **Authorise APIs** → sign in as `brendanlukebyrne@gmail.com`
5. **Exchange authorisation code for tokens**
6. Copy the **Refresh token**

### Calendars synced
- **Primary (Work):** `brendanlukebyrne@gmail.com` — shown in cyan
- **Byrne Family Calendar:** `mr6k6unuaegivoamfqbhfdaokh47384i@import.calendar.google.com` — shown in amber

After adding env vars, redeploy and hit **↻ Sync** in the app.

---

## Project Structure

```
syncn-app/
├── index.html
├── netlify.toml                  # Build config + redirects
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                  # React entry point
│   └── App.jsx                   # Full app (~2900 lines)
└── netlify/
    └── functions/
        └── sync-calendar.js      # Serverless Google Calendar sync (month range)
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

Create `.env` locally:
```
VITE_ANTHROPIC_KEY=your_key_here
```

---

## Notes

- **Data persistence:** Tasks saved to `localStorage` — survives deploys but is per-browser. A database backend would be needed for cross-device sync.
- **Compass memory:** Stated priorities persist via `localStorage`.
- **Calendar sync:** Fetches on demand via ↻ Sync button. Pulls 6 weeks of events.
- **AEST timezone:** All calendar events parsed to AEST (+10) regardless of source timezone format.

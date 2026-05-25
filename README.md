# Sync'n — Setup Guide

## Deploy to Netlify

1. Push this repo to GitHub
2. In Netlify: **New site → Import from GitHub** → select this repo
3. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy site**

---

## Enable Live Google Calendar Sync

The Sync button calls a Netlify serverless function that fetches your Google Calendar.
You need to set up Google OAuth credentials once.

### Step 1 — Google Cloud Console

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable the **Google Calendar API**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorised redirect URIs: add `https://developers.google.com/oauthplayground`
7. Copy your **Client ID** and **Client Secret**

### Step 2 — Get a Refresh Token

1. Go to https://developers.google.com/oauthplayground
2. Click the gear icon → check **"Use your own OAuth credentials"**
3. Enter your Client ID and Client Secret
4. In Step 1, find **Google Calendar API v3** and select:
   - `https://www.googleapis.com/auth/calendar.readonly`
5. Click **Authorise APIs** → sign in as `brendanlukebyrne@gmail.com`
6. Click **Exchange authorisation code for tokens**
7. Copy the **Refresh token**

### Step 3 — Add Environment Variables in Netlify

In your Netlify dashboard → **Site → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | from Step 1 |
| `GOOGLE_CLIENT_SECRET` | from Step 1 |
| `GOOGLE_REFRESH_TOKEN` | from Step 2 |

Then **redeploy** the site. The ↻ Sync button will now pull live events.

---

## Local Development

```bash
npm install
npm run dev
```

The calendar sync won't work locally without the Netlify Functions runtime.
To test locally: `npm install -g netlify-cli` then `netlify dev`

---

## Calendars Being Synced

- **Primary (Work):** brendanlukebyrne@gmail.com — shown in cyan
- **Byrne Family Calendar:** shown in warm tan

// netlify/functions/sync-calendar.js
// 
// This function fetches events from two Google calendars and returns them
// as a merged, deduplicated array ready for the Sync'n calendar view.
//
// SETUP REQUIRED:
// In Netlify dashboard → Site → Environment Variables, add:
//   GOOGLE_CLIENT_ID      — from Google Cloud Console OAuth credentials
//   GOOGLE_CLIENT_SECRET  — from Google Cloud Console OAuth credentials
//   GOOGLE_REFRESH_TOKEN  — obtained via OAuth flow (see README)

const FAMILY_CAL_ID = "mr6k6unuaegivoamfqbhfdaokh47384i@import.calendar.google.com";
const PRIMARY_CAL_ID = "brendanlukebyrne@gmail.com";

// Parse local time from ISO string, converting to AEST (UTC+10) when needed.
// Named offset like +10:00 → read as-is. UTC "Z" suffix → shift +10hrs to AEST.
const AEST_OFFSET = 10;

function parseLocal(str) {
  if (!str) return null;

  // All-day date only e.g. "2026-05-30"
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split("-").map(Number);
    return { year, month, day, hour: 0, min: 0, allDay: true };
  }

  const m = str.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;

  let year = +m[1], month = +m[2], day = +m[3], hour = +m[4], min = +m[5];

  // Has a named timezone offset like +10:00 or -05:00 — use as local time
  const hasOffset = /[+-]\d{2}:\d{2}$/.test(str);
  if (!hasOffset) {
    // No offset = UTC, shift to AEST +10
    hour += AEST_OFFSET;
    if (hour >= 24) {
      hour -= 24;
      const d = new Date(year, month - 1, day + 1);
      year = d.getFullYear(); month = d.getMonth() + 1; day = d.getDate();
    }
  }

  return { year, month, day, hour, min };
}

function gcalToEvent(ev, calType) {
  const rawStart = ev.start?.dateTime || ev.start?.date || "";
  const rawEnd   = ev.end?.dateTime   || ev.end?.date   || "";
  const start = parseLocal(rawStart);
  const end   = parseLocal(rawEnd);
  if (!start) return null;

  const duration = end
    ? (end.hour * 60 + end.min) - (start.hour * 60 + start.min)
    : 60;

  const date = new Date(start.year, start.month - 1, start.day);
  const dow = date.getDay();
  const dayIdx = dow >= 1 && dow <= 5 ? dow - 1 : dow === 6 ? 4 : 0;

  return {
    id: ev.id,
    title: ev.summary || "(No title)",
    dayIdx,
    startHour: start.hour,
    startMin: start.min,
    duration: Math.max(duration, 15),
    calType,
    location: ev.location || "",
    attendees: (ev.attendees || []).map(a => a.displayName || a.email).join(", "),
    htmlLink: ev.htmlLink || "",
  };
}

async function getAccessToken() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error("Missing Google OAuth environment variables. See README for setup.");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token: " + JSON.stringify(data));
  return data.access_token;
}

async function fetchCalendarEvents(calendarId, accessToken, timeMin, timeMax) {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Calendar API error for ${calendarId}: ${err}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function handler(event, context) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Get this week's Mon–Fri range
    const now = new Date();
    const day = now.getDay() || 7;
    const mon = new Date(now);
    mon.setDate(now.getDate() - (day - 1));
    mon.setHours(0, 0, 0, 0);
    const fri = new Date(mon);
    fri.setDate(mon.getDate() + 4);
    fri.setHours(23, 59, 59, 999);

    const timeMin = mon.toISOString();
    const timeMax = fri.toISOString();

    const accessToken = await getAccessToken();

    // Fetch both calendars in parallel
    const [primaryRaw, familyRaw] = await Promise.all([
      fetchCalendarEvents(PRIMARY_CAL_ID, accessToken, timeMin, timeMax),
      fetchCalendarEvents(FAMILY_CAL_ID, accessToken, timeMin, timeMax),
    ]);

    // Convert and tag
    const workEvents   = primaryRaw.map(e => gcalToEvent(e, "work")).filter(Boolean);
    const familyEvents = familyRaw.map(e => gcalToEvent(e, "family")).filter(Boolean);

    // Merge and deduplicate by id
    const seen = new Set();
    const merged = [...workEvents, ...familyEvents].filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(merged),
    };
  } catch (err) {
    console.error("sync-calendar error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

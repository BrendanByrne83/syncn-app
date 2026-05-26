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

// Parse the LOCAL calendar date and time from a Google Calendar ISO string.
// Strategy: events with a named offset (+10:00) already encode local time in the
// date/time portion. Events in UTC (Z) need shifting to AEST (+10).
// We use Date.UTC for day-rollover arithmetic to avoid host-timezone interference.
const AEST_OFFSET_HOURS = 10;

function parseLocalDateTime(str) {
  if (!str) return null;

  // All-day event — date-only string e.g. "2026-05-30"
  if (/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
    const [y, mo, d] = str.trim().split("-").map(Number);
    return { year: y, month: mo, day: d, hour: 0, min: 0, allDay: true };
  }

  // DateTime string
  const m = str.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;

  let year = +m[1], month = +m[2], day = +m[3], hour = +m[4], min = +m[5];

  // Named offset present (e.g. +10:00, -05:00) → date/time IS already local. Done.
  const hasNamedOffset = /[+-]\d{2}:\d{2}$/.test(str);
  if (!hasNamedOffset) {
    // No offset = UTC — shift forward to AEST
    hour += AEST_OFFSET_HOURS;
    if (hour >= 24) {
      hour -= 24;
      // Use UTC arithmetic for safe day rollover
      const next = new Date(Date.UTC(year, month - 1, day + 1));
      year = next.getUTCFullYear();
      month = next.getUTCMonth() + 1;
      day = next.getUTCDate();
    }
  }

  return { year, month, day, hour, min };
}

function gcalToEvent(ev, calType) {
  const rawStart = ev.start?.dateTime || ev.start?.date || "";
  const rawEnd   = ev.end?.dateTime   || ev.end?.date   || "";

  const start = parseLocalDateTime(rawStart);
  const end   = parseLocalDateTime(rawEnd);
  if (!start) return null;

  // Duration in minutes
  let dur = 60;
  if (end) {
    dur = (end.hour * 60 + end.min) - (start.hour * 60 + start.min);
    if (dur < 0) dur += 24 * 60; // crosses midnight
    if (dur === 0) dur = 60;
  }

  // Day-of-week using UTC to avoid host timezone distorting the result
  const utcD = new Date(Date.UTC(start.year, start.month - 1, start.day));
  const dow = utcD.getUTCDay(); // 0=Sun..6=Sat → convert to Mon=0..Sun=6
  const dayIdx = dow === 0 ? 6 : dow - 1;

  // Return a clean YYYY-MM-DD local date string as rawStart.
  // The client splits on "T" and uses only the date part — giving this directly
  // avoids any ambiguity in the client-side date parsing.
  const localDateStr = [
    start.year,
    String(start.month).padStart(2, "0"),
    String(start.day).padStart(2, "0"),
  ].join("-");

  return {
    id: ev.id,
    title: ev.summary || "(No title)",
    dayIdx,
    rawStart: localDateStr,   // clean YYYY-MM-DD of the LOCAL date — safe to split on "T"
    startHour: start.hour,
    startMin: start.min,
    duration: Math.max(dur, 15),
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
    // Range: week (default) or month
    const range = event.queryStringParameters?.range || "week";
    const now = new Date();
    const day = now.getDay() || 7;
    const mon = new Date(now);
    mon.setDate(now.getDate() - (day - 1)); // Start of this week Mon
    mon.setHours(0, 0, 0, 0);

    let timeMin, timeMax;
    if (range === "month") {
      // 1 week back to 5 weeks forward (~6 weeks total)
      const start = new Date(mon);
      start.setDate(mon.getDate() - 7);
      const end = new Date(mon);
      end.setDate(mon.getDate() + 35);
      end.setHours(23, 59, 59, 999);
      timeMin = start.toISOString();
      timeMax = end.toISOString();
    } else {
      // Default: Mon–Sun of current week
      const fri = new Date(mon);
      fri.setDate(mon.getDate() + 6);
      fri.setHours(23, 59, 59, 999);
      timeMin = mon.toISOString();
      timeMax = fri.toISOString();
    }

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

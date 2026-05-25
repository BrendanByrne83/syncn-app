import { useState, useEffect, useRef, useCallback } from "react";

// ─── SYNC'N BRAND PALETTE ─────────────────────────────────────────────────────
const C = {
  bg: "#0a0e1a",
  bgCard: "#0f1422",
  bgSurface: "#131929",
  bgHover: "#1a2235",
  border: "#1e2a40",
  borderLight: "#162030",
  text: "#f0f4ff",
  textMuted: "#6b7fa3",
  textFaint: "#3a4a6a",
  cyan: "#00b4d8",
  cyanDim: "#0090b0",
  cyanGlow: "#00b4d820",
  cyanBright: "#38d4f5",
  high: "#e05c5c",
  medium: "#d4a843",
  low: "#4db88a",
  done: "#4db88a",
  parked: "#4a7fa0",
  upcoming: "#d4a843",
};

const TIER_META = {
  1:  { label: "Film & Career",        icon: "🎬", color: "#00b4d8" },
  2:  { label: "Shadow Wolves",         icon: "🐺", color: "#5b8dd9" },
  3:  { label: "SLATR",                icon: "⚡", color: "#9b6dce" },
  4:  { label: "SPOT'D",               icon: "📍", color: "#4db88a" },
  5:  { label: "PITCH'D",              icon: "🎯", color: "#d4a843" },
  6:  { label: "Producer's Playbook",  icon: "📖", color: "#e07a5c" },
  7:  { label: "Work / Income",        icon: "💼", color: "#6db8b8" },
  8:  { label: "Online Products",      icon: "🛒", color: "#8fb85c" },
  9:  { label: "Kids / Creative",      icon: "🎨", color: "#b88a6d" },
  10: { label: "Follow-Ups",           icon: "✅", color: "#4db88a" },
  11: { label: "Parking Lot",          icon: "❄️", color: "#4a7fa0" },
};

const STATUS_META = {
  active:   { label: "🔥 Active",    color: C.high },
  upcoming: { label: "🟡 Upcoming",  color: C.upcoming },
  done:     { label: "✅ Follow-up", color: C.done },
  parked:   { label: "❄️ Parked",    color: C.parked },
};

// ─── MASTER TASK DATA ─────────────────────────────────────────────────────────
let uid = 1;
const T = (tier, project, title, status="active", priority="Medium", dur=45, notes="") =>
  ({ id:uid++, tier, project, title, status, priority, duration:dur, notes, done:false, scheduled:false, dayIdx:null, startHour:null, startMin:null, deadline:"" });

const INIT_TASKS = [
  T(1,"CROWE","Finalize synopsis completely","active","High",60,"Thriller/elevated horror positioning"),
  T(1,"CROWE","Finalize deck order and structure","active","High",90),
  T(1,"CROWE","Finalize executive summary page","active","High",45),
  T(1,"CROWE","Remove remaining slasher language","active","Medium",30),
  T(1,"CROWE","Build investor version deck","active","High",120),
  T(1,"CROWE","Build distributor version deck","active","High",90),
  T(1,"CROWE","Build talent attachment version deck","active","Medium",90),
  T(1,"CROWE","Build one-page leave-behind PDF","active","Medium",60),
  T(1,"CROWE","Create producer statement","active","Medium",45),
  T(1,"CROWE","Create director vision statement","active","Medium",45),
  T(1,"CROWE","Create financing strategy sheet","active","High",60),
  T(1,"CROWE","Create target cast wishlist","active","Medium",30),
  T(1,"CROWE","Create target producer/director wishlist","active","Medium",30),
  T(1,"CROWE","Create outreach list — producers/directors/consultants","active","Medium",60),
  T(1,"CROWE","Draft outreach packages","active","High",90),
  T(1,"CROWE","Research active Australian productions/casting","active","Medium",60),
  T(1,"CROWE","Track potential casting director info","active","Low",30),
  T(1,"THUNK","Lock edit timeline","active","High",30),
  T(1,"THUNK","Review assembly cut","active","High",90),
  T(1,"THUNK","Sound design pass","active","High",120),
  T(1,"THUNK","Music direction","active","Medium",60),
  T(1,"THUNK","VFX requirements list","active","Medium",45),
  T(1,"THUNK","Festival strategy","active","Medium",60),
  T(1,"THUNK","Poster concepts","active","Medium",60),
  T(1,"THUNK","Teaser/trailer strategy","active","Medium",60),
  T(1,"THUNK","Finalize mythology bible","active","Medium",90),
  T(1,"THUNK","Flesh out maternal curse rules","active","Low",45),
  T(1,"THUNK","Build Lilly/Josh/Hannah dynamics","active","Low",60),
  T(1,"THUNK","Define entity rules completely","active","Medium",45),
  T(1,"THUNK","Outline feature beat sheet","active","Medium",90),
  T(1,"BLUE ORCHIDS","Final logline","active","Medium",30,"Sequel to I'm Here Too"),
  T(1,"BLUE ORCHIDS","Final treatment","active","Medium",90),
  T(1,"BLUE ORCHIDS","Beat sheet","active","Medium",90),
  T(1,"BLUE ORCHIDS","One sheet","active","Low",45),
  T(1,"BLUE ORCHIDS","Sample dialogue pages","active","Low",60),
  T(1,"BLUE ORCHIDS","Visual lookbook","active","Low",60),
  T(1,"BLUE ORCHIDS","Claire letter voiceover draft","active","Low",45),
  T(1,"BLUE ORCHIDS","Character polish","active","Low",45),
  T(1,"THE DEVIL YOU KNOW","Review script status","active","Low",30),
  T(1,"THE DEVIL YOU KNOW","Determine current development stage","active","Low",30),
  T(1,"THE DEVIL YOU KNOW","Identify next action","active","Low",20),
  T(1,"KNIGHT","Review project status","parked","Low",30),
  T(1,"KNIGHT","Review financing strategy","parked","Low",30),
  T(1,"KNIGHT","Packaging considerations","parked","Low",30),
  T(2,"Website","Finish website restructure","active","High",120),
  T(2,"Website","Improve navigation clarity","active","Medium",45),
  T(2,"Website","Finalize section naming","active","Medium",30),
  T(2,"Website","SEO review","active","Medium",60),
  T(2,"Website","Sitemap / robots / redirect check","active","Medium",45),
  T(2,"Website","News section design","active","Low",60),
  T(2,"Company Structure","Clarify divisions","active","Medium",60),
  T(2,"Company Structure","Role descriptions","active","Medium",45),
  T(2,"Company Structure","Team recruitment plan","active","Low",60),
  T(2,"Company Structure","Collaboration MOU workflow","active","Low",45),
  T(2,"Company Structure","Onboarding structure","active","Low",45),
  T(3,"Core Build","Complete development flow implementation","active","High",120),
  T(3,"Core Build","Scrypto diagnostics flow","active","High",90),
  T(3,"Core Build","Risk assessment flow","active","High",90),
  T(3,"Core Build","Recheck validator system","active","High",60),
  T(3,"Core Build","Lock-for-packaging logic","active","High",60),
  T(3,"Core Build","SLATR score system","active","High",90),
  T(3,"Core Build","Project overview redesign","active","Medium",60),
  T(3,"Core Build","Next-step logic refinement","active","Medium",60),
  T(3,"AI Team","Calli refinement","active","High",60),
  T(3,"AI Team","Scrypto refinement","active","High",60),
  T(3,"AI Team","Timey Tim build","active","Medium",60),
  T(3,"AI Team","Cash build","active","Medium",60),
  T(3,"AI Team","Scout build","active","Medium",60),
  T(3,"AI Team","Iris build","active","Medium",60),
  T(3,"AI Team","SLATE-R build","active","Medium",60),
  T(3,"UX","Remove over-gating","active","High",45),
  T(3,"UX","One decision per screen review","active","Medium",45),
  T(3,"UX","Full consistency pass","active","Medium",90),
  T(4,"Core","Fix email spam issues completely","active","High",60),
  T(4,"Core","DKIM/SPF/DMARC review","active","High",45),
  T(4,"Core","Improve admin portal UI","active","Medium",90),
  T(4,"Projects Upgrade","Replace Casting Calls with Projects","active","High",120),
  T(4,"Projects Upgrade","Investors option","active","Medium",60),
  T(4,"Projects Upgrade","Distribution option","active","Medium",60),
  T(4,"Projects Upgrade","Team attachment option","active","Medium",45),
  T(4,"Projects Upgrade","Production stage option","active","Medium",45),
  T(4,"Projects Upgrade","Seeking section","active","Medium",45),
  T(4,"Marketing","Finish Instagram carousel","active","Medium",60),
  T(4,"Marketing","Monthly SPOTLight system","active","Low",60),
  T(5,"PITCH'D","Launch follow-up","active","High",30),
  T(5,"PITCH'D","Gather user feedback","active","High",45),
  T(5,"PITCH'D","Fix bugs","active","High",60),
  T(5,"PITCH'D","Improve exports","active","Medium",60),
  T(5,"PITCH'D","Monitor usage analytics","active","Medium",30),
  T(6,"Playbook","Complete Phase 1 — Project Positioning","active","High",90),
  T(6,"Playbook","Complete remaining phases","active","High",120),
  T(6,"Playbook","Dynamic card system","active","Medium",60),
  T(6,"Playbook","Add SPV explanations","active","Medium",45),
  T(6,"Playbook","Remove overly specific regional examples","active","Medium",30),
  T(6,"Playbook","Add alternate low-budget/student options","active","Medium",45),
  T(6,"Playbook","Finish workbook sections","active","High",90),
  T(6,"Playbook","Final design pass","active","Medium",60),
  T(6,"Playbook","Export version","active","Medium",45),
  T(7,"Teaching","Follow up TAFE contact Craig","upcoming","High",20),
  T(7,"Teaching","Explore screen/media teaching opportunities","upcoming","Medium",45),
  T(7,"Teaching","Explore soft skills teaching opportunities","upcoming","Medium",45),
  T(7,"Teaching","Assess long-term balance with film goals","upcoming","Low",30),
  T(7,"Acting","Continue audition pipeline","upcoming","High",60),
  T(7,"Acting","Agency/representation review","upcoming","Medium",45),
  T(7,"Acting","Outreach to new reps","upcoming","Medium",60),
  T(8,"Straight-Talk Studioz","Define product roadmap","upcoming","High",90),
  T(8,"Products","Script Doctoring course","upcoming","High",120),
  T(8,"Products","Filmmaking resources pack","upcoming","Medium",60),
  T(8,"Products","Templates bundle","upcoming","Medium",60),
  T(8,"Products","Podcast series","upcoming","Low",60),
  T(8,"Products","eBooks","upcoming","Low",60),
  T(8,"Products","Online courses","upcoming","Low",60),
  T(9,"Kids","Imagination Station course review","upcoming","Medium",45),
  T(9,"Kids","Acting workshop review","upcoming","Medium",45),
  T(9,"Kids","Mantra Toys concept review","parked","Low",30),
  T(9,"Creative","Reality debate show concept revisit","parked","Low",30),
  T(9,"Creative","The Creative Den content strategy","upcoming","Low",45),
  T(10,"Follow-Up","Check PITCH'D launch performance","done","High",20),
  T(10,"Follow-Up","Check SPOT'D beta bugs","done","High",20),
  T(10,"Follow-Up","Check website indexing","done","Medium",20),
  T(10,"Follow-Up","Check email deliverability","done","High",20),
  T(10,"Follow-Up","Check CROWE deck revisions","done","High",20),
  T(10,"Follow-Up","Check THUNK post progress","done","Medium",20),
  T(10,"Follow-Up","Check SLATR development progress","done","High",20),
  T(10,"Follow-Up","Check existing job applications","done","Medium",20),
  T(10,"Follow-Up","Check acting representation outreach","done","Medium",20),
  T(11,"Parking Lot","Reality debate show","parked","Low",0),
  T(11,"Parking Lot","Mantra Toys expansion","parked","Low",0),
  T(11,"Parking Lot","The Creative Den expansion","parked","Low",0),
  T(11,"Parking Lot","Extra app concepts","parked","Low",0),
  T(11,"Parking Lot","New startup ideas","parked","Low",0),
];

// ─── CALENDAR UTILS ───────────────────────────────────────────────────────────
const DAYS = ["Mon","Tue","Wed","Thu","Fri"];
const HOURS = Array.from({length:13},(_,i)=>i+7);
const WEEK_DATES = (() => {
  const now=new Date(); const day=now.getDay()||7;
  const mon=new Date(now); mon.setDate(now.getDate()-(day-1));
  return DAYS.map((_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
})();
const TODAY_IDX = Math.min(Math.max(new Date().getDay()-1,0),4);

const px=(h,m=0)=>(h-7)*60+(m/60)*60;
const pxH=mins=>(mins/60)*60;
const fmtT=(h,m)=>`${h%12||12}:${String(m).padStart(2,"0")}${h<12?"am":"pm"}`;
const fmtD=mins=>mins>=60?`${Math.floor(mins/60)}h${mins%60?` ${mins%60}m`:""}`:mins?`${mins}m`:"";

// Convert a Google Calendar event → our meeting shape
// Uses regex to parse LOCAL time directly from ISO string — avoids
// new Date() converting +10:00 timestamps to UTC and breaking hours.
function gcalToMeeting(ev) {
  const rawStart = ev.start?.dateTime || ev.start?.date || "";
  const rawEnd   = ev.end?.dateTime   || ev.end?.date   || "";

  const parseLocal = (str) => {
    const m = str.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return null;
    return { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], min: +m[5] };
  };

  const start = parseLocal(rawStart);
  const end   = parseLocal(rawEnd);
  if (!start || !end) return null;

  const duration = (end.hour * 60 + end.min) - (start.hour * 60 + start.min);

  // Build date using parsed year/month/day to get correct day-of-week
  const date = new Date(start.year, start.month - 1, start.day);
  const dow = date.getDay(); // 0=Sun
  const dayIdx = dow >= 1 && dow <= 5 ? dow - 1 : 4; // Mon=0, clamp weekends to Fri

  return {
    id: ev.id,
    title: ev.summary || "(No title)",
    dayIdx,
    startHour: start.hour,
    startMin: start.min,
    duration,
    gcal: true,
    htmlLink: ev.htmlLink,
    attendees: ev.attendees || [],
    location: ev.location || "",
    description: ev.description || "",
    rawStart,
    rawEnd,
  };
}

// ── LIVE CALENDAR EVENTS (fetched 25 May 2026, baked in statically) ──────────
// dayIdx: Mon=0 Tue=1 Wed=2 Thu=3 Fri=4
const GCAL_EVENTS = [
  { id:"gcal-1",  title:"Old Mate - Brendan & Mitch",    dayIdx:0, startHour:10, startMin:30, duration:60,  calType:"work",   attendees:"Mitch Savage-Charman", location:"",                         htmlLink:"https://www.google.com/calendar/event?eid=YzVnamNkOWw2Z3BqZWJiNDY0cGppYjlrY2dwNmNiYjFjZGdqZWI5aTYwcmppb3BuNmdwNmNjaGc3NCBicmVuZGFubHVrZWJ5cm5lQG0" },
  { id:"gcal-2",  title:"Brendan Byrne & Abhay Soni",    dayIdx:2, startHour:13, startMin:30, duration:30,  calType:"work",   attendees:"Abhay Soni",            location:"Google Meet",              htmlLink:"https://meet.google.com/aea-xspd-hwj" },
  { id:"fam-2",   title:"First Aid Webinar",              dayIdx:0, startHour:19, startMin:0,  duration:60,  calType:"family", attendees:"",                      location:"",                         htmlLink:"" },
  { id:"fam-3",   title:"Dr Lubna Naaz",                 dayIdx:1, startHour:11, startMin:45, duration:60,  calType:"family", attendees:"",                      location:"29 Fitzgerald St, Windsor",htmlLink:"" },
  { id:"fam-4",   title:"Noa swimming makeup lesson",    dayIdx:2, startHour:10, startMin:0,  duration:60,  calType:"family", attendees:"",                      location:"",                         htmlLink:"" },
  { id:"fam-5",   title:"Madz touch footy",              dayIdx:2, startHour:11, startMin:0,  duration:180, calType:"family", attendees:"",                      location:"",                         htmlLink:"" },
  { id:"fam-6",   title:"Meeting with Emergent",         dayIdx:2, startHour:13, startMin:30, duration:60,  calType:"family", attendees:"",                      location:"",                         htmlLink:"" },
  { id:"fam-7",   title:"First Aid - Penrith",           dayIdx:3, startHour:9,  startMin:30, duration:240, calType:"family", attendees:"",                      location:"Penrith",                  htmlLink:"" },
  { id:"fam-8",   title:"Psych - Barbara",               dayIdx:3, startHour:14, startMin:0,  duration:60,  calType:"family", attendees:"",                      location:"",                         htmlLink:"" },
  { id:"fam-9",   title:"First Aid Webinar",             dayIdx:3, startHour:15, startMin:30, duration:60,  calType:"family", attendees:"",                      location:"",                         htmlLink:"" },
  { id:"fam-10",  title:"H bday bonfire 🎂",             dayIdx:4, startHour:16, startMin:30, duration:300, calType:"family", attendees:"",                      location:"",                         htmlLink:"" },
];

let nextId = 9100;

// ─── CLAUDE API ───────────────────────────────────────────────────────────────
async function callClaude(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
  });
  return (await res.json()).content?.[0]?.text || "";
}

// ─── LOGO ────────────────────────────────────────────────────────────────────
function SyncnLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#38d4f5" />
          <stop offset="100%" stopColor="#0077aa" />
        </linearGradient>
      </defs>
      <text x="4" y="30" fontSize="32" fontWeight="900" fill="url(#sg)" fontFamily="Georgia,serif">S</text>
    </svg>
  );
}

// ─── CAL BLOCK ───────────────────────────────────────────────────────────────
function CalBlock({ item, onClick, isMeeting = false, isGcal = false }) {
  const color = item.calType === "family" ? "#b88a6d" : isGcal ? C.cyan : isMeeting ? C.cyan : (TIER_META[item.tier]?.color || C.cyan);
  const h = Math.max(pxH(item.duration) - 2, 20);
  return (
    <div onClick={onClick} style={{
      position: "absolute", left: 3, right: 3,
      top: px(item.startHour, item.startMin), height: h,
      background: `${color}18`, borderLeft: `2.5px solid ${color}`,
      borderRadius: 5, padding: "3px 7px", cursor: "pointer", overflow: "hidden", zIndex: 2,
      transition: "background 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}32`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}18`}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: C.text, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {isGcal ? "📅 " : isMeeting ? "📅 " : ""}{item.title}
      </div>
      {h > 32 && <div style={{ fontSize: 9, color: C.textMuted, marginTop: 1 }}>{fmtT(item.startHour, item.startMin)} · {fmtD(item.duration)}</div>}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Syncn() {
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [gcalEvents, setGcalEvents] = useState(GCAL_EVENTS); // live from Google
  const [calLoading, setCalLoading] = useState(false);
  const [calError, setCalError] = useState(null);
  const [mainView, setMainView] = useState("board");
  const [activeTier, setActiveTier] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [newItem, setNewItem] = useState({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMsgs, setAiMsgs] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const chatEnd = useRef(null);

  // ── Fetch Google Calendar ────────────────────────────────────────────────
  // ── Sync button: calls Netlify function which hits Google Calendar ──────────
  const fetchGcal = useCallback(async () => {
    setCalLoading(true);
    setCalError(null);
    try {
      const res = await fetch('/.netlify/functions/sync-calendar');
      if (!res.ok) throw new Error('Sync failed');
      const events = await res.json();
      setGcalEvents(events);
    } catch (e) {
      console.error('Calendar sync error', e);
      setCalError("Sync failed. Check your connection or Google auth.");
    }
    setCalLoading(false);
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMsgs]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const scheduledTasks = tasks.filter(t => t.scheduled && t.dayIdx !== null);
  const unscheduled = tasks.filter(t => !t.scheduled && !t.done && t.tier !== 11 && t.duration > 0 && t.status !== "parked");

  const visibleTasks = tasks.filter(t => {
    if (activeTier && t.tier !== activeTier) return false;
    if (activeProject && t.project !== activeProject) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.project.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = {};
  visibleTasks.forEach(t => {
    if (!grouped[t.tier]) grouped[t.tier] = {};
    if (!grouped[t.tier][t.project]) grouped[t.tier][t.project] = [];
    grouped[t.tier][t.project].push(t);
  });

  const tierProjects = activeTier ? [...new Set(tasks.filter(t => t.tier === activeTier).map(t => t.project))] : [];

  const stats = {
    active: tasks.filter(t => t.status === "active" && !t.done).length,
    done: tasks.filter(t => t.done).length,
    high: tasks.filter(t => t.priority === "High" && !t.done && t.status !== "parked").length,
    unscheduled: unscheduled.length,
    gcal: gcalEvents.length,
    familyEvents: gcalEvents.filter(e=>e.calType==="family").length,
  };

  // ── AI Schedule ──────────────────────────────────────────────────────────
  const autoSchedule = useCallback(async () => {
    const toSched = unscheduled.filter(t => t.priority !== "Low").slice(0, 8);
    if (!toSched.length) return;
    setScheduling(true);
    const occupied = [
      ...scheduledTasks.map(t => ({ dayIdx: t.dayIdx, startHour: t.startHour, startMin: t.startMin, duration: t.duration })),
      ...gcalEvents.map(m => ({ dayIdx: m.dayIdx, startHour: m.startHour, startMin: m.startMin, duration: m.duration })),
    ];
    const prompt = `Schedule tasks into Mon–Fri (dayIdx 0–4), 8am–6pm. No overlaps with existing blocks. High priority first. Min 15min gap. Return ONLY JSON array: [{"id":N,"dayIdx":0-4,"startHour":8-17,"startMin":0}]\n\nExisting blocks:${JSON.stringify(occupied)}\nTasks to schedule:${JSON.stringify(toSched.map(t => ({ id: t.id, title: t.title, priority: t.priority, duration: t.duration })))}`;
    try {
      const reply = await callClaude([{ role: "user", content: prompt }], "Return only valid JSON. No markdown.");
      const parsed = JSON.parse(reply.replace(/```json|```/g, "").trim());
      setTasks(prev => prev.map(t => {
        const s = parsed.find(x => x.id === t.id);
        return s ? { ...t, scheduled: true, dayIdx: s.dayIdx, startHour: s.startHour, startMin: s.startMin } : t;
      }));
    } catch (e) { console.error(e); }
    setScheduling(false);
  }, [unscheduled, scheduledTasks, gcalEvents]);

  // ── AI Chat ──────────────────────────────────────────────────────────────
  const buildContext = () => {
    const top = tasks.filter(t => t.priority === "High" && !t.done && t.status === "active").slice(0, 10).map(t => `[T${t.tier}/${t.project}] ${t.title}`).join("\n");
    const cal = scheduledTasks.map(t => `${DAYS[t.dayIdx]} ${fmtT(t.startHour, t.startMin)}: ${t.title}`).join("\n");
    const gcal = gcalEvents.map(m => `${DAYS[m.dayIdx]} ${fmtT(m.startHour, m.startMin)}: MEETING — ${m.title} (${fmtD(m.duration)})`).join("\n");
    return `HIGH PRIORITY TASKS:\n${top}\n\nSCHEDULED TASKS:\n${cal}\n\nGOOGLE CALENDAR MEETINGS:\n${gcal}\n\nSTATS: ${stats.active} active, ${stats.unscheduled} unscheduled, ${stats.high} urgent, ${stats.gcal} calendar events this week`;
  };

  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const msg = { role: "user", content: aiInput };
    const msgs = [...aiMsgs, msg];
    setAiMsgs(msgs); setAiInput(""); setAiLoading(true);
    const system = `You are a blunt, dry AI chief-of-staff for Brendan "Beej" Mulholland — indie filmmaker, Shadow Wolves Productions founder, SLATR/SPOT'D/PITCH'D app developer, Producer's Playbook creator. Ex-military. Hates waffle. Father of three.

Today: ${new Date().toDateString()}
${buildContext()}

Be short. Specific. Dry humour welcome. Max 6 bullets. Prioritise ruthlessly.`;
    try {
      const reply = await callClaude(msgs, system);
      setAiMsgs(p => [...p, { role: "assistant", content: reply }]);
    } catch { setAiMsgs(p => [...p, { role: "assistant", content: "API error." }]); }
    setAiLoading(false);
  };

  // ── Add Task/Meeting ─────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!newItem.title?.trim()) return;
    if (addModal === "meeting") {
      // Also create in Google Calendar
      const dayDate = new Date(WEEK_DATES[newItem.dayIdx ?? TODAY_IDX]);
      dayDate.setHours(newItem.startHour || 9, newItem.startMin || 0, 0, 0);
      const endDate = new Date(dayDate.getTime() + (newItem.duration || 60) * 60000);
      // Optimistically add to local state
      const localMeeting = {
        id: `local-${nextId++}`,
        title: newItem.title,
        dayIdx: newItem.dayIdx ?? TODAY_IDX,
        startHour: newItem.startHour || 9,
        startMin: newItem.startMin || 0,
        duration: newItem.duration || 60,
        gcal: false,
      };
      setGcalEvents(p => [...p, localMeeting]);
      // Fire off GCal creation in background
      createGcalEvent(newItem.title, dayDate.toISOString(), endDate.toISOString());
    } else {
      setTasks(p => [...p, { id: nextId++, done: false, scheduled: false, dayIdx: null, startHour: null, startMin: null, ...newItem }]);
    }
    setAddModal(null);
  };

  const createGcalEvent = async (title, start, end) => {
    try {
      await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: "Create a Google Calendar event using the MCP tool. Confirm success.",
          messages: [{ role: "user", content: `Create event titled "${title}" from ${start} to ${end} in Australia/Sydney timezone.` }],
          mcp_servers: [{ type: "url", url: "https://calendarmcp.googleapis.com/mcp/v1", name: "google-calendar" }],
        }),
      });
      // Refresh after creation
      setTimeout(fetchGcal, 2000);
    } catch (e) { console.error("GCal create error", e); }
  };

  const toggleDone = id => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = id => { setTasks(p => p.filter(t => t.id !== id)); setSelectedTask(null); };
  const unschedule = id => setTasks(p => p.map(t => t.id === id ? { ...t, scheduled: false, dayIdx: null, startHour: null, startMin: null } : t));

  const pColor = { High: C.high, Medium: C.medium, Low: C.low };
  const inp = { fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 10px", outline: "none", background: C.bgCard, color: C.text, fontFamily: "inherit", width: "100%" };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", background: C.bg, color: C.text, overflow: "hidden" }}>

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div style={{ background: C.bgCard, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 16px", height: 50, gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
          <SyncnLogo size={28} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>Sync<span style={{ color: C.cyan }}>'n</span></div>
            <div style={{ fontSize: 8, color: C.textMuted, letterSpacing: 0.2, lineHeight: 1, marginTop: 1 }}>Stop sink'n and start Sync'n.</div>
          </div>
        </div>

        <div style={{ display: "flex", background: C.bg, borderRadius: 7, padding: 2, gap: 1, border: `1px solid ${C.border}` }}>
          {[["board", "⬛ Board"], ["calendar", "📅 Calendar"], ["backlog", "📋 Backlog"]].map(([v, l]) => (
            <button key={v} onClick={() => setMainView(v)} style={{
              padding: "4px 12px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
              background: mainView === v ? C.bgSurface : "transparent",
              color: mainView === v ? C.cyan : C.textMuted,
              boxShadow: mainView === v ? `0 0 0 1px ${C.border}` : "none", transition: "all 0.12s"
            }}>{l}</button>
          ))}
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          style={{ ...inp, width: 150 }} />

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ ...inp, width: "auto" }}>
          <option value="all">All Status</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        {/* GCal status indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.done }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.done, boxShadow: `0 0 6px ${C.done}` }} />
          {calLoading ? "Syncing…" : calError ? "Sync failed" : `${stats.gcal} events`}
          {!calLoading && !calError && <span style={{ color: C.textFaint, fontSize: 9, marginLeft: 2 }}>📅 {stats.familyEvents} family</span>}
          <button onClick={fetchGcal} title="Sync Google Calendar" style={{ background: "none", border: "none", cursor: "pointer", color: C.cyan, fontSize: 11, padding: "0 3px", marginLeft: 2 }}>↻</button>
        </div>

        <div style={{ display: "flex", gap: 12, fontSize: 11, marginLeft: "auto" }}>
          <span style={{ color: C.textMuted }}><strong style={{ color: C.high }}>{stats.high}</strong> urgent</span>
          <span style={{ color: C.textMuted }}><strong style={{ color: C.text }}>{stats.active}</strong> active</span>
          <span style={{ color: C.textMuted }}><strong style={{ color: C.done }}>{stats.done}</strong> done</span>
          {stats.unscheduled > 0 && <span style={{ color: C.textMuted }}><strong style={{ color: C.medium }}>{stats.unscheduled}</strong> unsched</span>}
        </div>

        {unscheduled.length > 0 && (
          <button onClick={autoSchedule} disabled={scheduling} style={{
            background: scheduling ? "transparent" : `${C.cyan}18`, color: scheduling ? C.textMuted : C.cyan,
            border: `1px solid ${scheduling ? C.border : C.cyanDim}`,
            borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}>{scheduling ? "⟳ Scheduling…" : `✦ AI Schedule (${Math.min(unscheduled.filter(t => t.priority !== "Low").length, 8)})`}</button>
        )}
        <button onClick={() => setAddModal("meeting")} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", color: C.textMuted }}>+ Meeting</button>
        <button onClick={() => { setNewItem({ tier: 1, project: "CROWE", title: "", status: "active", priority: "High", duration: 60, notes: "", deadline: "" }); setAddModal("task"); }} style={{ background: `linear-gradient(135deg,${C.cyan},${C.cyanDim})`, color: "#000", border: "none", borderRadius: 7, padding: "5px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>+ Task</button>
        <button onClick={() => setAiOpen(o => !o)} style={{ background: aiOpen ? `${C.cyan}22` : "transparent", color: aiOpen ? C.cyan : C.textMuted, border: `1px solid ${aiOpen ? C.cyanDim : C.border}`, borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: aiOpen ? `0 0 12px ${C.cyanGlow}` : "none", transition: "all 0.15s" }}>✦ AI</button>
      </div>

      {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── TIER SIDEBAR ──────────────────────────────────────────────────── */}
        <div style={{ width: 185, background: C.bgCard, borderRight: `1px solid ${C.border}`, overflowY: "auto", flexShrink: 0, padding: "8px 0" }}>
          <button onClick={() => { setActiveTier(null); setActiveProject(null); }} style={{ width: "100%", textAlign: "left", padding: "7px 14px", border: "none", cursor: "pointer", background: !activeTier ? `${C.cyan}14` : "transparent", color: !activeTier ? C.cyan : C.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: 0.2 }}>ALL PROJECTS</button>
          <div style={{ margin: "6px 14px", height: 1, background: C.border }} />
          {Object.entries(TIER_META).map(([tier, meta]) => {
            const t = parseInt(tier);
            const activeCt = tasks.filter(x => x.tier === t && !x.done && x.status !== "parked").length;
            const isActive = activeTier === t;
            return (
              <div key={tier}>
                <button onClick={() => { setActiveTier(isActive ? null : t); setActiveProject(null); }} style={{ width: "100%", textAlign: "left", padding: "6px 12px", border: "none", cursor: "pointer", background: isActive ? `${meta.color}14` : "transparent", display: "flex", alignItems: "center", gap: 7, borderLeft: isActive ? `2px solid ${meta.color}` : "2px solid transparent" }}>
                  <span style={{ fontSize: 12 }}>{meta.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? meta.color : C.textMuted, flex: 1, lineHeight: 1.3 }}>{meta.label}</span>
                  {activeCt > 0 && <span style={{ fontSize: 9, background: C.bgSurface, borderRadius: 8, padding: "1px 5px", color: C.textMuted, fontWeight: 700 }}>{activeCt}</span>}
                </button>
                {isActive && tierProjects.map(proj => (
                  <button key={proj} onClick={() => setActiveProject(activeProject === proj ? null : proj)} style={{ width: "100%", textAlign: "left", padding: "4px 14px 4px 32px", border: "none", cursor: "pointer", background: activeProject === proj ? `${meta.color}0d` : "transparent", fontSize: 10, color: activeProject === proj ? meta.color : C.textFaint, fontWeight: activeProject === proj ? 700 : 400 }}>{proj}</button>
                ))}
              </div>
            );
          })}
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* BOARD */}
          {mainView === "board" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
              {Object.keys(grouped).length === 0 && <div style={{ textAlign: "center", padding: 60, color: C.textFaint }}>No tasks match filters.</div>}
              {Object.entries(grouped).map(([tier, projects]) => {
                const meta = TIER_META[parseInt(tier)];
                return (
                  <div key={tier} style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13 }}>{meta.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, color: meta.color }}>T{tier}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{meta.label}</span>
                      <span style={{ fontSize: 10, color: C.textFaint, marginLeft: "auto" }}>{Object.values(projects).flat().length} tasks</span>
                    </div>
                    {Object.entries(projects).map(([proj, ptasks]) => (
                      <div key={proj} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textFaint, marginBottom: 5, paddingLeft: 2, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 1, height: 10, background: meta.color, display: "inline-block" }} />{proj}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {ptasks.map(task => (
                            <div key={task.id} onClick={() => setSelectedTask(task)}
                              style={{ background: task.done ? `${C.bgCard}80` : C.bgCard, border: `1px solid ${task.done ? C.borderLight : C.border}`, borderLeft: `2px solid ${task.done ? "#2a3350" : meta.color}`, borderRadius: 6, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, opacity: task.done ? 0.45 : 1, transition: "background 0.12s" }}
                              onMouseEnter={e => { if (!task.done) e.currentTarget.style.background = C.bgHover; }}
                              onMouseLeave={e => { e.currentTarget.style.background = task.done ? `${C.bgCard}80` : C.bgCard; }}
                            >
                              <div onClick={e => { e.stopPropagation(); toggleDone(task.id); }} style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${task.done ? C.done : C.textFaint}`, background: task.done ? C.done : "transparent", flexShrink: 0, cursor: "pointer", display: "grid", placeItems: "center", transition: "all 0.12s" }}>
                                {task.done && <span style={{ color: C.bg, fontSize: 8, fontWeight: 900 }}>✓</span>}
                              </div>
                              <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: task.done ? C.textFaint : C.text, textDecoration: task.done ? "line-through" : "none", lineHeight: 1.35 }}>{task.title}</span>
                              <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
                                {task.scheduled && <span style={{ fontSize: 9, background: `${C.done}18`, color: C.done, padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>{DAYS[task.dayIdx]}</span>}
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: pColor[task.priority], flexShrink: 0 }} />
                                {task.duration > 0 && <span style={{ fontSize: 9, color: C.textFaint }}>{fmtD(task.duration)}</span>}
                                {task.status === "parked" && <span style={{ fontSize: 9, color: C.parked }}>❄️</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* CALENDAR */}
          {mainView === "calendar" && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "grid", gridTemplateColumns: "46px repeat(5,1fr)", borderBottom: `1px solid ${C.border}`, background: C.bgCard, flexShrink: 0 }}>
                <div />
                {DAYS.map((day, i) => {
                  const isToday = i === TODAY_IDX;
                  const dayMeetings = gcalEvents.filter(m => m.dayIdx === i).length;
                  return (
                    <div key={day} style={{ textAlign: "center", padding: "8px 4px", borderLeft: `1px solid ${C.borderLight}` }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: isToday ? C.cyan : C.textFaint, letterSpacing: 0.6, textTransform: "uppercase" }}>{day}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: isToday ? C.bg : C.text, background: isToday ? C.cyan : "transparent", width: 28, height: 28, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 2, lineHeight: 1, boxShadow: isToday ? `0 0 12px ${C.cyanGlow}` : "none" }}>{WEEK_DATES[i].getDate()}</div>
                      {dayMeetings > 0 && <div style={{ fontSize: 8, color: C.cyan, marginTop: 2 }}>{dayMeetings} event{dayMeetings > 1 ? "s" : ""}</div>}
                    </div>
                  );
                })}
              </div>

              {calLoading && (
                <div style={{ textAlign: "center", padding: "20px", fontSize: 11, color: C.textMuted }}>
                  <span style={{ color: C.cyan }}>⟳</span> Syncing Google Calendar…
                </div>
              )}

              <div style={{ flex: 1, overflowY: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "46px repeat(5,1fr)", height: HOURS.length * 60 }}>
                  <div style={{ position: "relative" }}>
                    {HOURS.map(h => (
                      <div key={h} style={{ position: "absolute", top: px(h), right: 6 }}>
                        <span style={{ fontSize: 9, color: C.textFaint, fontWeight: 500 }}>{fmtT(h, 0)}</span>
                      </div>
                    ))}
                  </div>
                  {DAYS.map((day, di) => {
                    const isToday = di === TODAY_IDX;
                    const dayGcal = gcalEvents.filter(m => m.dayIdx === di);
                    const dayTasks = scheduledTasks.filter(t => t.dayIdx === di);
                    return (
                      <div key={day} style={{ position: "relative", borderLeft: `1px solid ${C.borderLight}`, background: isToday ? `${C.cyan}04` : "transparent", height: HOURS.length * 60 }}>
                        {HOURS.map(h => <div key={h} style={{ position: "absolute", top: px(h), left: 0, right: 0, borderTop: `1px solid ${C.borderLight}`, pointerEvents: "none" }} />)}
                        {HOURS.map(h => <div key={h + "h"} style={{ position: "absolute", top: px(h, 30), left: 0, right: 0, borderTop: `1px dashed ${C.bg}`, pointerEvents: "none" }} />)}
                        {dayTasks.map(t => <CalBlock key={t.id} item={t} onClick={() => setSelectedTask(t)} />)}
                        {dayGcal.map(m => <CalBlock key={m.id} item={m} onClick={() => setSelectedMeeting(m)} isMeeting isGcal={m.gcal} />)}
                        {isToday && (() => {
                          const now = new Date(); const top = px(now.getHours(), now.getMinutes());
                          return top > 0 && top < HOURS.length * 60 ? (
                            <div style={{ position: "absolute", top, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.cyan, marginLeft: -3, boxShadow: `0 0 8px ${C.cyan}` }} />
                              <div style={{ flex: 1, height: 1.5, background: C.cyan, opacity: 0.6 }} />
                            </div>
                          ) : null;
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* BACKLOG */}
          {mainView === "backlog" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
              <div style={{ maxWidth: 680, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text }}>Task Backlog</h2>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{tasks.filter(t => !t.done).length} remaining · {tasks.filter(t => t.done).length} done</div>
                </div>
                {["High", "Medium", "Low"].map(pri => {
                  const pt = visibleTasks.filter(t => t.priority === pri);
                  if (!pt.length) return null;
                  return (
                    <div key={pri} style={{ marginBottom: 22 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: pColor[pri] }} />
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: C.textMuted }}>{pri} Priority ({pt.length})</span>
                      </div>
                      {pt.map(task => {
                        const meta = TIER_META[task.tier];
                        return (
                          <div key={task.id} onClick={() => setSelectedTask(task)}
                            style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderLeft: `2px solid ${meta?.color}`, borderRadius: 7, padding: "10px 14px", marginBottom: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, opacity: task.done ? 0.45 : 1, transition: "background 0.12s" }}
                            onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
                            onMouseLeave={e => e.currentTarget.style.background = C.bgCard}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{task.title}</div>
                              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{meta?.label} · {task.project} · {fmtD(task.duration)}</div>
                            </div>
                            <div>
                              {task.scheduled
                                ? <span style={{ fontSize: 9, background: `${C.done}18`, color: C.done, padding: "2px 7px", borderRadius: 5, fontWeight: 700 }}>{DAYS[task.dayIdx]} {fmtT(task.startHour, task.startMin)}</span>
                                : task.status === "parked"
                                  ? <span style={{ fontSize: 9, color: C.parked }}>❄️ Parked</span>
                                  : <span style={{ fontSize: 9, background: `${C.medium}18`, color: C.medium, padding: "2px 7px", borderRadius: 5, fontWeight: 700 }}>Unscheduled</span>
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── AI SIDEBAR ──────────────────────────────────────────────────────── */}
        {aiOpen && (
          <div style={{ width: 310, borderLeft: `1px solid ${C.border}`, background: C.bgCard, display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.cyan }}>✦ AI Chief-of-Staff</div>
                <div style={{ fontSize: 9, color: C.textFaint, marginTop: 1 }}>Knows all {tasks.length} tasks + {stats.gcal} live calendar events</div>
              </div>
              <button onClick={() => setAiOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textFaint, fontSize: 16 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              {aiMsgs.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 6px" }}>
                  <div style={{ fontSize: 26, marginBottom: 8, filter: "drop-shadow(0 0 8px #00b4d8)" }}>✦</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 14, lineHeight: 1.5 }}>Knows your tasks, your live Google Calendar, and your week. Ask anything.</div>
                  {["What should I focus on today?", "What meetings do I have this week?", "Schedule around my calendar events", "What's most overdue?", "What can I park or drop?"].map(q => (
                    <button key={q} onClick={() => setAiInput(q)} style={{ display: "block", width: "100%", marginBottom: 5, background: C.bgSurface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 10px", fontSize: 10, cursor: "pointer", color: C.textMuted, textAlign: "left", transition: "border-color 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.cyanDim}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                    >{q}</button>
                  ))}
                </div>
              )}
              {aiMsgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "90%", padding: "8px 11px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? `${C.cyan}22` : C.bgSurface, border: `1px solid ${m.role === "user" ? C.cyanDim : C.border}`, color: m.role === "user" ? C.cyanBright : C.text, fontSize: 11, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{m.content}</div>
                </div>
              ))}
              {aiLoading && <div style={{ display: "flex", gap: 4, padding: "6px 2px" }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.cyan, animation: `blink 1s ease-in-out ${i * 0.2}s infinite`, opacity: 0.3 }} />)}</div>}
              <div ref={chatEnd} />
            </div>
            <div style={{ padding: 10, borderTop: `1px solid ${C.borderLight}`, display: "flex", gap: 6 }}>
              <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiSend(); } }}
                placeholder="Ask your chief-of-staff…"
                style={{ ...inp, border: `1px solid ${C.border}`, flex: 1 }} />
              <button onClick={handleAiSend} disabled={aiLoading} style={{ background: `linear-gradient(135deg,${C.cyan},${C.cyanDim})`, color: C.bg, border: "none", borderRadius: 7, padding: "0 12px", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>↑</button>
            </div>
          </div>
        )}
      </div>

      {/* ══ TASK DETAIL ══════════════════════════════════════════════════════ */}
      {selectedTask && (
        <div onClick={() => setSelectedTask(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bgCard, width: "100%", borderRadius: "14px 14px 0 0", padding: "22px 26px 28px", boxShadow: `0 -8px 40px rgba(0,180,216,0.08)`, border: `1px solid ${C.border}`, borderBottom: "none", maxHeight: "58vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span>{TIER_META[selectedTask.tier]?.icon}</span>
                  <span style={{ fontSize: 10, color: TIER_META[selectedTask.tier]?.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>T{selectedTask.tier} · {selectedTask.project}</span>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: pColor[selectedTask.priority] }} />
                  <span style={{ fontSize: 10, color: C.textMuted }}>{selectedTask.priority}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textFaint, fontSize: 20, marginLeft: 10 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
              {[fmtD(selectedTask.duration) || null, selectedTask.scheduled ? `${DAYS[selectedTask.dayIdx]} ${fmtT(selectedTask.startHour, selectedTask.startMin)}` : "Unscheduled", selectedTask.deadline ? `Due ${selectedTask.deadline}` : null, STATUS_META[selectedTask.status]?.label].filter(Boolean).map(tag => (
                <span key={tag} style={{ fontSize: 11, background: C.bgSurface, border: `1px solid ${C.border}`, padding: "4px 10px", borderRadius: 6, color: C.textMuted }}>{tag}</span>
              ))}
            </div>
            {selectedTask.notes && <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 14px", lineHeight: 1.5 }}>{selectedTask.notes}</p>}
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <button onClick={() => toggleDone(selectedTask.id)} style={{ fontSize: 12, background: selectedTask.done ? C.bgSurface : `${C.done}18`, color: selectedTask.done ? C.textMuted : C.done, border: `1px solid ${selectedTask.done ? C.border : C.done}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontWeight: 700 }}>{selectedTask.done ? "↩ Mark Undone" : "✓ Mark Done"}</button>
              {selectedTask.scheduled && <button onClick={() => { unschedule(selectedTask.id); setSelectedTask(null); }} style={{ fontSize: 12, background: `${C.medium}18`, color: C.medium, border: `1px solid ${C.medium}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontWeight: 700 }}>Unschedule</button>}
              {!selectedTask.scheduled && selectedTask.duration > 0 && <button onClick={() => { setSelectedTask(null); autoSchedule(); }} style={{ fontSize: 12, background: `${C.cyan}18`, color: C.cyan, border: `1px solid ${C.cyanDim}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontWeight: 700 }}>✦ AI Schedule</button>}
              <button onClick={() => deleteTask(selectedTask.id)} style={{ fontSize: 12, background: "none", color: C.high, border: `1px solid ${C.high}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", marginLeft: "auto" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MEETING DETAIL ═══════════════════════════════════════════════════ */}
      {selectedMeeting && (
        <div onClick={() => setSelectedMeeting(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bgCard, width: "100%", borderRadius: "14px 14px 0 0", padding: "22px 26px 28px", border: `1px solid ${C.border}`, borderBottom: "none", boxShadow: `0 -8px 40px rgba(0,180,216,0.08)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: C.cyan, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  📅 {selectedMeeting.gcal ? "Google Calendar Event" : "Meeting"}
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>{selectedMeeting.title}</h2>
              </div>
              <button onClick={() => setSelectedMeeting(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textFaint, fontSize: 20 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{ fontSize: 11, background: C.bgSurface, border: `1px solid ${C.border}`, padding: "4px 10px", borderRadius: 6, color: C.textMuted }}>{DAYS[selectedMeeting.dayIdx]} {fmtT(selectedMeeting.startHour, selectedMeeting.startMin)}</span>
              <span style={{ fontSize: 11, background: C.bgSurface, border: `1px solid ${C.border}`, padding: "4px 10px", borderRadius: 6, color: C.textMuted }}>{fmtD(selectedMeeting.duration)}</span>
              {selectedMeeting.location && <span style={{ fontSize: 11, background: C.bgSurface, border: `1px solid ${C.border}`, padding: "4px 10px", borderRadius: 6, color: C.textMuted }}>📍 {selectedMeeting.location.substring(0, 40)}</span>}
            </div>
            {selectedMeeting.attendees?.length > 0 && (
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>
                👥 {selectedMeeting.attendees.map(a => a.displayName || a.email).join(", ")}
              </div>
            )}
            {selectedMeeting.htmlLink && (
              <a href={selectedMeeting.htmlLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.cyan, textDecoration: "none" }}>Open in Google Calendar →</a>
            )}
          </div>
        </div>
      )}

      {/* ══ ADD MODAL ════════════════════════════════════════════════════════ */}
      {addModal && (
        <div onClick={() => setAddModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bgCard, borderRadius: 14, padding: 24, width: 460, maxWidth: "92vw", boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${C.border}` }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: C.text }}>{addModal === "task" ? "New Task" : "New Meeting"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <input autoFocus value={newItem.title || ""} onChange={e => setNewItem(n => ({ ...n, title: e.target.value }))}
                placeholder={addModal === "task" ? "What needs doing?" : "Meeting title"}
                style={{ ...inp, fontSize: 13, padding: "9px 12px" }} />
              {addModal === "task" && (<>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={newItem.tier || 1} onChange={e => setNewItem(n => ({ ...n, tier: parseInt(e.target.value), project: "" }))} style={{ ...inp, flex: 1 }}>
                    {Object.entries(TIER_META).map(([t, m]) => <option key={t} value={t}>{m.icon} T{t}: {m.label}</option>)}
                  </select>
                  <select value={newItem.priority || "High"} onChange={e => setNewItem(n => ({ ...n, priority: e.target.value }))} style={{ ...inp, width: 110 }}>
                    {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={newItem.project || ""} onChange={e => setNewItem(n => ({ ...n, project: e.target.value }))} placeholder="Project name" style={{ ...inp, flex: 1 }} />
                  <select value={newItem.status || "active"} onChange={e => setNewItem(n => ({ ...n, status: e.target.value }))} style={{ ...inp, width: 140 }}>
                    {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label style={{ fontSize: 11, color: C.textMuted, whiteSpace: "nowrap" }}>Duration (min)</label>
                  <input type="number" value={newItem.duration || 60} min={15} step={15} onChange={e => setNewItem(n => ({ ...n, duration: parseInt(e.target.value) || 60 }))} style={{ ...inp, width: 70 }} />
                  <label style={{ fontSize: 11, color: C.textMuted }}>Deadline</label>
                  <input type="date" value={newItem.deadline || ""} onChange={e => setNewItem(n => ({ ...n, deadline: e.target.value }))} style={{ ...inp, flex: 1 }} />
                </div>
                <textarea value={newItem.notes || ""} onChange={e => setNewItem(n => ({ ...n, notes: e.target.value }))} placeholder="Notes (optional)" rows={2} style={{ ...inp, resize: "none" }} />
              </>)}
              {addModal === "meeting" && (<>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={newItem.dayIdx ?? TODAY_IDX} onChange={e => setNewItem(n => ({ ...n, dayIdx: parseInt(e.target.value) }))} style={{ ...inp, flex: 1 }}>
                    {DAYS.map((d, i) => <option key={d} value={i}>{d} {WEEK_DATES[i].getDate()}</option>)}
                  </select>
                  <input type="time" defaultValue="09:00" onChange={e => { const [h, m] = e.target.value.split(":").map(Number); setNewItem(n => ({ ...n, startHour: h, startMin: m })); }} style={{ ...inp, flex: 1 }} />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label style={{ fontSize: 11, color: C.textMuted }}>Duration (min)</label>
                  <input type="number" value={newItem.duration || 60} min={15} step={15} onChange={e => setNewItem(n => ({ ...n, duration: parseInt(e.target.value) || 60 }))} style={{ ...inp, width: 70 }} />
                </div>
                <div style={{ fontSize: 10, color: C.cyan, padding: "4px 0" }}>✦ This will also be added to your Google Calendar</div>
              </>)}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={handleAdd} style={{ background: `linear-gradient(135deg,${C.cyan},${C.cyanDim})`, color: C.bg, border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{addModal === "task" ? "Add Task" : "Add to Calendar"}</button>
              <button onClick={() => setAddModal(null)} style={{ background: "none", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink{0%,100%{opacity:.15}50%{opacity:1}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:8px}
        option{background:${C.bgCard};color:${C.text}}
      `}</style>
    </div>
  );
}

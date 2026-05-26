import { useState, useEffect, useRef, useCallback } from "react";

// ─── BRAND & PILLARS ──────────────────────────────────────────────────────────
const C = {
  bg:"#0b1220",bgCard:"#121b2e",bgSurface:"#1a2540",bgHover:"#1e2d47",
  border:"#1a2540",borderLight:"#111827",
  text:"#eef2ff",textMuted:"#64748b",textFaint:"#2d3a52",
  cyan:"#00b4d8",cyanDim:"#0090b0",cyanGlow:"#00b4d815",
  high:"#e05c5c",medium:"#d4a843",low:"#4db88a",
};

const DEFAULT_PILLARS = {
  family:    { label:"Family",       icon:"👨‍👩‍👧‍👦", color:"#e8a87c", sub:["Madden","Hardey","Noa","Relationship","Home"] },
  film:      { label:"Film & Craft", icon:"🎬", color:"#00b4d8", sub:["CROWE","THUNK","Blue Orchids","Acting","Writing"] },
  business:  { label:"Business",     icon:"🏢", color:"#9b6dce", sub:["Shadow Wolves","SLATR","SPOT'D","PITCH'D","Playbook"] },
  health:    { label:"Health",       icon:"💚", color:"#4db88a", sub:["Physical","Mental","Sleep","Energy"] },
  finance:   { label:"Finance",      icon:"💰", color:"#d4a843", sub:["Income","Teaching","Online Products","Budgeting"] },
  creativity:{ label:"Creativity",   icon:"🎨", color:"#e07a5c", sub:["Kids Projects","Mantra Toys","Creative Den","Children's Books"] },
  growth:    { label:"Growth",       icon:"🌱", color:"#5b8dd9", sub:["Learning","Coaching","Identity","Reflection"] },
  parking:   { label:"Parking Lot",  icon:"❄️", color:"#4a7fa0", sub:[] },
};

// Pillars are now fully editable — persisted in localStorage
function loadPillars() {
  try {
    const saved = localStorage.getItem("syncn_pillars");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) return parsed;
    }
  } catch(e) {}
  return DEFAULT_PILLARS;
}
function savePillars(pillars) {
  try { localStorage.setItem("syncn_pillars", JSON.stringify(pillars)); } catch(e) {}
}

// Keep a module-level reference for non-component code that still uses PILLARS
// This gets updated whenever React state changes
let PILLARS = loadPillars();

// ─── INITIAL TASKS (migrated from tier system) ────────────────────────────────
let uid = 1;
const T = (pillar,sub,title,priority="Medium",dur=45,status="active",notes="") =>
  ({id:uid++,pillar,sub,title,priority,duration:dur,status,notes,done:false,
    scheduled:false,dayOffset:null,startHour:null,startMin:null,deadline:"",
    postponeCount:0,blockerSurfaced:false});

const INIT_TASKS = [
  // FAMILY
  T("family","Madden","Oztag coaching schedule","Medium",30,"active"),
  T("family","Madden","Madden footy schedule","Medium",20,"active"),
  T("family","Home","Family weekly planning","Medium",30,"active"),
  // FILM & CRAFT
  T("film","CROWE","Finalize synopsis completely","High",60,"active","Thriller/elevated horror positioning"),
  T("film","CROWE","Finalize deck order and structure","High",90,"active"),
  T("film","CROWE","Finalize executive summary page","High",45,"active"),
  T("film","CROWE","Build investor version deck","High",120,"active"),
  T("film","CROWE","Build distributor version deck","High",90,"active"),
  T("film","CROWE","Build talent attachment deck","Medium",90,"active"),
  T("film","CROWE","Create financing strategy sheet","High",60,"active"),
  T("film","CROWE","Draft outreach packages","High",90,"active"),
  T("film","CROWE","Research Australian productions/casting","Medium",60,"active"),
  T("film","THUNK","Lock edit timeline","High",30,"active"),
  T("film","THUNK","Review assembly cut","High",90,"active"),
  T("film","THUNK","Sound design pass","High",120,"active"),
  T("film","THUNK","Music direction","Medium",60,"active"),
  T("film","THUNK","Festival strategy","Medium",60,"active"),
  T("film","THUNK","Finalize mythology bible","Medium",90,"active"),
  T("film","Blue Orchids","Final logline","Medium",30,"active","Sequel to I'm Here Too"),
  T("film","Blue Orchids","Final treatment","Medium",90,"active"),
  T("film","Blue Orchids","Beat sheet","Medium",90,"active"),
  T("film","Acting","Continue audition pipeline","High",60,"active"),
  T("film","Acting","Agency/representation review","Medium",45,"active"),
  // BUSINESS
  T("business","Shadow Wolves","Finish website restructure","High",120,"active"),
  T("business","Shadow Wolves","SEO review","Medium",60,"active"),
  T("business","Shadow Wolves","Clarify company divisions","Medium",60,"active"),
  T("business","SLATR","Complete development flow implementation","High",120,"active"),
  T("business","SLATR","Scrypto diagnostics flow","High",90,"active"),
  T("business","SLATR","SLATR score system","High",90,"active"),
  T("business","SLATR","Calli AI refinement","High",60,"active"),
  T("business","SLATR","Remove over-gating UX","High",45,"active"),
  T("business","SPOT'D","Fix email spam issues","High",60,"active"),
  T("business","SPOT'D","Replace Casting Calls with Projects","High",120,"active"),
  T("business","SPOT'D","Improve admin portal UI","Medium",90,"active"),
  T("business","PITCH'D","Launch follow-up","High",30,"active"),
  T("business","PITCH'D","Fix bugs","High",60,"active"),
  T("business","PITCH'D","Gather user feedback","High",45,"active"),
  T("business","Playbook","Complete Phase 1 — Project Positioning","High",90,"active"),
  T("business","Playbook","Finish workbook sections","High",90,"active"),
  T("business","Playbook","Final design pass","Medium",60,"active"),
  // FINANCE
  T("finance","Teaching","Follow up TAFE contact Craig","High",20,"active"),
  T("finance","Teaching","Explore screen/media teaching opportunities","Medium",45,"active"),
  T("finance","Online Products","Define Straight-Talk Studioz roadmap","High",90,"active"),
  T("finance","Online Products","Script Doctoring course","High",120,"active"),
  T("finance","Online Products","Filmmaking resources pack","Medium",60,"active"),
  // HEALTH
  T("health","Physical","Weekly exercise routine","High",60,"active"),
  T("health","Mental","Weekly reflection/journaling","Medium",30,"active"),
  T("health","Sleep","Establish consistent sleep schedule","Medium",20,"active"),
  // CREATIVITY
  T("creativity","Kids Projects","Imagination Station course review","Medium",45,"active"),
  T("creativity","Kids Projects","Acting workshop review","Medium",45,"active"),
  T("creativity","Children's Books","Christmas is Here — follow-up","Low",30,"active"),
  // GROWTH
  T("growth","Learning","Screen Australia funding research","Medium",60,"active"),
  T("growth","Coaching","Script Surgeon GPT — test prompts","Medium",60,"active"),
  // PARKING LOT
  T("parking","Parking Lot","Reality debate show","Low",0,"parked"),
  T("parking","Parking Lot","Mantra Toys expansion","Low",0,"parked"),
  T("parking","Parking Lot","The Creative Den expansion","Low",0,"parked"),
  T("parking","Parking Lot","Extra app concepts","Low",0,"parked"),
];

// ─── CALENDAR EVENTS (synced) ─────────────────────────────────────────────────
const INIT_GCAL = [
  {id:"gcal-1",title:"Old Mate - Brendan & Mitch",dayOffset:0,startHour:10,startMin:30,duration:60,calType:"work",attendees:"Mitch Savage-Charman",location:"",htmlLink:""},
  {id:"gcal-2",title:"Brendan Byrne & Abhay Soni",dayOffset:2,startHour:13,startMin:30,duration:30,calType:"work",attendees:"Abhay Soni",location:"Google Meet",htmlLink:""},
  {id:"fam-2",title:"First Aid Webinar",dayOffset:0,startHour:19,startMin:0,duration:60,calType:"family",attendees:"",location:"",htmlLink:""},
  {id:"fam-3",title:"Dr Lubna Naaz",dayOffset:1,startHour:11,startMin:45,duration:60,calType:"family",attendees:"",location:"29 Fitzgerald St Windsor",htmlLink:""},
  {id:"fam-4",title:"Noa swimming makeup lesson",dayOffset:2,startHour:10,startMin:0,duration:60,calType:"family",attendees:"",location:"",htmlLink:""},
  {id:"fam-5",title:"Madz touch footy",dayOffset:2,startHour:11,startMin:0,duration:180,calType:"family",attendees:"",location:"",htmlLink:""},
  {id:"fam-6",title:"Meeting with Emergent",dayOffset:2,startHour:13,startMin:30,duration:60,calType:"family",attendees:"",location:"",htmlLink:""},
  {id:"fam-7",title:"First Aid - Penrith",dayOffset:3,startHour:9,startMin:30,duration:240,calType:"family",attendees:"",location:"Penrith",htmlLink:""},
  {id:"fam-8",title:"Psych - Barbara",dayOffset:3,startHour:14,startMin:0,duration:60,calType:"family",attendees:"",location:"",htmlLink:""},
];

// ─── RECURRING TASKS ─────────────────────────────────────────────────────────
// type: "daily" | "weekly" | "weekday" | "monthly"
// days: array of 0=Mon..6=Sun (for weekly)
const INIT_RECURRING = [
  {
    id:"rec-1", title:"Lunch break", pillar:"health", sub:"Physical",
    priority:"Medium", duration:60, status:"active", notes:"",
    recurrence:{ type:"weekday", days:[0,1,2,3,4], startHour:12, startMin:30, endDate:null },
    exceptions:{},
  },
  {
    id:"rec-2", title:"Madden Footy Training", pillar:"family", sub:"Madden",
    priority:"Medium", duration:90, status:"active", notes:"",
    recurrence:{ type:"weekly", days:[1,3], startHour:17, startMin:30, endDate:null },
    exceptions:{},
  },
  {
    id:"rec-3", title:"Weekly reflection / journal", pillar:"growth", sub:"Reflection",
    priority:"Medium", duration:30, status:"active", notes:"",
    recurrence:{ type:"weekly", days:[6], startHour:20, startMin:0, endDate:null },
    exceptions:{},
  },
];

// Generate recurring instances for a given date range (dayOffset window)
// Returns array of calendar-event-like objects
function generateRecurringInstances(recurringTasks, windowDays=14) {
  const instances = [];
  const today = new Date(); today.setHours(0,0,0,0);

  recurringTasks.forEach(rt => {
    if (rt.status === "parked") return;
    const { type, days, startHour, startMin, endDate } = rt.recurrence;
    const endD = endDate ? new Date(endDate) : null;

    for (let offset = -1; offset <= windowDays; offset++) {
      const date = new Date(today); date.setDate(today.getDate() + offset);
      if (endD && date > endD) continue;

      const dow = date.getDay(); // 0=Sun..6=Sat
      // Convert to Mon-based: Mon=0..Sun=6
      const monDow = dow === 0 ? 6 : dow - 1;

      let fires = false;
      if (type === "daily") fires = true;
      else if (type === "weekday") fires = monDow <= 4;
      else if (type === "weekly") fires = days.includes(monDow);
      else if (type === "monthly") fires = date.getDate() === (days[0] || 1);

      if (!fires) continue;

      // Build date key for exceptions
      const dateKey = date.toISOString().split("T")[0];
      const exc = rt.exceptions?.[dateKey];
      if (exc === "skip") continue;

      const overrides = typeof exc === "object" ? exc : {};
      instances.push({
        id: `${rt.id}-${dateKey}`,
        recurringId: rt.id,
        dateKey,
        title: rt.title,
        pillar: rt.pillar,
        sub: rt.sub,
        priority: rt.priority,
        duration: rt.duration,
        dayOffset: offset,
        startHour: overrides.startHour ?? startHour,
        startMin: overrides.startMin ?? startMin,
        calType: rt.isReminder ? "reminder" : "recurring",
        isRecurring: true,
        isReminder: !!rt.isReminder,
        blockTime: !!rt.blockTime,
        _isTask: !rt.isReminder,
      });
    }
  });
  return instances;
}

let nextId = 5000;

// ─── ENERGY DEFAULTS ──────────────────────────────────────────────────────────
const DEFAULT_ENERGY = {6:4,7:5,8:7,9:8,10:9,11:9,12:7,13:6,14:5,15:5,16:4,17:3,18:2,19:2,20:1,21:1};

// ─── PERSISTENT TASK STORAGE ─────────────────────────────────────────────────
// Tasks and recurring tasks are saved to localStorage on every change.
// On first load, if no saved data exists, INIT_TASKS is used as the seed.
// This means deletions and edits survive Netlify deploys.

function loadTasks() {
  try {
    const saved = localStorage.getItem("syncn_tasks");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e) {}
  return INIT_TASKS;
}

function loadRecurring() {
  try {
    const saved = localStorage.getItem("syncn_recurring");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e) {}
  return INIT_RECURRING;
}

function saveTasks(tasks) {
  try { localStorage.setItem("syncn_tasks", JSON.stringify(tasks)); } catch(e) {}
}

function saveRecurring(recurring) {
  try { localStorage.setItem("syncn_recurring", JSON.stringify(recurring)); } catch(e) {}
}

// ─── COMPASS MEMORY (persisted in localStorage) ─────────────────────────────────
function loadMemory(){
  try{ return JSON.parse(localStorage.getItem("syncn_compass_memory")||"{}"); }catch{ return {}; }
}
function saveMemory(mem){ localStorage.setItem("syncn_compass_memory",JSON.stringify(mem)); }

// ─── UTILS ────────────────────────────────────────────────────────────────────
const HOUR_H = 56;
const CAL_START = 6;
const CAL_END = 22;
const HOURS = Array.from({length:CAL_END-CAL_START},(_,i)=>i+CAL_START);
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const px = (h,m=0) => (h-CAL_START)*HOUR_H+(m/60)*HOUR_H;
const pxH = mins => (mins/60)*HOUR_H;
const fmtT = (h,m) => `${h%12||12}:${String(m).padStart(2,"0")}${h<12?"am":"pm"}`;
const fmtD = mins => mins>=60?`${Math.floor(mins/60)}h${mins%60?` ${mins%60}m`:""}`:mins?`${mins}m`:"";

function getWeekStart(offset=0){
  const now=new Date(); const day=now.getDay()||7;
  const mon=new Date(now); mon.setDate(now.getDate()-(day-1)+(offset*7)); mon.setHours(0,0,0,0);
  return mon;
}
function getDayDates(offset=0){
  const mon=getWeekStart(offset);
  return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
}
function getTodayCol(weekOffset){
  const today=new Date(); today.setHours(0,0,0,0);
  const ws=getWeekStart(weekOffset);
  const diff=Math.round((today-ws)/(864e5));
  return diff>=0&&diff<7?diff:null;
}
function dayOffsetToDate(offset){
  const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+offset); return d;
}
function dateToDayOffset(date){
  const today=new Date(); today.setHours(0,0,0,0);
  return Math.round((date-today)/(864e5));
}
function computeOverlaps(events){
  const r=events.map(e=>({...e,col:0,cols:1}));
  for(let i=0;i<r.length;i++){
    const a=r[i]; const as=a.startHour*60+a.startMin; const ae=as+(a.duration||30);
    let col=0; const used=[];
    for(let j=0;j<i;j++){
      const b=r[j]; const bs=b.startHour*60+b.startMin; const be=bs+(b.duration||30);
      if(as<be&&ae>bs) used.push(b.col);
    }
    while(used.includes(col)) col++;
    r[i].col=col;
  }
  for(let i=0;i<r.length;i++){
    const a=r[i]; const as=a.startHour*60+a.startMin; const ae=as+(a.duration||30);
    let max=a.col;
    for(let j=0;j<r.length;j++){
      if(i===j) continue;
      const b=r[j]; const bs=b.startHour*60+b.startMin; const be=bs+(b.duration||30);
      if(as<be&&ae>bs) max=Math.max(max,b.col);
    }
    r[i].cols=max+1;
  }
  return r;
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function callClaude(messages,system,maxTokens=1000){
  const key=import.meta.env.VITE_ANTHROPIC_KEY;
  if(!key) return "⚠️ Add VITE_ANTHROPIC_KEY to Netlify environment variables to enable Compass.";
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,system,messages}),
  });
  const data=await res.json();
  if(data.error) return `Error: ${data.error.message}`;
  return data.content?.[0]?.text||"";
}

// ─── MARKDOWN RENDERER ───────────────────────────────────────────────────────
// Simple inline renderer — handles bold, italic, headers, bullets, line breaks
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Heading
    if (line.startsWith("### ")) return <div key={i} style={{fontSize:13,fontWeight:800,color:"#f0f4ff",marginTop:12,marginBottom:4}}>{renderInline(line.slice(4))}</div>;
    if (line.startsWith("## "))  return <div key={i} style={{fontSize:14,fontWeight:800,color:"#f0f4ff",marginTop:14,marginBottom:4}}>{renderInline(line.slice(3))}</div>;
    if (line.startsWith("# "))   return <div key={i} style={{fontSize:16,fontWeight:800,color:"#f0f4ff",marginTop:16,marginBottom:6}}>{renderInline(line.slice(2))}</div>;
    // Bullet
    if (line.startsWith("- ") || line.startsWith("* ")) return <div key={i} style={{display:"flex",gap:8,marginBottom:4,paddingLeft:4}}><span style={{color:"#00b4d8",flexShrink:0,marginTop:1}}>›</span><span style={{fontSize:13,lineHeight:1.55,color:"#eef2ff"}}>{renderInline(line.slice(2))}</span></div>;
    if (line.match(/^\d+\. /)) return <div key={i} style={{display:"flex",gap:8,marginBottom:4,paddingLeft:4}}><span style={{color:"#00b4d8",flexShrink:0,minWidth:16,fontSize:11}}>{line.match(/^(\d+)\./)[1]}.</span><span style={{fontSize:13,lineHeight:1.55,color:"#eef2ff"}}>{renderInline(line.replace(/^\d+\. /,""))}</span></div>;
    // HR
    if (line.match(/^---+$/)) return <div key={i} style={{height:1,background:"#1a2540",margin:"10px 0"}}/>;
    // Empty line
    if (line.trim()==="") return <div key={i} style={{height:6}}/>;
    // Normal paragraph
    return <div key={i} style={{fontSize:13,lineHeight:1.6,color:"#eef2ff",marginBottom:2}}>{renderInline(line)}</div>;
  });
}

function renderInline(text) {
  // Bold + italic, bold, italic, code, plain
  const parts = [];
  const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let last = 0; let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={m.index} style={{fontWeight:800,fontStyle:"italic"}}>{m[2]}</strong>);
    else if (m[3]) parts.push(<strong key={m.index} style={{fontWeight:800,color:"#38d4f5"}}>{m[3]}</strong>);
    else if (m[4]) parts.push(<em key={m.index} style={{fontStyle:"italic",color:"#a8c4d8"}}>{m[4]}</em>);
    else if (m[5]) parts.push(<code key={m.index} style={{background:"#1a2540",color:"#38d4f5",padding:"1px 5px",borderRadius:4,fontSize:11,fontFamily:"monospace"}}>{m[5]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

// ─── DAY PICKER COMPONENT ────────────────────────────────────────────────────
function DayPicker({value, onChange, multi=false, label="Day", showDateInput=false}) {
  const today = new Date(); today.setHours(0,0,0,0);

  if (multi) {
    // Full Mon-Sun multi-select for recurring tasks
    const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    return (
      <div>
        <div style={{fontSize:11,color:"#6b7fa3",marginBottom:6}}>{label}</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {DAYS.map((d,i)=>{
            const active = Array.isArray(value) && value.includes(i);
            return(
              <button key={i} type="button" onClick={()=>{
                const current = Array.isArray(value)?[...value]:[];
                const next = active ? current.filter(x=>x!==i) : [...current,i].sort((a,b)=>a-b);
                onChange(next);
              }} style={{
                padding:"6px 11px",borderRadius:6,border:`1.5px solid ${active?"#00b4d8":"#1a2540"}`,
                background:active?"#00b4d822":"transparent",color:active?"#00b4d8":"#6b7fa3",
                fontSize:11,fontWeight:active?800:400,cursor:"pointer",transition:"all 0.12s",
                boxShadow:active?"0 0 6px #00b4d830":"none",
              }}>{d}</button>
            );
          })}
        </div>
        <div style={{fontSize:10,color:"#3a4a6a",marginTop:5}}>Tap to toggle. Multiple days supported.</div>
      </div>
    );
  }

  // Single day — show upcoming 14 days as chips + optional date input
  const days = Array.from({length:14},(_,i)=>{
    const d = new Date(today); d.setDate(today.getDate()+i);
    return {
      offset: i,
      short: d.toLocaleDateString("en-AU",{weekday:"short"}),
      date: d.getDate(),
      full: d,
    };
  });

  return (
    <div>
      <div style={{fontSize:11,color:"#6b7fa3",marginBottom:6}}>{label}</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:showDateInput?8:0}}>
        {days.map(d=>{
          const active = value===d.offset;
          return(
            <button key={d.offset} type="button" onClick={()=>onChange(d.offset)} style={{
              padding:"5px 8px",borderRadius:6,
              border:`1.5px solid ${active?"#00b4d8":"#1a2540"}`,
              background:active?"#00b4d822":"transparent",
              color:active?"#00b4d8":"#6b7fa3",
              fontSize:10,fontWeight:active?800:400,cursor:"pointer",transition:"all 0.12s",
              display:"flex",flexDirection:"column",alignItems:"center",gap:1,minWidth:40,
              boxShadow:active?"0 0 6px #00b4d830":"none",
            }}>
              <span style={{fontSize:8,opacity:0.7}}>{d.short}</span>
              <span>{d.date}</span>
            </button>
          );
        })}
      </div>
      {showDateInput&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
          <span style={{fontSize:10,color:"#6b7fa3",whiteSpace:"nowrap"}}>Or pick a date:</span>
          <input type="date" style={{fontSize:11,border:"1px solid #1a2540",borderRadius:6,padding:"5px 8px",background:"#0d1220",color:"#f0f4ff",outline:"none"}}
            onChange={e=>{
              if(!e.target.value) return;
              const picked=new Date(e.target.value); picked.setHours(0,0,0,0);
              const todayD=new Date(); todayD.setHours(0,0,0,0);
              const off=Math.round((picked-todayD)/(864e5));
              onChange(off);
            }}/>
        </div>
      )}
    </div>
  );
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({size=24}){
  return(
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff"/><stop offset="55%" stopColor="#38d4f5"/><stop offset="100%" stopColor="#006d99"/>
      </linearGradient></defs>
      <text x="3" y="31" fontSize="33" fontWeight="900" fill="url(#lg)" fontFamily="Georgia,serif">S</text>
    </svg>
  );
}

// ─── ENERGY BAR ───────────────────────────────────────────────────────────────
function EnergyDot({level}){
  const color=level>=8?"#4db88a":level>=6?C.cyan:level>=4?C.medium:"#e05c5c";
  return <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:color,boxShadow:`0 0 4px ${color}80`}}/>;
}

// ─── PILLAR RING (Life Map) ────────────────────────────────────────────────────
function PillarRing({pillar,pid,tasks,onSelect,selected}){
  const meta=pillars[pid];
  const total=tasks.filter(t=>t.pillar===pid).length;
  const done=tasks.filter(t=>t.pillar===pid&&t.done).length;
  const active=tasks.filter(t=>t.pillar===pid&&t.status==="active"&&!t.done).length;
  const high=tasks.filter(t=>t.pillar===pid&&t.priority==="High"&&!t.done).length;
  const pct=total>0?Math.round((done/total)*100):0;
  const isSelected=selected===pid;
  const status=high>3?"red":high>1?"yellow":"green";
  const statusColor=status==="red"?C.high:status==="yellow"?C.medium:C.low;

  return(
    <div onClick={()=>onSelect(isSelected?null:pid)}
      style={{background:isSelected?`${meta.color}14`:C.bgCard,border:`1px solid ${isSelected?meta.color:C.border}`,borderRadius:14,padding:"16px",cursor:"pointer",transition:"all 0.2s",boxShadow:isSelected?`0 0 20px ${meta.color}20`:"none"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <span style={{fontSize:18}}>{meta.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{meta.label}</div>
          <div style={{fontSize:10,color:C.textMuted}}>{active} active · {high} urgent</div>
        </div>
        <div style={{width:8,height:8,borderRadius:"50%",background:statusColor,boxShadow:`0 0 6px ${statusColor}`}}/>
      </div>
      {/* Progress bar */}
      <div style={{height:3,background:C.border,borderRadius:2,marginBottom:8,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:meta.color,borderRadius:2,transition:"width 0.6s"}}/>
      </div>
      <div style={{fontSize:10,color:C.textMuted,display:"flex",justifyContent:"space-between"}}>
        <span>{pct}% complete</span>
        <span style={{color:meta.color}}>{total} tasks</span>
      </div>
    </div>
  );
}

// ─── CALENDAR BLOCK ───────────────────────────────────────────────────────────
// Block types for visual hierarchy:
// "locked"    = calendar events (immovable — bright, solid)
// "scheduled" = AI-scheduled tasks (softer background)
// "recurring" = recurring events (medium)
// "habit"     = habit-type recurring (pill style)
// "reminder"  = reminder (dashed border, no fill)
// "block"     = manually blocked time (muted)

function CalBlock({item,color,onClick,col=0,cols=1,isTask=false,blockType="scheduled"}){
  const top=px(item.startHour,item.startMin);
  const height=Math.max(pxH(item.duration||30)-2,16);

  const styles = {
    locked:    {bg:`${color}28`,border:`2px solid ${color}`,opacity:1},
    scheduled: {bg:`${color}14`,border:`1.5px solid ${color}60`,opacity:1},
    recurring: {bg:`${color}10`,border:`1.5px solid ${color}50`,opacity:0.9},
    habit:     {bg:`${color}18`,border:`1.5px solid ${color}`,opacity:1},
    reminder:  {bg:"transparent",border:`1.5px dashed ${color}60`,opacity:0.8},
    block:     {bg:"#333a4a",border:`1px solid #445`,opacity:0.7},
  };
  const s = styles[blockType] || styles.scheduled;

  return(
    <div onClick={e=>{e.stopPropagation();onClick();}} style={{
      position:"absolute",
      top,left:`calc(${(col/cols)*100}% + 2px)`,
      width:`calc(${100/cols}% - 4px)`,height,
      background:s.bg,border:s.border,
      borderRadius:5,padding:"2px 6px",cursor:"pointer",overflow:"hidden",
      zIndex:2+col,transition:"opacity 0.12s",boxSizing:"border-box",
      opacity:s.opacity,
    }}
    onMouseEnter={e=>e.currentTarget.style.opacity="1"}
    onMouseLeave={e=>e.currentTarget.style.opacity=String(s.opacity)}>
      <div style={{fontSize:9,fontWeight:blockType==="locked"?700:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.3}}>
        {item.title}
      </div>
      {height>28&&<div style={{fontSize:8,color:C.textMuted}}>{fmtT(item.startHour,item.startMin)}{item.duration?` · ${fmtD(item.duration)}`:""}</div>}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Syncn(){
  const [tasks,setTasks]=useState(loadTasks);
  const [gcalEvents,setGcalEvents]=useState(INIT_GCAL);
  const [screen,setScreen]=useState("today");
  const [todayView,setTodayView]=useState("day"); // day | week
  const [openAccordion,setOpenAccordion]=useState("morning"); // which period is open
  const [overflowOpen,setOverflowOpen]=useState(false);
  const [pillars,setPillars]=useState(loadPillars);
  const [pillarEditModal,setPillarEditModal]=useState(null); // {id, pillar} | null
  const [subEditModal,setSubEditModal]=useState(null); // {pillarId, subName} | null
  const [addPillarModal,setAddPillarModal]=useState(false);
  const [newPillarData,setNewPillarData]=useState({label:"",icon:"⭐",color:"#6b7fa3"}); // mission|today|lifemap|calendar|compass
  const [weekOffset,setWeekOffset]=useState(0);
  const [selectedPillar,setSelectedPillar]=useState(null);
  const [selectedSub,setSelectedSub]=useState(null);
  const [selected,setSelected]=useState(null); // {type,item}
  const [addModal,setAddModal]=useState(false);
  const [addType,setAddType]=useState("task"); // task | meeting | reminder
  const [newItem,setNewItem]=useState({});
  const [addProjectModal,setAddProjectModal]=useState(false);
  const [newProject,setNewProject]=useState({pillar:"film",name:""});
  const [customSubs,setCustomSubs]=useState({});
  const [energyRhythm,setEnergyRhythm]=useState({
    morning:{label:"Morning",hours:"6-11am",level:"high"},
    midday:{label:"Midday",hours:"11am-1pm",level:"peak"},
    afternoon:{label:"Afternoon",hours:"1-5pm",level:"medium"},
    evening:{label:"Evening",hours:"5-8pm",level:"low"},
    night:{label:"Night",hours:"8pm+",level:"low"},
  });
  const [energyModal,setEnergyModal]=useState(false);
  // Legacy energy profile for scheduling compatibility
  const energyProfile = {
    6:energyRhythm.morning.level==="peak"?10:energyRhythm.morning.level==="high"?8:energyRhythm.morning.level==="medium"?5:3,
    7:energyRhythm.morning.level==="peak"?10:energyRhythm.morning.level==="high"?8:energyRhythm.morning.level==="medium"?5:3,
    8:energyRhythm.morning.level==="peak"?10:energyRhythm.morning.level==="high"?8:energyRhythm.morning.level==="medium"?5:3,
    9:energyRhythm.morning.level==="peak"?10:energyRhythm.morning.level==="high"?8:energyRhythm.morning.level==="medium"?5:3,
    10:energyRhythm.morning.level==="peak"?10:energyRhythm.morning.level==="high"?8:energyRhythm.morning.level==="medium"?5:3,
    11:energyRhythm.midday.level==="peak"?10:energyRhythm.midday.level==="high"?8:energyRhythm.midday.level==="medium"?5:3,
    12:energyRhythm.midday.level==="peak"?10:energyRhythm.midday.level==="high"?8:energyRhythm.midday.level==="medium"?5:3,
    13:energyRhythm.afternoon.level==="peak"?10:energyRhythm.afternoon.level==="high"?8:energyRhythm.afternoon.level==="medium"?5:3,
    14:energyRhythm.afternoon.level==="peak"?10:energyRhythm.afternoon.level==="high"?8:energyRhythm.afternoon.level==="medium"?5:3,
    15:energyRhythm.afternoon.level==="peak"?10:energyRhythm.afternoon.level==="high"?8:energyRhythm.afternoon.level==="medium"?5:3,
    16:energyRhythm.afternoon.level==="peak"?10:energyRhythm.afternoon.level==="high"?8:energyRhythm.afternoon.level==="medium"?5:3,
    17:energyRhythm.evening.level==="peak"?10:energyRhythm.evening.level==="high"?8:energyRhythm.evening.level==="medium"?5:3,
    18:energyRhythm.evening.level==="peak"?10:energyRhythm.evening.level==="high"?8:energyRhythm.evening.level==="medium"?5:3,
    19:energyRhythm.evening.level==="peak"?10:energyRhythm.evening.level==="high"?8:energyRhythm.evening.level==="medium"?5:3,
    20:energyRhythm.night.level==="peak"?10:energyRhythm.night.level==="high"?8:energyRhythm.night.level==="medium"?5:3,
    21:energyRhythm.night.level==="peak"?10:energyRhythm.night.level==="high"?8:energyRhythm.night.level==="medium"?5:3,
  };
  const [compassMsgs,setCompassMsgs]=useState([]);
  const [compassActions,setCompassActions]=useState([]);
  const [reminderPopup,setReminderPopup]=useState(null); // {dayOffset, rems[]} // parsed task actions from Compass
  const [compassInput,setCompassInput]=useState("");
  const [compassLoading,setCompassLoading]=useState(false);
  const [memory,setMemory]=useState(loadMemory);
  const [briefingDone,setBriefingDone]=useState(false);
  const [reminders,setReminders]=useState([]); // {id,title,dayOffset,startHour,startMin,blockTime,notes}
  const [recurringTasks,setRecurringTasks]=useState(loadRecurring);
  const [archive,setArchive]=useState([]); // completed tasks older than 7 days
  const [showArchive,setShowArchive]=useState(false);
  const [editModal,setEditModal]=useState(null); // {task, mode:'single'|'all'}
  const [editItem,setEditItem]=useState({});
  const [recurringEditModal,setRecurringEditModal]=useState(null); // {instance, rt}
  const [recurringEditMode,setRecurringEditMode]=useState(null); // 'single'|'future'|'all'
  const [addRecurringModal,setAddRecurringModal]=useState(false);
  const [newRecurring,setNewRecurring]=useState({title:"",pillar:"family",sub:"",priority:"Medium",duration:60,status:"active",notes:"",recurrence:{type:"weekly",days:[0],startHour:9,startMin:0,endDate:""}});
  const [freedSlot,setFreedSlot]=useState(null); // {dateKey, startHour, startMin, duration}
  const [eveningPlanModal,setEveningPlanModal]=useState(false);
  const [eveningPlanLoading,setEveningPlanLoading]=useState(false);
  const [sidebarMode,setSidebarMode]=useState("expanded"); // expanded | collapsed | hidden
  const [hiddenEvents,setHiddenEvents]=useState(()=>{
    try{ return JSON.parse(localStorage.getItem("syncn_hidden_events")||"[]"); }catch{ return []; }
  });
  const hideEvent = (id) => {
    const updated = [...hiddenEvents, id];
    setHiddenEvents(updated);
    localStorage.setItem("syncn_hidden_events", JSON.stringify(updated));
  };
  const unhideEvent = (id) => {
    const updated = hiddenEvents.filter(x => x !== id);
    setHiddenEvents(updated);
    localStorage.setItem("syncn_hidden_events", JSON.stringify(updated));
  };
  const [showIgnoredModal,setShowIgnoredModal]=useState(false);
  const [calLoading,setCalLoading]=useState(false);
  const [calError,setCalError]=useState(null);
  const [scheduling,setScheduling]=useState(false);
  const [filterStatus,setFilterStatus]=useState("all");
  const [search,setSearch]=useState("");
  const [blockerModal,setBlockerModal]=useState(null); // task
  const calScrollRef=useRef(null);
  const chatEnd=useRef(null);

  useEffect(()=>{ chatEnd.current?.scrollIntoView({behavior:"smooth"}); },[compassMsgs]);
  useEffect(()=>{ if(screen==="calendar"&&calScrollRef.current) calScrollRef.current.scrollTop=px(8); },[screen]);

  // Check for postponed tasks proactively
  useEffect(()=>{
    const overdue=tasks.find(t=>t.postponeCount>=2&&!t.blockerSurfaced&&!t.done);
    if(overdue){ setBlockerModal(overdue); setTasks(p=>p.map(t=>t.id===overdue.id?{...t,blockerSurfaced:true}:t)); }
  },[tasks]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const dayDates=getDayDates(weekOffset);
  const todayCol=getTodayCol(weekOffset);
  const scheduledTasks=tasks.filter(t=>t.scheduled&&t.dayOffset!==null);
  const unscheduled=tasks.filter(t=>!t.scheduled&&!t.done&&t.pillar!=="parking"&&t.duration>0&&t.status!=="parked");
  const pColor={High:C.high,Medium:C.medium,Low:C.low};

  // Generate recurring instances for 2-week window
  const recurringInstances = generateRecurringInstances(recurringTasks, 14);

  // Archive sweep — tasks done > 7 days ago
  useEffect(() => {
    const cutoff = Date.now() - 7 * 864e5;
    const toArchive = tasks.filter(t => t.done && t.doneAt && t.doneAt < cutoff);
    if (toArchive.length > 0) {
      setArchive(p => [...p, ...toArchive]);
      setTasks(p => p.filter(t => !(t.done && t.doneAt && t.doneAt < cutoff)));
    }
  }, [tasks]);

  // Auto-save pillars to localStorage — also sync module-level PILLARS ref
  useEffect(() => { savePillars(pillars); PILLARS = pillars; }, [pillars]);

  // Auto-save tasks to localStorage on every change
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  // Auto-save recurring tasks to localStorage on every change
  useEffect(() => { saveRecurring(recurringTasks); }, [recurringTasks]);

  // Evening planning trigger — check if after 8pm
  const isEvening = new Date().getHours() >= 20;
  const isMonday = new Date().getDay() === 1;

  // Filter out hidden events (hidden from Sync'n only — stays in Google Calendar)
  const visibleGcalEvents = gcalEvents.filter(e => !hiddenEvents.includes(e.id));
  const todayTasks=scheduledTasks.filter(t=>t.dayOffset===0);
  const todayEvents=visibleGcalEvents.filter(e=>e.dayOffset===0);
  const todayRecurring = recurringInstances.filter(r => r.dayOffset === 0);
  const todayReminders = reminders.filter(r => r.dayOffset === 0);
  const todayAll=[
    ...todayTasks.map(t=>({...t,_type:"task",_color:pillars[t.pillar]?.color||C.cyan})),
    ...todayEvents.map(e=>({...e,_type:"event",_color:e.calType==="family"?PILLARS.family.color:C.cyan})),
    ...todayRecurring.map(r=>({...r,_type:"recurring",_color:pillars[r.pillar]?.color||C.cyan})),
    ...todayReminders.map(r=>({...r,_type:"reminder",_color:"#d4a843"})),
  ].sort((a,b)=>(a.startHour*60+a.startMin)-(b.startHour*60+b.startMin));

  const allSubs=(pid)=>[...(pillars[pid]?.sub||[]),...(customSubs[pid]||[])];

  const visibleTasks=tasks.filter(t=>{
    if(selectedPillar&&t.pillar!==selectedPillar) return false;
    if(selectedSub&&t.sub!==selectedSub) return false;
    if(filterStatus==="all") return true;
    if(filterStatus==="done") return t.done;
    if(filterStatus==="active") return t.status==="active"&&!t.done;
    if(filterStatus==="upcoming") return t.status==="upcoming"&&!t.done;
    if(filterStatus==="parked") return t.status==="parked"&&!t.done;
    if(search&&!t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Pillar time balance
  const pillarBalance=Object.keys(pillars).map(pid=>{
    const pt=tasks.filter(t=>t.pillar===pid);
    const totalMins=pt.filter(t=>t.scheduled).reduce((a,t)=>a+t.duration,0);
    return {pid,mins:totalMins};
  });
  const totalMins=pillarBalance.reduce((a,b)=>a+b.mins,1);
  const pillarPct=(pid)=>Math.round((pillarBalance.find(p=>p.pid===pid)?.mins||0)/totalMins*100);

  // Low-attention warnings
  const warnings=Object.entries(pillars).filter(([pid])=>{
    if(pid==="parking") return false;
    return pillarPct(pid)<5&&tasks.filter(t=>t.pillar===pid&&!t.done).length>0;
  }).map(([pid,meta])=>({pid,meta}));

  // ── Evening / Next-day Planning ──────────────────────────────────────────────
  const planNextDay = useCallback(async (fullWeek=false) => {
    setEveningPlanLoading(true);
    const tomorrow = fullWeek ? "this week" : "tomorrow";
    const window = fullWeek ? 5 : 1;
    const occupied = [
      ...scheduledTasks.map(t=>({dayOffset:t.dayOffset,startHour:t.startHour,startMin:t.startMin,duration:t.duration,title:t.title})),
      ...visibleGcalEvents.map(e=>({dayOffset:e.dayOffset,startHour:e.startHour,startMin:e.startMin,duration:e.duration,title:e.title})),
      ...recurringInstances.filter(r=>r.dayOffset>=0&&r.dayOffset<=window).map(r=>({dayOffset:r.dayOffset,startHour:r.startHour,startMin:r.startMin,duration:r.duration,title:r.title})),
    ];
    const toSched = unscheduled.filter(t=>t.priority!=="Low").slice(0,12);
    const energyCtx = Object.entries(energyProfile).map(([h,e])=>`${h}:00=${e}/10`).join(", ");
    const prompt = `Plan ${tomorrow} for Beej. Schedule unscheduled tasks into dayOffset ${fullWeek?"0-4":"1"} slots. Work around existing blocks. Respect energy profile. High priority tasks during peak energy. Return ONLY JSON array: [{"id":N,"dayOffset":${fullWeek?"0-4":"1"},"startHour":7-19,"startMin":0}]

Existing blocks:${JSON.stringify(occupied)}
Energy:${energyCtx}
Tasks:${JSON.stringify(toSched.map(t=>({id:t.id,title:t.title,priority:t.priority,duration:t.duration,pillar:t.pillar})))}`;
    try {
      const reply = await callClaude([{role:"user",content:prompt}], "Scheduling AI. Return only valid JSON. No markdown.");
      const parsed = JSON.parse(reply.replace(/```json|```/g,"").trim());
      setTasks(prev=>prev.map(t=>{ const s=parsed.find(x=>x.id===t.id); return s?{...t,scheduled:true,dayOffset:s.dayOffset,startHour:s.startHour,startMin:s.startMin}:t; }));
      // Tell Compass what was planned
      const topItems = parsed.slice(0,3).map(s=>{ const t=unscheduled.find(x=>x.id===s.id); return t ? t.title+" (Day+"+s.dayOffset+" "+s.startHour+":"+String(s.startMin).padStart(2,"0")+")" : ""; }).filter(Boolean).join(", ");
      const summary = parsed.length > 0
        ? "AI has scheduled "+parsed.length+" tasks for "+tomorrow+". Top: "+topItems+"."
        : "No unscheduled high-priority tasks for "+tomorrow+".";
      const planLabel = fullWeek ? "Week" : "Tomorrow";
      setCompassMsgs(p=>[...p,{role:"assistant",content:"**"+planLabel+" planned.** "+summary+"\n\nCheck Calendar view to review."}]);
      if(screen!=="compass") setScreen("compass");
    } catch(e) { console.error(e); }
    setEveningPlanLoading(false);
    setEveningPlanModal(false);
  },[unscheduled, scheduledTasks, gcalEvents, recurringInstances, energyProfile, screen]);

  // Re-sync today — reschedule remaining unfinished tasks around completed ones
  const resyncToday = useCallback(async () => {
    const remaining = scheduledTasks.filter(t=>t.dayOffset===0&&!t.done);
    const done = scheduledTasks.filter(t=>t.dayOffset===0&&t.done);
    const now = new Date();
    const currentHour = now.getHours();
    const toReschedule = remaining.filter(t=>t.startHour<=currentHour);
    if(toReschedule.length===0){ await sendToCompass("Quick re-sync — look at today and tell me if anything needs adjusting for the rest of the day."); return; }
    const prompt = `Re-sync today's remaining schedule. These tasks need new slots after ${currentHour}:00. Work around existing events and recurring tasks. Return ONLY JSON: [{"id":N,"dayOffset":0,"startHour":${currentHour+1}-20,"startMin":0}]

Completed:${JSON.stringify(done.map(t=>t.title))}
Needs rescheduling:${JSON.stringify(toReschedule.map(t=>({id:t.id,title:t.title,duration:t.duration})))}
Existing blocks:${JSON.stringify([...visibleGcalEvents.filter(e=>e.dayOffset===0),...recurringInstances.filter(r=>r.dayOffset===0)].map(e=>({startHour:e.startHour,startMin:e.startMin,duration:e.duration})))}`;
    try {
      const reply = await callClaude([{role:"user",content:prompt}],"Scheduling AI. Return only valid JSON.");
      const parsed = JSON.parse(reply.replace(/```json|```/g,"").trim());
      setTasks(prev=>prev.map(t=>{ const s=parsed.find(x=>x.id===t.id); return s?{...t,startHour:s.startHour,startMin:s.startMin}:t; }));
      const leftover = toReschedule.length-parsed.length; setCompassMsgs(p=>[...p,{role:"assistant",content:"**Today re-synced.** Moved "+parsed.length+" tasks to new slots."+(leftover>0?" "+leftover+" couldn't fit — consider parking them.":"")}]);
      if(screen!=="compass") setScreen("compass");
    } catch(e){ console.error(e); }
  },[scheduledTasks, gcalEvents, recurringInstances, screen]);

  // ── Sync Calendar ─────────────────────────────────────────────────────────
  const syncCalendar=useCallback(async()=>{
    setCalLoading(true); setCalError(null);
    try{
      const res=await fetch("/.netlify/functions/sync-calendar?range=month");
      if(!res.ok) throw new Error("Sync failed");
      const raw=await res.json();

      // Get today at midnight LOCAL time for offset calculation
      const now=new Date();
      const todayMidnight=new Date(now.getFullYear(),now.getMonth(),now.getDate(),0,0,0,0);

      const events=raw.map(e=>{
        // rawStart comes from the Netlify function as the original ISO string
        // e.g. "2026-06-12T10:30:00+10:00" or "2026-06-12T00:30:00Z"
        // We need the LOCAL date (AEST +10) — extract year/month/day directly from the string
        const raw = e.rawStart || e.rawEnd || "";
        let year, month, day;

        if(raw){
          // Always take the date portion directly from the string before any T
          // This avoids UTC conversion entirely
          const datePart = raw.split("T")[0]; // "2026-06-12"
          const parts = datePart.split("-");
          if(parts.length===3){
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1; // 0-indexed
            day = parseInt(parts[2]);
          }
        }

        if(year!==undefined){
          const evDate = new Date(year, month, day, 0, 0, 0, 0);
          const offset = Math.round((evDate - todayMidnight) / 864e5);
          return {...e, dayOffset: offset};
        }

        // Absolute fallback — shouldn't reach here with proper rawStart
        return {...e, dayOffset: 0};
      });

      setGcalEvents(events);
    }catch(e){
      console.error("Sync error:", e);
      setCalError("Sync failed. Check connection.");
    }
    setCalLoading(false);
  },[]);

  // ── AI Schedule ───────────────────────────────────────────────────────────
  // ── SMART CONFLICT-AWARE SCHEDULER ──────────────────────────────────────────
  // Step 1: Build a minute-accurate timeline of all occupied slots per day
  // Step 2: Ask Claude for suggestions (with full context of what's blocked)
  // Step 3: Validate every suggestion — reject any that overlap, find next free slot
  // Step 4: Apply only validated, conflict-free placements

  const buildDayTimeline = useCallback((dayOffset) => {
    // Returns array of {start, end} in minutes-from-midnight for a given dayOffset
    const slots = [];
    const addSlot = (startHour, startMin, duration, buffer=15) => {
      const start = startHour * 60 + startMin;
      const end = start + duration + buffer; // include buffer gap
      slots.push({start, end});
    };
    // Calendar events (hard blocks — no buffer needed, they're immovable)
    visibleGcalEvents.filter(e=>e.dayOffset===dayOffset).forEach(e=>{
      slots.push({start: e.startHour*60+e.startMin, end: e.startHour*60+e.startMin+e.duration});
    });
    // Recurring events
    recurringInstances.filter(r=>r.dayOffset===dayOffset).forEach(r=>{
      slots.push({start: r.startHour*60+r.startMin, end: r.startHour*60+r.startMin+r.duration});
    });
    // Already-scheduled tasks (with 15min buffer)
    scheduledTasks.filter(t=>t.dayOffset===dayOffset).forEach(t=>{
      addSlot(t.startHour, t.startMin, t.duration, 15);
    });
    return slots.sort((a,b)=>a.start-b.start);
  }, [visibleGcalEvents, recurringInstances, scheduledTasks]);

  const findFreeSlot = useCallback((dayOffset, durationMins, preferredStartMins=7*60, endMins=20*60) => {
    // Find the next available slot on a given day that fits duration + 15min buffer
    const timeline = buildDayTimeline(dayOffset);
    const needed = durationMins + 15; // task + buffer after

    let cursor = preferredStartMins;
    while (cursor + durationMins <= endMins) {
      const slotStart = cursor;
      const slotEnd = cursor + needed;
      const conflict = timeline.find(s => slotStart < s.end && slotEnd > s.start);
      if (!conflict) return cursor; // free — return start in minutes
      cursor = conflict.end; // jump past the conflict
    }
    return null; // no slot found this day
  }, [buildDayTimeline]);

  const autoSchedule = useCallback(async () => {
    const toSched = unscheduled.filter(t => t.priority !== "Low").slice(0, 12);
    if (!toSched.length) return;
    setScheduling(true);

    try {
      // Current time — don't schedule in past slots
      const nowHour = new Date().getHours();
      const nowMin = new Date().getMinutes();
      const nowMins = nowHour * 60 + nowMin;
      // If it's after 8pm, start scheduling from tomorrow
      const startDay = nowMins >= 20*60 ? 1 : 0;
      const todayEarliestMins = startDay === 0 ? nowMins + 15 : 7*60; // 15min buffer from now

      // Build human-readable calendar summary for Claude
      const calSummary = [];
      for (let d = startDay; d <= 6; d++) {
        const dayEvents = [
          ...visibleGcalEvents.filter(e=>e.dayOffset===d).map(e=>
            `    ${fmtT(e.startHour,e.startMin)}–${fmtT(e.startHour,e.startMin+e.duration)} [CALENDAR] ${e.title}`
          ),
          ...recurringInstances.filter(r=>r.dayOffset===d).map(r=>
            `    ${fmtT(r.startHour,r.startMin)}–${fmtT(r.startHour,r.startMin+r.duration)} [RECURRING] ${r.title}`
          ),
          ...scheduledTasks.filter(t=>t.dayOffset===d).map(t=>
            `    ${fmtT(t.startHour,t.startMin)}–${fmtT(t.startHour,t.startMin+t.duration)} [TASK] ${t.title}`
          ),
        ].sort();

        const today = new Date(); today.setHours(0,0,0,0);
        const dayDate = new Date(today); dayDate.setDate(today.getDate()+d);
        const dayName = dayDate.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});
        const freeMinutes = [7*60,8*60,9*60,10*60,11*60,13*60,14*60,15*60,16*60,17*60].reduce((acc,mins) => {
          const h = Math.floor(mins/60), m = mins%60;
          if(findFreeSlot(d,60,mins,20*60)===mins) acc++;
          return acc;
        },0);

        calSummary.push("  Day+" + d + " " + dayName + " (" + (freeMinutes>0 ? freeMinutes+" approx free hours" : "PACKED") + "):\n" + (dayEvents.length>0 ? dayEvents.join("\n") : "    [empty]"));
      }

      // Energy context
      const energyMap = {
        morning: energyRhythm?.morning?.level||"high",
        midday: energyRhythm?.midday?.level||"peak",
        afternoon: energyRhythm?.afternoon?.level||"medium",
        evening: energyRhythm?.evening?.level||"low",
      };

      const prompt = `You are scheduling tasks for Brendan Byrne. Be EXTREMELY careful not to overlap with existing blocks.

CALENDAR (all existing blocks — DO NOT place tasks during these times):
${calSummary.join("
")}

ENERGY PROFILE:
- Morning (7-11am): ${energyMap.morning} energy → best for creative/deep work
- Midday (11am-1pm): ${energyMap.midday} energy → best for important meetings/strategy
- Afternoon (1-5pm): ${energyMap.afternoon} energy → good for focused tasks
- Evening (5-8pm): ${energyMap.evening} energy → admin, light tasks only

TASKS TO SCHEDULE (in priority order):
${toSched.map((t,i)=>`${i+1}. id=${t.id} "${t.title}" [${t.pillar}] ${t.priority} priority, ${t.duration}min`).join("
")}

STRICT RULES:
1. DO NOT place any task during an existing calendar/recurring/task block
2. Leave minimum 15 minutes between tasks
3. Work hours only: 7am (hour=7) to 8pm (hour=20)
4. Match energy — High priority tasks go in HIGH or PEAK energy periods
5. Spread across multiple days — max 4 hours of tasks per day
6. If a day is too packed, move to the next day
7. Return startMin as 0, 15, 30, or 45 only

Return ONLY a JSON array, no markdown:
[{"id":N,"dayOffset":0-6,"startHour":7-19,"startMin":0|15|30|45}]`;

      const reply = await callClaude(
        [{role:"user",content:prompt}],
        "You are a precise calendar scheduling AI. Return ONLY valid JSON. Never place events during existing blocks."
      );
      const parsed = JSON.parse(reply.replace(/```json|```/g,"").trim());

      // ── POST-VALIDATION: check every suggestion against real timeline ──────
      const validated = [];
      const appliedThisRun = []; // track what we place in this run to avoid self-conflicts

      for (const suggestion of parsed) {
        const {id, dayOffset, startHour, startMin} = suggestion;
        const task = toSched.find(t => t.id === id);
        if (!task) continue;

        const suggestedStart = startHour * 60 + startMin;
        const suggestedEnd = suggestedStart + task.duration;

        // Build timeline including tasks already placed in this scheduling run
        const timeline = buildDayTimeline(dayOffset);
        appliedThisRun.filter(a=>a.dayOffset===dayOffset).forEach(a=>{
          timeline.push({start:a.startHour*60+a.startMin, end:a.startHour*60+a.startMin+a.duration+15});
        });
        timeline.sort((a,b)=>a.start-b.start);

        // Check if Claude's suggestion is conflict-free
        const hasConflict = timeline.some(s => suggestedStart < s.end && suggestedEnd+15 > s.start);

        if (!hasConflict) {
          // Claude's suggestion is good — use it
          validated.push({id, dayOffset, startHour, startMin});
          appliedThisRun.push({dayOffset, startHour, startMin, duration:task.duration});
        } else {
          // Claude's suggestion conflicts — find the next free slot on that day or following days
          let placed = false;
          for (let d = dayOffset; d <= 6 && !placed; d++) {
            // Get energy preference for this task
            // For today (d===0), start no earlier than now+15min
          const dayEarliest = d === 0 ? (nowMins + 15) : 7*60;
          const prefStart = Math.max(
            dayEarliest,
            task.priority === "High"
              ? (energyMap.midday === "peak" ? 11*60 : 9*60)
              : 13*60
          );

            const timeline2 = buildDayTimeline(d);
            appliedThisRun.filter(a=>a.dayOffset===d).forEach(a=>{
              timeline2.push({start:a.startHour*60+a.startMin, end:a.startHour*60+a.startMin+a.duration+15});
            });
            timeline2.sort((a,b)=>a.start-b.start);

            // Try preferred start, then any free slot
            const startPoints = [prefStart, dayEarliest, 7*60, 8*60, 9*60, 10*60, 13*60, 14*60, 15*60, 16*60].filter(t=>t>=dayEarliest).sort((a,b)=>a-b);
            for (const sp of startPoints) {
              if (sp < 7*60 || sp + task.duration > 20*60) continue;
              const end = sp + task.duration;
              const conflict = timeline2.some(s => sp < s.end && end+15 > s.start);
              if (!conflict) {
                const sh = Math.floor(sp/60);
                const sm = (sp%60);
                validated.push({id, dayOffset:d, startHour:sh, startMin:sm});
                appliedThisRun.push({dayOffset:d, startHour:sh, startMin:sm, duration:task.duration});
                placed = true;
                break;
              }
            }

            // If no preferred slot, try every 15min slot from dayEarliest
            if (!placed) {
              for (let mins = dayEarliest; mins + task.duration <= 20*60; mins += 15) {
                const end = mins + task.duration;
                const conflict = timeline2.some(s => mins < s.end && end+15 > s.start);
                if (!conflict) {
                  validated.push({id, dayOffset:d, startHour:Math.floor(mins/60), startMin:mins%60});
                  appliedThisRun.push({dayOffset:d, startHour:Math.floor(mins/60), startMin:mins%60, duration:task.duration});
                  placed = true;
                  break;
                }
              }
            }
          }
          // If we still couldn't place it, skip — don't force an overlap
          if (!placed) console.warn(`Could not find free slot for task ${id}: ${task.title}`);
        }
      }

      // Apply only validated placements
      setTasks(prev => prev.map(t => {
        const s = validated.find(x => x.id === t.id);
        return s ? {...t, scheduled:true, dayOffset:s.dayOffset, startHour:s.startHour, startMin:s.startMin} : t;
      }));

      console.log(`Scheduled ${validated.length}/${toSched.length} tasks (${toSched.length-validated.length} couldn't fit)`);
    } catch(e) {
      console.error("Schedule error:", e);
    }
    setScheduling(false);
  }, [unscheduled, scheduledTasks, visibleGcalEvents, recurringInstances, energyProfile, energyRhythm, buildDayTimeline, findFreeSlot]);

  // ── Compass ──────────────────────────────────────────────────────────────
  const buildCompassContext=()=>{
    const mem=loadMemory();
    const pillarStats=Object.keys(pillars).map(pid=>{
      const pt=tasks.filter(t=>t.pillar===pid&&!t.done);
      const high=pt.filter(t=>t.priority==="High").length;
      const pct=pillarPct(pid);
      return `${pillars[pid].label}: ${pt.length} tasks (${high} urgent), ${pct}% of scheduled time`;
    }).join("\n");
    const todayStr=todayAll.map(e=>`${fmtT(e.startHour,e.startMin)} ${e.title}`).join(", ")||"Nothing scheduled";
    const postponed=tasks.filter(t=>t.postponeCount>0).map(t=>`"${t.title}" (postponed ${t.postponeCount}x)`).join(", ");
    const memStr=mem.lastWeekReview?`Last week: ${mem.lastWeekReview}`:"";
    const statedPriorities=mem.statedPriorities||"Not yet defined";
    return `BEEJ'S LIFE CONTEXT:
Stated priorities: ${statedPriorities}
${memStr}

PILLAR TIME DISTRIBUTION:
${pillarStats}

TODAY (${new Date().toDateString()}):
${todayStr}

POSTPONED TASKS: ${postponed||"None"}

UNSCHEDULED HIGH PRIORITY: ${unscheduled.filter(t=>t.priority==="High").length} tasks

MEMORY: ${JSON.stringify(mem)}`;
  };

  const compassSystem=`You are Compass — the AI life alignment coach built into Sync'n for Brendan "Beej" Mulholland.

BEEJ'S IDENTITY: Indie filmmaker (Shadow Wolves Productions), app developer (SLATR, SPOT'D, PITCH'D), producer, writer, actor, father of three (Madden, Hardey, Noa), husband. Ex-military/security background. Running multiple projects simultaneously.

YOUR ROLE: Purpose coach, accountability partner, and task creator.

RULES — NON-NEGOTIABLE:
- Never say "amazing", "fantastic", "great question", "I understand", "absolutely"
- Never open with a compliment or affirmation
- Never use fake positivity or motivational fluff
- DO call out the gap between stated priorities and actual behaviour — with specific numbers
- DO reference what he said last week if relevant
- DO flag when a life pillar is being neglected — name it directly
- DO tell him what to cut when he's overloaded — not what to "consider deprioritising"
- IF family time is low and work is high — say it plainly
- IF a task has been postponed multiple times — call it out as a pattern
- Occasionally dry/witty but never at the expense of the point
- Always end with ONE specific next action — not a list
- Max 5 bullet points unless asked for more
- Be direct. Be honest. Be useful.

TASK & MEETING CREATION:
When asked to create tasks OR schedule meetings/events, return structured data at the END of your response.

For TASKS, use:

\`\`\`tasks
[
  {"title":"Task title here","pillar":"film","sub":"CROWE","priority":"High","duration":60,"status":"active","notes":"Optional context"},
  {"title":"Another task","pillar":"business","sub":"SLATR","priority":"Medium","duration":45,"status":"active","notes":""}
]
\`\`\`

PILLAR VALUES: film | business | health | family | finance | creativity | growth | parking
PRIORITY VALUES: High | Medium | Low
STATUS VALUES: active | upcoming | parked

Rules for task creation:
- Extract ONLY concrete actionable tasks — not vague ideas
- Assign pillar based on context (film work → film, app work → business, family stuff → family)
- Estimate duration honestly — don't default everything to 60min
- If notes contain useful context from the source material, include it
- Confirm what you created in plain text ABOVE the JSON block
- Do NOT create the JSON block unless explicitly asked to create tasks or meetings

For MEETINGS/EVENTS, when asked to schedule a meeting or add an event, use:
\`\`\`meeting
{"title":"Meeting title","dayOffset":0,"startHour":9,"startMin":0,"duration":60,"attendees":"","location":"","notes":""}
\`\`\`

dayOffset: 0=today, 1=tomorrow, 2=day after, etc.
startHour: 24hr format (9=9am, 14=2pm)
duration: minutes
Only create the meeting block when explicitly asked to schedule something.

Tone: Smart. Direct. Calm. Occasionally witty. Never a pushover.`;

  const sendToCompass=async(msg)=>{
    if(!msg.trim()||compassLoading) return;
    const userMsg={role:"user",content:msg};
    const msgs=[...compassMsgs,userMsg];
    setCompassMsgs(msgs); setCompassInput(""); setCompassLoading(true);
    const ctx=buildCompassContext();
    try{
      const reply=await callClaude(msgs,`${compassSystem}

CURRENT DATA:
${ctx}`);

      // ── Parse task and meeting creation commands ──────────────────────────
      const taskBlockMatch = reply.match(/```tasks\s*([\s\S]*?)```/);
      const meetingBlockMatch = reply.match(/```meeting\s*([\s\S]*?)```/);
      let createdTasks = [];
      let createdMeeting = null;
      let cleanReply = reply;

      // Parse tasks
      if(taskBlockMatch){
        try{
          const parsed = JSON.parse(taskBlockMatch[1].trim());
          if(Array.isArray(parsed) && parsed.length > 0){
            createdTasks = parsed.map(t => ({
              id: nextId++,
              title: t.title || "Untitled task",
              pillar: t.pillar || "film",
              sub: t.sub || "",
              priority: t.priority || "Medium",
              duration: t.duration || 60,
              status: t.status || "active",
              notes: t.notes || "",
              done: false, scheduled: false, dayOffset: null,
              startHour: null, startMin: null, deadline: "",
              postponeCount: 0, blockerSurfaced: false,
            }));
            setTasks(p => [...p, ...createdTasks]);
            cleanReply = cleanReply.replace(/```tasks[\s\S]*?```/, "").trim();
          }
        } catch(e){ console.error("Task parse error:", e); }
      }

      // Parse meeting
      if(meetingBlockMatch){
        try{
          const m = JSON.parse(meetingBlockMatch[1].trim());
          if(m && m.title){
            const meetingId = "compass-" + nextId++;
            const newMeeting = {
              id: meetingId,
              calType: "work",
              title: m.title,
              dayOffset: m.dayOffset ?? 0,
              startHour: m.startHour ?? 9,
              startMin: m.startMin ?? 0,
              duration: m.duration ?? 60,
              location: m.location || "",
              attendees: m.attendees || "",
              htmlLink: "",
              notes: m.notes || "",
            };
            setGcalEvents(p => [...p, newMeeting]);
            createdMeeting = newMeeting;
            cleanReply = cleanReply.replace(/```meeting[\s\S]*?```/, "").trim();
          }
        } catch(e){ console.error("Meeting parse error:", e); }
      }

      setCompassMsgs(p=>[...p,{
        role:"assistant",
        content:cleanReply,
        createdTasks: createdTasks.length > 0 ? createdTasks : undefined,
        createdMeeting: createdMeeting || undefined,
      }]);

      // Update memory with any stated priorities
      if(msg.toLowerCase().includes("priority")||msg.toLowerCase().includes("matters most")){
        const newMem={...loadMemory(),statedPriorities:msg,lastUpdated:new Date().toISOString()};
        saveMemory(newMem); setMemory(newMem);
      }
    }catch(e){
      setCompassMsgs(p=>[...p,{role:"assistant",content:"Connection error. Check VITE_ANTHROPIC_KEY."}]);
    }
    setCompassLoading(false);
  };

  // Morning briefing
  const startMorningBriefing=async()=>{
    setScreen("compass");
    setCompassLoading(true);
    const ctx=buildCompassContext();
    const now=new Date();
    const hour=now.getHours();
    const greeting=hour<12?"Morning":"Afternoon";
    const prompt=`Give Beej his morning briefing for ${now.toDateString()}. Structure:
1. One sharp opening line — what the day looks like (no fluff)
2. The 3 most important things he needs to accomplish today and why
3. One life balance flag if any pillar is being neglected
4. One thing he should NOT do today (something to cut or delay)
5. Single next action to start right now

Keep it tight. Max 200 words. This is a briefing, not a pep talk.`;
    try{
      const reply=await callClaude([{role:"user",content:prompt}],`${compassSystem}\n\nCURRENT DATA:\n${ctx}`);
      setCompassMsgs([{role:"assistant",content:reply}]);
    }catch(e){
      setCompassMsgs([{role:"assistant",content:"Connection issue. Check your API key."}]);
    }
    setBriefingDone(true);
    setCompassLoading(false);
  };

  const checkIn=async()=>{
    setScreen("compass");
    sendToCompass("Quick check-in — look at what I've done today, what's coming up, and tell me if I'm on track or drifting. Be direct.");
  };

  // ── Task actions ─────────────────────────────────────────────────────────
  const toggleDone = id => setTasks(p => p.map(t => t.id===id ? {...t, done:!t.done, doneAt:!t.done?Date.now():null} : t));

  const unarchiveTask = id => {
    const task = archive.find(t => t.id === id);
    if (!task) return;
    setArchive(p => p.filter(t => t.id !== id));
    setTasks(p => [...p, {...task, done:false, doneAt:null}]);
  };

  // Mark a single recurring instance done (adds exception)
  const doneRecurringInstance = (recurringId, dateKey) => {
    setRecurringTasks(p => p.map(rt => rt.id===recurringId
      ? {...rt, exceptions:{...rt.exceptions, [dateKey]:"skip"}}
      : rt
    ));
  };

  // Skip a recurring instance and optionally suggest a replacement
  const skipRecurringInstance = (instance) => {
    doneRecurringInstance(instance.recurringId, instance.dateKey);
    // Offer freed slot to Compass
    setFreedSlot({
      dateKey: instance.dateKey,
      dayOffset: instance.dayOffset,
      startHour: instance.startHour,
      startMin: instance.startMin,
      duration: instance.duration,
      title: instance.title,
    });
  };

  // Edit a single recurring occurrence
  const editRecurringOccurrence = (instance, changes) => {
    setRecurringTasks(p => p.map(rt => rt.id===instance.recurringId
      ? {...rt, exceptions:{...rt.exceptions, [instance.dateKey]: changes}}
      : rt
    ));
  };

  // Edit all future occurrences
  const editRecurringFuture = (rt, changes) => {
    setRecurringTasks(p => p.map(r => r.id===rt.id
      ? {...r, recurrence:{...r.recurrence, ...changes}}
      : r
    ));
  };
  const deleteTask=id=>{setTasks(p=>p.filter(t=>t.id!==id));setSelected(null);};
  const postponeTask=id=>setTasks(p=>p.map(t=>t.id===id?{...t,postponeCount:(t.postponeCount||0)+1,scheduled:false,dayOffset:null,startHour:null,startMin:null}:t));
  const unscheduleTask=id=>setTasks(p=>p.map(t=>t.id===id?{...t,scheduled:false,dayOffset:null,startHour:null,startMin:null}:t));

  const handleAdd=()=>{
    if(!newItem.title?.trim()) return;
    if(addType==="meeting"){
      setGcalEvents(p=>[...p,{id:`manual-${nextId++}`,calType:"work",dayOffset:newItem.dayOffset??0,startHour:newItem.startHour??9,startMin:newItem.startMin??0,duration:newItem.duration??60,location:newItem.location||"",attendees:newItem.attendees||"",htmlLink:"",title:newItem.title}]);
      // Handle meeting recurrence
      if(newItem._recurring&&newItem._recurring!=="never"){
        setRecurringTasks(p=>[...p,{id:`rec-${nextId++}`,title:newItem.title,pillar:"business",sub:"",priority:"Medium",duration:newItem.duration||60,status:"active",notes:newItem.notes||"",recurrence:{type:newItem._recurring,days:newItem._recurDays||[],startHour:newItem.startHour||9,startMin:newItem.startMin||0,endDate:newItem._endDate||null},exceptions:{}}]);
      }
    } else if(addType==="reminder"){
      if(newItem._isRecurring && newItem._recurring && newItem._recurring!=="never"){
        // Recurring reminder — add to recurringTasks as a special reminder type
        setRecurringTasks(p=>[...p,{
          id:`rec-${nextId++}`,
          title:newItem.title,
          pillar:"health", sub:"",
          priority:"Low", duration:newItem.duration||0,
          status:"active", notes:newItem.notes||"",
          isReminder:true,
          blockTime:!!newItem._blockTime,
          recurrence:{
            type:newItem._recurring||"daily",
            days:newItem._recurDays||[],
            startHour:newItem.startHour??9,
            startMin:newItem.startMin??0,
            endDate:newItem._endDate||null,
          },
          exceptions:{},
        }]);
      } else {
        // One-off reminder
        const reminder = {id:`reminder-${nextId++}`,title:newItem.title,dayOffset:newItem.dayOffset??0,startHour:newItem.startHour??9,startMin:newItem.startMin??0,blockTime:!!newItem._blockTime,notes:newItem.notes||""};
        setReminders(p=>[...p,reminder]);
        if(newItem._blockTime){
          setGcalEvents(p=>[...p,{id:`block-${nextId++}`,calType:"block",title:newItem.title,dayOffset:newItem.dayOffset??0,startHour:newItem.startHour??9,startMin:newItem.startMin??0,duration:newItem.duration||30,location:"",attendees:"",htmlLink:""}]);
        }
      }
    } else {
      // task
      const schedNow = newItem._scheduleNow && newItem.dayOffset!=null && newItem.startHour!=null;
      const {_scheduleNow,_isRecurring,_recurring,_recurDays,_endDate,_blockTime,...rest} = newItem;
      setTasks(p=>[...p,{id:nextId++,done:false,postponeCount:0,blockerSurfaced:false,
        scheduled:schedNow,
        dayOffset:schedNow?rest.dayOffset:null,
        startHour:schedNow?rest.startHour:null,
        startMin:schedNow?(rest.startMin??0):null,
        ...rest
      }]);
      if(_isRecurring&&_recurring&&_recurring!=="never"){
        setRecurringTasks(p=>[...p,{id:`rec-${nextId++}`,title:rest.title,pillar:rest.pillar||"film",sub:rest.sub||"",priority:rest.priority||"Medium",duration:rest.duration||60,status:"active",notes:rest.notes||"",recurrence:{type:_recurring,days:_recurDays||[],startHour:rest.startHour||9,startMin:rest.startMin||0,endDate:_endDate||null},exceptions:{}}]);
      }
    }
    setAddModal(false);
    setNewItem({});
  };

  const handleCalClick=(e,dayOffset)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const y=e.clientY-rect.top+e.currentTarget.parentElement.scrollTop;
    const hour=Math.floor(y/HOUR_H)+CAL_START;
    const min=Math.floor(((y%HOUR_H)/HOUR_H)*4)*15;
    if(hour>=CAL_START&&hour<CAL_END){
      setNewItem({title:"",dayOffset,startHour:hour,startMin:min,duration:60});
      setAddModal("block");
    }
  };

  const inp={fontSize:12,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",outline:"none",background:C.bgCard,color:C.text,fontFamily:"inherit",width:"100%"};
  const btn=(bg,color,border)=>({background:bg,color,border:`1px solid ${border||"transparent"}`,borderRadius:7,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer"});

  // ─── SCREENS ────────────────────────────────────────────────────────────────
  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",background:C.bg,color:C.text,overflow:"hidden"}}>

      {/* ── NAV BAR ── */}
      {/* TOP BAR */}
      <div style={{background:C.bgCard,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 20px",height:52,gap:0,flexShrink:0,zIndex:20}}>

        {/* Left: logo + nav */}
        <div style={{display:"flex",alignItems:"center",gap:0,flex:1}}>
          <button onClick={()=>setSidebarMode(m=>m==="expanded"?"collapsed":m==="collapsed"?"hidden":"expanded")}
            style={{background:"none",border:"none",cursor:"pointer",padding:"6px 8px 6px 0",color:C.textMuted,fontSize:15,lineHeight:1,marginRight:8}}
          >{sidebarMode==="hidden"?"▶":"☰"}</button>

          <div style={{display:"flex",alignItems:"center",gap:6,marginRight:24}}>
            <Logo size={22}/>
            <span style={{fontSize:13,fontWeight:800,letterSpacing:-0.5,color:C.text}}>Sync<span style={{color:C.cyan}}>'n</span></span>
          </div>

          {/* Nav tabs */}
          <div style={{display:"flex",gap:1}}>
            {[["today","Today"],["calendar","Calendar"],["lifemap","Life Map"],["compass","✦ Compass"]].map(([s,l])=>(
              <button key={s} onClick={()=>setScreen(s)} style={{
                padding:"6px 14px",background:"none",border:"none",cursor:"pointer",
                fontSize:12,fontWeight:screen===s?700:400,
                color:screen===s?(s==="compass"?C.cyan:C.text):C.textMuted,
                borderBottom:screen===s?`2px solid ${s==="compass"?C.cyan:C.cyan}`:"2px solid transparent",
                transition:"all 0.15s",marginBottom:-1,
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Right: primary actions only */}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* Sync status */}
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:C.textMuted,marginRight:4}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:calLoading?C.medium:calError?C.high:C.done}}/>
            <button onClick={syncCalendar} disabled={calLoading} style={{background:"none",border:"none",cursor:"pointer",color:C.textMuted,fontSize:10,padding:0}}>
              {calLoading?"Syncing…":"↻ Sync"}
            </button>
          </div>

          {/* Schedule */}
          {unscheduled.filter(t=>t.priority!=="Low").length>0&&(
            <button onClick={autoSchedule} disabled={scheduling} style={{
              background:scheduling?C.bgSurface:`${C.cyan}15`,color:scheduling?C.textMuted:C.cyan,
              border:`1px solid ${scheduling?C.border:C.cyanDim}`,borderRadius:8,
              padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer",
              display:"flex",alignItems:"center",gap:5,
            }}>
              {scheduling?"Scheduling…":"✨ Schedule"}
            </button>
          )}

          {/* Add */}
          <button onClick={()=>{setAddType("task");setNewItem({pillar:"film",sub:"",title:"",priority:"High",duration:60,status:"active",notes:"",deadline:"",_recurring:"never",_scheduleNow:false});setAddModal(true);}}
            style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:"#000",border:"none",borderRadius:8,padding:"6px 16px",fontSize:12,fontWeight:800,cursor:"pointer"}}>
            + Add
          </button>

          {/* Overflow menu */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setOverflowOpen(o=>!o)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:C.textMuted,fontSize:13,lineHeight:1}}>⋮</button>
            {overflowOpen&&(
              <div onClick={()=>setOverflowOpen(false)} style={{position:"fixed",inset:0,zIndex:40}} />
            )}
            {overflowOpen&&(
              <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,padding:"6px",minWidth:180,zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>
                {[
                  {label:"Plan Tomorrow", action:()=>{setEveningPlanModal(true);setOverflowOpen(false);}},
                  {label:"Re-sync Today", action:()=>{resyncToday();setOverflowOpen(false);}},
                  {label:"Archive ("+(archive.length)+")", action:()=>{setShowArchive(true);setOverflowOpen(false);}},
                  {label:"Add Recurring", action:()=>{setAddType("recurring");setNewItem({pillar:"film",sub:"",title:"",priority:"Medium",duration:60,status:"active",notes:"",_recurring:"weekly",_recurDays:[]});setAddModal(true);setOverflowOpen(false);}},
                  {label:`Ignored (${hiddenEvents.length})`, action:()=>{setShowIgnoredModal(true);setOverflowOpen(false);}},
                  {label:"Energy Rhythm", action:()=>{setEnergyModal(true);setOverflowOpen(false);}},
                ].map(item=>(
                  <button key={item.label} onClick={item.action} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 12px",background:"none",border:"none",cursor:"pointer",color:C.text,fontSize:12,borderRadius:6}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bgSurface}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}
                  >{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>


        {/* LEFT SIDEBAR — three modes: expanded(180px) | collapsed(40px) | hidden(0px) */}
        <div style={{
          width:sidebarMode==="expanded"?180:sidebarMode==="collapsed"?40:0,
          minWidth:sidebarMode==="expanded"?180:sidebarMode==="collapsed"?40:0,
          background:C.bgCard,
          borderRight:sidebarMode==="hidden"?"none":`1px solid ${C.border}`,
          overflowY:"auto",overflowX:"hidden",
          flexShrink:0,display:"flex",flexDirection:"column",
          transition:"width 0.2s ease, min-width 0.2s ease",
        }}>

          {/* EXPANDED MODE */}
          {sidebarMode==="expanded"&&(
            <div style={{padding:"10px 8px",flex:1,minWidth:180}}>
              {Object.entries(pillars).map(([pid,meta])=>{
                const isActive=selectedPillar===pid;
                const ct=tasks.filter(t=>t.pillar===pid&&!t.done&&t.status!=="parked").length;
                const subs=allSubs(pid);
                return(
                  <div key={pid}>
                    <button onClick={()=>{
                      setSelectedPillar(isActive?null:pid);
                      setSelectedSub(null);
                      if(!isActive) setScreen("lifemap");
                    }} style={{
                      width:"100%",textAlign:"left",padding:"5px 8px",border:"none",cursor:"pointer",
                      background:isActive?`${meta.color}14`:"transparent",
                      display:"flex",alignItems:"center",gap:6,borderRadius:6,
                      borderLeft:isActive?`2px solid ${meta.color}`:"2px solid transparent",marginBottom:1,
                    }}>
                      <span style={{fontSize:12}}>{meta.icon}</span>
                      <span style={{fontSize:10,fontWeight:isActive?700:400,color:isActive?meta.color:C.textMuted,flex:1,lineHeight:1.3}}>{meta.label}</span>
                      {ct>0&&<span style={{fontSize:8,background:C.bgSurface,borderRadius:8,padding:"1px 5px",color:C.textFaint,fontWeight:700}}>{ct}</span>}
                    </button>
                    {isActive&&subs.map(sub=>(
                      <button key={sub} onClick={()=>{setSelectedSub(selectedSub===sub?null:sub);setScreen("lifemap");}} style={{
                        width:"100%",textAlign:"left",padding:"3px 10px 3px 26px",border:"none",cursor:"pointer",
                        background:selectedSub===sub?`${meta.color}10`:"transparent",
                        fontSize:10,color:selectedSub===sub?meta.color:C.textFaint,fontWeight:selectedSub===sub?600:400,borderRadius:4,marginBottom:1,
                      }}>{sub}</button>
                    ))}
                    {isActive&&pid!=="parking"&&(
                      <button onClick={()=>{setNewProject({pillar:pid,name:""});setAddProjectModal(true);}} style={{
                        width:"100%",textAlign:"left",padding:"3px 10px 3px 26px",border:"none",cursor:"pointer",
                        background:"transparent",fontSize:9,color:C.textFaint,borderRadius:4,marginBottom:3,
                      }}>+ Add sub-pillar</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* COLLAPSED MODE — coloured dots with tooltips */}
          {sidebarMode==="collapsed"&&(
            <div style={{padding:"10px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:40}}>
              {Object.entries(pillars).map(([pid,meta])=>{
                const isActive=selectedPillar===pid;
                const ct=tasks.filter(t=>t.pillar===pid&&!t.done&&t.status!=="parked").length;
                return(
                  <div key={pid} style={{position:"relative",width:"100%",display:"flex",justifyContent:"center"}}
                    onMouseEnter={e=>{const tip=e.currentTarget.querySelector(".tip");if(tip)tip.style.opacity="1";}}
                    onMouseLeave={e=>{const tip=e.currentTarget.querySelector(".tip");if(tip)tip.style.opacity="0";}}>
                    <button onClick={()=>{
                      setSelectedPillar(isActive?null:pid);
                      setSelectedSub(null);
                      setSidebarMode("expanded");
                      if(!isActive) setScreen("lifemap");
                    }} style={{
                      width:28,height:28,borderRadius:"50%",border:"none",cursor:"pointer",
                      background:isActive?meta.color:`${meta.color}40`,
                      boxShadow:isActive?`0 0 8px ${meta.color}60`:"none",
                      transition:"all 0.15s",position:"relative",flexShrink:0,
                    }}>
                      {ct>0&&<span style={{position:"absolute",top:-3,right:-3,width:12,height:12,borderRadius:"50%",background:C.high,fontSize:7,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{ct>9?"9+":ct}</span>}
                    </button>
                    {/* Tooltip */}
                    <div className="tip" style={{
                      position:"absolute",left:"100%",top:"50%",transform:"translateY(-50%)",
                      marginLeft:8,background:C.bgCard,border:`1px solid ${C.border}`,
                      borderRadius:6,padding:"4px 8px",fontSize:10,fontWeight:600,color:meta.color,
                      whiteSpace:"nowrap",pointerEvents:"none",opacity:0,transition:"opacity 0.15s",
                      zIndex:50,boxShadow:"0 4px 12px rgba(0,0,0,0.3)",
                    }}>{meta.icon} {meta.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BOTTOM: Energy profile (expanded only) */}
          {sidebarMode==="expanded"&&(
            <button onClick={()=>setEnergyModal(true)} style={{
              margin:"8px",background:C.bgSurface,border:`1px solid ${C.border}`,borderRadius:7,
              padding:"7px 10px",fontSize:10,color:C.textMuted,cursor:"pointer",textAlign:"left",flexShrink:0,
            }}>
              ⚡ Energy Rhythm
              <div style={{fontSize:8,color:C.textFaint,marginTop:2}}>Set your peak periods</div>
            </button>
          )}
          {sidebarMode==="collapsed"&&(
            <button onClick={()=>setEnergyModal(true)} title="Energy Rhythm" style={{
              margin:"4px auto",background:"none",border:"none",cursor:"pointer",
              fontSize:16,lineHeight:1,display:"block",opacity:0.5,
            }}>⚡</button>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>

          {/* ══ TODAY ══════════════════════════════════════════════════════════ */}
          {screen==="today"&&(
            <div style={{flex:1,overflowY:"auto"}} onClick={()=>overflowOpen&&setOverflowOpen(false)}>
              <div style={{maxWidth:720,margin:"0 auto",padding:"28px 24px"}}>

                {/* Greeting + stats */}
                <div style={{marginBottom:28}}>
                  <div style={{fontSize:12,color:C.textMuted,marginBottom:6,letterSpacing:0.3}}>
                    {new Date().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}
                  </div>
                  <h1 style={{margin:"0 0 10px",fontSize:26,fontWeight:800,letterSpacing:-0.8,color:C.text,lineHeight:1.1}}>
                    Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, Brendan.
                  </h1>
                  <div style={{display:"flex",alignItems:"center",gap:16,fontSize:12,color:C.textMuted}}>
                    {unscheduled.filter(t=>t.priority==="High").length>0&&(
                      <span><strong style={{color:C.high}}>{unscheduled.filter(t=>t.priority==="High").length}</strong> urgent</span>
                    )}
                    <span><strong style={{color:C.text}}>{todayAll.length}</strong> scheduled today</span>
                    {gcalEvents.filter(e=>e.dayOffset===0).length>0&&(
                      <span><strong style={{color:C.cyan}}>{gcalEvents.filter(e=>e.dayOffset===0).length}</strong> calendar events</span>
                    )}
                  </div>
                </div>

                {/* Day / Week toggle */}
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
                  <div style={{display:"flex",background:C.bgSurface,borderRadius:8,padding:2,gap:1}}>
                    {[["day","Day"],["week","Week"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setTodayView(v)} style={{
                        padding:"5px 16px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                        background:todayView===v?C.bgCard:"transparent",
                        color:todayView===v?C.text:C.textMuted,
                        transition:"all 0.12s",
                      }}>{l}</button>
                    ))}
                  </div>
                  {(()=>{
                    const hr = new Date().getHours();
                    const isEvening = hr >= 20;
                    const hasUnscheduled = unscheduled.filter(t=>t.priority!=="Low").length>0;
                    return(<>
                      {hasUnscheduled&&!isEvening&&(
                        <button onClick={autoSchedule} disabled={scheduling} style={{fontSize:11,background:`${C.cyan}15`,color:C.cyan,border:`1px solid ${C.cyanDim}`,borderRadius:8,padding:"5px 14px",cursor:"pointer",fontWeight:700}}>
                          {scheduling?"Scheduling…":"✨ Schedule Remaining"}
                        </button>
                      )}
                      {(isEvening||!hasUnscheduled)&&(
                        <button onClick={()=>setEveningPlanModal(true)} style={{fontSize:11,background:`${C.cyan}15`,color:C.cyan,border:`1px solid ${C.cyanDim}`,borderRadius:8,padding:"5px 14px",cursor:"pointer",fontWeight:700}}>
                          📅 Plan Tomorrow
                        </button>
                      )}
                    </>);
                  })()}
                </div>

                {/* ── DAY VIEW ── */}
                {todayView==="day"&&(()=>{
                  const periods=[
                    {id:"morning",label:"Morning",icon:"🌅",from:0,to:12},
                    {id:"afternoon",label:"Afternoon",icon:"☀️",from:12,to:17},
                    {id:"evening",label:"Evening",icon:"🌙",from:17,to:24},
                  ];
                  const now=new Date();

                  // Today's reminders — one-off + recurring instances
                  const todayOneOffReminders = reminders.filter(r=>r.dayOffset===0);
                  const todayRecurringReminders = recurringInstances.filter(r=>r.dayOffset===0&&r.isReminder);
                  const allTodayReminders = [
                    ...todayOneOffReminders.map(r=>({...r,_isRecurring:false})),
                    ...todayRecurringReminders.map(r=>({...r,_isRecurring:true})),
                  ].sort((a,b)=>(a.startHour*60+a.startMin)-(b.startHour*60+b.startMin));

                  return(
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>

                      {/* REMINDER STRIP — pinned above accordions */}
                      {allTodayReminders.length>0&&(
                        <div style={{marginBottom:12,background:`${C.medium}0a`,border:`1px solid ${C.medium}25`,borderRadius:10,overflow:"hidden"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:allTodayReminders.length>0?`1px solid ${C.medium}20`:"none"}}>
                            <span style={{fontSize:13}}>🔔</span>
                            <span style={{fontSize:11,fontWeight:700,color:C.medium,letterSpacing:0.3}}>TODAY'S REMINDERS</span>
                            <span style={{fontSize:10,color:C.textFaint,marginLeft:"auto"}}>{allTodayReminders.length} reminder{allTodayReminders.length!==1?"s":""}</span>
                          </div>
                          {allTodayReminders.map((r,idx)=>(
                            <div key={r.id} style={{
                              display:"flex",alignItems:"center",gap:12,
                              padding:"10px 14px",
                              borderBottom:idx<allTodayReminders.length-1?`1px solid ${C.medium}18`:"none",
                            }}>
                              <span style={{fontSize:11,color:C.textFaint,width:50,flexShrink:0,textAlign:"right",fontWeight:600}}>{fmtT(r.startHour,r.startMin)}</span>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{r.title}</div>
                                {r.notes&&<div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{r.notes}</div>}
                                {r._isRecurring&&<div style={{fontSize:9,color:C.medium,marginTop:2}}>🔁 Recurring</div>}
                              </div>
                              {!r._isRecurring&&(
                                <button onClick={()=>setReminders(p=>p.filter(x=>x.id!==r.id))}
                                  style={{background:"none",border:`1px solid ${C.medium}40`,borderRadius:5,cursor:"pointer",color:C.medium,fontSize:10,padding:"2px 8px",flexShrink:0}}>
                                  Dismiss
                                </button>
                              )}
                              {r._isRecurring&&(
                                <button onClick={()=>{
                                  // Skip this occurrence
                                  const rt=recurringTasks.find(x=>x.id===r.recurringId);
                                  if(rt) skipRecurringInstance(r);
                                }}
                                  style={{background:"none",border:`1px solid ${C.medium}40`,borderRadius:5,cursor:"pointer",color:C.medium,fontSize:10,padding:"2px 8px",flexShrink:0}}>
                                  Done
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {periods.map(period=>{
                        const items=todayAll.filter(i=>i.startHour>=period.from&&i.startHour<period.to);
                        const isOpen=openAccordion===period.id;
                        const isPast=now.getHours()>=period.to;
                        const isCurrent=now.getHours()>=period.from&&now.getHours()<period.to;

                        return(
                          <div key={period.id} style={{borderRadius:12,overflow:"hidden",marginBottom:4}}>
                            {/* Accordion header */}
                            <button onClick={()=>setOpenAccordion(isOpen?null:period.id)} style={{
                              width:"100%",display:"flex",alignItems:"center",gap:10,
                              padding:"14px 18px",background:isOpen?C.bgCard:C.bgSurface,
                              border:"none",cursor:"pointer",textAlign:"left",
                              borderBottom:isOpen?`1px solid ${C.border}`:"none",
                              transition:"background 0.15s",
                            }}>
                              <span style={{fontSize:16,opacity:isPast?0.4:1}}>{period.icon}</span>
                              <span style={{fontSize:13,fontWeight:700,color:isPast?C.textMuted:C.text,flex:1}}>{period.label}</span>
                              {isCurrent&&<span style={{fontSize:9,background:`${C.cyan}20`,color:C.cyan,padding:"2px 8px",borderRadius:10,fontWeight:700,letterSpacing:0.5}}>NOW</span>}
                              <span style={{fontSize:11,color:C.textMuted,marginRight:6}}>{items.length>0?`${items.length} item${items.length>1?"s":""}`:"Clear"}</span>
                              <span style={{fontSize:10,color:C.textFaint,transition:"transform 0.2s",display:"inline-block",transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
                            </button>

                            {/* Accordion body */}
                            {isOpen&&(
                              <div style={{background:C.bgCard,padding:"8px 0 4px"}}>
                                {items.length===0?(
                                  <div style={{padding:"16px 18px",fontSize:12,color:C.textFaint,fontStyle:"italic"}}>Nothing scheduled — enjoy the breathing room.</div>
                                ):items.map((item,idx)=>{
                                  const isTask=item._type==="task"||item._type==="recurring";
                                  const isReminder=item._type==="reminder";
                                  const color=item._color||C.cyan;
                                  const isItemPast=now.getHours()>item.startHour||(now.getHours()===item.startHour&&now.getMinutes()>item.startMin);
                                  return(
                                    <div key={item.id}
                                      onClick={()=>setSelected({type:isTask?"task":"event",item})}
                                      style={{
                                        display:"flex",alignItems:"center",gap:14,
                                        padding:"12px 18px",cursor:"pointer",
                                        borderBottom:idx<items.length-1?`1px solid ${C.borderLight}`:"none",
                                        opacity:item.done?0.4:1,
                                        transition:"background 0.1s",
                                      }}
                                      onMouseEnter={e=>e.currentTarget.style.background=C.bgSurface}
                                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                    >
                                      {/* Time */}
                                      <div style={{width:52,flexShrink:0,textAlign:"right"}}>
                                        <div style={{fontSize:11,fontWeight:600,color:isItemPast?C.textFaint:C.textMuted}}>{fmtT(item.startHour,item.startMin)}</div>
                                        {item.duration>0&&<div style={{fontSize:9,color:C.textFaint,marginTop:1}}>{fmtD(item.duration)}</div>}
                                      </div>

                                      {/* Left border accent */}
                                      <div style={{width:3,height:36,borderRadius:2,background:isReminder?C.medium:color,flexShrink:0,opacity:item.done?0.3:1}}/>

                                      {/* Content */}
                                      <div style={{flex:1,minWidth:0}}>
                                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                                          {isReminder&&<span style={{fontSize:12}}>🔔</span>}
                                          <div style={{fontSize:13,fontWeight:item.done?400:600,color:item.done?C.textFaint:C.text,textDecoration:item.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                                        </div>
                                        <div style={{fontSize:10,color:C.textFaint,marginTop:2}}>
                                          {isTask&&item.pillar?pillars[item.pillar]?.label:""}
                                          {item.attendees?` · ${item.attendees}`:""}
                                          {isReminder?" · Reminder":""}
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      {isTask&&(
                                        <div style={{display:"flex",gap:6,flexShrink:0}}>
                                          <div onClick={e=>{e.stopPropagation();toggleDone(item.id);}} style={{
                                            width:20,height:20,borderRadius:5,cursor:"pointer",display:"grid",placeItems:"center",flexShrink:0,
                                            border:`1.5px solid ${item.done?C.done:C.textMuted}`,
                                            background:item.done?C.done:"transparent",
                                            transition:"all 0.15s",
                                          }}>
                                            {item.done&&<span style={{color:C.bg,fontSize:11,fontWeight:900}}>✓</span>}
                                          </div>
                                        </div>
                                      )}
                                      {isReminder&&(
                                        <button onClick={e=>{e.stopPropagation();setReminders(p=>p.filter(r=>r.id!==item.id));}} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:12,padding:"0 4px"}}>✕</button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Unscheduled urgent — shown only in day view */}
                      {unscheduled.filter(t=>t.priority==="High").length>0&&(
                        <div style={{marginTop:20,padding:"16px 18px",background:C.bgCard,borderRadius:12,borderLeft:`3px solid ${C.high}`}}>
                          <div style={{fontSize:11,fontWeight:700,color:C.high,marginBottom:12,textTransform:"uppercase",letterSpacing:0.5}}>Unscheduled — needs a time slot</div>
                          {unscheduled.filter(t=>t.priority==="High").map(task=>(
                            <div key={task.id} onClick={()=>setSelected({type:"task",item:task})}
                              style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${C.borderLight}`,cursor:"pointer"}}
                              onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
                              onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                            >
                              <div style={{width:5,height:5,borderRadius:"50%",background:pillars[task.pillar]?.color||C.cyan,flexShrink:0}}/>
                              <div style={{flex:1,fontSize:12,fontWeight:600,color:C.text}}>{task.title}</div>
                              <div style={{fontSize:10,color:C.textMuted}}>{fmtD(task.duration)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── WEEK VIEW ── */}
                {todayView==="week"&&(()=>{
                  const today=new Date(); today.setHours(0,0,0,0);
                  const days=Array.from({length:7},(_,i)=>{
                    const d=new Date(today); d.setDate(today.getDate()+i);
                    return {offset:i,date:d,label:i===0?"Today":i===1?"Tomorrow":d.toLocaleDateString("en-AU",{weekday:"short",day:"numeric"})};
                  });
                  return(
                    <div style={{display:"flex",flexDirection:"column",gap:3}}>
                      {days.map(day=>{
                        const dayItems=[
                          ...scheduledTasks.filter(t=>t.dayOffset===day.offset).map(t=>({...t,_color:pillars[t.pillar]?.color||C.cyan,_type:"task"})),
                          ...visibleGcalEvents.filter(e=>e.dayOffset===day.offset).map(e=>({...e,_color:e.calType==="family"?PILLARS.family.color:C.cyan,_type:"event"})),
                          ...recurringInstances.filter(r=>r.dayOffset===day.offset).map(r=>({...r,_color:pillars[r.pillar]?.color||C.cyan,_type:"recurring"})),
                          ...reminders.filter(r=>r.dayOffset===day.offset).map(r=>({...r,_color:C.medium,_type:"reminder"})),
                        ].sort((a,b)=>(a.startHour*60+a.startMin)-(b.startHour*60+b.startMin));
                        const isToday=day.offset===0;
                        return(
                          <div key={day.offset} style={{background:isToday?C.bgCard:C.bgSurface,borderRadius:10,overflow:"hidden",border:isToday?`1px solid ${C.border}`:"none"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:dayItems.length>0?`1px solid ${C.borderLight}`:"none"}}>
                              <div style={{width:28,height:28,borderRadius:"50%",background:isToday?C.cyan:"transparent",display:"grid",placeItems:"center",flexShrink:0}}>
                                <span style={{fontSize:12,fontWeight:800,color:isToday?"#000":C.textMuted}}>{day.date.getDate()}</span>
                              </div>
                              <span style={{fontSize:12,fontWeight:isToday?700:500,color:isToday?C.text:C.textMuted,flex:1}}>{day.label}</span>
                              <span style={{fontSize:10,color:C.textFaint}}>{dayItems.length>0?`${dayItems.length} items`:""}</span>
                            </div>
                            {dayItems.map((item,idx)=>(
                              <div key={item.id} onClick={()=>setSelected({type:item._type==="task"||item._type==="recurring"?"task":"event",item})}
                                style={{display:"flex",alignItems:"center",gap:10,padding:"8px 16px",borderBottom:idx<dayItems.length-1?`1px solid ${C.borderLight}`:"none",cursor:"pointer"}}
                                onMouseEnter={e=>e.currentTarget.style.background=C.bgHover}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                              >
                                <span style={{fontSize:10,color:C.textFaint,width:44,flexShrink:0,textAlign:"right"}}>{fmtT(item.startHour,item.startMin)}</span>
                                <div style={{width:3,height:24,borderRadius:2,background:item._color,flexShrink:0}}/>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:11,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                                </div>
                                <span style={{fontSize:9,color:C.textFaint}}>{fmtD(item.duration)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Life balance strip — neutral language */}
                <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.textMuted,marginBottom:14,textTransform:"uppercase",letterSpacing:0.5}}>Life Balance This Week</div>
                  <div style={{height:4,borderRadius:2,overflow:"hidden",display:"flex",marginBottom:12}}>
                    {Object.entries(pillars).filter(([pid])=>pid!=="parking").map(([pid,meta])=>{
                      const pct=pillarPct(pid);
                      return pct>0?<div key={pid} style={{flex:pct,background:meta.color,transition:"flex 0.6s"}} title={`${meta.label}: ${pct}%`}/>:null;
                    })}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                    {Object.entries(pillars).filter(([pid])=>pid!=="parking").map(([pid,meta])=>{
                      const pct=pillarPct(pid);
                      const isQuiet=pct<5&&tasks.filter(t=>t.pillar===pid&&!t.done).length>0;
                      return(
                        <div key={pid} style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:meta.color}}/>
                          <span style={{fontSize:10,color:isQuiet?C.textMuted:C.textFaint}}>{meta.label} {pct}%{isQuiet?" ·":""}</span>
                          {isQuiet&&<span style={{fontSize:10,color:C.textMuted,fontStyle:"italic"}}>quiet this week</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {screen==="lifemap"&&(
            <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
              <div style={{maxWidth:900,margin:"0 auto"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                  <h2 style={{margin:0,fontSize:20,fontWeight:800,letterSpacing:-0.5}}>Life Map</h2>
                  <span style={{fontSize:12,color:C.textMuted}}>Your pillars at a glance</span>
                  <div style={{marginLeft:"auto",display:"flex",gap:4,background:C.bgSurface,borderRadius:8,padding:2}}>
                    {[["all","All"],["active","🔥 Active"],["upcoming","🟡 Upcoming"],["parked","❄️ Parked"],["done","✓ Done"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setFilterStatus(v)} style={{
                        padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:filterStatus===v?700:400,
                        background:filterStatus===v?C.bgCard:"transparent",
                        color:filterStatus===v?C.text:C.textMuted,transition:"all 0.12s",whiteSpace:"nowrap",
                      }}>{l}</button>
                    ))}
                  </div>
                </div>

                {/* Pillar grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
                  {Object.entries(pillars).map(([pid,meta])=>(
                    <div key={pid} style={{position:"relative"}}>
                      <PillarRing pid={pid} pillar={meta} tasks={tasks} onSelect={setSelectedPillar} selected={selectedPillar}/>
                      <button
                        onClick={e=>{e.stopPropagation();setPillarEditModal({id:pid,pillar:{...meta}});}}
                        title="Edit pillar"
                        style={{position:"absolute",top:8,right:8,background:`${meta.color}22`,border:`1px solid ${meta.color}44`,borderRadius:5,width:22,height:22,cursor:"pointer",fontSize:10,color:meta.color,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}
                      >✏</button>
                    </div>
                  ))}
                  {/* Add new pillar */}
                  <button onClick={()=>{setNewPillarData({label:"",icon:"⭐",color:"#6b7fa3"});setAddPillarModal(true);}}
                    style={{background:C.bgSurface,border:`2px dashed ${C.border}`,borderRadius:14,padding:"16px",cursor:"pointer",color:C.textMuted,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"border-color 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.cyan}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
                  >+ New Pillar</button>
                </div>

                {/* Drill-down */}
                {selectedPillar&&(()=>{
                  const meta=pillars[selectedPillar];
                  const subs=allSubs(selectedPillar);
                  return(
                    <div style={{background:C.bgCard,border:`1px solid ${meta.color}40`,borderRadius:14,padding:"20px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                        <span style={{fontSize:18}}>{meta.icon}</span>
                        <h3 style={{margin:0,fontSize:16,fontWeight:800,color:meta.color}}>{meta.label}</h3>
                        <button onClick={()=>{setNewProject({pillar:selectedPillar,name:""});setAddProjectModal(true);}} style={{marginLeft:"auto",...btn(`${meta.color}18`,meta.color,`${meta.color}60`),fontSize:10}}>+ Sub-pillar</button>
                      </div>
                      {/* Sub-pillar breakdown */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,marginBottom:16}}>
                        {subs.map(sub=>{
                          const st=tasks.filter(t=>t.pillar===selectedPillar&&t.sub===sub);
                          const done=st.filter(t=>t.done).length;
                          const pct=st.length>0?Math.round(done/st.length*100):0;
                          return(
                            <div key={sub} style={{position:"relative"}}>
                              <div onClick={()=>setSelectedSub(selectedSub===sub?null:sub)}
                                style={{background:selectedSub===sub?`${meta.color}14`:C.bgSurface,border:`1px solid ${selectedSub===sub?meta.color:C.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer",paddingRight:28}}>
                                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:5}}>{sub}</div>
                                <div style={{height:3,background:C.border,borderRadius:2,marginBottom:5,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${pct}%`,background:meta.color,borderRadius:2}}/>
                                </div>
                                <div style={{fontSize:10,color:C.textMuted}}>{st.length} tasks · {pct}% done</div>
                              </div>
                              <button
                                onClick={e=>{e.stopPropagation();setSubEditModal({pillarId:selectedPillar,subName:sub});}}
                                title="Edit sub-pillar"
                                style={{position:"absolute",top:6,right:6,background:`${meta.color}22`,border:`1px solid ${meta.color}44`,borderRadius:4,width:18,height:18,cursor:"pointer",fontSize:9,color:meta.color,display:"flex",alignItems:"center",justifyContent:"center"}}
                              >✏</button>
                            </div>
                          );
                        })}
                        {/* Add sub-pillar inline */}
                        <button onClick={()=>{setNewProject({pillar:selectedPillar,name:""});setAddProjectModal(true);}}
                          style={{background:"transparent",border:`2px dashed ${C.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer",color:C.textMuted,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=meta.color}
                          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
                        >+ Sub-pillar</button>
                      </div>
                      {/* Tasks in this pillar */}
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>
                        {tasks.filter(t=>t.pillar===selectedPillar&&(!selectedSub||t.sub===selectedSub)&&(search?t.title.toLowerCase().includes(search.toLowerCase()):true)).map(task=>(
                          <div key={task.id} onClick={()=>setSelected({type:"task",item:task})}
                            style={{background:task.done?`${C.bgCard}80`:C.bgSurface,border:`1px solid ${C.border}`,borderLeft:`2px solid ${task.done?"#1a2540":meta.color}`,borderRadius:7,padding:"7px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,opacity:task.done?0.45:1}}
                            onMouseEnter={e=>e.currentTarget.style.background=C.bgHover}
                            onMouseLeave={e=>e.currentTarget.style.background=task.done?`${C.bgCard}80`:C.bgSurface}>
                            <div onClick={ev=>{ev.stopPropagation();toggleDone(task.id);}} style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${task.done?C.done:C.textFaint}`,background:task.done?C.done:"transparent",flexShrink:0,cursor:"pointer",display:"grid",placeItems:"center"}}>
                              {task.done&&<span style={{color:C.bg,fontSize:8,fontWeight:900}}>✓</span>}
                            </div>
                            <div style={{flex:1}}>
                              <div style={{fontSize:11,fontWeight:500,color:task.done?C.textFaint:C.text,textDecoration:task.done?"line-through":"none"}}>{task.title}</div>
                              <div style={{fontSize:9,color:C.textFaint,marginTop:1}}>{task.sub} · {fmtD(task.duration)}</div>
                            </div>
                            <div style={{display:"flex",gap:4,alignItems:"center"}}>
                              {task.postponeCount>0&&<span style={{fontSize:8,color:C.high}}>↩{task.postponeCount}</span>}
                              {task.scheduled&&<span style={{fontSize:8,background:`${C.done}18`,color:C.done,padding:"1px 5px",borderRadius:4,fontWeight:700}}>Day+{task.dayOffset}</span>}
                              <span style={{width:5,height:5,borderRadius:"50%",background:pColor[task.priority]}}/>
                              <span style={{fontSize:9,color:C.textFaint}}>{fmtD(task.duration)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ══ CALENDAR ═════════════════════════════════════════════════════ */}
          {screen==="calendar"&&(
            <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              {/* Week nav */}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:C.bgCard,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
                <button onClick={()=>setWeekOffset(w=>w-1)} style={{...btn("none",C.textMuted,C.border),padding:"3px 10px"}}>‹</button>
                <button onClick={()=>setWeekOffset(0)} style={{...btn("none",C.cyan,C.cyanDim),padding:"3px 10px",fontSize:11}}>Today</button>
                <button onClick={()=>setWeekOffset(w=>w+1)} style={{...btn("none",C.textMuted,C.border),padding:"3px 10px"}}>›</button>
                <span style={{fontSize:11,color:C.textMuted}}>
                  {dayDates[0].toLocaleDateString("en-AU",{day:"numeric",month:"short"})} — {dayDates[6].toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}
                </span>
                <span style={{fontSize:10,color:C.textFaint,marginLeft:4}}>Click any slot to block time</span>
                <div style={{marginLeft:"auto",display:"flex",gap:7}}>
                  {hiddenEvents.length>0&&(
                    <button onClick={()=>setShowIgnoredModal(true)} style={{...btn(`${C.medium}14`,C.medium,C.medium),fontSize:10}}>
                      👁 Ignored ({hiddenEvents.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Day headers */}
              <div style={{display:"grid",gridTemplateColumns:"52px repeat(7,1fr)",background:C.bgCard,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
                <div/>
                {dayDates.map((date,i)=>{
                  const isToday=todayCol===i;
                  const isWeekend=i>=5;
                  return(
                    <div key={i} style={{textAlign:"center",padding:"6px 2px",borderLeft:`1px solid ${C.borderLight}`,background:isWeekend?`${C.bgSurface}66`:"transparent"}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:isToday?C.cyan:isWeekend?C.textFaint:C.textMuted}}>{DAY_NAMES[i]}</div>
                      <div style={{fontSize:14,fontWeight:700,width:26,height:26,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",marginTop:2,color:isToday?"#000":C.text,background:isToday?C.cyan:"transparent",boxShadow:isToday?`0 0 12px ${C.cyanGlow}`:"none"}}>{date.getDate()}</div>
                      {(()=>{
                        const today2=new Date(); today2.setHours(0,0,0,0);
                        const colOff=Math.round((date-today2)/(864e5));
                        const dayRems=reminders.filter(r=>r.dayOffset===colOff&&!r.blockTime);
                        if(dayRems.length===0) return null;
                        return(
                          <div
                            onClick={e=>{e.stopPropagation();setReminderPopup(reminderPopup?.dayOffset===colOff?null:{dayOffset:colOff,rems:dayRems});}}
                            style={{fontSize:8,color:C.medium,marginTop:2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:2,background:`${C.medium}18`,borderRadius:8,padding:"1px 5px",transition:"background 0.12s"}}
                            title={dayRems.map(r=>r.title).join(", ")}
                          >
                            🔔 {dayRems.length}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>

              {/* Reminder popup panel — shows when bell badge is clicked */}
              {reminderPopup&&(
                <div style={{background:`${C.medium}0d`,borderBottom:`1px solid ${C.medium}30`,padding:"10px 16px",flexShrink:0}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.medium}}>
                      🔔 Reminders — {reminderPopup.rems[0]&&(()=>{
                        const today2=new Date(); today2.setHours(0,0,0,0);
                        const d=new Date(today2); d.setDate(today2.getDate()+reminderPopup.dayOffset);
                        return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"short"});
                      })()}
                    </div>
                    <button onClick={()=>setReminderPopup(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:16,lineHeight:1}}>×</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {reminderPopup.rems.map(r=>(
                      <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,background:C.bgCard,borderRadius:8,padding:"8px 12px",border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.medium}`}}>
                        <span style={{fontSize:14,flexShrink:0}}>🔔</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:700,color:C.text}}>{r.title}</div>
                          <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>
                            {fmtT(r.startHour,r.startMin)}
                            {r.notes&&` · ${r.notes}`}
                            <span style={{marginLeft:6,color:C.textFaint}}>(no time blocked)</span>
                          </div>
                        </div>
                        <button onClick={()=>{setReminders(p=>p.filter(x=>x.id!==r.id));setReminderPopup(prev=>({...prev,rems:prev.rems.filter(x=>x.id!==r.id)}));}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:5,color:C.textFaint,fontSize:10,cursor:"pointer",padding:"2px 7px",flexShrink:0}}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid */}
              <div ref={calScrollRef} style={{flex:1,overflowY:"auto"}}>
                <div style={{display:"grid",gridTemplateColumns:"52px repeat(7,1fr)",height:HOURS.length*HOUR_H}}>
                  <div style={{position:"relative",overflow:"hidden"}}>
                    {HOURS.map(h=>(
                      <div key={h} style={{position:"absolute",top:px(h)-7,left:0,right:3,textAlign:"right"}}>
                        <span style={{fontSize:9,color:C.textMuted,fontWeight:600,whiteSpace:"nowrap",letterSpacing:-0.3}}>{fmtT(h,0)}</span>
                      </div>
                    ))}
                  </div>
                  {dayDates.map((date,colIdx)=>{
                    const isToday=todayCol===colIdx;
                    const isWeekend=colIdx>=5;
                    const today=new Date(); today.setHours(0,0,0,0);
                    const dayOff=Math.round((date-today)/(864e5));
                    const colTasks=scheduledTasks.filter(t=>t.dayOffset===dayOff);
                    const colRecurring=recurringInstances.filter(r=>r.dayOffset===dayOff);
                    const colEvents=visibleGcalEvents.filter(e=>e.dayOffset===dayOff);
                    const allItems=[...colTasks.map(t=>({...t,_isTask:true})),...colEvents.map(e=>({...e,_isTask:false})),...colRecurring.map(r=>({...r,_isTask:true,_isRecurring:true}))];
                    const withOverlap=computeOverlaps(allItems);

                    // Energy tint background
                    const energyBg=isToday?`${C.cyan}04`:"transparent";

                    return(
                      <div key={colIdx} style={{position:"relative",borderLeft:`1px solid ${C.borderLight}`,background:isWeekend?`${C.bgSurface}44`:energyBg,height:HOURS.length*HOUR_H,cursor:"crosshair"}}
                        onClick={e=>{ if(e.target===e.currentTarget) handleCalClick(e,dayOff); }}>
                        {/* Energy overlay strips */}
                        {HOURS.map(h=>{
                          const energy=energyProfile[h]||5;
                          const alpha=((energy-1)/9)*0.06;
                          return(
                            <div key={h} style={{position:"absolute",top:px(h),left:0,right:0,height:HOUR_H,background:`rgba(0,180,216,${alpha})`,pointerEvents:"none",zIndex:0}}/>
                          );
                        })}
                        {HOURS.map(h=><div key={h} style={{position:"absolute",top:px(h),left:0,right:0,borderTop:`1px solid ${C.borderLight}`,pointerEvents:"none",zIndex:1}}/>)}
                        {HOURS.map(h=><div key={h+"h"} style={{position:"absolute",top:px(h,30),left:0,right:0,borderTop:`1px dashed ${C.bg}`,pointerEvents:"none",zIndex:1}}/>)}
                        {withOverlap.map(item=>{
                          const color=item._isTask
                            ?(pillars[item.pillar]?.color||C.cyan)
                            :item.calType==="family"?PILLARS.family.color
                            :item.calType==="block"?"#556":C.cyan;
                        const blockType=item.calType==="family"||item.calType==="work"?"locked"
                            :item._isRecurring?"recurring"
                            :item.calType==="block"?"block"
                            :item._isTask?"scheduled"
                            :"locked";
                          return(
                            <CalBlock key={item.id} item={item} color={color} col={item.col} cols={item.cols} isTask={item._isTask} blockType={blockType}
                              onClick={()=>{
                                if(item._isRecurring){
                                  const rt=recurringTasks.find(r=>r.id===item.recurringId);
                                  setRecurringEditModal({instance:item,rt});
                                } else {
                                  setSelected({type:item._isTask?"task":"event",item});
                                }
                              }}/>
                          );
                        })}
                        {isToday&&(()=>{
                          const now=new Date(); const top=px(now.getHours(),now.getMinutes());
                          return top>0&&top<HOURS.length*HOUR_H?(
                            <div style={{position:"absolute",top,left:0,right:0,zIndex:10,display:"flex",alignItems:"center",pointerEvents:"none"}}>
                              <div style={{width:9,height:9,borderRadius:"50%",background:C.cyan,marginLeft:-4,boxShadow:`0 0 10px ${C.cyan}`,animation:"nowPulse 2s ease-in-out infinite"}}/>
                              <div style={{flex:1,height:2,background:C.cyan,opacity:0.8}}/>
                            </div>
                          ):null;
                        })()}
                        <div style={{position:"absolute",inset:0,zIndex:0}} onClick={e=>handleCalClick(e,dayOff)}/>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ COMPASS ══════════════════════════════════════════════════════ */}
          {screen==="compass"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              {/* Compass header */}
              <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:C.bgCard,flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:`${C.cyan}18`,border:`1px solid ${C.cyanDim}`,display:"grid",placeItems:"center",boxShadow:`0 0 12px ${C.cyanGlow}`}}>
                    <span style={{fontSize:14}}>✦</span>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:C.cyan}}>Compass</div>
                    <div style={{fontSize:10,color:C.textMuted}}>Purpose coach · Life alignment · Accountability</div>
                  </div>
                  <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                    {!briefingDone&&<button onClick={startMorningBriefing} style={{...btn(`${C.cyan}18`,C.cyan,C.cyanDim),fontSize:10}}>Morning Briefing</button>}
                    <button onClick={()=>sendToCompass("Weekly reset — give me a summary of this week: wins, misses, time distribution, and what I should focus on next week.")} style={{...btn(C.bgSurface,C.textMuted,C.border),fontSize:10}}>Weekly Reset</button>
                    <button onClick={()=>sendToCompass("Check in — look at my schedule, my pillars, what's been postponed, and tell me honestly if I'm on track.")} style={{...btn(C.bgSurface,C.textMuted,C.border),fontSize:10}}>Check In</button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
                {compassMsgs.length===0&&(
                  <div style={{textAlign:"center",padding:"40px 20px"}}>
                    <div style={{fontSize:32,marginBottom:12,filter:`drop-shadow(0 0 12px ${C.cyan})`}}>✦</div>
                    <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:6}}>Compass</div>
                    <div style={{fontSize:12,color:C.textMuted,marginBottom:20,lineHeight:1.6,maxWidth:420,margin:"0 auto 20px"}}>Your AI life alignment coach. Knows your pillars, your schedule, your patterns. Doesn't sugarcoat.</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:480,margin:"0 auto"}}>
                      {[
                        "What should I focus on today and why?",
                        "Am I spending time on what actually matters?",
                        "What have I been avoiding and why?",
                        "Which pillar am I neglecting most?",
                        "Give me an honest assessment of this week.",
                        "What should I cut or park right now?",
                      ].map(q=>(
                        <button key={q} onClick={()=>sendToCompass(q)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:11,cursor:"pointer",color:C.textMuted,textAlign:"left",lineHeight:1.4,transition:"border-color 0.12s"}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=C.cyanDim}
                          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {compassMsgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:8}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8,width:"100%",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                      {m.role==="assistant"&&<div style={{width:24,height:24,borderRadius:"50%",background:`${C.cyan}18`,border:`1px solid ${C.cyanDim}`,display:"grid",placeItems:"center",flexShrink:0,marginTop:2}}>
                        <span style={{fontSize:10}}>✦</span>
                      </div>}
                      <div style={{
                        maxWidth:"75%",padding:"10px 14px",
                        borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",
                        background:m.role==="user"?`${C.cyan}18`:C.bgCard,
                        border:`1px solid ${m.role==="user"?C.cyanDim:C.border}`,
                        color:m.role==="user"?C.cyanBright:C.text,
                        fontSize:13,lineHeight:1.6,
                      }}>{m.role==="user"?m.content:renderMarkdown(m.content)}</div>
                    </div>
                    {m.createdTasks&&m.createdTasks.length>0&&(
                      <div style={{marginLeft:32,background:`${C.done}0d`,border:`1px solid ${C.done}40`,borderRadius:10,padding:"12px 14px",maxWidth:"75%"}}>
                        <div style={{fontSize:11,fontWeight:700,color:C.done,marginBottom:8}}>
                          ✓ {m.createdTasks.length} task{m.createdTasks.length>1?"s":""} added to your board
                        </div>
                        {m.createdTasks.map((t,ti)=>(
                          <div key={ti} style={{display:"flex",alignItems:"center",gap:8,marginBottom:ti<m.createdTasks.length-1?6:0}}>
                            <span style={{width:6,height:6,borderRadius:"50%",background:pillars[t.pillar]?.color||C.cyan,flexShrink:0}}/>
                            <div style={{flex:1}}>
                              <div style={{fontSize:11,fontWeight:600,color:C.text}}>{t.title}</div>
                              <div style={{fontSize:9,color:C.textMuted}}>{pillars[t.pillar]?.label}{t.sub?` · ${t.sub}`:""} · {t.priority} · {fmtD(t.duration)}</div>
                            </div>
                          </div>
                        ))}
                        <button onClick={()=>setScreen("lifemap")} style={{marginTop:10,fontSize:10,background:"none",border:`1px solid ${C.done}`,borderRadius:5,color:C.done,padding:"3px 10px",cursor:"pointer",fontWeight:600}}>View in Life Map →</button>
                      </div>
                    )}
                  {/* Created meeting confirmation card */}
                  {m.createdMeeting&&(
                    <div style={{marginLeft:32,background:`${C.cyan}0d`,border:`1px solid ${C.cyan}40`,borderRadius:10,padding:"12px 14px",maxWidth:"75%"}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.cyan,marginBottom:6}}>✓ Meeting added to your calendar</div>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:4}}>📅 {m.createdMeeting.title}</div>
                      <div style={{fontSize:10,color:C.textMuted}}>
                        {m.createdMeeting.dayOffset===0?"Today":m.createdMeeting.dayOffset===1?"Tomorrow":"Day +"+m.createdMeeting.dayOffset}
                        {" · "}{fmtT(m.createdMeeting.startHour,m.createdMeeting.startMin)}
                        {" · "}{fmtD(m.createdMeeting.duration)}
                        {m.createdMeeting.attendees?" · "+m.createdMeeting.attendees:""}
                      </div>
                      <button onClick={()=>setScreen("calendar")} style={{marginTop:10,fontSize:10,background:"none",border:`1px solid ${C.cyan}`,borderRadius:5,color:C.cyan,padding:"3px 10px",cursor:"pointer",fontWeight:600}}>View in Calendar →</button>
                    </div>
                  )}
                  </div>
                ))}
                {compassLoading&&(
                  <div style={{display:"flex",gap:5,padding:"8px 32px",alignItems:"center"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:`${C.cyan}18`,border:`1px solid ${C.cyanDim}`,display:"grid",placeItems:"center",marginRight:8,flexShrink:0}}>
                      <span style={{fontSize:10}}>✦</span>
                    </div>
                    {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.cyan,animation:`blink 1.2s ease-in-out ${i*0.2}s infinite`,opacity:0.3}}/>)}
                  </div>
                )}
                <div ref={chatEnd}/>
              </div>

              {/* Input */}
              <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,background:C.bgCard,display:"flex",gap:8}}>
                <input value={compassInput} onChange={e=>setCompassInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendToCompass(compassInput);}}}
                  placeholder="Talk to Compass — anything on your mind…"
                  style={{...inp,flex:1,fontSize:13,padding:"10px 14px"}}/>
                <button onClick={()=>sendToCompass(compassInput)} disabled={compassLoading}
                  style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"0 16px",cursor:"pointer",fontSize:14,fontWeight:800}}>↑</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TASK DETAIL SHEET ── */}
      {selected&&(
        <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,width:"100%",borderRadius:"16px 16px 0 0",padding:"22px 26px 28px",boxShadow:"0 -12px 40px rgba(0,0,0,0.4)",border:`1px solid ${C.border}`,borderBottom:"none",maxHeight:"56vh",overflowY:"auto"}}>
            {selected.type==="task"&&(()=>{
              const t=selected.item;
              const meta=pillars[t.pillar];
              return(<>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:14}}>{meta?.icon}</span>
                      <span style={{fontSize:10,color:meta?.color,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>{meta?.label} · {t.sub}</span>
                      <span style={{width:5,height:5,borderRadius:"50%",background:pColor[t.priority]}}/>
                      <span style={{fontSize:10,color:C.textMuted}}>{t.priority}</span>
                      {t.postponeCount>0&&<span style={{fontSize:10,color:C.high}}>Postponed {t.postponeCount}×</span>}
                    </div>
                    <h2 style={{margin:0,fontSize:18,fontWeight:800,color:C.text,lineHeight:1.2}}>{t.title}</h2>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:22,marginLeft:12}}>×</button>
                </div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
                  {[fmtD(t.duration),t.scheduled?`Day+${t.dayOffset} ${fmtT(t.startHour,t.startMin)}`:"Unscheduled",t.deadline?`Due ${t.deadline}`:null,t.status].filter(Boolean).map(tag=>(
                    <span key={tag} style={{fontSize:11,background:C.bgSurface,border:`1px solid ${C.border}`,padding:"3px 10px",borderRadius:6,color:C.textMuted}}>{tag}</span>
                  ))}
                </div>
                {t.notes&&<p style={{fontSize:12,color:C.textMuted,margin:"0 0 14px",lineHeight:1.5}}>{t.notes}</p>}
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  <button onClick={()=>toggleDone(t.id)} style={{...btn(t.done?C.bgSurface:`${C.done}18`,t.done?C.textMuted:C.done,t.done?C.border:C.done)}}>{t.done?"↩ Undone":"✓ Done"}</button>
                  <button onClick={()=>{setEditItem({...t});setEditModal(true);}} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>✏ Edit</button>
                  {t.scheduled&&<button onClick={()=>{unscheduleTask(t.id);setSelected(null);}} style={{...btn(`${C.medium}18`,C.medium,C.medium)}}>Unschedule</button>}
                  <button onClick={()=>{postponeTask(t.id);setSelected(null);}} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>↩ Postpone</button>
                  {!t.scheduled&&t.duration>0&&<button onClick={()=>{setSelected(null);autoSchedule();}} style={{...btn(`${C.cyan}18`,C.cyan,C.cyanDim)}}>✦ AI Schedule</button>}
                  <button onClick={()=>deleteTask(t.id)} style={{...btn("none",C.high,C.high),marginLeft:"auto"}}>Delete</button>
                </div>
              </>);
            })()}
            {selected.type!=="task"&&(()=>{
              const e=selected.item;
              return(<>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:10,color:e.calType==="family"?PILLARS.family.color:C.cyan,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:5}}>
                      {e.calType==="family"?"👨‍👩‍👧‍👦 Family Calendar":e.calType==="block"?"🚫 Blocked":"📅 Meeting"}
                    </div>
                    <h2 style={{margin:0,fontSize:18,fontWeight:800,color:C.text}}>{e.title}</h2>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:22}}>×</button>
                </div>
                <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,background:C.bgSurface,border:`1px solid ${C.border}`,padding:"3px 9px",borderRadius:6,color:C.textMuted}}>Day+{e.dayOffset} {fmtT(e.startHour,e.startMin)}</span>
                  <span style={{fontSize:11,background:C.bgSurface,border:`1px solid ${C.border}`,padding:"3px 9px",borderRadius:6,color:C.textMuted}}>{fmtD(e.duration)}</span>
                  {e.location&&<span style={{fontSize:11,background:C.bgSurface,border:`1px solid ${C.border}`,padding:"3px 9px",borderRadius:6,color:C.textMuted}}>📍 {e.location.substring(0,40)}</span>}
                </div>
                {e.attendees&&<div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>👥 {e.attendees}</div>}
                {e.htmlLink&&<a href={e.htmlLink} target="_blank" rel="noreferrer" style={{fontSize:11,color:C.cyan}}>Open in Google Calendar →</a>}
                <div style={{display:"flex",gap:7,marginTop:12,flexWrap:"wrap"}}>
                  {/* Hide — for Google Calendar events only */}
                  {!e.id?.startsWith("manual-")&&!e.id?.startsWith("block-")&&(
                    <button onClick={()=>{hideEvent(e.id);setSelected(null);}} style={{...btn(`${C.medium}14`,C.medium,C.medium),fontSize:11}}>
                      👁 Ignore in Sync'n
                    </button>
                  )}
                  {/* Delete — available for ALL events */}
                  <button onClick={()=>{
                    setGcalEvents(p=>p.filter(x=>x.id!==e.id));
                    setReminders(p=>p.filter(x=>x.id!==e.id));
                    setSelected(null);
                  }} style={{...btn("none",C.high,C.high),fontSize:11}}>🗑 Delete</button>
                </div>
                {!e.id?.startsWith("manual-")&&!e.id?.startsWith("block-")&&(
                  <div style={{fontSize:10,color:C.textFaint,marginTop:6}}>
                    Ignore = stays in Google Calendar, invisible in Sync'n. Delete = removed from Sync'n only (still in Google Calendar).
                  </div>
                )}
              </>);
            })()}
          </div>
        </div>
      )}

      {/* ── UNIVERSAL ADD MODAL ── */}
      {addModal&&(
        <div onClick={()=>{setAddModal(false);setNewItem({});}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:500,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>

            {/* Type selector */}
            <div style={{display:"flex",gap:4,marginBottom:20,background:C.bg,borderRadius:10,padding:3}}>
              {[["task","Task","📋"],["meeting","Meeting","📅"],["reminder","Reminder","🔔"]].map(([t,l,ic])=>(
                <button key={t} onClick={()=>{
                  setAddType(t);
                  setNewItem(prev=>({
                    title:prev.title||"",
                    ...(t==="task"?{pillar:"film",sub:"",priority:"High",duration:60,status:"active",notes:"",deadline:"",_isRecurring:false,_recurring:"weekly",_recurDays:[]}:{}),
                    ...(t==="meeting"?{duration:60,notes:"",_isRecurring:false}:{}),
                    ...(t==="reminder"?{notes:""}:{}),
                  }));
                }} style={{
                  flex:1,padding:"7px 4px",borderRadius:8,border:"none",cursor:"pointer",
                  background:addType===t?C.bgSurface:"transparent",
                  color:addType===t?C.text:C.textMuted,
                  fontSize:11,fontWeight:addType===t?700:400,
                  transition:"all 0.12s",display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                }}>
                  <span style={{fontSize:16}}>{ic}</span>
                  <span>{l}</span>
                </button>
              ))}
            </div>

            {/* Title */}
            <input autoFocus value={newItem.title||""}
              onChange={e=>setNewItem(n=>({...n,title:e.target.value}))}
              placeholder={addType==="task"?"What needs doing?":addType==="meeting"?"Meeting title…":"Reminder title…"}
              style={{...inp,fontSize:14,padding:"10px 14px",marginBottom:14,fontWeight:600}}
            />

            {/* TASK */}
            {addType==="task"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",gap:8}}>
                  <select value={newItem.pillar||"film"} onChange={e=>setNewItem(n=>({...n,pillar:e.target.value,sub:""}))} style={{...inp,flex:1}}>
                    {Object.entries(pillars).filter(([pid])=>pid!=="parking").map(([pid,m])=><option key={pid} value={pid}>{m.icon} {m.label}</option>)}
                  </select>
                  <select value={newItem.priority||"High"} onChange={e=>setNewItem(n=>({...n,priority:e.target.value}))} style={{...inp,width:110}}>
                    {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <select value={newItem.sub||""} onChange={e=>setNewItem(n=>({...n,sub:e.target.value}))} style={{...inp,flex:1}}>
                    <option value="">Sub-pillar (optional)</option>
                    {allSubs(newItem.pillar||"film").map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={newItem.status||"active"} onChange={e=>setNewItem(n=>({...n,status:e.target.value}))} style={{...inp,width:130}}>
                    <option value="active">🔥 Active</option>
                    <option value="upcoming">🟡 Upcoming</option>
                    <option value="parked">❄️ Parked</option>
                  </select>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Duration (min)</label>
                  <input type="number" value={newItem.duration||60} min={15} step={15} onChange={e=>setNewItem(n=>({...n,duration:parseInt(e.target.value)||60}))} style={{...inp,width:75}}/>
                  <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Deadline</label>
                  <input type="date" value={newItem.deadline||""} onChange={e=>setNewItem(n=>({...n,deadline:e.target.value}))} style={{...inp,flex:1}}/>
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                  {/* Recurring checkbox */}
                  <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setNewItem(n=>({...n,_isRecurring:!n._isRecurring,_recurring:n._recurring||"weekly",_recurDays:n._recurDays||[]}))}>
                    <div style={{width:36,height:20,borderRadius:10,background:newItem._isRecurring?C.cyan:C.border,transition:"background 0.2s",position:"relative",flexShrink:0}}>
                      <div style={{position:"absolute",top:2,left:newItem._isRecurring?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>Is this a recurring task?</div>
                      {!newItem._isRecurring&&<div style={{fontSize:10,color:C.textMuted,marginTop:2}}>Toggle to set a repeat schedule</div>}
                    </div>
                  </label>

                  {newItem._isRecurring&&(
                    <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:12}}>
                      {/* Frequency */}
                      <div>
                        <div style={{fontSize:11,color:C.textMuted,marginBottom:7,fontWeight:600}}>Frequency</div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          {[["daily","Daily"],["weekday","Weekdays"],["weekly","Weekly"],["weekend","Weekends"]].map(([v,l])=>(
                            <button key={v} type="button" onClick={()=>setNewItem(n=>({...n,_recurring:v}))}
                              style={{padding:"5px 12px",borderRadius:6,border:`1.5px solid ${(newItem._recurring||"weekly")===v?C.cyan:C.border}`,background:(newItem._recurring||"weekly")===v?`${C.cyan}18`:"transparent",color:(newItem._recurring||"weekly")===v?C.cyan:C.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.12s"}}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Day selector — shown for weekly */}
                      {(newItem._recurring==="weekly"||!newItem._recurring)&&(
                        <DayPicker value={newItem._recurDays||[]} onChange={v=>setNewItem(n=>({...n,_recurDays:v}))} multi label="Repeat on days"/>
                      )}

                      {/* Time + End date */}
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Time</label>
                        <input type="time" defaultValue="09:00"
                          onChange={e=>{const[h,m]=e.target.value.split(":").map(Number);setNewItem(n=>({...n,startHour:h,startMin:m}));}}
                          style={{...inp,flex:1}}/>
                        <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Ends</label>
                        <input type="date" value={newItem._endDate||""}
                          onChange={e=>setNewItem(n=>({...n,_endDate:e.target.value||null}))}
                          style={{...inp,flex:1}}/>
                      </div>
                      <div style={{fontSize:10,color:C.textFaint}}>Leave end date blank for indefinite.</div>
                    </div>
                  )}
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:C.textMuted,cursor:"pointer",marginBottom:newItem._scheduleNow?10:0}}>
                    <input type="checkbox" checked={!!newItem._scheduleNow} onChange={e=>setNewItem(n=>({...n,_scheduleNow:e.target.checked}))}/>
                    Schedule manually now
                  </label>
                  {newItem._scheduleNow&&(<>
                    <DayPicker value={newItem.dayOffset??0} onChange={v=>setNewItem(n=>({...n,dayOffset:v}))} label="Which day?" showDateInput/>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginTop:8}}>
                      <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Time</label>
                      <input type="time" defaultValue="09:00" onChange={e=>{const[h,m]=e.target.value.split(":").map(Number);setNewItem(n=>({...n,startHour:h,startMin:m}));}} style={{...inp,flex:1}}/>
                    </div>
                  </>)}
                </div>
                <textarea value={newItem.notes||""} onChange={e=>setNewItem(n=>({...n,notes:e.target.value}))} placeholder="Notes (optional)" rows={2} style={{...inp,resize:"none"}}/>
              </div>
            )}

            {/* MEETING */}
            {addType==="meeting"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <input value={newItem.attendees||""} onChange={e=>setNewItem(n=>({...n,attendees:e.target.value}))} placeholder="Participants (names or emails)" style={{...inp}}/>
                <DayPicker value={newItem.dayOffset??0} onChange={v=>setNewItem(n=>({...n,dayOffset:v}))} label="Day" showDateInput/>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Time</label>
                  <input type="time" defaultValue="09:00" onChange={e=>{const[h,m]=e.target.value.split(":").map(Number);setNewItem(n=>({...n,startHour:h,startMin:m}));}} style={{...inp,flex:1}}/>
                  <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Dur (min)</label>
                  <input type="number" value={newItem.duration||60} min={15} step={15} onChange={e=>setNewItem(n=>({...n,duration:parseInt(e.target.value)||60}))} style={{...inp,width:75}}/>
                </div>
                <input value={newItem.location||""} onChange={e=>setNewItem(n=>({...n,location:e.target.value}))} placeholder="Location or link" style={{...inp}}/>
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                  <div style={{fontSize:11,color:C.textMuted,marginBottom:7}}>Recurring</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:newItem._recurring&&newItem._recurring!=="never"?8:0}}>
                    {[["never","Never"],["daily","Daily"],["weekday","Weekdays"],["weekly","Weekly"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setNewItem(n=>({...n,_recurring:v}))} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${(newItem._recurring||"never")===v?C.cyan:C.border}`,background:(newItem._recurring||"never")===v?`${C.cyan}18`:"transparent",color:(newItem._recurring||"never")===v?C.cyan:C.textMuted,fontSize:10,fontWeight:700,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                  {newItem._recurring==="weekly"&&<DayPicker value={newItem._recurDays||[]} onChange={v=>setNewItem(n=>({...n,_recurDays:v}))} multi label="Repeat on"/>}
                </div>
                <textarea value={newItem.notes||""} onChange={e=>setNewItem(n=>({...n,notes:e.target.value}))} placeholder="Notes (optional)" rows={2} style={{...inp,resize:"none"}}/>
              </div>
            )}

            {/* REMINDER */}
            {addType==="reminder"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>

                {/* Recurring toggle */}
                <div style={{borderBottom:`1px solid ${C.border}`,paddingBottom:12}}>
                  <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}
                    onClick={()=>setNewItem(n=>({...n,_isRecurring:!n._isRecurring,_recurring:n._recurring||"daily",_recurDays:n._recurDays||[]}))}>
                    <div style={{width:36,height:20,borderRadius:10,background:newItem._isRecurring?C.cyan:C.border,transition:"background 0.2s",position:"relative",flexShrink:0}}>
                      <div style={{position:"absolute",top:2,left:newItem._isRecurring?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>Is this a recurring reminder?</div>
                      <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{newItem._isRecurring?"e.g. Take meds, drink water, stand up":"One-off reminder"}</div>
                    </div>
                  </label>
                </div>

                {/* If recurring — show frequency + days */}
                {newItem._isRecurring&&(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div>
                      <div style={{fontSize:11,color:C.textMuted,marginBottom:7,fontWeight:600}}>Frequency</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {[["daily","Daily"],["weekday","Weekdays"],["weekly","Weekly"],["weekend","Weekends"]].map(([v,l])=>(
                          <button key={v} type="button" onClick={()=>setNewItem(n=>({...n,_recurring:v}))}
                            style={{padding:"5px 12px",borderRadius:6,border:`1.5px solid ${(newItem._recurring||"daily")===v?C.cyan:C.border}`,background:(newItem._recurring||"daily")===v?`${C.cyan}18`:"transparent",color:(newItem._recurring||"daily")===v?C.cyan:C.textMuted,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    {newItem._recurring==="weekly"&&(
                      <DayPicker value={newItem._recurDays||[]} onChange={v=>setNewItem(n=>({...n,_recurDays:v}))} multi label="Repeat on days"/>
                    )}
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>End date</label>
                      <input type="date" value={newItem._endDate||""} onChange={e=>setNewItem(n=>({...n,_endDate:e.target.value||null}))} style={{...inp,flex:1}}/>
                      <span style={{fontSize:10,color:C.textFaint,whiteSpace:"nowrap"}}>Blank = forever</span>
                    </div>
                  </div>
                )}

                {/* If NOT recurring — show date picker */}
                {!newItem._isRecurring&&(
                  <DayPicker value={newItem.dayOffset??0} onChange={v=>setNewItem(n=>({...n,dayOffset:v}))} label="When?" showDateInput/>
                )}

                {/* Time — always shown */}
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Time</label>
                  <input type="time" defaultValue="09:00" onChange={e=>{const[h,m]=e.target.value.split(":").map(Number);setNewItem(n=>({...n,startHour:h,startMin:m}));}} style={{...inp,flex:1}}/>
                </div>

                {/* Block time toggle */}
                <div style={{background:C.bgSurface,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setNewItem(n=>({...n,_blockTime:!n._blockTime}))}>
                    <div style={{width:36,height:20,borderRadius:10,background:newItem._blockTime?C.cyan:C.border,transition:"background 0.2s",position:"relative",flexShrink:0}}>
                      <div style={{position:"absolute",top:2,left:newItem._blockTime?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>Block time on calendar</div>
                      <div style={{fontSize:10,color:C.textMuted,lineHeight:1.4}}>{newItem._blockTime?"Reserves this slot — nothing schedules here.":"Badge + slim line in Today view only. No time blocked."}</div>
                    </div>
                  </div>
                  {newItem._blockTime&&(
                    <div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}>
                      <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Duration (min)</label>
                      <input type="number" value={newItem.duration||30} min={15} step={15} onChange={e=>setNewItem(n=>({...n,duration:parseInt(e.target.value)||30}))} style={{...inp,width:80}}/>
                    </div>
                  )}
                </div>
                <textarea value={newItem.notes||""} onChange={e=>setNewItem(n=>({...n,notes:e.target.value}))} placeholder="Notes (optional)" rows={2} style={{...inp,resize:"none"}}/>
              </div>
            )}

            <div style={{display:"flex",gap:8,marginTop:18,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
              <button onClick={handleAdd} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 24px",fontSize:13,fontWeight:800,cursor:"pointer"}}>
                {addType==="task"?"Add Task":addType==="meeting"?"Add Meeting":"Set Reminder"}
              </button>
              <button onClick={()=>{setAddModal(false);setNewItem({});}} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PROJECT MODAL ── */}
      {addProjectModal&&(
        <div onClick={()=>setAddProjectModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:380,boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:800,color:C.text}}>Add Sub-Pillar</h3>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <input autoFocus value={newProject.name} onChange={e=>setNewProject(p=>({...p,name:e.target.value}))}
                onKeyDown={e=>{if(e.key==="Enter") document.getElementById("addSubPillarBtn")?.click();}}
                placeholder="Sub-pillar name…" style={{...inp,fontSize:13}}/>
              <select value={newProject.pillar} onChange={e=>setNewProject(p=>({...p,pillar:e.target.value}))} style={inp}>
                {Object.entries(pillars).map(([pid,m])=><option key={pid} value={pid}>{m.icon} {m.label}</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button id="addSubPillarBtn" onClick={()=>{
                if(!newProject.name.trim()) return;
                setCustomSubs(p=>({...p,[newProject.pillar]:[...(p[newProject.pillar]||[]),newProject.name]}));
                setSelectedPillar(newProject.pillar);
                setNewProject({pillar:"film",name:""});
                setAddProjectModal(false);
              }} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 20px",fontSize:12,fontWeight:800,cursor:"pointer"}}>Add</button>
              <button onClick={()=>setAddProjectModal(false)} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ENERGY RHYTHM MODAL ── */}
      {energyModal&&(
        <div onClick={()=>setEnergyModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:420,boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <h3 style={{margin:"0 0 6px",fontSize:15,fontWeight:800,color:C.text}}>⚡ Energy Rhythm</h3>
            <div style={{fontSize:11,color:C.textMuted,marginBottom:20,lineHeight:1.5}}>
              Tell Compass when you have the most energy. AI scheduling places high-priority tasks in your peak periods.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {Object.entries(energyRhythm).map(([period,data])=>(
                <div key={period}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>{data.label}</div>
                      <div style={{fontSize:10,color:C.textFaint}}>{data.hours}</div>
                    </div>
                    <div style={{display:"flex",gap:5}}>
                      {["low","medium","high","peak"].map(level=>{
                        const colors={low:C.textFaint,medium:C.medium,high:C.low,peak:C.cyan};
                        const labels={low:"Low",medium:"Medium",high:"High",peak:"Peak"};
                        const active=data.level===level;
                        return(
                          <button key={level} onClick={()=>setEnergyRhythm(p=>({...p,[period]:{...p[period],level}}))} style={{
                            padding:"4px 10px",borderRadius:6,fontSize:10,fontWeight:active?800:400,cursor:"pointer",border:"none",
                            background:active?`${colors[level]}22`:"transparent",
                            color:active?colors[level]:C.textFaint,
                            outline:active?`1.5px solid ${colors[level]}`:"none",
                            transition:"all 0.12s"
                          }}>{labels[level]}</button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{height:3,background:C.border,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:data.level==="peak"?"100%":data.level==="high"?"75%":data.level==="medium"?"45%":"20%",background:data.level==="peak"?C.cyan:data.level==="high"?C.low:data.level==="medium"?C.medium:C.textFaint,borderRadius:2,transition:"width 0.3s"}}/>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>setEnergyModal(false)} style={{marginTop:20,background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 20px",fontSize:12,fontWeight:800,cursor:"pointer"}}>Save Rhythm</button>
          </div>
        </div>
      )}

      {/* ── BLOCKER MODAL ── */}
      {blockerModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:C.bgCard,borderRadius:16,padding:24,width:420,boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.high}40`}}>
            <div style={{fontSize:11,color:C.high,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>⚠ Pattern Detected</div>
            <h3 style={{margin:"0 0 8px",fontSize:16,fontWeight:800,color:C.text}}>"{blockerModal.title}"</h3>
            <div style={{fontSize:13,color:C.textMuted,marginBottom:16}}>This has been postponed {blockerModal.postponeCount} times. What's actually blocking it?</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16}}>
              {["Too hard","Fear of failure","Need help","Too vague","Not important","No time","Don't know where to start","Wrong moment"].map(reason=>(
                <button key={reason} onClick={async()=>{
                  setBlockerModal(null);
                  setScreen("compass");
                  await sendToCompass(`The task "${blockerModal.title}" has been postponed ${blockerModal.postponeCount} times. The blocker is: "${reason}". Help me break through this.`);
                }} style={{background:C.bgSurface,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",fontSize:11,cursor:"pointer",color:C.textMuted,textAlign:"left",transition:"border-color 0.12s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.cyanDim}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>{reason}</button>
              ))}
            </div>
            <button onClick={()=>setBlockerModal(null)} style={{...btn(C.bgSurface,C.textMuted,C.border),fontSize:11}}>Dismiss</button>
          </div>
        </div>
      )}

      {/* ── FULL EDIT TASK MODAL ── */}
      {editModal&&(
        <div onClick={()=>setEditModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:500,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>

            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:10,color:C.cyan,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Editing Task</div>
                <h3 style={{margin:0,fontSize:16,fontWeight:800,color:C.text,lineHeight:1.2}}>{editItem.title||"Untitled"}</h3>
              </div>
              <button onClick={()=>setEditModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:22}}>×</button>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* Title */}
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Title</label>
                <input autoFocus value={editItem.title||""} onChange={e=>setEditItem(n=>({...n,title:e.target.value}))}
                  style={{...inp,fontSize:13,padding:"10px 12px"}}/>
              </div>

              {/* Pillar + Sub-pillar */}
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Pillar</label>
                  <select value={editItem.pillar||"film"} onChange={e=>setEditItem(n=>({...n,pillar:e.target.value,sub:""}))} style={{...inp}}>
                    {Object.entries(pillars).filter(([pid])=>pid!=="parking").map(([pid,m])=><option key={pid} value={pid}>{m.icon} {m.label}</option>)}
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Sub-pillar</label>
                  <select value={editItem.sub||""} onChange={e=>setEditItem(n=>({...n,sub:e.target.value}))} style={{...inp}}>
                    <option value="">None</option>
                    {allSubs(editItem.pillar||"film").map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Priority + Status */}
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Priority</label>
                  <div style={{display:"flex",gap:5}}>
                    {["High","Medium","Low"].map(p=>{
                      const colors={High:C.high,Medium:C.medium,Low:C.low};
                      const active=editItem.priority===p;
                      return(
                        <button key={p} type="button" onClick={()=>setEditItem(n=>({...n,priority:p}))} style={{
                          flex:1,padding:"7px 4px",borderRadius:6,fontSize:11,fontWeight:active?800:400,cursor:"pointer",border:"none",
                          background:active?`${colors[p]}22`:"transparent",
                          color:active?colors[p]:C.textMuted,
                          outline:active?`1.5px solid ${colors[p]}`:"1px solid "+C.border,
                          transition:"all 0.12s",
                        }}>{p}</button>
                      );
                    })}
                  </div>
                </div>
                <div style={{flex:1}}>
                  <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Status</label>
                  <select value={editItem.status||"active"} onChange={e=>setEditItem(n=>({...n,status:e.target.value}))} style={{...inp}}>
                    <option value="active">🔥 Active</option>
                    <option value="upcoming">🟡 Upcoming</option>
                    <option value="parked">❄️ Parked</option>
                  </select>
                </div>
              </div>

              {/* Duration + Deadline */}
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Duration (min)</label>
                  <input type="number" value={editItem.duration||60} min={15} step={15}
                    onChange={e=>setEditItem(n=>({...n,duration:parseInt(e.target.value)||60}))} style={{...inp}}/>
                </div>
                <div style={{flex:1}}>
                  <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Deadline</label>
                  <input type="date" value={editItem.deadline||""} onChange={e=>setEditItem(n=>({...n,deadline:e.target.value}))} style={{...inp}}/>
                </div>
              </div>

              {/* Schedule */}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:8}}>Schedule</label>
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:editItem.scheduled?12:0}}
                  onClick={()=>setEditItem(n=>({...n,scheduled:!n.scheduled,dayOffset:n.dayOffset??0,startHour:n.startHour??9,startMin:n.startMin??0}))}>
                  <div style={{width:36,height:20,borderRadius:10,background:editItem.scheduled?C.cyan:C.border,transition:"background 0.2s",position:"relative",flexShrink:0}}>
                    <div style={{position:"absolute",top:2,left:editItem.scheduled?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                  </div>
                  <span style={{fontSize:12,color:C.text,fontWeight:600}}>{editItem.scheduled?"Scheduled — tap to unschedule":"Not scheduled — tap to set a time"}</span>
                </label>
                {editItem.scheduled&&(<>
                  <DayPicker value={editItem.dayOffset??0} onChange={v=>setEditItem(n=>({...n,dayOffset:v,scheduled:true}))} label="Day" showDateInput/>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}>
                    <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Time</label>
                    <input type="time"
                      value={editItem.startHour!=null?`${String(editItem.startHour).padStart(2,"0")}:${String(editItem.startMin||0).padStart(2,"0")}`:"09:00"}
                      onChange={e=>{const[h,m]=e.target.value.split(":").map(Number);setEditItem(n=>({...n,startHour:h,startMin:m,scheduled:true}));}}
                      style={{...inp,flex:1}}/>
                  </div>
                </>)}
              </div>

              {/* Notes */}
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Notes</label>
                <textarea value={editItem.notes||""} onChange={e=>setEditItem(n=>({...n,notes:e.target.value}))}
                  placeholder="Notes…" rows={3} style={{...inp,resize:"none"}}/>
              </div>

            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
              <button onClick={()=>{
                setTasks(p=>p.map(t=>t.id===editItem.id?{...editItem}:t));
                setEditModal(null); setSelected(null);
              }} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 24px",fontSize:13,fontWeight:800,cursor:"pointer"}}>
                Save Changes
              </button>
              <button onClick={()=>setEditModal(null)} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>Cancel</button>
              <button onClick={()=>{deleteTask(editItem.id);setEditModal(null);}} style={{...btn("none",C.high,C.high),marginLeft:"auto",fontSize:11}}>🗑 Delete Task</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECURRING EDIT MODAL ── */}
      {recurringEditModal&&!recurringEditMode&&(
        <div onClick={()=>setRecurringEditModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:400,boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <div style={{fontSize:11,color:C.cyan,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>🔁 Recurring Event</div>
            <h3 style={{margin:"0 0 6px",fontSize:16,fontWeight:800,color:C.text}}>{recurringEditModal.instance.title}</h3>
            <div style={{fontSize:12,color:C.textMuted,marginBottom:20}}>
              {fmtT(recurringEditModal.instance.startHour,recurringEditModal.instance.startMin)} · {fmtD(recurringEditModal.instance.duration)} · {recurringEditModal.instance.dateKey}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={()=>setRecurringEditMode("single")} style={{...btn(`${C.cyan}14`,C.cyan,C.cyanDim),textAlign:"left",padding:"10px 14px"}}>
                <div style={{fontWeight:700,fontSize:12}}>Edit this occurrence only</div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>Changes only apply to {recurringEditModal.instance.dateKey}</div>
              </button>
              <button onClick={()=>setRecurringEditMode("future")} style={{...btn(C.bgSurface,C.textMuted,C.border),textAlign:"left",padding:"10px 14px"}}>
                <div style={{fontWeight:700,fontSize:12}}>Edit this and all future occurrences</div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>Updates the recurring rule from this date forward</div>
              </button>
              <button onClick={()=>{skipRecurringInstance(recurringEditModal.instance);setRecurringEditModal(null);}} style={{...btn(`${C.high}14`,C.high,C.high),textAlign:"left",padding:"10px 14px"}}>
                <div style={{fontWeight:700,fontSize:12}}>Skip this occurrence</div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>Cancel just this one — Compass will suggest what to fill the slot with</div>
              </button>
            </div>
            <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`,display:"flex",gap:7}}>
              <button onClick={()=>{
                // Delete this single occurrence
                skipRecurringInstance(recurringEditModal.instance);
                setRecurringEditModal(null);
              }} style={{...btn(`${C.high}14`,C.high,C.high),fontSize:11}}>🗑 Delete This Occurrence</button>
              <button onClick={()=>{
                // Delete the entire recurring series
                setRecurringTasks(p=>p.filter(r=>r.id!==recurringEditModal.instance.recurringId));
                setRecurringEditModal(null);
              }} style={{...btn("none",C.high,C.high),fontSize:11}}>🗑 Delete Entire Series</button>
              <button onClick={()=>setRecurringEditModal(null)} style={{...btn(C.bgSurface,C.textMuted,C.border),fontSize:11,marginLeft:"auto"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECURRING OCCURRENCE FULL EDIT ── */}
      {recurringEditModal&&recurringEditMode&&(
        <div onClick={()=>setRecurringEditMode(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:500,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>

            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <div style={{fontSize:10,color:C.cyan,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>
                  🔁 {recurringEditMode==="single"?"This occurrence only":"All future occurrences"}
                </div>
                <h3 style={{margin:0,fontSize:16,fontWeight:800,color:C.text,lineHeight:1.2}}>{recurringEditModal.instance.title}</h3>
                <div style={{fontSize:11,color:C.textMuted,marginTop:4}}>{recurringEditModal.instance.dateKey} · {fmtT(recurringEditModal.instance.startHour,recurringEditModal.instance.startMin)}</div>
              </div>
              <button onClick={()=>setRecurringEditMode(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:22}}>×</button>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* Title — only editable for "all future" */}
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>
                  Title {recurringEditMode==="single"&&<span style={{color:C.textFaint,fontWeight:400}}>(edit series to rename)</span>}
                </label>
                <input
                  value={recurringEditModal.instance.title}
                  disabled={recurringEditMode==="single"}
                  onChange={e=>{
                    if(recurringEditMode==="future"){
                      setRecurringTasks(p=>p.map(r=>r.id===recurringEditModal.instance.recurringId?{...r,title:e.target.value}:r));
                      setRecurringEditModal(prev=>({...prev,instance:{...prev.instance,title:e.target.value}}));
                    }
                  }}
                  style={{...inp,fontSize:13,padding:"10px 12px",opacity:recurringEditMode==="single"?0.5:1}}/>
              </div>

              {/* Pillar — series only */}
              {recurringEditMode==="future"&&(
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1}}>
                    <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Pillar</label>
                    <select value={recurringEditModal.rt?.pillar||"film"}
                      onChange={e=>setRecurringTasks(p=>p.map(r=>r.id===recurringEditModal.instance.recurringId?{...r,pillar:e.target.value}:r))}
                      style={{...inp}}>
                      {Object.entries(pillars).filter(([pid])=>pid!=="parking").map(([pid,m])=><option key={pid} value={pid}>{m.icon} {m.label}</option>)}
                    </select>
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Priority</label>
                    <div style={{display:"flex",gap:5}}>
                      {["High","Medium","Low"].map(p=>{
                        const colors={High:C.high,Medium:C.medium,Low:C.low};
                        const current=recurringEditModal.rt?.priority||"Medium";
                        const active=current===p;
                        return(
                          <button key={p} type="button"
                            onClick={()=>setRecurringTasks(prev=>prev.map(r=>r.id===recurringEditModal.instance.recurringId?{...r,priority:p}:r))}
                            style={{flex:1,padding:"7px 4px",borderRadius:6,fontSize:11,fontWeight:active?800:400,cursor:"pointer",border:"none",background:active?`${colors[p]}22`:"transparent",color:active?colors[p]:C.textMuted,outline:active?`1.5px solid ${colors[p]}`:"1px solid "+C.border,transition:"all 0.12s"}}>
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Duration */}
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Duration (min)</label>
                <input type="number" id="recEditDur" defaultValue={recurringEditModal.instance.duration} min={15} step={15} style={{...inp,width:120}}/>
              </div>

              {/* Time */}
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Time</label>
                <input type="time" id="recEditTime"
                  defaultValue={`${String(recurringEditModal.instance.startHour).padStart(2,"0")}:${String(recurringEditModal.instance.startMin).padStart(2,"0")}`}
                  style={{...inp,maxWidth:180}}/>
              </div>

              {/* Day — single occurrence only */}
              {recurringEditMode==="single"&&(
                <div>
                  <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Move to different day</label>
                  <DayPicker value={0} onChange={()=>{}} label="Day (coming soon — use time above)" showDateInput/>
                </div>
              )}

              {/* Recurrence rule — series only */}
              {recurringEditMode==="future"&&(()=>{
                const rt=recurringEditModal.rt;
                if(!rt) return null;
                return(
                  <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                    <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:8}}>Repeat schedule</label>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                      {[["daily","Daily"],["weekday","Weekdays"],["weekly","Weekly"],["weekend","Weekends"]].map(([v,l])=>(
                        <button key={v} type="button"
                          onClick={()=>setRecurringTasks(p=>p.map(r=>r.id===rt.id?{...r,recurrence:{...r.recurrence,type:v}}:r))}
                          style={{padding:"5px 12px",borderRadius:6,border:`1.5px solid ${rt.recurrence?.type===v?C.cyan:C.border}`,background:rt.recurrence?.type===v?`${C.cyan}18`:"transparent",color:rt.recurrence?.type===v?C.cyan:C.textMuted,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                          {l}
                        </button>
                      ))}
                    </div>
                    {rt.recurrence?.type==="weekly"&&(
                      <DayPicker
                        value={rt.recurrence?.days||[]}
                        onChange={days=>setRecurringTasks(p=>p.map(r=>r.id===rt.id?{...r,recurrence:{...r.recurrence,days}}:r))}
                        multi label="Repeat on days"/>
                    )}
                    <div style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}>
                      <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Ends</label>
                      <input type="date" value={rt.recurrence?.endDate||""}
                        onChange={e=>setRecurringTasks(p=>p.map(r=>r.id===rt.id?{...r,recurrence:{...r.recurrence,endDate:e.target.value||null}}:r))}
                        style={{...inp,flex:1}}/>
                      <span style={{fontSize:10,color:C.textFaint}}>Blank = indefinite</span>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
              <button onClick={()=>{
                const timeEl=document.getElementById("recEditTime");
                const durEl=document.getElementById("recEditDur");
                const[h,m]=(timeEl?.value||"09:00").split(":").map(Number);
                const dur=parseInt(durEl?.value)||recurringEditModal.instance.duration;
                if(recurringEditMode==="single"){
                  editRecurringOccurrence(recurringEditModal.instance,{startHour:h,startMin:m,duration:dur});
                } else {
                  editRecurringFuture(recurringEditModal.rt,{startHour:h,startMin:m,duration:dur});
                }
                setRecurringEditModal(null); setRecurringEditMode(null);
              }} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 24px",fontSize:13,fontWeight:800,cursor:"pointer"}}>
                Save Changes
              </button>
              <button onClick={()=>setRecurringEditMode(null)} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>Back</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD RECURRING MODAL ── */}
      {addRecurringModal&&(
        <div onClick={()=>setAddRecurringModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:480,maxWidth:"92vw",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:800,color:C.text}}>New Recurring Task</h3>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <input autoFocus value={newRecurring.title} onChange={e=>setNewRecurring(n=>({...n,title:e.target.value}))} placeholder="e.g. Lunch break, Madden training…" style={{...inp,fontSize:13,padding:"10px 12px"}}/>
              <div style={{display:"flex",gap:8}}>
                <select value={newRecurring.pillar} onChange={e=>setNewRecurring(n=>({...n,pillar:e.target.value}))} style={{...inp,flex:1}}>
                  {Object.entries(pillars).map(([pid,m])=><option key={pid} value={pid}>{m.icon} {m.label}</option>)}
                </select>
                <select value={newRecurring.priority} onChange={e=>setNewRecurring(n=>({...n,priority:e.target.value}))} style={{...inp,width:110}}>
                  {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Repeats</label>
                <select value={newRecurring.recurrence.type} onChange={e=>setNewRecurring(n=>({...n,recurrence:{...n.recurrence,type:e.target.value}}))} style={{...inp,flex:1}}>
                  <option value="daily">Daily</option>
                  <option value="weekday">Every weekday (Mon–Fri)</option>
                  <option value="weekly">Weekly (pick days)</option>
                </select>
              </div>
              {newRecurring.recurrence.type==="weekly"&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>(
                    <button key={i} onClick={()=>setNewRecurring(n=>({...n,recurrence:{...n.recurrence,days:n.recurrence.days.includes(i)?n.recurrence.days.filter(x=>x!==i):[...n.recurrence.days,i]}}))}
                      style={{...btn(newRecurring.recurrence.days.includes(i)?`${C.cyan}22`:"transparent",newRecurring.recurrence.days.includes(i)?C.cyan:C.textMuted,newRecurring.recurrence.days.includes(i)?C.cyanDim:C.border),padding:"4px 10px",fontSize:11}}>{d}</button>
                  ))}
                </div>
              )}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Time</label>
                <input type="time" defaultValue={`${String(newRecurring.recurrence.startHour).padStart(2,"0")}:${String(newRecurring.recurrence.startMin).padStart(2,"0")}`}
                  onChange={e=>{const[h,m]=e.target.value.split(":").map(Number);setNewRecurring(n=>({...n,recurrence:{...n.recurrence,startHour:h,startMin:m}}));}} style={{...inp,flex:1}}/>
                <label style={{fontSize:11,color:C.textMuted}}>Duration (min)</label>
                <input type="number" value={newRecurring.duration} min={15} step={15} onChange={e=>setNewRecurring(n=>({...n,duration:parseInt(e.target.value)||60}))} style={{...inp,width:70}}/>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>End date</label>
                <input type="date" value={newRecurring.recurrence.endDate||""} onChange={e=>setNewRecurring(n=>({...n,recurrence:{...n.recurrence,endDate:e.target.value||null}}))} style={{...inp,flex:1}}/>
                <span style={{fontSize:10,color:C.textFaint}}>Leave blank = indefinite</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button onClick={()=>{
                if(!newRecurring.title.trim()) return;
                setRecurringTasks(p=>[...p,{...newRecurring,id:`rec-${nextId++}`,exceptions:{}}]);
                setAddRecurringModal(false);
                setNewRecurring({title:"",pillar:"family",sub:"",priority:"Medium",duration:60,status:"active",notes:"",recurrence:{type:"weekly",days:[0],startHour:9,startMin:0,endDate:""}});
              }} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 20px",fontSize:12,fontWeight:800,cursor:"pointer"}}>Add Recurring Task</button>
              <button onClick={()=>setAddRecurringModal(false)} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FREED SLOT SUGGESTION ── */}
      {freedSlot&&(
        <div style={{position:"fixed",bottom:24,right:24,zIndex:300,background:C.bgCard,border:`1px solid ${C.cyanDim}`,borderRadius:12,padding:"16px 18px",maxWidth:340,boxShadow:`0 8px 32px rgba(0,180,216,0.15)`}}>
          <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:6}}>✦ Freed Slot Detected</div>
          <div style={{fontSize:12,color:C.text,marginBottom:4}}>
            <strong>{freedSlot.title}</strong> was skipped — freeing {fmtT(freedSlot.startHour,freedSlot.startMin)} ({fmtD(freedSlot.duration)}).
          </div>
          <div style={{fontSize:11,color:C.textMuted,marginBottom:12}}>Want Compass to suggest what to put in this slot?</div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={async()=>{
              setFreedSlot(null);
              setScreen("compass");
              await sendToCompass(`A recurring task was skipped, freeing up ${fmtT(freedSlot.startHour,freedSlot.startMin)} for ${fmtD(freedSlot.duration)} on day+${freedSlot.dayOffset}. Based on my unscheduled priorities and energy at that time, what should I put in this slot?`);
            }} style={{...btn(`${C.cyan}18`,C.cyan,C.cyanDim),fontSize:11}}>✦ Get Suggestion</button>
            <button onClick={()=>setFreedSlot(null)} style={{...btn(C.bgSurface,C.textMuted,C.border),fontSize:11}}>Dismiss</button>
          </div>
        </div>
      )}

      {/* ── EVENING / WEEK PLAN MODAL ── */}
      {eveningPlanModal&&(
        <div onClick={()=>setEveningPlanModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:400,boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <div style={{fontSize:11,color:C.cyan,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>✦ AI Planning</div>
            <h3 style={{margin:"0 0 6px",fontSize:16,fontWeight:800,color:C.text}}>{isMonday?"Plan This Week":"Plan Tomorrow"}</h3>
            <div style={{fontSize:12,color:C.textMuted,marginBottom:20,lineHeight:1.5}}>
              {isMonday
                ?"Compass will schedule your high-priority tasks across the full week, working around your calendar and energy profile."
                :"Compass will fill tomorrow's schedule with your top unscheduled priorities, working around existing events."
              }
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={()=>planNextDay(isMonday)} disabled={eveningPlanLoading}
                style={{...btn(`${C.cyan}18`,C.cyan,C.cyanDim),padding:"12px 16px",textAlign:"left",fontSize:12}}>
                {eveningPlanLoading?"⟳ Planning…":isMonday?"✦ Plan Full Week":"✦ Plan Tomorrow"}
              </button>
              {!isMonday&&(
                <button onClick={()=>planNextDay(true)} disabled={eveningPlanLoading}
                  style={{...btn(C.bgSurface,C.textMuted,C.border),padding:"12px 16px",textAlign:"left",fontSize:12}}>
                  Plan Full Week Instead
                </button>
              )}
              <button onClick={resyncToday} disabled={eveningPlanLoading}
                style={{...btn(C.bgSurface,C.textMuted,C.border),padding:"12px 16px",textAlign:"left",fontSize:12}}>
                ↻ Re-sync Today Only
              </button>
            </div>
            <button onClick={()=>setEveningPlanModal(false)} style={{marginTop:12,...btn(C.bgSurface,C.textMuted,C.border),fontSize:11}}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── ARCHIVE VIEW ── */}
      {showArchive&&(
        <div onClick={()=>setShowArchive(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:560,maxWidth:"92vw",maxHeight:"70vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:800,color:C.text}}>Archive ({archive.length} tasks)</h3>
              <button onClick={()=>setShowArchive(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:20}}>×</button>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              {archive.length===0?(
                <div style={{fontSize:12,color:C.textFaint,padding:"20px 0",textAlign:"center"}}>Nothing archived yet. Tasks completed more than 7 days ago appear here.</div>
              ):archive.map(task=>(
                <div key={task.id} style={{background:C.bgSurface,border:`1px solid ${C.border}`,borderLeft:`2px solid ${pillars[task.pillar]?.color||C.cyan}`,borderRadius:7,padding:"8px 12px",marginBottom:5,display:"flex",alignItems:"center",gap:10,opacity:0.65}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:500,color:C.text,textDecoration:"line-through"}}>{task.title}</div>
                    <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{pillars[task.pillar]?.label} · {task.sub} · Done {task.doneAt?new Date(task.doneAt).toLocaleDateString("en-AU"):""}</div>
                  </div>
                  <button onClick={()=>unarchiveTask(task.id)} style={{fontSize:10,...btn(C.bgCard,C.cyan,C.cyanDim)}}>↩ Restore</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HIDDEN EVENTS MANAGER ── */}
      {showIgnoredModal&&(
        <div onClick={()=>setShowIgnoredModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:500,maxWidth:"92vw",maxHeight:"65vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:800,color:C.text}}>Ignored Events</h3>
              <button onClick={()=>setShowIgnoredModal(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:20}}>×</button>
            </div>
            <div style={{fontSize:11,color:C.textMuted,marginBottom:16}}>
              These events are hidden from Sync'n but still exist in Google Calendar. Your family can still see them.
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              {hiddenEvents.length===0?(
                <div style={{fontSize:12,color:C.textFaint,padding:"20px 0",textAlign:"center"}}>No hidden events. Tap "Ignore in Sync'n" on any calendar event to hide it.</div>
              ):gcalEvents.filter(e=>hiddenEvents.includes(e.id)).map(e=>(
                <div key={e.id} style={{background:C.bgSurface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.textMuted,textDecoration:"line-through"}}>{e.title}</div>
                    <div style={{fontSize:10,color:C.textFaint,marginTop:2}}>
                      Day+{e.dayOffset} {fmtT(e.startHour,e.startMin)} · {fmtD(e.duration)}
                      {e.calType==="family"?" · Family Calendar":""}
                    </div>
                  </div>
                  <button onClick={()=>unhideEvent(e.id)} style={{...btn(`${C.done}14`,C.done,C.done),fontSize:10}}>↩ Unhide</button>
                </div>
              ))}
              {hiddenEvents.filter(id=>!gcalEvents.find(e=>e.id===id)).length>0&&(
                <div style={{marginTop:8,padding:"8px 12px",background:C.bgCard,borderRadius:7,fontSize:10,color:C.textFaint}}>
                  +{hiddenEvents.filter(id=>!gcalEvents.find(e=>e.id===id)).length} hidden events from previous weeks (auto-cleared after sync)
                </div>
              )}
            </div>
            {hiddenEvents.length>0&&(
              <button onClick={()=>{setHiddenEvents([]);localStorage.setItem("syncn_hidden_events","[]");}} style={{marginTop:12,...btn(C.bgSurface,C.high,C.high),fontSize:11,alignSelf:"flex-start"}}>Clear All Ignored</button>
            )}
          </div>
        </div>
      )}

      {/* ── PILLAR EDIT MODAL ── */}
      {pillarEditModal&&(
        <div onClick={()=>setPillarEditModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:460,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:800,color:C.text}}>Edit Pillar</h3>
              <button onClick={()=>setPillarEditModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:20}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Name</label>
                <input value={pillarEditModal?.pillar?.label||""} onChange={e=>setPillarEditModal(p=>({...p,pillar:{...p.pillar,label:e.target.value}}))} style={{...inp,fontSize:13,padding:"9px 12px"}}/>
              </div>
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:7}}>Icon</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {["👨‍👩‍👧‍👦","🎬","🏢","💚","💰","🎨","🌱","❄️","⭐","🔥","💡","🎯","🏆","🌍","🛡","📚","🎵","🏋","✈️","🏡","💻","🎭","🌿","⚡"].map(ic=>(
                    <button key={ic} type="button" onClick={()=>setPillarEditModal(p=>({...p,pillar:{...p.pillar,icon:ic}}))} style={{width:36,height:36,borderRadius:7,border:"1.5px solid "+(pillarEditModal?.pillar?.icon===ic?C.cyan:C.border),background:pillarEditModal?.pillar?.icon===ic?C.cyan+"18":"transparent",fontSize:18,cursor:"pointer"}}>{ic}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:7}}>Colour</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  {["#e8a87c","#00b4d8","#9b6dce","#4db88a","#d4a843","#e07a5c","#5b8dd9","#4a7fa0","#e05c5c","#a8c4d8","#c084fc","#34d399","#fb923c","#f472b6","#60a5fa"].map(col=>(
                    <button key={col} type="button" onClick={()=>setPillarEditModal(p=>({...p,pillar:{...p.pillar,color:col}}))} style={{width:28,height:28,borderRadius:"50%",background:col,border:"2px solid "+(pillarEditModal?.pillar?.color===col?"#fff":"transparent"),cursor:"pointer"}}/>
                  ))}
                </div>
                <input type="color" value={pillarEditModal?.pillar?.color||"#6b7fa3"}
                  onChange={e=>setPillarEditModal(p=>({...p,pillar:{...p.pillar,color:e.target.value}}))}
                  style={{border:`1px solid ${C.border}`,borderRadius:6,padding:2,width:44,height:28,cursor:"pointer",background:"none"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
              <button onClick={()=>{
                if(!pillarEditModal.pillar.label.trim()) return;
                setPillars(p=>({...p,[pillarEditModal.id]:{...p[pillarEditModal.id],...pillarEditModal.pillar}}));
                setPillarEditModal(null);
              }} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 22px",fontSize:13,fontWeight:800,cursor:"pointer"}}>Save Changes</button>
              <button onClick={()=>setPillarEditModal(null)} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>Cancel</button>
              {pillarEditModal&&tasks.filter(t=>t.pillar===pillarEditModal.id&&!t.done).length===0&&pillarEditModal.id!=="parking"&&(
                <button onClick={()=>{
                  if(!window.confirm("Delete this pillar? This cannot be undone.")) return;
                  setPillars(p=>{ const n={...p}; delete n[pillarEditModal.id]; return n; });
                  setPillarEditModal(null);
                }} style={{...btn("none",C.high,C.high),marginLeft:"auto",fontSize:11}}>🗑 Delete Pillar</button>
              )}
              {pillarEditModal&&tasks.filter(t=>t.pillar===pillarEditModal.id&&!t.done).length>0&&(
                <div style={{fontSize:10,color:C.textMuted,marginLeft:"auto",alignSelf:"center"}}>Complete tasks first to delete</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-PILLAR EDIT MODAL ── */}
      {subEditModal&&(
        <div onClick={()=>setSubEditModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:400,maxWidth:"94vw",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:10,color:pillars[subEditModal.pillarId]?.color||C.cyan,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{pillars[subEditModal.pillarId]?.label}</div>
                <h3 style={{margin:0,fontSize:15,fontWeight:800,color:C.text}}>Edit Sub-pillar</h3>
              </div>
              <button onClick={()=>setSubEditModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:20}}>×</button>
            </div>
            <div>
              <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Name</label>
              <input id="subEditName" defaultValue={subEditModal.subName} style={{...inp,fontSize:13,padding:"9px 12px"}}/>
              <div style={{fontSize:11,color:C.textMuted,marginTop:8}}>{tasks.filter(t=>t.pillar===subEditModal.pillarId&&t.sub===subEditModal.subName).length} tasks in this sub-pillar</div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
              <button onClick={()=>{
                const newName=document.getElementById("subEditName")?.value?.trim();
                if(!newName) return;
                setPillars(p=>{ const pid=subEditModal.pillarId; return {...p,[pid]:{...p[pid],sub:(p[pid]?.sub||[]).map(s=>s===subEditModal.subName?newName:s)}}; });
                setTasks(prev=>prev.map(t=>t.pillar===subEditModal.pillarId&&t.sub===subEditModal.subName?{...t,sub:newName}:t));
                setSubEditModal(null);
              }} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 22px",fontSize:13,fontWeight:800,cursor:"pointer"}}>Rename</button>
              <button onClick={()=>setSubEditModal(null)} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>Cancel</button>
              <button onClick={()=>{
                if(!window.confirm("Delete this sub-pillar? Tasks keep their pillar but lose the sub-pillar.")) return;
                setPillars(p=>{ const pid=subEditModal.pillarId; return {...p,[pid]:{...p[pid],sub:(p[pid]?.sub||[]).filter(s=>s!==subEditModal.subName)}}; });
                setTasks(prev=>prev.map(t=>t.pillar===subEditModal.pillarId&&t.sub===subEditModal.subName?{...t,sub:""}:t));
                setSubEditModal(null);
              }} style={{...btn("none",C.high,C.high),marginLeft:"auto",fontSize:11}}>🗑 Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW PILLAR MODAL ── */}
      {addPillarModal&&(
        <div onClick={()=>setAddPillarModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:460,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:800,color:C.text}}>New Pillar</h3>
              <button onClick={()=>setAddPillarModal(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:20}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:5}}>Name</label>
                <input autoFocus value={newPillarData.label} onChange={e=>setNewPillarData(p=>({...p,label:e.target.value}))} placeholder="e.g. Side Projects, Travel, Community…" style={{...inp,fontSize:13,padding:"9px 12px"}}/>
              </div>
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:7}}>Icon</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {["👨‍👩‍👧‍👦","🎬","🏢","💚","💰","🎨","🌱","❄️","⭐","🔥","💡","🎯","🏆","🌍","🛡","📚","🎵","🏋","✈️","🏡","💻","🎭","🌿","⚡"].map(ic=>(
                    <button key={ic} type="button" onClick={()=>setNewPillarData(p=>({...p,icon:ic}))} style={{width:36,height:36,borderRadius:7,border:"1.5px solid "+(newPillarData.icon===ic?C.cyan:C.border),background:newPillarData.icon===ic?C.cyan+"18":"transparent",fontSize:18,cursor:"pointer"}}>{ic}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{fontSize:11,color:C.textMuted,fontWeight:600,display:"block",marginBottom:7}}>Colour</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  {["#e8a87c","#00b4d8","#9b6dce","#4db88a","#d4a843","#e07a5c","#5b8dd9","#4a7fa0","#e05c5c","#a8c4d8","#c084fc","#34d399","#fb923c","#f472b6","#60a5fa"].map(col=>(
                    <button key={col} type="button" onClick={()=>setNewPillarData(p=>({...p,color:col}))} style={{width:28,height:28,borderRadius:"50%",background:col,border:"2px solid "+(newPillarData.color===col?"#fff":"transparent"),cursor:"pointer"}}/>
                  ))}
                </div>
                <input type="color" value={newPillarData.color} onChange={e=>setNewPillarData(p=>({...p,color:e.target.value}))} style={{border:`1px solid ${C.border}`,borderRadius:6,padding:2,width:44,height:28,cursor:"pointer",background:"none"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
              <button onClick={()=>{
                if(!newPillarData.label.trim()) return;
                const id=newPillarData.label.toLowerCase().replace(/[^a-z0-9]/g,"_").replace(/__+/g,"_")+Date.now();
                setPillars(p=>({...p,[id]:{label:newPillarData.label.trim(),icon:newPillarData.icon,color:newPillarData.color,sub:[]}}));
                setAddPillarModal(false);
                setNewPillarData({label:"",icon:"⭐",color:"#6b7fa3"});
              }} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 22px",fontSize:13,fontWeight:800,cursor:"pointer"}}>Create Pillar</button>
              <button onClick={()=>setAddPillarModal(false)} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink{0%,100%{opacity:.15}50%{opacity:1}}@keyframes nowPulse{0%,100%{box-shadow:0 0 8px #00b4d8}50%{box-shadow:0 0 16px #00b4d8,0 0 32px #00b4d840}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:8px}
        option{background:${C.bgCard};color:${C.text}}
        input[type=range]{accent-color:${C.cyan}}
      `}</style>
    </div>
  );
}

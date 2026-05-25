import { useState, useEffect, useRef, useCallback } from "react";

// ─── BRAND & PILLARS ──────────────────────────────────────────────────────────
const C = {
  bg:"#080c17",bgCard:"#0d1220",bgSurface:"#111827",bgHover:"#171f30",
  border:"#1a2540",borderLight:"#111827",
  text:"#eef2ff",textMuted:"#64748b",textFaint:"#2d3a52",
  cyan:"#00b4d8",cyanDim:"#0090b0",cyanGlow:"#00b4d815",
  high:"#e05c5c",medium:"#d4a843",low:"#4db88a",
};

const PILLARS = {
  family:    { label:"Family",       icon:"👨‍👩‍👧‍👦", color:"#e8a87c", sub:["Madden","Hardey","Noa","Relationship","Home"] },
  film:      { label:"Film & Craft", icon:"🎬", color:"#00b4d8", sub:["CROWE","THUNK","Blue Orchids","Acting","Writing"] },
  business:  { label:"Business",     icon:"🏢", color:"#9b6dce", sub:["Shadow Wolves","SLATR","SPOT'D","PITCH'D","Playbook"] },
  health:    { label:"Health",       icon:"💚", color:"#4db88a", sub:["Physical","Mental","Sleep","Energy"] },
  finance:   { label:"Finance",      icon:"💰", color:"#d4a843", sub:["Income","Teaching","Online Products","Budgeting"] },
  creativity:{ label:"Creativity",   icon:"🎨", color:"#e07a5c", sub:["Kids Projects","Mantra Toys","Creative Den","Children's Books"] },
  growth:    { label:"Growth",       icon:"🌱", color:"#5b8dd9", sub:["Learning","Coaching","Identity","Reflection"] },
  parking:   { label:"Parking Lot",  icon:"❄️", color:"#4a7fa0", sub:[] },
};

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

let nextId = 5000;

// ─── ENERGY DEFAULTS ──────────────────────────────────────────────────────────
const DEFAULT_ENERGY = {6:4,7:5,8:7,9:8,10:9,11:9,12:7,13:6,14:5,15:5,16:4,17:3,18:2,19:2,20:1,21:1};

// ─── COMPASS MEMORY (persisted in localStorage) ───────────────────────────────
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
  const meta=PILLARS[pid];
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
function CalBlock({item,color,onClick,col=0,cols=1,isTask=false}){
  const top=px(item.startHour,item.startMin);
  const height=Math.max(pxH(item.duration||30)-2,16);
  return(
    <div onClick={e=>{e.stopPropagation();onClick();}} style={{
      position:"absolute",
      top,left:`calc(${(col/cols)*100}% + 2px)`,
      width:`calc(${100/cols}% - 4px)`,height,
      background:`${color}1a`,borderLeft:`2px solid ${color}`,
      borderRadius:5,padding:"2px 5px",cursor:"pointer",overflow:"hidden",zIndex:2+col,
      transition:"background 0.12s",boxSizing:"border-box",
    }}
    onMouseEnter={e=>e.currentTarget.style.background=`${color}35`}
    onMouseLeave={e=>e.currentTarget.style.background=`${color}1a`}>
      <div style={{fontSize:9,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.3}}>
        {isTask?"⬡ ":""}{item.title}
      </div>
      {height>28&&<div style={{fontSize:8,color:C.textMuted}}>{fmtT(item.startHour,item.startMin)}{item.duration?` · ${fmtD(item.duration)}`:""}</div>}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Syncn(){
  const [tasks,setTasks]=useState(INIT_TASKS);
  const [gcalEvents,setGcalEvents]=useState(INIT_GCAL);
  const [screen,setScreen]=useState("mission"); // mission|today|lifemap|calendar|compass
  const [weekOffset,setWeekOffset]=useState(0);
  const [selectedPillar,setSelectedPillar]=useState(null);
  const [selectedSub,setSelectedSub]=useState(null);
  const [selected,setSelected]=useState(null); // {type,item}
  const [addModal,setAddModal]=useState(null);
  const [newItem,setNewItem]=useState({});
  const [addProjectModal,setAddProjectModal]=useState(false);
  const [newProject,setNewProject]=useState({pillar:"film",name:""});
  const [customSubs,setCustomSubs]=useState({});
  const [energyProfile,setEnergyProfile]=useState(DEFAULT_ENERGY);
  const [energyModal,setEnergyModal]=useState(false);
  const [compassMsgs,setCompassMsgs]=useState([]);
  const [compassInput,setCompassInput]=useState("");
  const [compassLoading,setCompassLoading]=useState(false);
  const [memory,setMemory]=useState(loadMemory);
  const [briefingDone,setBriefingDone]=useState(false);
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

  const todayTasks=scheduledTasks.filter(t=>t.dayOffset===0);
  const todayEvents=gcalEvents.filter(e=>e.dayOffset===0);
  const todayAll=[
    ...todayTasks.map(t=>({...t,_type:"task",_color:PILLARS[t.pillar]?.color||C.cyan})),
    ...todayEvents.map(e=>({...e,_type:"event",_color:e.calType==="family"?PILLARS.family.color:C.cyan})),
  ].sort((a,b)=>(a.startHour*60+a.startMin)-(b.startHour*60+b.startMin));

  const allSubs=(pid)=>[...(PILLARS[pid]?.sub||[]),...(customSubs[pid]||[])];

  const visibleTasks=tasks.filter(t=>{
    if(selectedPillar&&t.pillar!==selectedPillar) return false;
    if(selectedSub&&t.sub!==selectedSub) return false;
    if(filterStatus!=="all"&&t.status!==filterStatus) return false;
    if(search&&!t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Pillar time balance
  const pillarBalance=Object.keys(PILLARS).map(pid=>{
    const pt=tasks.filter(t=>t.pillar===pid);
    const totalMins=pt.filter(t=>t.scheduled).reduce((a,t)=>a+t.duration,0);
    return {pid,mins:totalMins};
  });
  const totalMins=pillarBalance.reduce((a,b)=>a+b.mins,1);
  const pillarPct=(pid)=>Math.round((pillarBalance.find(p=>p.pid===pid)?.mins||0)/totalMins*100);

  // Low-attention warnings
  const warnings=Object.entries(PILLARS).filter(([pid])=>{
    if(pid==="parking") return false;
    return pillarPct(pid)<5&&tasks.filter(t=>t.pillar===pid&&!t.done).length>0;
  }).map(([pid,meta])=>({pid,meta}));

  // ── Sync Calendar ─────────────────────────────────────────────────────────
  const syncCalendar=useCallback(async()=>{
    setCalLoading(true); setCalError(null);
    try{
      const res=await fetch("/.netlify/functions/sync-calendar");
      if(!res.ok) throw new Error("Sync failed");
      const raw=await res.json();
      const weekMon=getWeekStart(0);
      const today=new Date(); today.setHours(0,0,0,0);
      const events=raw.map(e=>{
        const ed=new Date(weekMon); ed.setDate(weekMon.getDate()+(e.dayIdx||0));
        return {...e,dayOffset:Math.round((ed-today)/(864e5))};
      });
      setGcalEvents(events);
    }catch(e){ setCalError("Sync failed."); }
    setCalLoading(false);
  },[]);

  // ── AI Schedule ───────────────────────────────────────────────────────────
  const autoSchedule=useCallback(async()=>{
    const toSched=unscheduled.filter(t=>t.priority!=="Low").slice(0,10);
    if(!toSched.length) return;
    setScheduling(true);
    const occupied=[
      ...scheduledTasks.map(t=>({dayOffset:t.dayOffset,startHour:t.startHour,startMin:t.startMin,duration:t.duration})),
      ...gcalEvents.map(e=>({dayOffset:e.dayOffset,startHour:e.startHour,startMin:e.startMin,duration:e.duration})),
    ];
    // Energy-aware: prefer high energy hours for high priority tasks
    const energyCtx=Object.entries(energyProfile).map(([h,e])=>`${h}:00=${e}/10`).join(", ");
    const prompt=`Schedule these tasks across the next 7 days (dayOffset 0=today). Hours 7am-8pm. No overlaps. High priority tasks during high energy hours. Energy profile: ${energyCtx}. Min 15min gap. Return ONLY JSON: [{"id":N,"dayOffset":0-6,"startHour":7-19,"startMin":0}]\n\nExisting:${JSON.stringify(occupied)}\nTasks:${JSON.stringify(toSched.map(t=>({id:t.id,title:t.title,priority:t.priority,duration:t.duration,pillar:t.pillar})))}`;
    try{
      const reply=await callClaude([{role:"user",content:prompt}],"Scheduling AI. Return only valid JSON. No markdown.");
      const parsed=JSON.parse(reply.replace(/```json|```/g,"").trim());
      setTasks(prev=>prev.map(t=>{ const s=parsed.find(x=>x.id===t.id); return s?{...t,scheduled:true,dayOffset:s.dayOffset,startHour:s.startHour,startMin:s.startMin}:t; }));
    }catch(e){console.error(e);}
    setScheduling(false);
  },[unscheduled,scheduledTasks,gcalEvents,energyProfile]);

  // ── Compass ──────────────────────────────────────────────────────────────
  const buildCompassContext=()=>{
    const mem=loadMemory();
    const pillarStats=Object.keys(PILLARS).map(pid=>{
      const pt=tasks.filter(t=>t.pillar===pid&&!t.done);
      const high=pt.filter(t=>t.priority==="High").length;
      const pct=pillarPct(pid);
      return `${PILLARS[pid].label}: ${pt.length} tasks (${high} urgent), ${pct}% of scheduled time`;
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

YOUR ROLE: Purpose coach and accountability partner. Not a task manager cheerleader.

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

Tone: Smart. Direct. Calm. Occasionally witty. Never a pushover.`;

  const sendToCompass=async(msg)=>{
    if(!msg.trim()||compassLoading) return;
    const userMsg={role:"user",content:msg};
    const msgs=[...compassMsgs,userMsg];
    setCompassMsgs(msgs); setCompassInput(""); setCompassLoading(true);
    const ctx=buildCompassContext();
    try{
      const reply=await callClaude(msgs,`${compassSystem}\n\nCURRENT DATA:\n${ctx}`);
      setCompassMsgs(p=>[...p,{role:"assistant",content:reply}]);
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
  const toggleDone=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const deleteTask=id=>{setTasks(p=>p.filter(t=>t.id!==id));setSelected(null);};
  const postponeTask=id=>setTasks(p=>p.map(t=>t.id===id?{...t,postponeCount:(t.postponeCount||0)+1,scheduled:false,dayOffset:null,startHour:null,startMin:null}:t));
  const unscheduleTask=id=>setTasks(p=>p.map(t=>t.id===id?{...t,scheduled:false,dayOffset:null,startHour:null,startMin:null}:t));

  const handleAdd=()=>{
    if(!newItem.title?.trim()) return;
    if(addModal==="event"){
      setGcalEvents(p=>[...p,{id:`manual-${nextId++}`,calType:"work",dayOffset:0,...newItem}]);
    } else if(addModal==="block"){
      setGcalEvents(p=>[...p,{id:`block-${nextId++}`,calType:"block",title:newItem.title,dayOffset:newItem.dayOffset??0,startHour:newItem.startHour??9,startMin:newItem.startMin??0,duration:newItem.duration??60,location:"",attendees:"",htmlLink:""}]);
    } else {
      setTasks(p=>[...p,{id:nextId++,done:false,scheduled:false,dayOffset:null,startHour:null,startMin:null,postponeCount:0,blockerSurfaced:false,...newItem}]);
    }
    setAddModal(null);
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
      <div style={{background:C.bgCard,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 16px",height:48,gap:8,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginRight:10}}>
          <Logo size={24}/>
          <span style={{fontSize:14,fontWeight:800,letterSpacing:-0.5}}>Sync<span style={{color:C.cyan}}>'n</span></span>
        </div>

        {/* Nav */}
        <div style={{display:"flex",gap:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:2}}>
          {[["mission","⚡ Mission"],["today","📋 Today"],["lifemap","🗺 Life Map"],["calendar","📅 Calendar"],["compass","✦ Compass"]].map(([s,l])=>(
            <button key={s} onClick={()=>setScreen(s)} style={{
              padding:"4px 11px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
              background:screen===s?C.bgSurface:"transparent",
              color:screen===s?(s==="compass"?C.cyan:C.text):C.textMuted,
              boxShadow:screen===s&&s==="compass"?`0 0 8px ${C.cyanGlow}`:"none",
              transition:"all 0.12s"
            }}>{l}</button>
          ))}
        </div>

        {/* Quick search */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks…"
          style={{...inp,width:150,border:`1px solid ${C.border}`,marginLeft:4}}/>

        {/* Actions */}
        <div style={{marginLeft:"auto",display:"flex",gap:7,alignItems:"center"}}>
          {/* Warnings */}
          {warnings.length>0&&(
            <div style={{fontSize:10,color:C.medium,background:`${C.medium}12`,border:`1px solid ${C.medium}40`,borderRadius:6,padding:"3px 8px"}}>
              ⚠ {warnings[0].meta.label} needs attention
            </div>
          )}

          {/* Sync */}
          <button onClick={syncCalendar} disabled={calLoading} style={{...btn(calLoading?C.bgSurface:`${C.cyan}14`,calLoading?C.textMuted:C.cyan,calLoading?C.border:C.cyanDim),fontSize:10}}>
            {calLoading?"⟳":"↻"} Sync
          </button>

          {/* AI Schedule */}
          {unscheduled.filter(t=>t.priority!=="Low").length>0&&(
            <button onClick={autoSchedule} disabled={scheduling} style={{...btn(scheduling?C.bgSurface:`${C.cyan}14`,scheduling?C.textMuted:C.cyan,C.cyanDim),fontSize:10}}>
              {scheduling?"⟳ Scheduling…":`✦ AI Schedule (${unscheduled.filter(t=>t.priority!=="Low").length})`}
            </button>
          )}

          {/* Check-in */}
          <button onClick={checkIn} style={{...btn(`${C.cyan}18`,C.cyan,C.cyanDim),fontSize:10}}>✦ Check In</button>

          {/* Add Task */}
          <button onClick={()=>{setNewItem({pillar:"film",sub:"CROWE",title:"",priority:"High",duration:60,status:"active",notes:"",deadline:""});setAddModal("task");}}
            style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:"#000",border:"none",borderRadius:7,padding:"5px 14px",fontSize:11,fontWeight:800,cursor:"pointer"}}>+ Task</button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* LEFT SIDEBAR */}
        <div style={{width:180,background:C.bgCard,borderRight:`1px solid ${C.border}`,overflowY:"auto",flexShrink:0,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"10px 8px",flex:1}}>
            {Object.entries(PILLARS).map(([pid,meta])=>{
              const isActive=selectedPillar===pid;
              const ct=tasks.filter(t=>t.pillar===pid&&!t.done&&t.status!=="parked").length;
              const subs=allSubs(pid);
              return(
                <div key={pid}>
                  <button onClick={()=>{setSelectedPillar(isActive?null:pid);setSelectedSub(null);}} style={{
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
                    <button key={sub} onClick={()=>setSelectedSub(selectedSub===sub?null:sub)} style={{
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
          {/* Energy setup */}
          <button onClick={()=>setEnergyModal(true)} style={{
            margin:"8px",background:C.bgSurface,border:`1px solid ${C.border}`,borderRadius:7,
            padding:"7px 10px",fontSize:10,color:C.textMuted,cursor:"pointer",textAlign:"left"
          }}>
            ⚡ Energy Profile
            <div style={{fontSize:8,color:C.textFaint,marginTop:2}}>Set your peak hours</div>
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>

          {/* ══ MISSION CONTROL ══════════════════════════════════════════════ */}
          {screen==="mission"&&(
            <div style={{flex:1,overflowY:"auto",padding:"28px 32px"}}>
              <div style={{maxWidth:820,margin:"0 auto"}}>
                {/* Header */}
                <div style={{marginBottom:28}}>
                  <div style={{fontSize:11,color:C.textMuted,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>
                    {new Date().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                  </div>
                  <h1 style={{margin:0,fontSize:28,fontWeight:800,letterSpacing:-1,color:C.text,lineHeight:1.1}}>
                    Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, Brendan.
                  </h1>
                  <div style={{fontSize:13,color:C.textMuted,marginTop:6}}>
                    {unscheduled.filter(t=>t.priority==="High").length} urgent tasks unscheduled · {todayAll.length} items today · {gcalEvents.length} calendar events this week
                  </div>
                </div>

                {/* Start briefing CTA */}
                {!briefingDone&&(
                  <div style={{background:`linear-gradient(135deg,${C.bgCard},${C.bgSurface})`,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 24px",marginBottom:24,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${C.cyan},${PILLARS.film.color})`}}/>
                    <div style={{fontSize:11,color:C.cyan,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>✦ Daily Briefing Ready</div>
                    <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14}}>Compass has analysed your day. Start your morning briefing.</div>
                    <button onClick={startMorningBriefing} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:"#000",border:"none",borderRadius:8,padding:"9px 20px",fontSize:12,fontWeight:800,cursor:"pointer"}}>
                      Start Morning Briefing →
                    </button>
                  </div>
                )}

                {/* Stats grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
                  {[
                    {label:"Urgent Unscheduled",value:unscheduled.filter(t=>t.priority==="High").length,color:C.high,sub:"Need time blocks"},
                    {label:"Today's Tasks",value:todayTasks.length,color:C.cyan,sub:"Scheduled today"},
                    {label:"Meetings Today",value:todayEvents.length,color:PILLARS.family.color,sub:"Calendar events"},
                    {label:"Life Pillars",value:Object.keys(PILLARS).length-1,color:PILLARS.growth.color,sub:`${warnings.length} need attention`},
                  ].map(s=>(
                    <div key={s.label} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:11,padding:"14px 16px"}}>
                      <div style={{fontSize:24,fontWeight:800,color:s.color,marginBottom:2}}>{s.value}</div>
                      <div style={{fontSize:11,color:C.text,fontWeight:600}}>{s.label}</div>
                      <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Two columns: Today + Urgent */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
                  {/* Today */}
                  <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:12}}>Today's Schedule</div>
                    {todayAll.length===0?(
                      <div style={{fontSize:12,color:C.textFaint,padding:"10px 0"}}>Nothing scheduled.{unscheduled.length>0?" Hit AI Schedule.":""}</div>
                    ):todayAll.slice(0,6).map(item=>(
                      <div key={item.id} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.borderLight}`}}>
                        <div style={{width:44,flexShrink:0,textAlign:"right"}}>
                          <span style={{fontSize:9,color:C.textFaint}}>{fmtT(item.startHour,item.startMin)}</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,fontWeight:600,color:C.text,lineHeight:1.3}}>{item.title}</div>
                          <div style={{fontSize:9,color:item._color,marginTop:1}}>{fmtD(item.duration)}{item._type==="task"?` · ${PILLARS[item.pillar]?.label}`:" · Meeting"}</div>
                        </div>
                        <div style={{width:6,height:6,borderRadius:"50%",background:item._color,marginTop:3,flexShrink:0}}/>
                      </div>
                    ))}
                    {todayAll.length>6&&<div style={{fontSize:10,color:C.textMuted,marginTop:4}}>+{todayAll.length-6} more → Today view</div>}
                  </div>

                  {/* Urgent queue */}
                  <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.5}}>Urgent Queue</div>
                      {unscheduled.filter(t=>t.priority==="High").length>0&&(
                        <button onClick={autoSchedule} disabled={scheduling} style={{fontSize:9,background:`${C.cyan}18`,color:C.cyan,border:`1px solid ${C.cyanDim}`,borderRadius:5,padding:"2px 8px",cursor:"pointer",fontWeight:700}}>
                          {scheduling?"⟳":"✦ Schedule All"}
                        </button>
                      )}
                    </div>
                    {unscheduled.filter(t=>t.priority==="High").slice(0,6).map(task=>(
                      <div key={task.id} onClick={()=>setSelected({type:"task",item:task})} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,padding:"6px 8px",background:C.bgSurface,borderRadius:6,cursor:"pointer",borderLeft:`2px solid ${PILLARS[task.pillar]?.color||C.cyan}`}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,fontWeight:600,color:C.text,lineHeight:1.2}}>{task.title}</div>
                          <div style={{fontSize:9,color:C.textMuted,marginTop:1}}>{PILLARS[task.pillar]?.label} · {fmtD(task.duration)}</div>
                        </div>
                        {task.postponeCount>0&&<span style={{fontSize:8,color:C.high}}>↩{task.postponeCount}</span>}
                      </div>
                    ))}
                    {unscheduled.filter(t=>t.priority==="High").length===0&&(
                      <div style={{fontSize:12,color:C.textFaint,padding:"10px 0"}}>No urgent unscheduled tasks. Rare. Enjoy it.</div>
                    )}
                  </div>
                </div>

                {/* Life balance strip */}
                <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:14}}>Life Balance This Week</div>
                  <div style={{display:"flex",gap:0,height:8,borderRadius:4,overflow:"hidden",marginBottom:10}}>
                    {Object.entries(PILLARS).filter(([pid])=>pid!=="parking").map(([pid,meta])=>{
                      const pct=pillarPct(pid);
                      return pct>0?<div key={pid} style={{flex:pct,background:meta.color,transition:"flex 0.6s"}} title={`${meta.label}: ${pct}%`}/>:null;
                    })}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {Object.entries(PILLARS).filter(([pid])=>pid!=="parking").map(([pid,meta])=>(
                      <div key={pid} style={{display:"flex",alignItems:"center",gap:4}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:meta.color}}/>
                        <span style={{fontSize:9,color:C.textMuted}}>{meta.label} {pillarPct(pid)}%</span>
                      </div>
                    ))}
                  </div>
                  {warnings.length>0&&(
                    <div style={{marginTop:12,padding:"8px 10px",background:`${C.medium}10`,border:`1px solid ${C.medium}30`,borderRadius:7}}>
                      {warnings.map(w=>(
                        <div key={w.pid} style={{fontSize:11,color:C.medium,display:"flex",alignItems:"center",gap:6}}>
                          <span>{w.meta.icon}</span>
                          <span><strong>{w.meta.label}</strong> has received less than 5% of your time this week.</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ TODAY VIEW ═══════════════════════════════════════════════════ */}
          {screen==="today"&&(
            <div style={{flex:1,overflowY:"auto",padding:"20px 28px"}}>
              <div style={{maxWidth:760,margin:"0 auto"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                  <h2 style={{margin:0,fontSize:20,fontWeight:800,letterSpacing:-0.5}}>{new Date().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}</h2>
                  <button onClick={checkIn} style={{marginLeft:"auto",...btn(`${C.cyan}18`,C.cyan,C.cyanDim),fontSize:10}}>✦ Check In with Compass</button>
                  {unscheduled.length>0&&<button onClick={autoSchedule} disabled={scheduling} style={{...btn(`${C.cyan}14`,C.cyan,C.cyanDim),fontSize:10}}>{scheduling?"⟳":"✦ AI Schedule My Day"}</button>}
                </div>

                {/* Hourly timeline */}
                <div style={{position:"relative"}}>
                  {HOURS.filter(h=>h>=6&&h<=22).map(h=>{
                    const items=todayAll.filter(e=>e.startHour===h);
                    const now=new Date();
                    const isPast=h<now.getHours();
                    const isCurrent=h===now.getHours();
                    const energy=energyProfile[h]||5;
                    return(
                      <div key={h} style={{display:"flex",gap:10,marginBottom:3,opacity:isPast?0.4:1}}>
                        <div style={{width:52,flexShrink:0,textAlign:"right",paddingTop:9,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                          <span style={{fontSize:9,color:isCurrent?C.cyan:C.textFaint,fontWeight:isCurrent?700:400}}>{fmtT(h,0)}</span>
                          <EnergyDot level={energy}/>
                        </div>
                        <div style={{flex:1,borderLeft:`1px solid ${isCurrent?C.cyan:C.border}`,paddingLeft:10,paddingTop:4,minHeight:36}}>
                          {items.map(item=>(
                            <div key={item.id} onClick={()=>setSelected({type:item._type==="task"?"task":"event",item})}
                              style={{background:`${item._color}14`,border:`1px solid ${item._color}30`,borderLeft:`3px solid ${item._color}`,borderRadius:7,padding:"7px 11px",marginBottom:4,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                              <div style={{flex:1}}>
                                <div style={{fontSize:12,fontWeight:700,color:C.text}}>{item.title}</div>
                                <div style={{fontSize:9,color:C.textMuted,marginTop:2}}>
                                  {fmtT(item.startHour,item.startMin)} · {fmtD(item.duration)}
                                  {item._type==="task"?` · ${PILLARS[item.pillar]?.label}`:" · Meeting"}
                                  {item.attendees?` · ${item.attendees}`:""}
                                </div>
                              </div>
                              {item._type==="task"&&(
                                <div style={{display:"flex",gap:5}}>
                                  <div onClick={e=>{e.stopPropagation();toggleDone(item.id);}} style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${item.done?C.done:C.textFaint}`,background:item.done?C.done:"transparent",cursor:"pointer",display:"grid",placeItems:"center"}}>
                                    {item.done&&<span style={{color:C.bg,fontSize:8,fontWeight:900}}>✓</span>}
                                  </div>
                                  <button onClick={e=>{e.stopPropagation();postponeTask(item.id);}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,color:C.textFaint,fontSize:9,cursor:"pointer",padding:"0 5px"}}>↩</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pinned next action */}
                {unscheduled.filter(t=>t.priority==="High").length>0&&(
                  <div style={{position:"sticky",bottom:16,marginTop:16,background:`${C.bgCard}ee`,backdropFilter:"blur(10px)",border:`1px solid ${C.cyan}40`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:C.cyan,fontWeight:700,marginBottom:3}}>NEXT UNSCHEDULED PRIORITY</div>
                      <div style={{fontSize:13,fontWeight:700,color:C.text}}>{unscheduled.filter(t=>t.priority==="High")[0]?.title}</div>
                    </div>
                    <button onClick={autoSchedule} style={{...btn(`${C.cyan}`,C.bg,C.cyan),fontSize:11}}>✦ Schedule Now</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ LIFE MAP ═════════════════════════════════════════════════════ */}
          {screen==="lifemap"&&(
            <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
              <div style={{maxWidth:900,margin:"0 auto"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                  <h2 style={{margin:0,fontSize:20,fontWeight:800,letterSpacing:-0.5}}>Life Map</h2>
                  <span style={{fontSize:12,color:C.textMuted}}>Your pillars at a glance</span>
                  <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...inp,width:"auto",marginLeft:"auto",fontSize:11}}>
                    <option value="all">All Tasks</option>
                    <option value="active">🔥 Active</option>
                    <option value="upcoming">🟡 Upcoming</option>
                  </select>
                </div>

                {/* Pillar grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
                  {Object.entries(PILLARS).map(([pid,meta])=>(
                    <PillarRing key={pid} pid={pid} pillar={meta} tasks={tasks} onSelect={setSelectedPillar} selected={selectedPillar}/>
                  ))}
                </div>

                {/* Drill-down */}
                {selectedPillar&&(()=>{
                  const meta=PILLARS[selectedPillar];
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
                            <div key={sub} onClick={()=>setSelectedSub(selectedSub===sub?null:sub)}
                              style={{background:selectedSub===sub?`${meta.color}14`:C.bgSurface,border:`1px solid ${selectedSub===sub?meta.color:C.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer"}}>
                              <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:5}}>{sub}</div>
                              <div style={{height:3,background:C.border,borderRadius:2,marginBottom:5,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${pct}%`,background:meta.color,borderRadius:2}}/>
                              </div>
                              <div style={{fontSize:10,color:C.textMuted}}>{st.length} tasks · {pct}% done</div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Tasks in this pillar */}
                      <div style={{display:"flex",flexDirection:"column",gap:3}}>
                        {visibleTasks.filter(t=>t.pillar===selectedPillar).map(task=>(
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
                <button onClick={()=>{setNewItem({title:"",dayOffset:0,startHour:9,startMin:0,duration:60});setAddModal("event");}} style={{marginLeft:"auto",...btn(`${C.cyan}14`,C.cyan,C.cyanDim),fontSize:10}}>+ Meeting</button>
              </div>

              {/* Day headers */}
              <div style={{display:"grid",gridTemplateColumns:"44px repeat(7,1fr)",background:C.bgCard,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
                <div/>
                {dayDates.map((date,i)=>{
                  const isToday=todayCol===i;
                  const isWeekend=i>=5;
                  return(
                    <div key={i} style={{textAlign:"center",padding:"6px 2px",borderLeft:`1px solid ${C.borderLight}`,background:isWeekend?`${C.bgSurface}66`:"transparent"}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:isToday?C.cyan:isWeekend?C.textFaint:C.textMuted}}>{DAY_NAMES[i]}</div>
                      <div style={{fontSize:14,fontWeight:700,width:26,height:26,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",marginTop:2,color:isToday?"#000":C.text,background:isToday?C.cyan:"transparent",boxShadow:isToday?`0 0 12px ${C.cyanGlow}`:"none"}}>{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Grid */}
              <div ref={calScrollRef} style={{flex:1,overflowY:"auto"}}>
                <div style={{display:"grid",gridTemplateColumns:"44px repeat(7,1fr)",height:HOURS.length*HOUR_H}}>
                  <div style={{position:"relative"}}>
                    {HOURS.map(h=>(
                      <div key={h} style={{position:"absolute",top:px(h),right:5}}>
                        <span style={{fontSize:8,color:C.textFaint}}>{fmtT(h,0)}</span>
                      </div>
                    ))}
                  </div>
                  {dayDates.map((date,colIdx)=>{
                    const isToday=todayCol===colIdx;
                    const isWeekend=colIdx>=5;
                    const today=new Date(); today.setHours(0,0,0,0);
                    const dayOff=Math.round((date-today)/(864e5));
                    const colTasks=scheduledTasks.filter(t=>t.dayOffset===dayOff);
                    const colEvents=gcalEvents.filter(e=>e.dayOffset===dayOff);
                    const allItems=[...colTasks.map(t=>({...t,_isTask:true})),...colEvents.map(e=>({...e,_isTask:false}))];
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
                            ?(PILLARS[item.pillar]?.color||C.cyan)
                            :item.calType==="family"?PILLARS.family.color
                            :item.calType==="block"?"#555":C.cyan;
                          return(
                            <CalBlock key={item.id} item={item} color={color} col={item.col} cols={item.cols} isTask={item._isTask}
                              onClick={()=>setSelected({type:item._isTask?"task":"event",item})}/>
                          );
                        })}
                        {isToday&&(()=>{
                          const now=new Date(); const top=px(now.getHours(),now.getMinutes());
                          return top>0&&top<HOURS.length*HOUR_H?(
                            <div style={{position:"absolute",top,left:0,right:0,zIndex:10,display:"flex",alignItems:"center",pointerEvents:"none"}}>
                              <div style={{width:7,height:7,borderRadius:"50%",background:C.cyan,marginLeft:-3,boxShadow:`0 0 6px ${C.cyan}`}}/>
                              <div style={{flex:1,height:1.5,background:C.cyan,opacity:0.7}}/>
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
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",maxWidth:"100%"}}>
                    {m.role==="assistant"&&<div style={{width:24,height:24,borderRadius:"50%",background:`${C.cyan}18`,border:`1px solid ${C.cyanDim}`,display:"grid",placeItems:"center",marginRight:8,flexShrink:0,marginTop:2}}>
                      <span style={{fontSize:10}}>✦</span>
                    </div>}
                    <div style={{
                      maxWidth:"75%",padding:"10px 14px",
                      borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",
                      background:m.role==="user"?`${C.cyan}18`:C.bgCard,
                      border:`1px solid ${m.role==="user"?C.cyanDim:C.border}`,
                      color:m.role==="user"?C.cyanBright:C.text,
                      fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap",
                    }}>{m.content}</div>
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
              const meta=PILLARS[t.pillar];
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
                {(e.id?.startsWith("manual-")||e.id?.startsWith("block-"))&&(
                  <button onClick={()=>{setGcalEvents(p=>p.filter(x=>x.id!==e.id));setSelected(null);}} style={{display:"block",marginTop:10,...btn("none",C.high,C.high)}}>Delete</button>
                )}
              </>);
            })()}
          </div>
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {addModal&&(
        <div onClick={()=>setAddModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:460,maxWidth:"92vw",boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:800,color:C.text}}>
              {addModal==="task"?"New Task":addModal==="event"?"New Meeting":"Block Time"}
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <input autoFocus value={newItem.title||""} onChange={e=>setNewItem(n=>({...n,title:e.target.value}))}
                placeholder={addModal==="task"?"What needs doing?":addModal==="event"?"Meeting title…":"What are you blocking?"}
                style={{...inp,fontSize:13,padding:"10px 12px"}}/>
              {addModal==="task"&&(<>
                <div style={{display:"flex",gap:8}}>
                  <select value={newItem.pillar||"film"} onChange={e=>setNewItem(n=>({...n,pillar:e.target.value,sub:""}))} style={{...inp,flex:1}}>
                    {Object.entries(PILLARS).map(([pid,m])=><option key={pid} value={pid}>{m.icon} {m.label}</option>)}
                  </select>
                  <select value={newItem.priority||"High"} onChange={e=>setNewItem(n=>({...n,priority:e.target.value}))} style={{...inp,width:110}}>
                    {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <select value={newItem.sub||""} onChange={e=>setNewItem(n=>({...n,sub:e.target.value}))} style={{...inp,flex:1}}>
                    <option value="">Select sub-pillar…</option>
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
                  <input type="number" value={newItem.duration||60} min={15} step={15} onChange={e=>setNewItem(n=>({...n,duration:parseInt(e.target.value)||60}))} style={{...inp,width:70}}/>
                  <label style={{fontSize:11,color:C.textMuted}}>Deadline</label>
                  <input type="date" value={newItem.deadline||""} onChange={e=>setNewItem(n=>({...n,deadline:e.target.value}))} style={{...inp,flex:1}}/>
                </div>
                <textarea value={newItem.notes||""} onChange={e=>setNewItem(n=>({...n,notes:e.target.value}))} placeholder="Notes (optional)" rows={2} style={{...inp,resize:"none"}}/>
              </>)}
              {(addModal==="event"||addModal==="block")&&(<>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Day (0=today)</label>
                  <input type="number" value={newItem.dayOffset??0} min={0} max={30} onChange={e=>setNewItem(n=>({...n,dayOffset:parseInt(e.target.value)||0}))} style={{...inp,width:70}}/>
                  <input type="time" defaultValue={`${String(newItem.startHour??9).padStart(2,"0")}:00`}
                    onChange={e=>{const[h,m]=e.target.value.split(":").map(Number);setNewItem(n=>({...n,startHour:h,startMin:m}));}}
                    style={{...inp,flex:1}}/>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <label style={{fontSize:11,color:C.textMuted}}>Duration (min)</label>
                  <input type="number" value={newItem.duration||60} min={15} step={15} onChange={e=>setNewItem(n=>({...n,duration:parseInt(e.target.value)||60}))} style={{...inp,width:80}}/>
                </div>
              </>)}
            </div>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button onClick={handleAdd} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 20px",fontSize:12,fontWeight:800,cursor:"pointer"}}>
                {addModal==="task"?"Add Task":addModal==="event"?"Add Meeting":"Block Time"}
              </button>
              <button onClick={()=>setAddModal(null)} style={{...btn(C.bgSurface,C.textMuted,C.border)}}>Cancel</button>
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
                {Object.entries(PILLARS).map(([pid,m])=><option key={pid} value={pid}>{m.icon} {m.label}</option>)}
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

      {/* ── ENERGY PROFILE MODAL ── */}
      {energyModal&&(
        <div onClick={()=>setEnergyModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:16,padding:24,width:420,boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px ${C.border}`}}>
            <h3 style={{margin:"0 0 6px",fontSize:15,fontWeight:800,color:C.text}}>Energy Profile</h3>
            <div style={{fontSize:11,color:C.textMuted,marginBottom:16}}>Rate your typical energy at each hour (1–10). AI uses this to schedule high-priority work during your peak hours.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxHeight:320,overflowY:"auto"}}>
              {Object.entries(energyProfile).sort((a,b)=>+a[0]-+b[0]).map(([h,e])=>(
                <div key={h} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:C.textMuted,width:46,flexShrink:0}}>{fmtT(+h,0)}</span>
                  <input type="range" min={1} max={10} value={e} onChange={ev=>setEnergyProfile(p=>({...p,[h]:+ev.target.value}))} style={{flex:1}}/>
                  <EnergyDot level={e}/>
                  <span style={{fontSize:10,color:C.textMuted,width:14}}>{e}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setEnergyModal(false)} style={{marginTop:16,background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"9px 20px",fontSize:12,fontWeight:800,cursor:"pointer"}}>Save Profile</button>
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

      <style>{`
        @keyframes blink{0%,100%{opacity:.15}50%{opacity:1}}
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

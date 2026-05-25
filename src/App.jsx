import { useState, useEffect, useRef, useCallback } from "react";

// ─── BRAND ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#0a0e1a",bgCard:"#0f1422",bgSurface:"#131929",bgHover:"#1a2235",
  border:"#1e2a40",borderLight:"#162030",
  text:"#f0f4ff",textMuted:"#6b7fa3",textFaint:"#3a4a6a",
  cyan:"#00b4d8",cyanDim:"#0090b0",cyanGlow:"#00b4d820",cyanBright:"#38d4f5",
  high:"#e05c5c",medium:"#d4a843",low:"#4db88a",done:"#4db88a",parked:"#4a7fa0",
};

const TIER_META = {
  1:{label:"Film & Career",icon:"🎬",color:"#00b4d8"},
  2:{label:"Shadow Wolves",icon:"🐺",color:"#5b8dd9"},
  3:{label:"SLATR",icon:"⚡",color:"#9b6dce"},
  4:{label:"SPOT'D",icon:"📍",color:"#4db88a"},
  5:{label:"PITCH'D",icon:"🎯",color:"#d4a843"},
  6:{label:"Producer's Playbook",icon:"📖",color:"#e07a5c"},
  7:{label:"Work / Income",icon:"💼",color:"#6db8b8"},
  8:{label:"Online Products",icon:"🛒",color:"#8fb85c"},
  9:{label:"Kids / Creative",icon:"🎨",color:"#b88a6d"},
  10:{label:"Follow-Ups",icon:"✅",color:"#4db88a"},
  11:{label:"Parking Lot",icon:"❄️",color:"#4a7fa0"},
};

// ─── DATA ────────────────────────────────────────────────────────────────────
let uid=1;
const T=(tier,project,title,status="active",priority="Medium",dur=45,notes="")=>
  ({id:uid++,tier,project,title,status,priority,duration:dur,notes,done:false,
    scheduled:false,dayOffset:null,startHour:null,startMin:null,deadline:""});

const INIT_TASKS=[
  T(1,"CROWE","Finalize synopsis completely","active","High",60,"Thriller/elevated horror"),
  T(1,"CROWE","Finalize deck order and structure","active","High",90),
  T(1,"CROWE","Finalize executive summary page","active","High",45),
  T(1,"CROWE","Build investor version deck","active","High",120),
  T(1,"CROWE","Build distributor version deck","active","High",90),
  T(1,"CROWE","Build talent attachment deck","active","Medium",90),
  T(1,"CROWE","Create financing strategy sheet","active","High",60),
  T(1,"CROWE","Draft outreach packages","active","High",90),
  T(1,"CROWE","Research Australian productions/casting","active","Medium",60),
  T(1,"THUNK","Lock edit timeline","active","High",30),
  T(1,"THUNK","Review assembly cut","active","High",90),
  T(1,"THUNK","Sound design pass","active","High",120),
  T(1,"THUNK","Music direction","active","Medium",60),
  T(1,"THUNK","Festival strategy","active","Medium",60),
  T(1,"THUNK","Finalize mythology bible","active","Medium",90),
  T(1,"BLUE ORCHIDS","Final logline","active","Medium",30,"Sequel to I'm Here Too"),
  T(1,"BLUE ORCHIDS","Final treatment","active","Medium",90),
  T(1,"BLUE ORCHIDS","Beat sheet","active","Medium",90),
  T(1,"THE DEVIL YOU KNOW","Review script status","active","Low",30),
  T(1,"KNIGHT","Review project status","parked","Low",30),
  T(2,"Website","Finish website restructure","active","High",120),
  T(2,"Website","SEO review","active","Medium",60),
  T(2,"Company Structure","Clarify divisions","active","Medium",60),
  T(3,"Core Build","Complete development flow","active","High",120),
  T(3,"Core Build","Scrypto diagnostics flow","active","High",90),
  T(3,"Core Build","SLATR score system","active","High",90),
  T(3,"AI Team","Calli refinement","active","High",60),
  T(3,"AI Team","Scrypto refinement","active","High",60),
  T(3,"UX","Remove over-gating","active","High",45),
  T(4,"Core","Fix email spam issues","active","High",60),
  T(4,"Projects Upgrade","Replace Casting Calls with Projects","active","High",120),
  T(5,"PITCH'D","Launch follow-up","active","High",30),
  T(5,"PITCH'D","Fix bugs","active","High",60),
  T(6,"Playbook","Complete Phase 1","active","High",90),
  T(6,"Playbook","Finish workbook sections","active","High",90),
  T(7,"Teaching","Follow up TAFE contact Craig","upcoming","High",20),
  T(7,"Acting","Continue audition pipeline","upcoming","High",60),
  T(8,"Straight-Talk Studioz","Define product roadmap","upcoming","High",90),
  T(9,"Kids","Imagination Station course review","upcoming","Medium",45),
  T(10,"Follow-Up","Check PITCH'D launch performance","done","High",20),
  T(10,"Follow-Up","Check SPOT'D beta bugs","done","High",20),
  T(11,"Parking Lot","Reality debate show","parked","Low",0),
  T(11,"Parking Lot","Mantra Toys expansion","parked","Low",0),
];

// dayOffset = days from today (0=today,1=tomorrow etc)
const INIT_GCAL=[
  {id:"gcal-1",title:"Old Mate - Brendan & Mitch",dayOffset:0,startHour:10,startMin:30,duration:60,calType:"work",location:"",attendees:"Mitch Savage-Charman",htmlLink:""},
  {id:"gcal-2",title:"Brendan Byrne & Abhay Soni",dayOffset:2,startHour:13,startMin:30,duration:30,calType:"work",location:"Google Meet",attendees:"Abhay Soni",htmlLink:""},
  {id:"fam-2",title:"First Aid Webinar",dayOffset:0,startHour:19,startMin:0,duration:60,calType:"family",location:"",attendees:"",htmlLink:""},
  {id:"fam-3",title:"Dr Lubna Naaz",dayOffset:1,startHour:11,startMin:45,duration:60,calType:"family",location:"29 Fitzgerald St Windsor",attendees:"",htmlLink:""},
  {id:"fam-4",title:"Noa swimming makeup lesson",dayOffset:2,startHour:10,startMin:0,duration:60,calType:"family",location:"",attendees:"",htmlLink:""},
  {id:"fam-5",title:"Madz touch footy",dayOffset:2,startHour:11,startMin:0,duration:180,calType:"family",location:"",attendees:"",htmlLink:""},
  {id:"fam-6",title:"Meeting with Emergent",dayOffset:2,startHour:13,startMin:30,duration:60,calType:"family",location:"",attendees:"",htmlLink:""},
  {id:"fam-7",title:"First Aid - Penrith",dayOffset:3,startHour:9,startMin:30,duration:240,calType:"family",location:"Penrith",attendees:"",htmlLink:""},
  {id:"fam-8",title:"Psych - Barbara",dayOffset:3,startHour:14,startMin:0,duration:60,calType:"family",location:"",attendees:"",htmlLink:""},
  {id:"fam-9",title:"First Aid Webinar",dayOffset:3,startHour:15,startMin:30,duration:60,calType:"family",location:"",attendees:"",htmlLink:""},
  {id:"fam-10",title:"H bday bonfire 🎂",dayOffset:4,startHour:16,startMin:30,duration:300,calType:"family",location:"",attendees:"",htmlLink:""},
];

let nextId=9100;

// ─── UTILS ───────────────────────────────────────────────────────────────────
const HOUR_H=60; // px per hour
const CAL_START=7; // 7am
const CAL_END=22;  // 10pm
const HOURS=Array.from({length:CAL_END-CAL_START},(_,i)=>i+CAL_START);

const px=(h,m=0)=>(h-CAL_START)*HOUR_H+(m/60)*HOUR_H;
const pxH=mins=>(mins/60)*HOUR_H;
const fmtT=(h,m)=>`${h%12||12}:${String(m).padStart(2,"0")}${h<12?"am":"pm"}`;
const fmtD=mins=>mins>=60?`${Math.floor(mins/60)}h${mins%60?` ${mins%60}m`:""}`:mins?`${mins}m`:"";

// Get Monday of current week offset by weekOffset weeks
function getWeekStart(weekOffset=0){
  const now=new Date();
  const day=now.getDay()||7;
  const mon=new Date(now);
  mon.setDate(now.getDate()-(day-1)+(weekOffset*7));
  mon.setHours(0,0,0,0);
  return mon;
}

function getDayDates(weekOffset=0){
  const mon=getWeekStart(weekOffset);
  return Array.from({length:7},(_,i)=>{
    const d=new Date(mon);
    d.setDate(mon.getDate()+i);
    return d;
  });
}

const DAY_NAMES=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// dayOffset from today → which column (0-6) in current week view
function dayOffsetToCol(dayOffset,weekOffset){
  const today=new Date(); today.setHours(0,0,0,0);
  const targetDate=new Date(today); targetDate.setDate(today.getDate()+dayOffset);
  const weekStart=getWeekStart(weekOffset);
  const diff=Math.round((targetDate-weekStart)/(1000*60*60*24));
  return diff>=0&&diff<7?diff:null;
}

// Get today's column in current week
function getTodayCol(weekOffset){
  const today=new Date(); today.setHours(0,0,0,0);
  const weekStart=getWeekStart(weekOffset);
  const diff=Math.round((today-weekStart)/(1000*60*60*24));
  return diff>=0&&diff<7?diff:null;
}

// Compute overlap columns for events on same day
function computeOverlaps(events){
  const result=events.map(e=>({...e,col:0,cols:1}));
  for(let i=0;i<result.length;i++){
    const a=result[i];
    const aStart=a.startHour*60+a.startMin;
    const aEnd=aStart+a.duration;
    let col=0;
    const colsUsed=[];
    for(let j=0;j<i;j++){
      const b=result[j];
      const bStart=b.startHour*60+b.startMin;
      const bEnd=bStart+b.duration;
      if(aStart<bEnd&&aEnd>bStart) colsUsed.push(b.col);
    }
    while(colsUsed.includes(col)) col++;
    result[i].col=col;
  }
  // compute max cols per overlapping group
  for(let i=0;i<result.length;i++){
    const a=result[i];
    const aStart=a.startHour*60+a.startMin;
    const aEnd=aStart+a.duration;
    let maxCol=a.col;
    for(let j=0;j<result.length;j++){
      if(i===j) continue;
      const b=result[j];
      const bStart=b.startHour*60+b.startMin;
      const bEnd=bStart+b.duration;
      if(aStart<bEnd&&aEnd>bStart) maxCol=Math.max(maxCol,b.col);
    }
    result[i].cols=maxCol+1;
  }
  return result;
}

// ─── API ─────────────────────────────────────────────────────────────────────
async function callClaude(messages,system){
  const key=import.meta.env.VITE_ANTHROPIC_KEY;
  if(!key) return "⚠️ No API key. Add VITE_ANTHROPIC_KEY to Netlify environment variables.";
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system,messages}),
  });
  const data=await res.json();
  if(data.error) return `API error: ${data.error.message}`;
  return data.content?.[0]?.text||"";
}

// ─── LOGO ────────────────────────────────────────────────────────────────────
function Logo({size=26}){
  return(
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff"/><stop offset="60%" stopColor="#38d4f5"/><stop offset="100%" stopColor="#0077aa"/>
      </linearGradient></defs>
      <text x="4" y="30" fontSize="32" fontWeight="900" fill="url(#sg)" fontFamily="Georgia,serif">S</text>
    </svg>
  );
}

// ─── CALENDAR BLOCK ───────────────────────────────────────────────────────────
function CalBlock({item,color,onClick,col=0,cols=1,isTask=false}){
  const top=px(item.startHour,item.startMin);
  const height=Math.max(pxH(item.duration)-2,18);
  const w=`calc(${100/cols}% - 4px)`;
  const left=`calc(${(col/cols)*100}% + 2px)`;
  return(
    <div onClick={onClick} style={{
      position:"absolute",top,left,width:w,height,
      background:`${color}22`,borderLeft:`2.5px solid ${color}`,
      borderRadius:5,padding:"2px 5px",cursor:"pointer",overflow:"hidden",zIndex:2+col,
      transition:"background 0.12s",boxSizing:"border-box",
    }}
    onMouseEnter={e=>e.currentTarget.style.background=`${color}40`}
    onMouseLeave={e=>e.currentTarget.style.background=`${color}22`}
    >
      <div style={{fontSize:9,fontWeight:700,color:C.text,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {isTask?"⬡ ":""}{item.title}
      </div>
      {height>30&&<div style={{fontSize:8,color:C.textMuted,marginTop:1}}>{fmtT(item.startHour,item.startMin)}{item.duration?` · ${fmtD(item.duration)}`:""}</div>}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function Syncn(){
  const [tasks,setTasks]=useState(INIT_TASKS);
  const [gcalEvents,setGcalEvents]=useState(INIT_GCAL);
  const [calLoading,setCalLoading]=useState(false);
  const [calError,setCalError]=useState(null);
  const [weekOffset,setWeekOffset]=useState(0);
  const [mainView,setMainView]=useState("today");
  const [activeTier,setActiveTier]=useState(null);
  const [activeProject,setActiveProject]=useState(null);
  const [selected,setSelected]=useState(null);
  const [addModal,setAddModal]=useState(null);
  const [newItem,setNewItem]=useState({});
  const [aiOpen,setAiOpen]=useState(false);
  const [aiMsgs,setAiMsgs]=useState([]);
  const [aiInput,setAiInput]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [scheduling,setScheduling]=useState(false);
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("all");
  const [clickBlock,setClickBlock]=useState(null); // {dayOffset,hour,min}
  const [addProjectModal,setAddProjectModal]=useState(false);
  const [newProject,setNewProject]=useState({tier:1,name:""});
  const chatEnd=useRef(null);
  const calScrollRef=useRef(null);

  useEffect(()=>{ chatEnd.current?.scrollIntoView({behavior:"smooth"}); },[aiMsgs]);

  // Scroll calendar to 7am on load
  useEffect(()=>{
    if(calScrollRef.current) calScrollRef.current.scrollTop=px(8);
  },[mainView]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const dayDates=getDayDates(weekOffset);
  const todayCol=getTodayCol(weekOffset);
  const scheduledTasks=tasks.filter(t=>t.scheduled&&t.dayOffset!==null);
  const unscheduled=tasks.filter(t=>!t.scheduled&&!t.done&&t.tier!==11&&t.duration>0&&t.status!=="parked");
  const pColor={High:C.high,Medium:C.medium,Low:C.low};

  // Today's items
  const todayTasks=scheduledTasks.filter(t=>t.dayOffset===0);
  const todayEvents=gcalEvents.filter(e=>e.dayOffset===0);
  const todayAll=[...todayTasks.map(t=>({...t,_type:"task",color:TIER_META[t.tier]?.color||C.cyan})),
                  ...todayEvents.map(e=>({...e,_type:e.calType==="family"?"family":"work",color:e.calType==="family"?"#b88a6d":C.cyan}))
  ].sort((a,b)=>(a.startHour*60+a.startMin)-(b.startHour*60+b.startMin));

  const visibleTasks=tasks.filter(t=>{
    if(activeTier&&t.tier!==activeTier) return false;
    if(activeProject&&t.project!==activeProject) return false;
    if(filterStatus!=="all"&&t.status!==filterStatus) return false;
    if(search&&!t.title.toLowerCase().includes(search.toLowerCase())&&!t.project.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped={};
  visibleTasks.forEach(t=>{
    if(!grouped[t.tier]) grouped[t.tier]={};
    if(!grouped[t.tier][t.project]) grouped[t.tier][t.project]=[];
    grouped[t.tier][t.project].push(t);
  });

  const tierProjects=activeTier?[...new Set(tasks.filter(t=>t.tier===activeTier).map(t=>t.project))]:[];
  const stats={
    active:tasks.filter(t=>t.status==="active"&&!t.done).length,
    high:tasks.filter(t=>t.priority==="High"&&!t.done&&t.status!=="parked").length,
    unscheduled:unscheduled.length,
    gcal:gcalEvents.length,
  };

  // ── Sync Calendar ─────────────────────────────────────────────────────────
  const syncCalendar=useCallback(async()=>{
    setCalLoading(true); setCalError(null);
    try{
      const res=await fetch("/.netlify/functions/sync-calendar");
      if(!res.ok) throw new Error("Sync failed");
      const raw=await res.json();
      // Convert absolute dates to dayOffset from today
      const today=new Date(); today.setHours(0,0,0,0);
      // raw events use dayIdx (0=Mon of current week) — convert to dayOffset
      const weekMon=getWeekStart(0);
      const events=raw.map(e=>{
        const eventDate=new Date(weekMon);
        eventDate.setDate(weekMon.getDate()+(e.dayIdx||0));
        const offset=Math.round((eventDate-today)/(1000*60*60*24));
        return {...e,dayOffset:offset};
      });
      setGcalEvents(events);
    }catch(e){
      setCalError("Sync failed. Check connection.");
    }
    setCalLoading(false);
  },[]);

  // ── AI Schedule ────────────────────────────────────────────────────────────
  const autoSchedule=useCallback(async()=>{
    const toSched=unscheduled.filter(t=>t.priority!=="Low").slice(0,10);
    if(!toSched.length) return;
    setScheduling(true);
    const occupied=[
      ...scheduledTasks.map(t=>({dayOffset:t.dayOffset,startHour:t.startHour,startMin:t.startMin,duration:t.duration})),
      ...gcalEvents.map(e=>({dayOffset:e.dayOffset,startHour:e.startHour,startMin:e.startMin,duration:e.duration})),
    ];
    const prompt=`Schedule these tasks across the next 5 working days (dayOffset 0=today, 1=tomorrow, up to 6). Hours 8am-6pm. No overlaps with existing blocks. High priority first. Min 15min gap between tasks. Break tasks >90min into multiple sessions if needed.

Return ONLY valid JSON array: [{"id":N,"dayOffset":0-6,"startHour":8-17,"startMin":0}]

Existing blocks: ${JSON.stringify(occupied)}
Tasks to schedule: ${JSON.stringify(toSched.map(t=>({id:t.id,title:t.title,priority:t.priority,duration:t.duration})))}`;
    try{
      const reply=await callClaude([{role:"user",content:prompt}],"You are a scheduling AI. Return only valid JSON arrays. No markdown. No explanation.");
      const clean=reply.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      setTasks(prev=>prev.map(t=>{
        const s=parsed.find(x=>x.id===t.id);
        return s?{...t,scheduled:true,dayOffset:s.dayOffset,startHour:s.startHour,startMin:s.startMin}:t;
      }));
    }catch(e){console.error("Schedule error",e);}
    setScheduling(false);
  },[unscheduled,scheduledTasks,gcalEvents]);

  // ── AI Chat ────────────────────────────────────────────────────────────────
  const buildContext=()=>{
    const topTasks=tasks.filter(t=>t.priority==="High"&&!t.done&&t.status==="active").slice(0,10)
      .map(t=>`[T${t.tier}/${t.project}] ${t.title} (${fmtD(t.duration)}${t.scheduled?`, scheduled day+${t.dayOffset} ${fmtT(t.startHour,t.startMin)}`:", UNSCHEDULED"})`).join("\n");
    const todayStr=todayAll.map(e=>`${fmtT(e.startHour,e.startMin)}: ${e.title} (${fmtD(e.duration)})`).join("\n");
    return `TODAY'S SCHEDULE:\n${todayStr||"Nothing scheduled today"}\n\nTOP PRIORITY TASKS:\n${topTasks}\n\nSTATS: ${stats.active} active, ${stats.unscheduled} unscheduled, ${stats.high} urgent, ${stats.gcal} calendar events`;
  };

  const handleAiSend=async()=>{
    if(!aiInput.trim()||aiLoading) return;
    const msg={role:"user",content:aiInput};
    const msgs=[...aiMsgs,msg];
    setAiMsgs(msgs); setAiInput(""); setAiLoading(true);
    const system=`You are a blunt, dry AI chief-of-staff for Brendan "Beej" Mulholland — indie filmmaker, Shadow Wolves Productions founder, SLATR/SPOT'D/PITCH'D app developer, Producer's Playbook creator. Ex-military. Father of three (Madden, Hardey, Noa). Hates waffle.

Today: ${new Date().toDateString()}
${buildContext()}

Rules: Short. Specific. Dry humour welcome. Max 6 bullet points. Prioritise ruthlessly. Call out conflicts. Be honest about what's realistic.`;
    try{
      const reply=await callClaude(msgs,system);
      setAiMsgs(p=>[...p,{role:"assistant",content:reply}]);
    }catch(e){
      setAiMsgs(p=>[...p,{role:"assistant",content:"API error. Check VITE_ANTHROPIC_KEY in Netlify env vars."}]);
    }
    setAiLoading(false);
  };

  // ── Add Items ──────────────────────────────────────────────────────────────
  const handleAdd=()=>{
    if(!newItem.title?.trim()) return;
    if(addModal==="meeting"){
      setGcalEvents(p=>[...p,{id:`manual-${nextId++}`,calType:"work",dayOffset:newItem.dayOffset??0,...newItem}]);
    } else if(addModal==="block"){
      setGcalEvents(p=>[...p,{id:`block-${nextId++}`,calType:"block",title:newItem.title,dayOffset:newItem.dayOffset??0,startHour:newItem.startHour??9,startMin:newItem.startMin??0,duration:newItem.duration??60,location:"",attendees:"",htmlLink:""}]);
    } else {
      setTasks(p=>[...p,{id:nextId++,done:false,scheduled:false,dayOffset:null,startHour:null,startMin:null,...newItem}]);
    }
    setAddModal(null); setClickBlock(null);
  };

  const toggleDone=id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const deleteTask=id=>{setTasks(p=>p.filter(t=>t.id!==id));setSelected(null);};
  const unscheduleTask=id=>setTasks(p=>p.map(t=>t.id===id?{...t,scheduled:false,dayOffset:null,startHour:null,startMin:null}:t));

  // Click on calendar grid to create block
  const handleCalClick=(e,dayOffset)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const y=e.clientY-rect.top+e.currentTarget.parentElement.scrollTop;
    const totalMins=(y/HOUR_H)*60;
    const hour=Math.floor(totalMins/60)+CAL_START;
    const min=Math.floor((totalMins%60)/15)*15;
    if(hour>=CAL_START&&hour<CAL_END){
      setClickBlock({dayOffset,hour,min});
      setNewItem({title:"",dayOffset,startHour:hour,startMin:min,duration:60});
      setAddModal("block");
    }
  };

  const inp={fontSize:12,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",outline:"none",background:C.bgCard,color:C.text,fontFamily:"inherit",width:"100%"};

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",background:C.bg,color:C.text,overflow:"hidden"}}>

      {/* TOP BAR */}
      <div style={{background:C.bgCard,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 14px",height:50,gap:10,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginRight:6}}>
          <Logo size={26}/>
          <div>
            <div style={{fontSize:13,fontWeight:800,letterSpacing:-0.5,lineHeight:1}}>Sync<span style={{color:C.cyan}}>'n</span></div>
            <div style={{fontSize:7,color:C.textMuted,lineHeight:1,marginTop:1}}>Stop sink'n and start Sync'n.</div>
          </div>
        </div>

        {/* View tabs */}
        <div style={{display:"flex",background:C.bg,borderRadius:7,padding:2,gap:1,border:`1px solid ${C.border}`}}>
          {[["today","⚡ Today"],["calendar","📅 Calendar"],["board","⬛ Board"],["backlog","📋 Backlog"]].map(([v,l])=>(
            <button key={v} onClick={()=>setMainView(v)} style={{
              padding:"4px 10px",borderRadius:5,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
              background:mainView===v?C.bgSurface:"transparent",color:mainView===v?C.cyan:C.textMuted,transition:"all 0.12s"
            }}>{l}</button>
          ))}
        </div>

        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
          style={{...inp,width:140,border:`1px solid ${C.border}`}}/>

        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{...inp,width:"auto",fontSize:11}}>
          <option value="all">All</option>
          <option value="active">🔥 Active</option>
          <option value="upcoming">🟡 Upcoming</option>
          <option value="done">✅ Follow-up</option>
          <option value="parked">❄️ Parked</option>
        </select>

        {/* Sync status */}
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:calLoading?C.medium:calError?C.high:C.done,boxShadow:!calLoading&&!calError?`0 0 6px ${C.done}`:"none"}}/>
          <span style={{color:calLoading?C.medium:calError?C.high:C.textMuted}}>{calLoading?"Syncing…":calError?"Sync failed":`${stats.gcal} events`}</span>
          <button onClick={syncCalendar} disabled={calLoading} title="Sync Google Calendar"
            style={{background:"none",border:`1px solid ${C.border}`,borderRadius:5,cursor:"pointer",color:C.cyan,fontSize:11,padding:"2px 7px",fontWeight:700}}>↻ Sync</button>
        </div>

        <div style={{display:"flex",gap:10,fontSize:11,marginLeft:"auto"}}>
          <span style={{color:C.textMuted}}><strong style={{color:C.high}}>{stats.high}</strong> urgent</span>
          <span style={{color:C.textMuted}}><strong style={{color:C.text}}>{stats.active}</strong> active</span>
          <span style={{color:C.textMuted}}><strong style={{color:C.medium}}>{stats.unscheduled}</strong> unsched</span>
        </div>

        {unscheduled.length>0&&(
          <button onClick={autoSchedule} disabled={scheduling} style={{
            background:scheduling?"transparent":`${C.cyan}18`,color:scheduling?C.textMuted:C.cyan,
            border:`1px solid ${scheduling?C.border:C.cyanDim}`,borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"
          }}>{scheduling?"⟳ Scheduling…":`✦ AI Schedule (${Math.min(unscheduled.filter(t=>t.priority!=="Low").length,10)})`}</button>
        )}
        <button onClick={()=>{setNewItem({tier:1,project:"CROWE",title:"",status:"active",priority:"High",duration:60,notes:"",deadline:""});setAddModal("task");}}
          style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:"#000",border:"none",borderRadius:7,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer"}}>+ Task</button>
        <button onClick={()=>setAiOpen(o=>!o)} style={{
          background:aiOpen?`${C.cyan}22`:"transparent",color:aiOpen?C.cyan:C.textMuted,
          border:`1px solid ${aiOpen?C.cyanDim:C.border}`,borderRadius:7,padding:"5px 9px",fontSize:11,fontWeight:700,cursor:"pointer",
          boxShadow:aiOpen?`0 0 12px ${C.cyanGlow}`:"none",transition:"all 0.15s"
        }}>✦ AI</button>
      </div>

      {/* BODY */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* LEFT SIDEBAR */}
        <div style={{width:185,background:C.bgCard,borderRight:`1px solid ${C.border}`,overflowY:"auto",flexShrink:0,padding:"8px 0"}}>
          <button onClick={()=>{setActiveTier(null);setActiveProject(null);}} style={{
            width:"100%",textAlign:"left",padding:"6px 12px",border:"none",cursor:"pointer",
            background:!activeTier?`${C.cyan}14`:"transparent",color:!activeTier?C.cyan:C.textMuted,fontSize:11,fontWeight:700,letterSpacing:0.2
          }}>ALL PROJECTS</button>

          <div style={{margin:"5px 12px",height:1,background:C.border}}/>

          {Object.entries(TIER_META).map(([tier,meta])=>{
            const t=parseInt(tier);
            const ct=tasks.filter(x=>x.tier===t&&!x.done&&x.status!=="parked").length;
            const isActive=activeTier===t;
            return(
              <div key={tier}>
                <button onClick={()=>{setActiveTier(isActive?null:t);setActiveProject(null);}} style={{
                  width:"100%",textAlign:"left",padding:"5px 10px",border:"none",cursor:"pointer",
                  background:isActive?`${meta.color}14`:"transparent",
                  display:"flex",alignItems:"center",gap:6,
                  borderLeft:isActive?`2px solid ${meta.color}`:"2px solid transparent",
                }}>
                  <span style={{fontSize:11}}>{meta.icon}</span>
                  <span style={{fontSize:10,fontWeight:isActive?700:400,color:isActive?meta.color:C.textMuted,flex:1,lineHeight:1.3}}>{meta.label}</span>
                  {ct>0&&<span style={{fontSize:9,background:C.bgSurface,borderRadius:8,padding:"1px 5px",color:C.textFaint,fontWeight:700}}>{ct}</span>}
                </button>
                {isActive&&tierProjects.map(proj=>(
                  <button key={proj} onClick={()=>setActiveProject(activeProject===proj?null:proj)} style={{
                    width:"100%",textAlign:"left",padding:"3px 12px 3px 28px",border:"none",cursor:"pointer",
                    background:activeProject===proj?`${meta.color}0d`:"transparent",
                    fontSize:10,color:activeProject===proj?meta.color:C.textFaint,fontWeight:activeProject===proj?700:400,
                  }}>{proj}</button>
                ))}
              </div>
            );
          })}

          <div style={{margin:"10px 12px 5px",height:1,background:C.border}}/>
          <button onClick={()=>setAddProjectModal(true)} style={{
            width:"100%",textAlign:"left",padding:"6px 12px",border:"none",cursor:"pointer",
            background:"transparent",color:C.cyan,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:5
          }}>+ Add Project</button>
        </div>

        {/* MAIN */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>

          {/* ══ TODAY VIEW ══════════════════════════════════════════════════ */}
          {mainView==="today"&&(
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
              <div style={{maxWidth:760,margin:"0 auto"}}>
                {/* Header */}
                <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:20}}>
                  <h1 style={{margin:0,fontSize:22,fontWeight:800,color:C.text}}>
                    {new Date().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}
                  </h1>
                  <span style={{fontSize:12,color:C.textMuted}}>{todayAll.length} items today</span>
                  {unscheduled.length>0&&(
                    <button onClick={autoSchedule} disabled={scheduling} style={{
                      marginLeft:"auto",background:`${C.cyan}18`,color:C.cyan,border:`1px solid ${C.cyanDim}`,
                      borderRadius:7,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"
                    }}>{scheduling?"⟳ Scheduling…":"✦ AI Schedule My Day"}</button>
                  )}
                </div>

                {/* Stats row */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
                  {[
                    {label:"Urgent Tasks",value:stats.high,color:C.high},
                    {label:"Scheduled Today",value:todayTasks.length,color:C.cyan},
                    {label:"Meetings Today",value:todayEvents.length,color:"#b88a6d"},
                    {label:"Unscheduled",value:stats.unscheduled,color:C.medium},
                  ].map(s=>(
                    <div key={s.label} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
                      <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Hourly timeline */}
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:10}}>Today's Schedule</div>
                  {todayAll.length===0?(
                    <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,padding:"30px",textAlign:"center",color:C.textFaint,fontSize:13}}>
                      Nothing scheduled yet.{unscheduled.length>0?" Hit AI Schedule to fill your day.":""}</div>
                  ):(
                    <div style={{position:"relative"}}>
                      {HOURS.filter(h=>h>=7&&h<=21).map(h=>{
                        const items=todayAll.filter(e=>e.startHour===h);
                        const now=new Date();
                        const isPast=h<now.getHours();
                        const isCurrent=h===now.getHours();
                        return(
                          <div key={h} style={{display:"flex",gap:10,marginBottom:4,opacity:isPast?0.45:1}}>
                            <div style={{width:52,flexShrink:0,textAlign:"right",paddingTop:10}}>
                              <span style={{fontSize:10,color:isCurrent?C.cyan:C.textFaint,fontWeight:isCurrent?700:400}}>{fmtT(h,0)}</span>
                            </div>
                            <div style={{flex:1,minHeight:38,borderLeft:`1px solid ${isCurrent?C.cyan:C.border}`,paddingLeft:10,paddingTop:6}}>
                              {items.length===0?(
                                <div style={{height:30,borderRadius:5}}/>
                              ):(
                                items.map(item=>(
                                  <div key={item.id} onClick={()=>setSelected({type:item._type==="task"?"task":"event",item})}
                                    style={{
                                      background:`${item.color}18`,border:`1px solid ${item.color}44`,
                                      borderLeft:`3px solid ${item.color}`,borderRadius:7,
                                      padding:"8px 12px",marginBottom:4,cursor:"pointer",
                                      display:"flex",alignItems:"center",gap:10,
                                    }}>
                                    <div style={{flex:1}}>
                                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>{item.title}</div>
                                      <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>
                                        {fmtT(item.startHour,item.startMin)} · {fmtD(item.duration)}
                                        {item._type==="task"&&item.tier?` · ${TIER_META[item.tier]?.label}`:""}
                                        {item.attendees?` · ${item.attendees}`:""}
                                      </div>
                                    </div>
                                    {item._type==="task"&&(
                                      <div onClick={e=>{e.stopPropagation();toggleDone(item.id);}} style={{
                                        width:16,height:16,borderRadius:4,border:`1.5px solid ${item.done?C.done:C.textFaint}`,
                                        background:item.done?C.done:"transparent",cursor:"pointer",display:"grid",placeItems:"center",flexShrink:0
                                      }}>{item.done&&<span style={{color:C.bg,fontSize:9,fontWeight:900}}>✓</span>}</div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Unscheduled urgent */}
                {unscheduled.filter(t=>t.priority==="High").length>0&&(
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.high,textTransform:"uppercase",letterSpacing:0.6,marginBottom:10}}>⚠ Urgent — Not Yet Scheduled</div>
                    {unscheduled.filter(t=>t.priority==="High").map(task=>(
                      <div key={task.id} onClick={()=>setSelected({type:"task",item:task})}
                        style={{background:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`3px solid ${TIER_META[task.tier]?.color}`,borderRadius:7,padding:"8px 12px",marginBottom:4,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"background 0.12s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=C.bgHover}
                        onMouseLeave={e=>e.currentTarget.style.background=C.bgCard}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:600,color:C.text}}>{task.title}</div>
                          <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{TIER_META[task.tier]?.label} · {task.project} · {fmtD(task.duration)}</div>
                        </div>
                        <span style={{fontSize:9,background:`${C.medium}18`,color:C.medium,padding:"2px 6px",borderRadius:5,fontWeight:700}}>Unscheduled</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ CALENDAR VIEW ═══════════════════════════════════════════════ */}
          {mainView==="calendar"&&(
            <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              {/* Week nav */}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:C.bgCard,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
                <button onClick={()=>setWeekOffset(w=>w-1)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:5,color:C.textMuted,cursor:"pointer",padding:"3px 10px",fontSize:12}}>‹</button>
                <button onClick={()=>setWeekOffset(0)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:5,color:C.cyan,cursor:"pointer",padding:"3px 10px",fontSize:11,fontWeight:700}}>Today</button>
                <button onClick={()=>setWeekOffset(w=>w+1)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:5,color:C.textMuted,cursor:"pointer",padding:"3px 10px",fontSize:12}}>›</button>
                <span style={{fontSize:12,color:C.textMuted,marginLeft:4}}>
                  {dayDates[0].toLocaleDateString("en-AU",{day:"numeric",month:"short"})} — {dayDates[6].toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}
                </span>
                <span style={{fontSize:10,color:C.textFaint,marginLeft:8}}>Click any time slot to block it</span>
              </div>

              {/* Day headers */}
              <div style={{display:"grid",gridTemplateColumns:"46px repeat(7,1fr)",background:C.bgCard,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
                <div/>
                {dayDates.map((date,i)=>{
                  const isToday=todayCol===i;
                  const isWeekend=i>=5;
                  return(
                    <div key={i} style={{textAlign:"center",padding:"6px 2px",borderLeft:`1px solid ${C.borderLight}`,background:isWeekend?`${C.bgSurface}88`:"transparent"}}>
                      <div style={{fontSize:9,fontWeight:700,color:isToday?C.cyan:isWeekend?C.textFaint:C.textMuted,letterSpacing:0.5,textTransform:"uppercase"}}>{DAY_NAMES[i]}</div>
                      <div style={{fontSize:15,fontWeight:700,color:isToday?"#000":C.text,background:isToday?C.cyan:"transparent",width:26,height:26,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",marginTop:2,lineHeight:1}}>{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Grid */}
              <div ref={calScrollRef} style={{flex:1,overflowY:"auto"}}>
                <div style={{display:"grid",gridTemplateColumns:"46px repeat(7,1fr)",height:HOURS.length*HOUR_H}}>
                  {/* Time labels */}
                  <div style={{position:"relative"}}>
                    {HOURS.map(h=>(
                      <div key={h} style={{position:"absolute",top:px(h),right:5}}>
                        <span style={{fontSize:9,color:C.textFaint,fontWeight:500}}>{fmtT(h,0)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {dayDates.map((date,colIdx)=>{
                    const isToday=todayCol===colIdx;
                    const isWeekend=colIdx>=5;

                    // Compute dayOffset for this column
                    const today=new Date(); today.setHours(0,0,0,0);
                    const dayOff=Math.round((date-today)/(1000*60*60*24));

                    const colTasks=scheduledTasks.filter(t=>t.dayOffset===dayOff);
                    const colEvents=gcalEvents.filter(e=>e.dayOffset===dayOff);

                    // Compute overlaps separately for tasks and events, then combine
                    const allItems=[
                      ...colTasks.map(t=>({...t,_isTask:true})),
                      ...colEvents.map(e=>({...e,_isTask:false})),
                    ];
                    const withOverlap=computeOverlaps(allItems);

                    return(
                      <div key={colIdx}
                        style={{position:"relative",borderLeft:`1px solid ${C.borderLight}`,background:isToday?`${C.cyan}05`:isWeekend?`${C.bgSurface}55`:"transparent",height:HOURS.length*HOUR_H,cursor:"crosshair"}}
                        onClick={e=>{
                          if(e.target===e.currentTarget||e.target.className==="cal-col-bg") handleCalClick(e,dayOff);
                        }}
                      >
                        <div className="cal-col-bg" style={{position:"absolute",inset:0,zIndex:0}} onClick={e=>handleCalClick(e,dayOff)}/>
                        {HOURS.map(h=>(
                          <div key={h} style={{position:"absolute",top:px(h),left:0,right:0,borderTop:`1px solid ${C.borderLight}`,pointerEvents:"none",zIndex:1}}/>
                        ))}
                        {HOURS.map(h=>(
                          <div key={h+"h"} style={{position:"absolute",top:px(h,30),left:0,right:0,borderTop:`1px dashed ${C.bg}`,pointerEvents:"none",zIndex:1}}/>
                        ))}

                        {withOverlap.map(item=>{
                          const color=item._isTask
                            ?(TIER_META[item.tier]?.color||C.cyan)
                            :item.calType==="family"?"#b88a6d"
                            :item.calType==="block"?"#666"
                            :C.cyan;
                          return(
                            <CalBlock key={item.id} item={item} color={color}
                              col={item.col} cols={item.cols} isTask={item._isTask}
                              onClick={e=>{e.stopPropagation();setSelected({type:item._isTask?"task":"event",item});}}
                            />
                          );
                        })}

                        {/* Now line */}
                        {isToday&&(()=>{
                          const now=new Date();
                          const top=px(now.getHours(),now.getMinutes());
                          return top>0&&top<HOURS.length*HOUR_H?(
                            <div style={{position:"absolute",top,left:0,right:0,zIndex:10,display:"flex",alignItems:"center",pointerEvents:"none"}}>
                              <div style={{width:7,height:7,borderRadius:"50%",background:C.cyan,marginLeft:-3,boxShadow:`0 0 6px ${C.cyan}`}}/>
                              <div style={{flex:1,height:1.5,background:C.cyan,opacity:0.7}}/>
                            </div>
                          ):null;
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ BOARD VIEW ══════════════════════════════════════════════════ */}
          {mainView==="board"&&(
            <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>
              {Object.keys(grouped).length===0&&<div style={{textAlign:"center",padding:60,color:C.textFaint}}>No tasks match.</div>}
              {Object.entries(grouped).map(([tier,projects])=>{
                const meta=TIER_META[parseInt(tier)];
                return(
                  <div key={tier} style={{marginBottom:26}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingBottom:7,borderBottom:`1px solid ${C.border}`}}>
                      <span>{meta.icon}</span>
                      <span style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:0.7,color:meta.color}}>T{tier}</span>
                      <span style={{fontSize:13,fontWeight:700,color:C.text}}>{meta.label}</span>
                      <span style={{fontSize:10,color:C.textFaint,marginLeft:"auto"}}>{Object.values(projects).flat().length} tasks</span>
                    </div>
                    {Object.entries(projects).map(([proj,ptasks])=>(
                      <div key={proj} style={{marginBottom:10}}>
                        <div style={{fontSize:10,fontWeight:700,color:C.textFaint,marginBottom:4,display:"flex",alignItems:"center",gap:5}}>
                          <span style={{width:1,height:9,background:meta.color,display:"inline-block"}}/>
                          {proj.toUpperCase()}
                        </div>
                        {ptasks.map(task=>(
                          <div key={task.id} onClick={()=>setSelected({type:"task",item:task})}
                            style={{background:task.done?`${C.bgCard}80`:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`2px solid ${task.done?"#2a3350":meta.color}`,borderRadius:6,padding:"6px 10px",marginBottom:3,cursor:"pointer",display:"flex",alignItems:"center",gap:8,opacity:task.done?0.4:1,transition:"background 0.12s"}}
                            onMouseEnter={e=>{if(!task.done)e.currentTarget.style.background=C.bgHover;}}
                            onMouseLeave={e=>{e.currentTarget.style.background=task.done?`${C.bgCard}80`:C.bgCard;}}>
                            <div onClick={e=>{e.stopPropagation();toggleDone(task.id);}} style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${task.done?C.done:C.textFaint}`,background:task.done?C.done:"transparent",flexShrink:0,cursor:"pointer",display:"grid",placeItems:"center"}}>
                              {task.done&&<span style={{color:C.bg,fontSize:8,fontWeight:900}}>✓</span>}
                            </div>
                            <span style={{flex:1,fontSize:11,fontWeight:500,color:task.done?C.textFaint:C.text,textDecoration:task.done?"line-through":"none",lineHeight:1.3}}>{task.title}</span>
                            <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
                              {task.scheduled&&<span style={{fontSize:8,background:`${C.done}18`,color:C.done,padding:"1px 5px",borderRadius:4,fontWeight:700}}>Day+{task.dayOffset}</span>}
                              <span style={{width:5,height:5,borderRadius:"50%",background:pColor[task.priority]}}/>
                              {task.duration>0&&<span style={{fontSize:9,color:C.textFaint}}>{fmtD(task.duration)}</span>}
                              {task.status==="parked"&&<span style={{fontSize:9,color:C.parked}}>❄️</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ BACKLOG VIEW ════════════════════════════════════════════════ */}
          {mainView==="backlog"&&(
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
              <div style={{maxWidth:680,margin:"0 auto"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                  <h2 style={{margin:0,fontSize:16,fontWeight:800}}>Future Tasks</h2>
                  <span style={{fontSize:11,color:C.textMuted}}>{tasks.filter(t=>!t.done).length} remaining</span>
                </div>
                {["High","Medium","Low"].map(pri=>{
                  const pt=visibleTasks.filter(t=>t.priority===pri&&!t.done&&t.status!=="parked");
                  if(!pt.length) return null;
                  return(
                    <div key={pri} style={{marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                        <span style={{width:7,height:7,borderRadius:"50%",background:pColor[pri]}}/>
                        <span style={{fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:0.5,color:C.textMuted}}>{pri} ({pt.length})</span>
                      </div>
                      {pt.map(task=>{
                        const meta=TIER_META[task.tier];
                        return(
                          <div key={task.id} onClick={()=>setSelected({type:"task",item:task})}
                            style={{background:C.bgCard,border:`1px solid ${C.border}`,borderLeft:`2px solid ${meta?.color}`,borderRadius:7,padding:"9px 12px",marginBottom:4,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"background 0.12s"}}
                            onMouseEnter={e=>e.currentTarget.style.background=C.bgHover}
                            onMouseLeave={e=>e.currentTarget.style.background=C.bgCard}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:12,fontWeight:600,color:C.text}}>{task.title}</div>
                              <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{meta?.label} · {task.project} · {fmtD(task.duration)}</div>
                            </div>
                            {task.scheduled
                              ?<span style={{fontSize:9,background:`${C.done}18`,color:C.done,padding:"2px 6px",borderRadius:5,fontWeight:700}}>Day+{task.dayOffset} {fmtT(task.startHour,task.startMin)}</span>
                              :<span style={{fontSize:9,background:`${C.medium}18`,color:C.medium,padding:"2px 6px",borderRadius:5,fontWeight:700}}>Unscheduled</span>
                            }
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

        {/* AI SIDEBAR */}
        {aiOpen&&(
          <div style={{width:300,borderLeft:`1px solid ${C.border}`,background:C.bgCard,display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"11px 14px",borderBottom:`1px solid ${C.borderLight}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:C.cyan}}>✦ AI Chief-of-Staff</div>
                <div style={{fontSize:9,color:C.textFaint,marginTop:1}}>All {tasks.length} tasks + calendar</div>
              </div>
              <button onClick={()=>setAiOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:16}}>×</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"10px 10px 0",display:"flex",flexDirection:"column",gap:7}}>
              {aiMsgs.length===0&&(
                <div style={{textAlign:"center",padding:"18px 6px"}}>
                  <div style={{fontSize:24,marginBottom:7,filter:`drop-shadow(0 0 8px ${C.cyan})`}}>✦</div>
                  <div style={{fontSize:11,color:C.textMuted,marginBottom:12,lineHeight:1.5}}>Your AI chief-of-staff. Knows everything. Says it straight.</div>
                  {["What should I focus on today?","Any scheduling conflicts?","What's most overdue?","Prioritise my week","What can I drop or park?"].map(q=>(
                    <button key={q} onClick={()=>setAiInput(q)} style={{display:"block",width:"100%",marginBottom:4,background:C.bgSurface,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 9px",fontSize:10,cursor:"pointer",color:C.textMuted,textAlign:"left",transition:"border-color 0.12s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=C.cyanDim}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
                    >{q}</button>
                  ))}
                </div>
              )}
              {aiMsgs.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"90%",padding:"7px 10px",borderRadius:m.role==="user"?"11px 11px 2px 11px":"11px 11px 11px 2px",background:m.role==="user"?`${C.cyan}22`:C.bgSurface,border:`1px solid ${m.role==="user"?C.cyanDim:C.border}`,color:m.role==="user"?C.cyanBright:C.text,fontSize:11,lineHeight:1.55,whiteSpace:"pre-wrap"}}>{m.content}</div>
                </div>
              ))}
              {aiLoading&&<div style={{display:"flex",gap:4,padding:"5px 2px"}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:C.cyan,animation:`blink 1s ease-in-out ${i*0.2}s infinite`,opacity:0.3}}/>)}</div>}
              <div ref={chatEnd}/>
            </div>
            <div style={{padding:9,borderTop:`1px solid ${C.borderLight}`,display:"flex",gap:5}}>
              <input value={aiInput} onChange={e=>setAiInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleAiSend();}}}
                placeholder="Ask your chief-of-staff…"
                style={{...inp,border:`1px solid ${C.border}`,flex:1,fontSize:11}}/>
              <button onClick={handleAiSend} disabled={aiLoading} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:7,padding:"0 11px",cursor:"pointer",fontSize:12,fontWeight:800}}>↑</button>
            </div>
          </div>
        )}
      </div>

      {/* TASK/EVENT DETAIL SHEET */}
      {selected&&(
        <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,width:"100%",borderRadius:"14px 14px 0 0",padding:"20px 24px 26px",boxShadow:`0 -8px 40px rgba(0,180,216,0.08)`,border:`1px solid ${C.border}`,borderBottom:"none",maxHeight:"55vh",overflowY:"auto"}}>
            {selected.type==="task"&&(()=>{
              const t=selected.item;
              const meta=TIER_META[t.tier];
              return(<>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                      <span>{meta?.icon}</span>
                      <span style={{fontSize:10,color:meta?.color,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>T{t.tier} · {t.project}</span>
                      <span style={{width:5,height:5,borderRadius:"50%",background:pColor[t.priority]}}/>
                      <span style={{fontSize:10,color:C.textMuted}}>{t.priority}</span>
                    </div>
                    <h2 style={{margin:0,fontSize:17,fontWeight:800,color:C.text,lineHeight:1.2}}>{t.title}</h2>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:20,marginLeft:10}}>×</button>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                  {[fmtD(t.duration)||null,t.scheduled?`Day+${t.dayOffset} ${fmtT(t.startHour,t.startMin)}`:"Unscheduled",t.deadline?`Due ${t.deadline}`:null,t.status].filter(Boolean).map(tag=>(
                    <span key={tag} style={{fontSize:11,background:C.bgSurface,border:`1px solid ${C.border}`,padding:"3px 9px",borderRadius:6,color:C.textMuted}}>{tag}</span>
                  ))}
                </div>
                {t.notes&&<p style={{fontSize:12,color:C.textMuted,margin:"0 0 12px",lineHeight:1.5}}>{t.notes}</p>}
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <button onClick={()=>toggleDone(t.id)} style={{fontSize:11,background:t.done?C.bgSurface:`${C.done}18`,color:t.done?C.textMuted:C.done,border:`1px solid ${t.done?C.border:C.done}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",fontWeight:700}}>{t.done?"↩ Undone":"✓ Done"}</button>
                  {t.scheduled&&<button onClick={()=>{unscheduleTask(t.id);setSelected(null);}} style={{fontSize:11,background:`${C.medium}18`,color:C.medium,border:`1px solid ${C.medium}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",fontWeight:700}}>Unschedule</button>}
                  {!t.scheduled&&t.duration>0&&<button onClick={()=>{setSelected(null);autoSchedule();}} style={{fontSize:11,background:`${C.cyan}18`,color:C.cyan,border:`1px solid ${C.cyanDim}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",fontWeight:700}}>✦ AI Schedule</button>}
                  <button onClick={()=>deleteTask(t.id)} style={{fontSize:11,background:"none",color:C.high,border:`1px solid ${C.high}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",marginLeft:"auto"}}>Delete</button>
                </div>
              </>);
            })()}
            {selected.type!=="task"&&(()=>{
              const e=selected.item;
              return(<>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:10,color:e.calType==="family"?"#b88a6d":C.cyan,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:5}}>
                      {e.calType==="family"?"👨‍👩‍👧‍👦 Family":e.calType==="block"?"🚫 Blocked Time":"📅 Meeting"}
                    </div>
                    <h2 style={{margin:0,fontSize:17,fontWeight:800,color:C.text}}>{e.title}</h2>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,fontSize:20}}>×</button>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                  <span style={{fontSize:11,background:C.bgSurface,border:`1px solid ${C.border}`,padding:"3px 9px",borderRadius:6,color:C.textMuted}}>Day+{e.dayOffset} {fmtT(e.startHour,e.startMin)}</span>
                  <span style={{fontSize:11,background:C.bgSurface,border:`1px solid ${C.border}`,padding:"3px 9px",borderRadius:6,color:C.textMuted}}>{fmtD(e.duration)}</span>
                  {e.location&&<span style={{fontSize:11,background:C.bgSurface,border:`1px solid ${C.border}`,padding:"3px 9px",borderRadius:6,color:C.textMuted}}>📍 {e.location.substring(0,40)}</span>}
                </div>
                {e.attendees&&<div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>👥 {e.attendees}</div>}
                {e.htmlLink&&<a href={e.htmlLink} target="_blank" rel="noreferrer" style={{fontSize:11,color:C.cyan}}>Open in Google Calendar →</a>}
                {e.id?.startsWith("manual-")||e.id?.startsWith("block-")?
                  <button onClick={()=>{setGcalEvents(p=>p.filter(x=>x.id!==e.id));setSelected(null);}} style={{display:"block",marginTop:10,fontSize:11,background:"none",color:C.high,border:`1px solid ${C.high}`,borderRadius:7,padding:"6px 12px",cursor:"pointer"}}>Delete</button>:null}
              </>);
            })()}
          </div>
        </div>
      )}

      {/* ADD MODAL (task / meeting / block) */}
      {addModal&&(
        <div onClick={()=>{setAddModal(null);setClickBlock(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:14,padding:22,width:440,maxWidth:"92vw",boxShadow:`0 20px 60px rgba(0,0,0,0.6),0 0 0 1px ${C.border}`}}>
            <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:800,color:C.text}}>
              {addModal==="task"?"New Task":addModal==="meeting"?"New Meeting":"Block Time"}
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <input autoFocus value={newItem.title||""} onChange={e=>setNewItem(n=>({...n,title:e.target.value}))}
                placeholder={addModal==="task"?"Task title…":addModal==="meeting"?"Meeting title…":"What are you blocking?"}
                style={{...inp,fontSize:13,padding:"9px 12px"}}/>
              {addModal==="task"&&(<>
                <div style={{display:"flex",gap:7}}>
                  <select value={newItem.tier||1} onChange={e=>setNewItem(n=>({...n,tier:parseInt(e.target.value),project:""}))} style={{...inp,flex:1}}>
                    {Object.entries(TIER_META).map(([t,m])=><option key={t} value={t}>{m.icon} T{t}: {m.label}</option>)}
                  </select>
                  <select value={newItem.priority||"High"} onChange={e=>setNewItem(n=>({...n,priority:e.target.value}))} style={{...inp,width:110}}>
                    {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <input value={newItem.project||""} onChange={e=>setNewItem(n=>({...n,project:e.target.value}))} placeholder="Project name" style={{...inp,flex:1}}/>
                  <select value={newItem.status||"active"} onChange={e=>setNewItem(n=>({...n,status:e.target.value}))} style={{...inp,width:130}}>
                    <option value="active">🔥 Active</option>
                    <option value="upcoming">🟡 Upcoming</option>
                    <option value="done">✅ Follow-up</option>
                    <option value="parked">❄️ Parked</option>
                  </select>
                </div>
                <div style={{display:"flex",gap:7,alignItems:"center"}}>
                  <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Duration (min)</label>
                  <input type="number" value={newItem.duration||60} min={15} step={15} onChange={e=>setNewItem(n=>({...n,duration:parseInt(e.target.value)||60}))} style={{...inp,width:70}}/>
                  <label style={{fontSize:11,color:C.textMuted}}>Deadline</label>
                  <input type="date" value={newItem.deadline||""} onChange={e=>setNewItem(n=>({...n,deadline:e.target.value}))} style={{...inp,flex:1}}/>
                </div>
                <textarea value={newItem.notes||""} onChange={e=>setNewItem(n=>({...n,notes:e.target.value}))} placeholder="Notes (optional)" rows={2} style={{...inp,resize:"none"}}/>
              </>)}
              {(addModal==="meeting"||addModal==="block")&&(<>
                <div style={{display:"flex",gap:7,alignItems:"center"}}>
                  <label style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>Day offset (0=today)</label>
                  <input type="number" value={newItem.dayOffset??0} min={0} max={13} onChange={e=>setNewItem(n=>({...n,dayOffset:parseInt(e.target.value)||0}))} style={{...inp,width:70}}/>
                  <input type="time" value={`${String(newItem.startHour??9).padStart(2,"0")}:${String(newItem.startMin??0).padStart(2,"0")}`}
                    onChange={e=>{const[h,m]=e.target.value.split(":").map(Number);setNewItem(n=>({...n,startHour:h,startMin:m}));}}
                    style={{...inp,flex:1}}/>
                </div>
                <div style={{display:"flex",gap:7,alignItems:"center"}}>
                  <label style={{fontSize:11,color:C.textMuted}}>Duration (min)</label>
                  <input type="number" value={newItem.duration||60} min={15} step={15} onChange={e=>setNewItem(n=>({...n,duration:parseInt(e.target.value)||60}))} style={{...inp,width:70}}/>
                </div>
                {clickBlock&&<div style={{fontSize:10,color:C.cyan}}>📅 Placing at {fmtT(clickBlock.hour,clickBlock.min)}</div>}
              </>)}
            </div>
            <div style={{display:"flex",gap:7,marginTop:14}}>
              <button onClick={handleAdd} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"8px 18px",fontSize:12,fontWeight:800,cursor:"pointer"}}>
                {addModal==="task"?"Add Task":addModal==="meeting"?"Add Meeting":"Block Time"}
              </button>
              <button onClick={()=>{setAddModal(null);setClickBlock(null);}} style={{background:"none",color:C.textMuted,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,cursor:"pointer"}}>Cancel</button>
              {addModal==="task"&&<button onClick={()=>{setNewItem(n=>({...n,_ai:true}));}} style={{marginLeft:"auto",background:"none",color:C.cyan,border:`1px solid ${C.cyanDim}`,borderRadius:8,padding:"8px 12px",fontSize:12,cursor:"pointer"}}>✦ AI Schedule after adding</button>}
            </div>
          </div>
        </div>
      )}

      {/* ADD PROJECT MODAL */}
      {addProjectModal&&(
        <div onClick={()=>setAddProjectModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:14,padding:22,width:380,boxShadow:`0 20px 60px rgba(0,0,0,0.6),0 0 0 1px ${C.border}`}}>
            <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:800,color:C.text}}>Add Project</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <input autoFocus value={newProject.name} onChange={e=>setNewProject(p=>({...p,name:e.target.value}))} placeholder="Project name" style={{...inp,fontSize:13}}/>
              <select value={newProject.tier} onChange={e=>setNewProject(p=>({...p,tier:parseInt(e.target.value)}))} style={inp}>
                {Object.entries(TIER_META).map(([t,m])=><option key={t} value={t}>{m.icon} T{t}: {m.label}</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:7,marginTop:14}}>
              <button onClick={()=>{
                if(!newProject.name.trim()) return;
                // Add a placeholder task to create the project in the list
                setTasks(p=>[...p,{id:nextId++,tier:newProject.tier,project:newProject.name,title:"Project created — add tasks",status:"active",priority:"Medium",duration:30,notes:"",done:false,scheduled:false,dayOffset:null,startHour:null,startMin:null,deadline:""}]);
                setActiveTier(newProject.tier);
                setActiveProject(newProject.name);
                setNewProject({tier:1,name:""});
                setAddProjectModal(false);
              }} style={{background:`linear-gradient(135deg,${C.cyan},${C.cyanDim})`,color:C.bg,border:"none",borderRadius:8,padding:"8px 18px",fontSize:12,fontWeight:800,cursor:"pointer"}}>Add Project</button>
              <button onClick={()=>setAddProjectModal(false)} style={{background:"none",color:C.textMuted,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,cursor:"pointer"}}>Cancel</button>
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

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar, Clock, Users, User, Home as HomeIcon,
  ChevronRight, ChevronLeft, BookOpen, MapPin, Search,
  Check, LogOut, Bell, ArrowLeft, X, Plus, Minus,
  GraduationCap, AlertCircle, DollarSign, Edit2, Trash2,
  Lock, ShieldCheck, CheckCircle2, Download, Play, Square,
  UserPlus, Eye, EyeOff, TrendingUp, FileText,
} from "lucide-react";

/* =========================================================
   DESIGN — Lernwelt Orange + Dunkelblau
   Schriftart: system-ui mit Display-Gewichten (kein Google Fonts)
   ========================================================= */
const C = {
  bg:         "#F5F7FB",
  surface:    "#FFFFFF",
  surfaceAlt: "#EEF2F9",
  border:     "#DDE3EF",
  primary:    "#1A3A6B",
  primaryLi:  "#2A5298",
  primaryTint:"#EBF0FA",
  accent:     "#E8650A",
  accentDk:   "#C4520A",
  accentLi:   "#F07820",
  accentTint: "#FEF0E7",
  success:    "#16A34A",
  warn:       "#D97706",
  danger:     "#DC2626",
  info:       "#2563EB",
  textHi:     "#0F1B2D",
  text:       "#374151",
  textDim:    "#6B7280",
  textVeryDim:"#9CA3AF",
};

/* Einheitliche Schrift — kein Google Fonts, kein Fallback-Problem */
const FF = {
  display: "-apple-system, 'Segoe UI', system-ui, sans-serif",
  body:    "-apple-system, 'Segoe UI', system-ui, sans-serif",
};

/* =========================================================
   STAMMDATEN
   ========================================================= */
const LOCATIONS = [
  { id: "heerdt",  name: "Düsseldorf Heerdt",  short: "Heerdt",  color: "#1A3A6B" },
  { id: "garath",  name: "Düsseldorf Garath",  short: "Garath",  color: "#2563EB" },
  { id: "neuss-i", name: "Neuss Innenstadt",   short: "Neuss-I", color: "#E8650A" },
  { id: "neuss-f", name: "Neuss Furth",        short: "Neuss-F", color: "#16A34A" },
];
const ROOMS = {
  heerdt:   [{id:"h1",name:"Raum 1"},{id:"h2",name:"Raum 2"},{id:"h3",name:"Raum 3"}],
  garath:   [{id:"g1",name:"Raum 1"},{id:"g2",name:"Raum 2"},{id:"g3",name:"Raum 3"}],
  "neuss-i":[{id:"n1",name:"Raum 1"},{id:"n2",name:"Raum 2"}],
  "neuss-f":[{id:"f1",name:"Raum 1"},{id:"f2",name:"Raum 2"}],
};
const ALL_SUBJECTS = ["Mathe","Deutsch","Englisch","Französisch","Spanisch","Latein","Physik","Chemie","Biologie","Informatik","Geschichte","DaZ","LRS","Dyskalkulie","ZP10","Abitur","Vorschule"];
const WEEKDAYS = ["Mo","Di","Mi","Do","Fr"];
const WEEKDAYS_LONG = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag"];
const TEACHER_COLORS = ["#1A3A6B","#E8650A","#2563EB","#16A34A","#7C3AED","#DB2777","#D97706","#0891B2"];

const today = new Date();
const dk = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayKey = dk(today);
const fmtEur = n => `${Number(n).toFixed(2).replace(".",",")} €`;
const initials = name => (name||"").split(" ").filter(Boolean).map(p=>p[0]).join("").slice(0,2).toUpperCase();
const appDay = d => { const x=d.getDay(); return x===0?6:x-1; };

/* =========================================================
   STATE — alles in einem zentralen Store
   ========================================================= */
const INIT_TEACHERS = [
  {id:"t1",name:"Herr Stolle",    short:"ST",subjects:["Mathe","Physik","Informatik"],color:"#1A3A6B",rate:25,email:"stolle@lernwelt.de",role:"teacher"},
  {id:"t2",name:"Frau Yılmaz",    short:"YI",subjects:["Deutsch","DaZ","LRS"],        color:"#E8650A",rate:24,email:"yilmaz@lernwelt.de",role:"teacher"},
  {id:"t3",name:"Herr Kovač",     short:"KO",subjects:["Englisch","Französisch"],     color:"#2563EB",rate:23,email:"kovac@lernwelt.de",role:"teacher"},
  {id:"t4",name:"Frau Nguyen",    short:"NG",subjects:["Mathe","Dyskalkulie","ZP10"], color:"#16A34A",rate:26,email:"nguyen@lernwelt.de",role:"teacher"},
  {id:"t5",name:"Herr Schreiber", short:"SC",subjects:["Chemie","Biologie","Latein"], color:"#7C3AED",rate:24,email:"schreiber@lernwelt.de",role:"teacher"},
  {id:"t6",name:"Frau Becker",    short:"BE",subjects:["Vorschule","Deutsch","LRS"],  color:"#DB2777",rate:22,email:"becker@lernwelt.de",role:"teacher"},
];
const INIT_STUDENTS = [
  {id:"s1", name:"Mia Hoffmann",  short:"MH",grade:9, subjects:["Mathe"],         teacherId:"t1",locationId:"heerdt",  focus:"ZP10-Vorbereitung",since:"Sep 2024",notes:"Sehr motiviert, Algebra läuft gut."},
  {id:"s2", name:"Leon Müller",   short:"LM",grade:5, subjects:["Deutsch","LRS"], teacherId:"t2",locationId:"heerdt",  focus:"LRS-Förderung",    since:"Jan 2025",notes:"Große Fortschritte beim Lesen."},
  {id:"s3", name:"Sophia Kaya",   short:"SK",grade:7, subjects:["Englisch"],      teacherId:"t3",locationId:"garath",  focus:"Grammatik",        since:"Okt 2024",notes:"Vocabulary sehr gut."},
  {id:"s4", name:"Noah Bauer",    short:"NB",grade:11,subjects:["Mathe","Physik"],teacherId:"t1",locationId:"heerdt",  focus:"Abi-Vorbereitung", since:"Aug 2024",notes:"Klausurniveau erreicht."},
  {id:"s5", name:"Emma Schäfer",  short:"ES",grade:3, subjects:["Vorschule"],     teacherId:"t6",locationId:"neuss-f", focus:"Schulstart",       since:"Mär 2025",notes:"Sehr fleißig."},
  {id:"s6", name:"Lukas Fischer", short:"LF",grade:8, subjects:["Chemie"],        teacherId:"t5",locationId:"neuss-i", focus:"Klausur-Prep",     since:"Nov 2024",notes:"Organische Chemie schwierig."},
  {id:"s7", name:"Hana Al-Rashid",short:"HA",grade:6, subjects:["Deutsch","DaZ"], teacherId:"t2",locationId:"garath",  focus:"Sprachförderung",  since:"Feb 2025",notes:"Deutsch wird deutlich besser."},
  {id:"s8", name:"Tim Weber",     short:"TW",grade:10,subjects:["Englisch"],      teacherId:"t3",locationId:"garath",  focus:"Abitur-Niveau",    since:"Sep 2024",notes:"Speaking sehr stark."},
  {id:"s9", name:"Lena Braun",    short:"LB",grade:4, subjects:["Mathe","Dyskalkulie"],teacherId:"t4",locationId:"neuss-i",focus:"Dyskalkulie",since:"Okt 2024",notes:"Mengenverständnis wächst."},
  {id:"s10",name:"Felix Richter", short:"FR",grade:12,subjects:["Mathe"],         teacherId:"t4",locationId:"neuss-f", focus:"Abi-Vorbereitung", since:"Aug 2024",notes:"Auf Kurs."},
  {id:"s11",name:"Amira Hassan",  short:"AH",grade:5, subjects:["Deutsch","DaZ"], teacherId:"t2",locationId:"heerdt",  focus:"Integration",      since:"Jan 2025",notes:"Toll integriert."},
  {id:"s12",name:"Jonas Klein",   short:"JK",grade:9, subjects:["Latein"],        teacherId:"t5",locationId:"neuss-i", focus:"ZP10",             since:"Sep 2024",notes:"Grammatik solide."},
];
const mkApt = (id,teacherId,studentIds,locationId,room,time,status,subject,offset=0) => {
  const d = new Date(today); d.setDate(d.getDate()-offset);
  return {id,teacherId,studentIds,locationId,room,time,subject,
    dateKey:dk(d), status,
    completedDur: status==="completed"?60:null,
    checkedInAt: status!=="scheduled"?"14:00":null,
    checkedOutAt: status==="completed"?"15:00":null,
    _checkedInTs: status==="checked-in"?Date.now()-12*60*1000:null,
    billed: offset>3, billedMonth: offset>3?"Mai 2025":null,
  };
};
const INIT_APTS = [
  mkApt("a1","t1",["s1","s4"],"heerdt","Raum 1","14:00","completed","Mathe"),
  mkApt("a2","t2",["s2"],"heerdt","Raum 2","15:00","checked-in","Deutsch / LRS"),
  mkApt("a3","t1",["s4"],"heerdt","Raum 1","16:00","scheduled","Physik"),
  mkApt("a4","t3",["s3","s8"],"garath","Raum 1","14:30","completed","Englisch"),
  mkApt("a5","t2",["s7"],"garath","Raum 2","15:30","scheduled","DaZ"),
  mkApt("a6","t5",["s6"],"neuss-i","Raum 1","15:00","completed","Chemie"),
  mkApt("a7","t4",["s9"],"neuss-i","Raum 2","16:00","scheduled","Mathe / Dyskalkulie"),
  mkApt("a8","t6",["s5"],"neuss-f","Raum 1","14:00","completed","Vorschule"),
  mkApt("a9","t4",["s10"],"neuss-f","Raum 2","17:00","scheduled","Mathe"),
  ...Array.from({length:16},(_, i)=>mkApt(`p${i}`,"t"+((i%6)+1),[`s${(i%12)+1}`],LOCATIONS[i%4].id,"Raum 1",["14:00","15:00","16:00"][i%3],"completed",ALL_SUBJECTS[i%10],i+1)),
];
const INIT_SLOTS = [
  {id:"sl1",day:0,time:"14:00",locationId:"heerdt", roomId:"h1",teacherId:"t1",studentIds:["s1","s4"],type:"gruppe"},
  {id:"sl2",day:0,time:"15:00",locationId:"heerdt", roomId:"h2",teacherId:"t2",studentIds:["s2"],    type:"einzel"},
  {id:"sl3",day:0,time:"16:00",locationId:"heerdt", roomId:"h1",teacherId:"t1",studentIds:["s4"],    type:"einzel"},
  {id:"sl4",day:0,time:"14:30",locationId:"garath", roomId:"g1",teacherId:"t3",studentIds:["s3","s8"],type:"gruppe"},
  {id:"sl5",day:0,time:"15:30",locationId:"garath", roomId:"g2",teacherId:"t2",studentIds:["s7"],    type:"einzel"},
  {id:"sl6",day:0,time:"15:00",locationId:"neuss-i",roomId:"n1",teacherId:"t5",studentIds:["s6"],    type:"einzel"},
  {id:"sl7",day:0,time:"16:00",locationId:"neuss-i",roomId:"n2",teacherId:"t4",studentIds:["s9"],    type:"einzel"},
  {id:"sl8",day:0,time:"14:00",locationId:"neuss-f",roomId:"f1",teacherId:"t6",studentIds:["s5"],    type:"einzel"},
  {id:"sl9",day:0,time:"17:00",locationId:"neuss-f",roomId:"f2",teacherId:"t4",studentIds:["s10"],   type:"einzel"},
  {id:"sl10",day:1,time:"14:00",locationId:"heerdt", roomId:"h1",teacherId:"t1",studentIds:["s1"],   type:"einzel"},
  {id:"sl11",day:1,time:"15:30",locationId:"garath", roomId:"g1",teacherId:"t3",studentIds:["s8"],   type:"einzel"},
  {id:"sl12",day:2,time:"14:00",locationId:"neuss-i",roomId:"n1",teacherId:"t4",studentIds:["s9","s12"],type:"gruppe"},
  {id:"sl13",day:2,time:"16:00",locationId:"heerdt", roomId:"h3",teacherId:"t5",studentIds:["s6"],   type:"einzel"},
  {id:"sl14",day:3,time:"15:00",locationId:"garath", roomId:"g2",teacherId:"t2",studentIds:["s2","s11"],type:"gruppe"},
  {id:"sl15",day:3,time:"17:00",locationId:"neuss-f",roomId:"f1",teacherId:"t4",studentIds:["s10"],  type:"einzel"},
  {id:"sl16",day:4,time:"14:30",locationId:"heerdt", roomId:"h1",teacherId:"t1",studentIds:["s1","s4"],type:"gruppe"},
  {id:"sl17",day:4,time:"16:00",locationId:"neuss-i",roomId:"n2",teacherId:"t3",studentIds:["s3"],   type:"einzel"},
];

/* =========================================================
   PRIMITIVES
   ========================================================= */
function Avatar({short,color,size=32}){
  return <div style={{width:size,height:size,borderRadius:size/2,background:color||C.primary,display:"grid",placeItems:"center",color:"#fff",fontWeight:800,fontSize:size*0.36,fontFamily:FF.display,flexShrink:0,letterSpacing:-0.5}}>{short}</div>;
}
function Badge({children,color=C.primary}){
  return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:6,background:color+"18",color,fontSize:11,fontWeight:700,letterSpacing:0.3}}>{children}</span>;
}
function LocBadge({locationId}){
  const l=LOCATIONS.find(x=>x.id===locationId); if(!l) return null;
  return <Badge color={l.color}>{l.short}</Badge>;
}
function Card({children,padding=20,accent,onClick,hover}){
  const [hov,setHov]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:C.surface,border:`1px solid ${hov&&hover?C.primary:C.border}`,borderRadius:14,padding,position:"relative",overflow:"hidden",boxShadow:hov&&hover?"0 8px 24px rgba(26,58,107,.12)":"0 1px 4px rgba(26,58,107,.05)",cursor:onClick?"pointer":"default",transition:"all .2s"}}>
    {accent&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent}}/>}
    {children}
  </div>;
}
function SecTitle({children,action}){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
    <div style={{fontSize:11,fontWeight:800,color:C.textDim,letterSpacing:1.5,textTransform:"uppercase"}}>{children}</div>
    {action}
  </div>;
}
function Btn({children,onClick,icon:Icon,color,outline,small,disabled}){
  const bg=outline?"transparent":(color||`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`);
  return <button onClick={onClick} disabled={disabled} style={{padding:small?"8px 14px":"12px 20px",background:disabled?C.border:bg,color:outline?(color||C.accent):"#fff",border:outline?`1.5px solid ${color||C.accent}`:"none",borderRadius:10,fontSize:small?12:13,fontWeight:700,fontFamily:FF.body,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,opacity:disabled?.5:1,transition:"opacity .15s"}}>
    {Icon&&<Icon size={small?12:15}/>}{children}
  </button>;
}
function Input({label,value,onChange,type="text",placeholder}){
  return <div>
    {label&&<label style={{display:"block",fontSize:12,fontWeight:700,color:C.textDim,marginBottom:6,letterSpacing:.3}}>{label}</label>}
    <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} style={{width:"100%",padding:"12px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surfaceAlt,color:C.textHi,fontSize:14,fontFamily:FF.body,outline:"none",boxSizing:"border-box"}}/>
  </div>;
}

/* =========================================================
   SVG LOGO
   ========================================================= */
function Logo({size=36}){
  return <svg width={size*2.5} height={size*.75} viewBox="0 0 220 60">
    <circle cx="28" cy="30" r="22" fill="none" stroke={C.primary} strokeWidth="2.5"/>
    <ellipse cx="28" cy="30" rx="11" ry="22" fill="none" stroke={C.primary} strokeWidth="1.5"/>
    <line x1="6" y1="20" x2="50" y2="20" stroke={C.primary} strokeWidth="1.5"/>
    <line x1="6" y1="30" x2="50" y2="30" stroke={C.primary} strokeWidth="1.5"/>
    <line x1="6" y1="40" x2="50" y2="40" stroke={C.primary} strokeWidth="1.5"/>
    <path d="M14 10 Q28 2 42 10" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round"/>
    <text x="62" y="26" fontFamily={FF.display} fontSize="18" fontWeight="800" fill={C.primary} letterSpacing="-0.5">Lernwelt</text>
    <text x="62" y="44" fontFamily={FF.display} fontSize="10" fontWeight="700" fill={C.accent} letterSpacing="1.5">NACHHILFESCHULE</text>
  </svg>;
}

/* =========================================================
   SIDEBAR
   ========================================================= */
function Sidebar({tab,setTab,onLogout,view}){
  const tabs=[
    {key:"dashboard",label:"Dashboard",  icon:HomeIcon},
    {key:"plan",     label:"Wochenplan", icon:Calendar},
    {key:"students", label:"Schüler",    icon:Users},
    {key:"teachers", label:"Lehrkräfte", icon:GraduationCap},
    {key:"billing",  label:"Abrechnung", icon:DollarSign},
    {key:"stunden",  label:"Stunden",    icon:Clock},
  ];
  return <div style={{width:240,flexShrink:0,background:C.primary,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0}}>
    <div style={{padding:"28px 20px 20px",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
      <Logo size={28}/>
      <div style={{marginTop:12,fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:700,letterSpacing:1.5}}>VERWALTUNGSPORTAL · DEMO</div>
    </div>
    <div style={{padding:"12px 20px 10px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{fontSize:9,color:"rgba(255,255,255,.35)",fontWeight:800,letterSpacing:2,marginBottom:10,textTransform:"uppercase"}}>Standorte</div>
      {LOCATIONS.map(l=><div key={l.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
        <div style={{width:6,height:6,borderRadius:3,background:l.color==="rgba(26,58,107)"?C.accent:l.color}}/>
        <span style={{fontSize:11,color:"rgba(255,255,255,.65)",fontWeight:600}}>{l.name}</span>
      </div>)}
    </div>
    <nav style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2}}>
      {tabs.map(t=>{
        const active=tab===t.key&&!view;
        const Icon=t.icon;
        return <button key={t.key} onClick={()=>setTab(t.key)} style={{width:"100%",padding:"11px 14px",borderRadius:10,background:active?"rgba(255,255,255,.15)":"transparent",border:active?"1px solid rgba(255,255,255,.2)":"1px solid transparent",color:active?"#fff":"rgba(255,255,255,.55)",fontSize:13,fontWeight:active?700:500,cursor:"pointer",fontFamily:FF.body,textAlign:"left",display:"flex",alignItems:"center",gap:10,transition:"all .15s"}}>
          <Icon size={16} strokeWidth={active?2.5:2}/>{t.label}
        </button>;
      })}
    </nav>
    <div style={{padding:"14px 16px",borderTop:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:36,height:36,borderRadius:10,background:C.accent,display:"grid",placeItems:"center",color:"#fff",fontWeight:800,fontSize:13}}>AD</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Admin</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.45)",marginTop:1}}>Geschäftsführung</div>
      </div>
      <button onClick={onLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.5)",width:30,height:30,borderRadius:8,display:"grid",placeItems:"center",cursor:"pointer"}}>
        <LogOut size={13}/>
      </button>
    </div>
  </div>;
}

/* =========================================================
   LOGIN
   ========================================================= */
function Login({onLogin}){
  const [email,setEmail]=useState("admin@lernwelt.de");
  const [pw,setPw]=useState("demo1234");
  const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);
  const submit=e=>{e.preventDefault();setLoading(true);setTimeout(()=>onLogin({id:"admin",name:"Admin",role:"admin"}),700);};
  return <div style={{minHeight:"100vh",display:"flex",background:C.bg}}>
    <div style={{flex:1,background:C.primary,display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 80px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:350,height:350,background:"rgba(232,101,10,.12)",borderRadius:"50%"}}/>
      <div style={{position:"absolute",bottom:-80,left:-80,width:280,height:280,background:"rgba(255,255,255,.04)",borderRadius:"50%"}}/>
      <div style={{position:"relative"}}>
        <Logo size={32}/>
        <div style={{marginTop:48}}>
          <div style={{fontSize:12,color:"rgba(255,255,255,.45)",fontWeight:800,letterSpacing:2,marginBottom:14,textTransform:"uppercase"}}>Verwaltungsportal</div>
          <h1 style={{fontFamily:FF.display,fontSize:42,fontWeight:800,color:"#fff",lineHeight:1.1,margin:"0 0 18px",letterSpacing:-1.5}}>Alle 4 Standorte.<br/><span style={{color:C.accentLi}}>Ein System.</span></h1>
          <p style={{fontSize:15,color:"rgba(255,255,255,.6)",lineHeight:1.7,maxWidth:380}}>Lehrkräfte, Schüler, Stunden, Abrechnung — standortübergreifend verwalten.</p>
        </div>
        <div style={{marginTop:44,display:"flex",flexDirection:"column",gap:10}}>
          {["Heerdt · Garath · Neuss Innenstadt · Neuss Furth","Lehrkraft-Einladung per E-Mail","Lohnabrechnung mit PIN-Schutz","CSV-Export für den Steuerberater"].map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:10,color:"rgba(255,255,255,.8)",fontSize:13}}>
            <div style={{width:20,height:20,borderRadius:6,background:C.accent,display:"grid",placeItems:"center",flexShrink:0}}><Check size={11} color="#fff" strokeWidth={3}/></div>{f}
          </div>)}
        </div>
      </div>
    </div>
    <div style={{width:460,display:"flex",alignItems:"center",justifyContent:"center",padding:60,background:C.surface}}>
      <div style={{width:"100%"}}>
        <h2 style={{fontFamily:FF.display,fontSize:30,fontWeight:800,color:C.textHi,margin:"0 0 6px",letterSpacing:-1}}>Anmelden</h2>
        <p style={{fontSize:14,color:C.textDim,margin:"0 0 28px"}}>Demo-Zugangsdaten sind bereits eingetragen.</p>
        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="E-Mail" value={email} onChange={setEmail} type="email"/>
          <div>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.textDim,marginBottom:6}}>Passwort</label>
            <div style={{position:"relative"}}>
              <input value={pw} onChange={e=>setPw(e.target.value)} type={showPw?"text":"password"} style={{width:"100%",padding:"12px 44px 12px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surfaceAlt,color:C.textHi,fontSize:14,fontFamily:FF.body,outline:"none",boxSizing:"border-box"}}/>
              <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",color:C.textDim}}>
                {showPw?<EyeOff size={18}/>:<Eye size={18}/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{padding:"14px 20px",background:`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`,color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:800,fontFamily:FF.body,cursor:"pointer",boxShadow:`0 8px 20px -6px ${C.accent}60`,marginTop:6}}>
            {loading?"Anmelden…":"Einloggen →"}
          </button>
        </form>
        <div style={{marginTop:20,padding:"12px 16px",background:C.accentTint,border:`1px solid ${C.accent}30`,borderRadius:10,fontSize:12,color:C.accentDk,fontWeight:600}}>
          Demo: admin@lernwelt.de · demo1234
        </div>
      </div>
    </div>
  </div>;
}

/* =========================================================
   DASHBOARD
   ========================================================= */
function Dashboard({apts,teachers,students,slots,setTab,setView}){
  const todayApts=apts.filter(a=>a.dateKey===todayKey);
  const done=todayApts.filter(a=>a.status==="completed").length;
  const running=todayApts.filter(a=>a.status==="checked-in").length;
  const openBilling=apts.filter(a=>a.status==="completed"&&!a.billed);
  const totalOpen=openBilling.reduce((s,a)=>{const t=teachers.find(x=>x.id===a.teacherId);return s+(a.completedDur||60)/60*(t?.rate||22);},0);

  const byLoc=LOCATIONS.map(loc=>{
    const la=todayApts.filter(a=>a.locationId===loc.id);
    return {...loc,count:la.length,done:la.filter(a=>a.status==="completed").length};
  });

  return <div style={{padding:"32px 40px 60px",maxWidth:1200}}>
    <div style={{marginBottom:28}}>
      <div style={{fontSize:11,fontWeight:800,color:C.accent,letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>
        {today.toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}
      </div>
      <h1 style={{fontFamily:FF.display,fontSize:36,fontWeight:800,color:C.textHi,margin:0,letterSpacing:-1.2}}>Guten Tag, Admin.</h1>
      <p style={{fontSize:15,color:C.textDim,margin:"6px 0 0"}}>Heute laufen <strong style={{color:C.primary}}>{todayApts.length} Stunden</strong> an 4 Standorten.</p>
    </div>

    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
      {[
        {label:"Heute gesamt",value:todayApts.length,icon:Calendar,color:C.primary,action:()=>setTab("stunden")},
        {label:"Aktive Stunden",value:running,icon:Play,color:C.accent,sub:running?"läuft jetzt":"",action:()=>setTab("stunden")},
        {label:"Abgeschlossen",value:done,icon:CheckCircle2,color:C.success,action:()=>setTab("stunden")},
        {label:"Offene Abrechnung",value:fmtEur(totalOpen),icon:DollarSign,color:C.warn,sub:`${openBilling.length} Termine`,action:()=>setTab("billing")},
      ].map(s=>{
        const Icon=s.icon;
        return <div key={s.label} onClick={s.action} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",cursor:"pointer",transition:"all .2s",boxShadow:"0 1px 4px rgba(26,58,107,.05)"}}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 24px rgba(26,58,107,.12)";e.currentTarget.style.borderColor=C.primary;}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(26,58,107,.05)";e.currentTarget.style.borderColor=C.border;}}>
          <div style={{width:38,height:38,borderRadius:10,background:s.color+"15",display:"grid",placeItems:"center",marginBottom:12}}>
            <Icon size={18} color={s.color}/>
          </div>
          <div style={{fontFamily:FF.display,fontSize:typeof s.value==="string"?18:28,fontWeight:800,color:C.textHi,lineHeight:1,letterSpacing:-0.5}}>{s.value}</div>
          <div style={{fontSize:12,color:C.textDim,marginTop:6,fontWeight:600}}>{s.label}</div>
          {s.sub&&<div style={{fontSize:11,color:s.color,marginTop:3,fontWeight:700}}>{s.sub}</div>}
        </div>;
      })}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:20,marginBottom:20}}>
      {/* Standorte */}
      <Card accent={C.primary}>
        <SecTitle>Standorte heute <span style={{color:C.textVeryDim,fontWeight:400}}>– klicken für Details</span></SecTitle>
        {byLoc.map(loc=><div key={loc.id} onClick={()=>{setTab("plan");}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.surfaceAlt,borderRadius:10,marginBottom:8,cursor:"pointer",transition:"all .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=loc.color+"15"}
          onMouseLeave={e=>e.currentTarget.style.background=C.surfaceAlt}>
          <div style={{width:10,height:10,borderRadius:5,background:loc.color,flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:C.textHi}}>{loc.name}</div>
            <div style={{fontSize:11,color:C.textDim,marginTop:1}}>{loc.count} Stunden · {loc.done} fertig</div>
          </div>
          <div style={{width:80,height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${loc.count?(loc.done/loc.count)*100:0}%`,background:loc.color,borderRadius:3,transition:"width .5s"}}/>
          </div>
          <span style={{fontSize:11,fontWeight:800,color:loc.color,minWidth:30,textAlign:"right"}}>{loc.count?Math.round((loc.done/loc.count)*100):0}%</span>
          <ChevronRight size={14} color={C.textVeryDim}/>
        </div>)}
      </Card>

      {/* Lehrkräfte */}
      <Card>
        <SecTitle>Lehrkräfte heute</SecTitle>
        {teachers.map(t=>{
          const ta=todayApts.filter(a=>a.teacherId===t.id);
          if(!ta.length) return null;
          const active=ta.find(a=>a.status==="checked-in");
          return <div key={t.id} onClick={()=>setView({type:"teacher",id:t.id})} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.surfaceAlt,borderRadius:10,marginBottom:6,cursor:"pointer",transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.primaryTint||"#EBF0FA"}
            onMouseLeave={e=>e.currentTarget.style.background=C.surfaceAlt}>
            <Avatar short={t.short} color={t.color} size={32}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.textHi}}>{t.name}</div>
              <div style={{fontSize:10,color:C.textDim}}>{ta.length} Stunden heute</div>
            </div>
            {active&&<span style={{fontSize:10,fontWeight:800,color:C.accent,background:C.accentTint,padding:"2px 8px",borderRadius:6}}>AKTIV</span>}
            <ChevronRight size={14} color={C.textVeryDim}/>
          </div>;
        }).filter(Boolean)}
      </Card>
    </div>

    {/* Heutige Stunden */}
    <Card>
      <SecTitle>Alle Stunden heute <span style={{color:C.textVeryDim,fontWeight:400,fontSize:10}}>– anklicken für Details</span>
        <button onClick={()=>setTab("stunden")} style={{fontSize:12,fontWeight:700,color:C.accent,background:"transparent",border:"none",cursor:"pointer",fontFamily:FF.body}}>Alle →</button>
      </SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
        {todayApts.map(a=>{
          const t=teachers.find(x=>x.id===a.teacherId);
          const loc=LOCATIONS.find(l=>l.id===a.locationId);
          const names=a.studentIds.map(id=>students.find(s=>s.id===id)?.name).filter(Boolean);
          const sc={completed:C.success,"checked-in":C.accent,scheduled:C.textVeryDim};
          return <div key={a.id} onClick={()=>setView({type:"apt",id:a.id})} style={{display:"flex",gap:10,padding:"10px 12px",background:a.status==="checked-in"?C.accentTint:C.surfaceAlt,borderRadius:10,border:a.status==="checked-in"?`1.5px solid ${C.accent}60`:"1px solid transparent",cursor:"pointer",transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.primary}
            onMouseLeave={e=>e.currentTarget.style.borderColor=a.status==="checked-in"?`${C.accent}60`:"transparent"}>
            <div style={{fontFamily:FF.display,fontSize:13,fontWeight:800,color:C.textHi,minWidth:44}}>{a.time}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:C.textHi,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{names.join(", ")}</div>
              <div style={{fontSize:10,color:C.textDim,marginTop:1}}>{t?.name} · {loc?.short} · {a.room}</div>
            </div>
            <div style={{width:8,height:8,borderRadius:4,background:sc[a.status]||C.textVeryDim,flexShrink:0,marginTop:3}}/>
          </div>;
        })}
      </div>
    </Card>
  </div>;
}

/* =========================================================
   STUNDEN DETAIL (Termin)
   ========================================================= */
function AptDetail({aptId,apts,teachers,students,setApts,onBack}){
  const a=apts.find(x=>x.id===aptId); if(!a) return null;
  const t=teachers.find(x=>x.id===a.teacherId);
  const loc=LOCATIONS.find(l=>l.id===a.locationId);
  const studs=a.studentIds.map(id=>students.find(s=>s.id===id)).filter(Boolean);
  const [notes,setNotes]=useState(a.notes||"");

  const checkIn=()=>setApts(prev=>prev.map(x=>x.id===aptId?{...x,status:"checked-in",checkedInAt:"jetzt",_checkedInTs:Date.now()}:x));
  const checkOut=()=>setApts(prev=>prev.map(x=>x.id===aptId?{...x,status:"completed",checkedOutAt:"jetzt",completedDur:60,notes}:x));

  const statusMap={completed:{color:C.success,label:"Abgeschlossen"},"checked-in":{color:C.accent,label:"Läuft jetzt"},scheduled:{color:C.textDim,label:"Geplant"}};
  const s=statusMap[a.status];

  return <div style={{padding:"28px 40px 60px",maxWidth:700}}>
    <button onClick={onBack} style={{background:"transparent",border:"none",color:C.textDim,display:"flex",alignItems:"center",gap:6,padding:0,cursor:"pointer",marginBottom:20,fontFamily:FF.body,fontSize:13,fontWeight:600}}>
      <ArrowLeft size={16}/> Zurück
    </button>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
      <div style={{width:52,height:52,borderRadius:14,background:loc?.color||C.primary,display:"grid",placeItems:"center",color:"#fff",fontWeight:800,fontSize:18}}>{loc?.short}</div>
      <div>
        <h1 style={{fontFamily:FF.display,fontSize:24,fontWeight:800,color:C.textHi,margin:"0 0 4px",letterSpacing:-0.5}}>{a.time} Uhr · {loc?.name}</h1>
        <div style={{display:"flex",gap:6}}><Badge color={s.color}>{s.label}</Badge><Badge color={C.primary}>{a.room}</Badge></div>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <Card accent={t?.color}>
        <div style={{paddingTop:4}}>
          <div style={{fontSize:10,fontWeight:800,color:C.textDim,letterSpacing:1.5,marginBottom:10}}>LEHRKRAFT</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Avatar short={t?.short} color={t?.color} size={38}/>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:C.textHi}}>{t?.name}</div>
              <div style={{fontSize:11,color:C.textDim}}>{t?.subjects?.join(" · ")}</div>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div style={{fontSize:10,fontWeight:800,color:C.textDim,letterSpacing:1.5,marginBottom:10}}>SCHÜLER ({studs.length})</div>
        {studs.map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <Avatar short={s.short} size={28}/>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.textHi}}>{s.name}</div>
            <div style={{fontSize:10,color:C.textDim}}>Kl. {s.grade} · {s.subjects?.join(", ")}</div>
          </div>
        </div>)}
      </Card>
    </div>

    {a.status==="checked-in"&&<div style={{padding:20,background:`linear-gradient(135deg,${C.accent}18 0%,${C.accentDk}08 100%)`,border:`1.5px solid ${C.accent}60`,borderRadius:14,marginBottom:20,textAlign:"center"}}>
      <div style={{fontSize:11,fontWeight:800,color:C.accent,letterSpacing:1.5,marginBottom:8}}>STUNDE LÄUFT</div>
      <div style={{fontFamily:FF.display,fontSize:40,fontWeight:800,color:C.textHi,letterSpacing:-2}}>00:12</div>
      <div style={{fontSize:12,color:C.textDim,marginTop:6}}>seit Check-in um {a.checkedInAt}</div>
    </div>}

    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:12,fontWeight:700,color:C.textDim,marginBottom:6}}>Notizen zur Stunde</label>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Was habt ihr gemacht?" style={{width:"100%",minHeight:80,padding:"12px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surfaceAlt,color:C.textHi,fontSize:13,fontFamily:FF.body,outline:"none",boxSizing:"border-box",resize:"vertical"}}/>
    </div>

    {a.status==="scheduled"&&<Btn onClick={checkIn} icon={Play} color={`linear-gradient(135deg,${C.primary} 0%,${C.primaryLi} 100%)`}>Stunde starten · Einchecken</Btn>}
    {a.status==="checked-in"&&<Btn onClick={checkOut} icon={Square} color={`linear-gradient(135deg,${C.danger} 0%,#9B1C1C 100%)`}>Auschecken · Stunde erfassen</Btn>}
    {a.status==="completed"&&<div style={{padding:"12px 16px",background:C.success+"15",border:`1px solid ${C.success}40`,borderRadius:10,color:C.success,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
      <CheckCircle2 size={16}/> Stunde erfasst · {a.completedDur} Minuten
    </div>}
  </div>;
}

/* =========================================================
   WOCHENPLAN
   ========================================================= */
function Wochenplan({slots,teachers,students}){
  const [locId,setLocId]=useState("heerdt");
  const [dayIdx,setDayIdx]=useState(Math.min(appDay(today),4));
  const [view,setView]=useState("week");
  const [showAdd,setShowAdd]=useState(null);
  const [newSlot,setNewSlot]=useState({time:"14:00",teacherId:"",studentIds:[],type:"einzel",roomId:""});
  const [localSlots,setLocalSlots]=useState(slots);

  const loc=LOCATIONS.find(l=>l.id===locId);
  const locSlots=localSlots.filter(s=>s.locationId===locId);
  const rooms=ROOMS[locId]||[];

  const addSlot=()=>{
    const id="new_"+Date.now();
    setLocalSlots(prev=>[...prev,{id,day:dayIdx,locationId:locId,...newSlot,roomId:newSlot.roomId||rooms[0]?.id}]);
    setShowAdd(null);
    setNewSlot({time:"14:00",teacherId:"",studentIds:[],type:"einzel",roomId:""});
  };

  return <div style={{padding:"32px 40px 60px"}}>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:11,fontWeight:800,color:C.accent,letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>Admin · Wochenplan</div>
      <h1 style={{fontFamily:FF.display,fontSize:32,fontWeight:800,color:C.textHi,margin:0,letterSpacing:-1}}>Wochenplan</h1>
    </div>

    {/* Standort Tabs */}
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
      {LOCATIONS.map(l=><button key={l.id} onClick={()=>setLocId(l.id)} style={{padding:"10px 18px",borderRadius:10,background:locId===l.id?l.color:C.surface,border:`1.5px solid ${locId===l.id?l.color:C.border}`,color:locId===l.id?"#fff":C.textDim,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FF.body,display:"flex",alignItems:"center",gap:6}}>
        <MapPin size={12}/>{l.short} <span style={{fontSize:10,opacity:.7}}>({locSlots.filter(s=>s.locationId===l.id).length})</span>
      </button>)}
    </div>

    {/* View Toggle */}
    <div style={{display:"flex",gap:4,marginBottom:20,background:C.surfaceAlt,padding:4,borderRadius:10,width:"fit-content"}}>
      {[{id:"day",label:"Tagesansicht"},{id:"week",label:"Wochenübersicht"}].map(v=><button key={v.id} onClick={()=>setView(v.id)} style={{padding:"8px 18px",borderRadius:8,background:view===v.id?C.primary:"transparent",border:"none",color:view===v.id?"#fff":C.textDim,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FF.body}}>{v.label}</button>)}
    </div>

    {view==="day"&&<>
      {/* Tag Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {WEEKDAYS.map((d,i)=>{
          const cnt=locSlots.filter(s=>s.day===i).length;
          return <button key={d} onClick={()=>setDayIdx(i)} style={{flex:1,padding:"12px 8px",borderRadius:10,background:dayIdx===i?`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`:C.surface,border:`1.5px solid ${dayIdx===i?"transparent":C.border}`,color:dayIdx===i?"#fff":C.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FF.body,textAlign:"center"}}>
            <div>{d}</div><div style={{fontSize:10,marginTop:2,opacity:.75}}>{cnt} Std</div>
          </button>;
        })}
      </div>
      {/* Räume */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${rooms.length},1fr)`,gap:14}}>
        {rooms.map(room=>{
          const rSlots=locSlots.filter(s=>s.day===dayIdx&&s.roomId===room.id).sort((a,b)=>a.time.localeCompare(b.time));
          return <div key={room.id}>
            <div style={{padding:"10px 14px",background:loc.color,borderRadius:"10px 10px 0 0",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,borderRadius:7,background:"rgba(255,255,255,.15)",display:"grid",placeItems:"center",color:"#fff",fontWeight:800,fontSize:11}}>{room.name.replace("Raum ","")}</div>
              <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{room.name}</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,.6)",marginLeft:"auto"}}>{rSlots.length} Stunden</span>
            </div>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:8,minHeight:140,display:"flex",flexDirection:"column",gap:6}}>
              {rSlots.map(s=>{
                const t=teachers.find(x=>x.id===s.teacherId);
                const studs=s.studentIds.map(id=>students.find(x=>x.id===id)).filter(Boolean);
                return <div key={s.id} style={{padding:"10px 12px",background:loc.color+"12",border:`1.5px solid ${loc.color}35`,borderRadius:8}}>
                  <div style={{fontFamily:FF.display,fontSize:13,fontWeight:800,color:loc.color}}>{s.time}</div>
                  <div style={{fontSize:12,fontWeight:700,color:C.textHi,marginTop:2}}>{t?.name||"—"}</div>
                  <div style={{fontSize:10,color:C.textDim,marginTop:1}}>{studs.map(s=>s.name.split(" ")[0]).join(", ")||"Keine Schüler"}</div>
                  <div style={{marginTop:5}}><Badge color={s.type==="gruppe"?C.info:C.success}>{s.type==="gruppe"?`Gruppe · ${studs.length}`:"Einzel"}</Badge></div>
                </div>;
              })}
              <button onClick={()=>setShowAdd({roomId:room.id})} style={{padding:"9px 0",background:"transparent",border:`1.5px dashed ${C.border}`,borderRadius:8,color:C.textDim,fontSize:12,cursor:"pointer",fontFamily:FF.body,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                <Plus size={12}/> Stunde hinzufügen
              </button>
            </div>
          </div>;
        })}
      </div>
    </>}

    {view==="week"&&<div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"6px 0"}}>
        <thead><tr>
          {WEEKDAYS_LONG.map((d,i)=><th key={d} style={{padding:"12px 14px",background:i===appDay(today)?C.accent:C.primary,color:"#fff",borderRadius:"10px 10px 0 0",fontSize:13,fontWeight:700,textAlign:"center"}}>
            {d}<div style={{fontSize:10,opacity:.65,marginTop:2}}>{locSlots.filter(s=>s.day===i).length} Std</div>
          </th>)}
        </tr></thead>
        <tbody><tr>
          {WEEKDAYS.map((_,di)=>{
            const dSlots=locSlots.filter(s=>s.day===di).sort((a,b)=>a.time.localeCompare(b.time));
            return <td key={di} style={{verticalAlign:"top",background:C.surface,border:`1px solid ${C.border}`,borderRadius:"0 0 10px 10px",padding:8,minWidth:150}}>
              {dSlots.length===0?<div style={{padding:"20px 0",textAlign:"center",color:C.textVeryDim,fontSize:12}}>Frei</div>:dSlots.map(s=>{
                const t=teachers.find(x=>x.id===s.teacherId);
                const studs=s.studentIds.map(id=>students.find(x=>x.id===id)).filter(Boolean);
                const r=ROOMS[locId]?.find(x=>x.id===s.roomId);
                return <div key={s.id} style={{marginBottom:6,padding:"8px 10px",background:loc.color+"10",border:`1px solid ${loc.color}25`,borderRadius:8}}>
                  <div style={{fontFamily:FF.display,fontWeight:800,fontSize:12,color:loc.color}}>{s.time}</div>
                  <div style={{fontSize:11,fontWeight:700,color:C.textHi,marginTop:1}}>{t?.short} · {r?.name}</div>
                  <div style={{fontSize:10,color:C.textDim}}>{studs.map(s=>s.name.split(" ")[0]).join(", ")}</div>
                </div>;
              })}
            </td>;
          })}
        </tr></tbody>
      </table>
    </div>}

    {/* Add Slot Modal */}
    {showAdd&&<div style={{position:"fixed",inset:0,background:"rgba(15,27,45,.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(3px)"}}>
      <div style={{background:C.surface,borderRadius:18,padding:28,width:420,boxShadow:"0 24px 48px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <h3 style={{fontFamily:FF.display,fontSize:18,fontWeight:800,color:C.textHi,margin:0}}>Stunde hinzufügen</h3>
          <button onClick={()=>setShowAdd(null)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.textDim}}><X size={20}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.textDim,display:"block",marginBottom:6}}>Uhrzeit</label>
            <select value={newSlot.time} onChange={e=>setNewSlot(p=>({...p,time:e.target.value}))} style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surfaceAlt,color:C.textHi,fontSize:14,fontFamily:FF.body}}>
              {["13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.textDim,display:"block",marginBottom:6}}>Lehrkraft</label>
            <select value={newSlot.teacherId} onChange={e=>setNewSlot(p=>({...p,teacherId:e.target.value}))} style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surfaceAlt,color:C.textHi,fontSize:14,fontFamily:FF.body}}>
              <option value="">Auswählen…</option>
              {teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.textDim,display:"block",marginBottom:6}}>Art</label>
            <div style={{display:"flex",gap:8}}>
              {["einzel","gruppe"].map(v=><button key={v} onClick={()=>setNewSlot(p=>({...p,type:v}))} style={{flex:1,padding:"10px 0",borderRadius:8,background:newSlot.type===v?C.primary:C.surfaceAlt,border:`1.5px solid ${newSlot.type===v?C.primary:C.border}`,color:newSlot.type===v?"#fff":C.textDim,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FF.body,textTransform:"capitalize"}}>{v}</button>)}
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={()=>setShowAdd(null)} style={{flex:1,padding:12,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textDim,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FF.body}}>Abbrechen</button>
            <button onClick={addSlot} disabled={!newSlot.teacherId} style={{flex:1,padding:12,background:newSlot.teacherId?`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`:C.border,border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:newSlot.teacherId?"pointer":"not-allowed",fontFamily:FF.body}}>Hinzufügen</button>
          </div>
        </div>
      </div>
    </div>}
  </div>;
}

/* =========================================================
   SCHÜLER
   ========================================================= */
function Schueler({students,setStudents,teachers,setView}){
  const [q,setQ]=useState("");
  const [locF,setLocF]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [draft,setDraft]=useState({name:"",grade:"",subjects:[],focus:"",notes:"",locationId:"heerdt",teacherId:""});

  const filtered=students.filter(s=>(locF==="all"||s.locationId===locF)&&(s.name.toLowerCase().includes(q.toLowerCase())||s.subjects.some(x=>x.toLowerCase().includes(q.toLowerCase()))));

  const addStudent=()=>{
    const id="s_"+Date.now();
    const short=initials(draft.name);
    setStudents(prev=>[...prev,{id,short,...draft,grade:parseInt(draft.grade)||1,since:new Date().toLocaleDateString("de-DE",{month:"short",year:"numeric"})}]);
    setShowAdd(false);
    setDraft({name:"",grade:"",subjects:[],focus:"",notes:"",locationId:"heerdt",teacherId:""});
  };

  return <div style={{padding:"32px 40px 60px"}}>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:11,fontWeight:800,color:C.accent,letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>Admin · Schüler</div>
      <h1 style={{fontFamily:FF.display,fontSize:32,fontWeight:800,color:C.textHi,margin:0,letterSpacing:-1}}>{students.length} Schülerinnen & Schüler</h1>
    </div>

    <div style={{display:"flex",gap:12,marginBottom:22}}>
      <div style={{flex:1,position:"relative"}}>
        <Search size={15} color={C.textDim} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)"}}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Name oder Fach…" style={{width:"100%",padding:"11px 12px 11px 38px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surface,color:C.textHi,fontSize:14,fontFamily:FF.body,outline:"none",boxSizing:"border-box"}}/>
      </div>
      <select value={locF} onChange={e=>setLocF(e.target.value)} style={{padding:"11px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surface,color:C.textHi,fontSize:13,fontFamily:FF.body,cursor:"pointer"}}>
        <option value="all">Alle Standorte</option>
        {LOCATIONS.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
      <button onClick={()=>setShowAdd(true)} style={{padding:"11px 18px",background:`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,fontFamily:FF.body,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
        <UserPlus size={14}/> Neu anlegen
      </button>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {filtered.map(s=>{
        const t=teachers.find(x=>x.id===s.teacherId);
        const loc=LOCATIONS.find(l=>l.id===s.locationId);
        return <div key={s.id} onClick={()=>setView({type:"student",id:s.id})} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:18,cursor:"pointer",transition:"all .2s",position:"relative",overflow:"hidden",boxShadow:"0 1px 4px rgba(26,58,107,.05)"}}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 24px rgba(26,58,107,.12)";e.currentTarget.style.borderColor=loc?.color||C.primary;}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(26,58,107,.05)";e.currentTarget.style.borderColor=C.border;}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:loc?.color||C.primary}}/>
          <div style={{paddingTop:6,display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
            <Avatar short={s.short} size={42}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:800,fontSize:15,color:C.textHi}}>{s.name}</div>
              <div style={{fontSize:12,color:C.textDim,marginTop:2}}>Klasse {s.grade} · seit {s.since}</div>
              <div style={{marginTop:6,display:"flex",gap:4,flexWrap:"wrap"}}>{s.subjects.map(sub=><Badge key={sub} color={C.primary}>{sub}</Badge>)}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            {t?<div style={{display:"flex",alignItems:"center",gap:8}}><Avatar short={t.short} color={t.color} size={22}/><span style={{fontSize:11,color:C.textDim}}>{t.name}</span></div>:<span style={{fontSize:11,color:C.warn,fontWeight:700}}>Keine Zuweisung</span>}
            <LocBadge locationId={s.locationId}/>
          </div>
        </div>;
      })}
    </div>

    {/* Add Student Modal */}
    {showAdd&&<div style={{position:"fixed",inset:0,background:"rgba(15,27,45,.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(3px)"}}>
      <div style={{background:C.surface,borderRadius:18,padding:28,width:500,maxHeight:"85vh",overflow:"auto",boxShadow:"0 24px 48px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <h3 style={{fontFamily:FF.display,fontSize:20,fontWeight:800,color:C.textHi,margin:0}}>Neuen Schüler anlegen</h3>
          <button onClick={()=>setShowAdd(false)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.textDim}}><X size={20}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="Name *" value={draft.name} onChange={v=>setDraft(p=>({...p,name:v}))} placeholder="Vor- und Nachname"/>
          <Input label="Klasse (1–13) *" value={draft.grade} onChange={v=>setDraft(p=>({...p,grade:v}))} type="number" placeholder="z.B. 7"/>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.textDim,display:"block",marginBottom:8}}>Fächer</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {ALL_SUBJECTS.map(s=>{const on=draft.subjects.includes(s);return <button key={s} onClick={()=>setDraft(p=>({...p,subjects:on?p.subjects.filter(x=>x!==s):[...p.subjects,s]}))} style={{padding:"6px 12px",borderRadius:7,border:`1.5px solid ${on?C.accent:C.border}`,background:on?C.accentTint:C.surfaceAlt,color:on?C.accent:C.textDim,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FF.body}}>{s}</button>;})}
            </div>
          </div>
          <Input label="Schwerpunkt" value={draft.focus} onChange={v=>setDraft(p=>({...p,focus:v}))} placeholder="z.B. ZP10, Abi-Vorbereitung"/>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.textDim,display:"block",marginBottom:6}}>Standort</label>
            <select value={draft.locationId} onChange={e=>setDraft(p=>({...p,locationId:e.target.value}))} style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surfaceAlt,color:C.textHi,fontSize:14,fontFamily:FF.body}}>
              {LOCATIONS.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.textDim,display:"block",marginBottom:6}}>Lehrkraft zuweisen</label>
            <select value={draft.teacherId} onChange={e=>setDraft(p=>({...p,teacherId:e.target.value}))} style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surfaceAlt,color:C.textHi,fontSize:14,fontFamily:FF.body}}>
              <option value="">Später zuweisen</option>
              {teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:13,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textDim,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FF.body}}>Abbrechen</button>
            <button onClick={addStudent} disabled={!draft.name||!draft.grade} style={{flex:1,padding:13,background:draft.name&&draft.grade?`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`:C.border,border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:draft.name&&draft.grade?"pointer":"not-allowed",fontFamily:FF.body}}>Anlegen</button>
          </div>
        </div>
      </div>
    </div>}
  </div>;
}

/* =========================================================
   SCHÜLER DETAIL
   ========================================================= */
function StudentDetail({studentId,students,teachers,apts,setStudents,onBack}){
  const s=students.find(x=>x.id===studentId); if(!s) return null;
  const t=teachers.find(x=>x.id===s.teacherId);
  const loc=LOCATIONS.find(l=>l.id===s.locationId);
  const sApts=apts.filter(a=>a.studentIds?.includes(studentId));
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState({...s});

  const save=()=>{setStudents(prev=>prev.map(x=>x.id===studentId?{...x,...draft}:x));setEditing(false);};

  return <div style={{padding:"28px 40px 60px",maxWidth:800}}>
    <button onClick={onBack} style={{background:"transparent",border:"none",color:C.textDim,display:"flex",alignItems:"center",gap:6,padding:0,cursor:"pointer",marginBottom:20,fontFamily:FF.body,fontSize:13,fontWeight:600}}>
      <ArrowLeft size={16}/> Zurück
    </button>
    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
      <Avatar short={s.short} size={64}/>
      <div>
        <h1 style={{fontFamily:FF.display,fontSize:28,fontWeight:800,color:C.textHi,margin:"0 0 6px",letterSpacing:-0.8}}>{s.name}</h1>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <Badge color={C.primary}>Klasse {s.grade}</Badge>
          {s.subjects.map(sub=><Badge key={sub} color={C.primaryLi}>{sub}</Badge>)}
          <LocBadge locationId={s.locationId}/>
          {s.focus&&<Badge color={C.accent}>{s.focus}</Badge>}
        </div>
      </div>
      <button onClick={()=>setEditing(!editing)} style={{marginLeft:"auto",padding:"10px 16px",background:editing?C.surface:`linear-gradient(135deg,${C.primary} 0%,${C.primaryLi} 100%)`,border:editing?`1px solid ${C.border}`:"none",borderRadius:10,color:editing?C.text:"#fff",fontSize:13,fontWeight:700,fontFamily:FF.body,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
        <Edit2 size={13}/>{editing?"Abbrechen":"Bearbeiten"}
      </button>
    </div>

    {editing?<Card accent={C.accent}>
      <div style={{paddingTop:4,display:"flex",flexDirection:"column",gap:14}}>
        <Input label="Name" value={draft.name} onChange={v=>setDraft(p=>({...p,name:v}))}/>
        <Input label="Klasse" value={String(draft.grade)} onChange={v=>setDraft(p=>({...p,grade:parseInt(v)||1}))} type="number"/>
        <Input label="Schwerpunkt" value={draft.focus||""} onChange={v=>setDraft(p=>({...p,focus:v}))}/>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:C.textDim,display:"block",marginBottom:8}}>Fächer</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {ALL_SUBJECTS.map(sub=>{const on=draft.subjects.includes(sub);return <button key={sub} onClick={()=>setDraft(p=>({...p,subjects:on?p.subjects.filter(x=>x!==sub):[...p.subjects,sub]}))} style={{padding:"6px 12px",borderRadius:7,border:`1.5px solid ${on?C.accent:C.border}`,background:on?C.accentTint:C.surfaceAlt,color:on?C.accent:C.textDim,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FF.body}}>{sub}</button>;})}
          </div>
        </div>
        <button onClick={save} style={{padding:12,background:`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,fontFamily:FF.body,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Check size={15}/> Speichern
        </button>
      </div>
    </Card>:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <Card>
        <SecTitle>Lehrkraft</SecTitle>
        {t?<div style={{display:"flex",alignItems:"center",gap:10}}>
          <Avatar short={t.short} color={t.color} size={40}/>
          <div><div style={{fontWeight:700,fontSize:14,color:C.textHi}}>{t.name}</div><div style={{fontSize:11,color:C.textDim}}>{t.subjects?.join(" · ")}</div></div>
        </div>:<span style={{fontSize:13,color:C.warn,fontWeight:700}}>Keine Zuweisung</span>}
      </Card>
      <Card>
        <SecTitle>Standort</SecTitle>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:10,height:10,borderRadius:5,background:loc?.color}}/>
          <span style={{fontWeight:700,fontSize:14,color:C.textHi}}>{loc?.name}</span>
        </div>
        <div style={{marginTop:8,fontSize:12,color:C.textDim}}>seit {s.since}</div>
      </Card>
    </div>}

    {s.notes&&!editing&&<Card><SecTitle>Notizen</SecTitle><p style={{fontSize:13,color:C.text,lineHeight:1.6,margin:0}}>{s.notes}</p></Card>}

    <div style={{marginTop:16}}>
      <Card>
        <SecTitle>Termine ({sApts.length})</SecTitle>
        {sApts.slice(0,5).map(a=>{
          const sc={completed:C.success,"checked-in":C.accent,scheduled:C.textDim};
          return <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.surfaceAlt,borderRadius:8,marginBottom:6}}>
            <div style={{width:8,height:8,borderRadius:4,background:sc[a.status]||C.textDim,flexShrink:0}}/>
            <span style={{fontFamily:FF.display,fontWeight:700,fontSize:13,color:C.textHi,minWidth:44}}>{a.time}</span>
            <span style={{fontSize:12,color:C.textDim,flex:1}}>{a.locationId} · {a.room}</span>
            {a.completedDur&&<span style={{fontSize:11,fontWeight:700,color:C.success}}>{a.completedDur}m</span>}
          </div>;
        })}
      </Card>
    </div>
  </div>;
}

/* =========================================================
   LEHRKRÄFTE
   ========================================================= */
function Lehrkraefte({teachers,setTeachers,students,apts,setView}){
  const [showAdd,setShowAdd]=useState(false);
  const [draft,setDraft]=useState({name:"",email:"",rate:"",subjects:[],color:TEACHER_COLORS[0]});

  const add=()=>{
    const id="t_"+Date.now();
    setTeachers(prev=>[...prev,{id,short:initials(draft.name),role:"teacher",...draft,rate:parseFloat(draft.rate)||22}]);
    setShowAdd(false);
    setDraft({name:"",email:"",rate:"",subjects:[],color:TEACHER_COLORS[0]});
  };

  return <div style={{padding:"32px 40px 60px"}}>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:11,fontWeight:800,color:C.accent,letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>Admin · Lehrkräfte</div>
      <h1 style={{fontFamily:FF.display,fontSize:32,fontWeight:800,color:C.textHi,margin:0,letterSpacing:-1}}>{teachers.length} Lehrkräfte</h1>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
      <button onClick={()=>setShowAdd(true)} style={{padding:"12px 20px",background:`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,fontFamily:FF.body,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
        <UserPlus size={14}/> Neue Lehrkraft einladen
      </button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
      {teachers.map(t=>{
        const myS=students.filter(s=>s.teacherId===t.id);
        const openH=apts.filter(a=>a.teacherId===t.id&&a.status==="completed"&&!a.billed).reduce((s,a)=>s+(a.completedDur||60)/60,0);
        const locs=[...new Set(myS.map(s=>s.locationId))].map(id=>LOCATIONS.find(l=>l.id===id)).filter(Boolean);
        return <div key={t.id} onClick={()=>setView({type:"teacher",id:t.id})} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all .2s",boxShadow:"0 1px 4px rgba(26,58,107,.05)"}}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 24px rgba(26,58,107,.12)";e.currentTarget.style.borderColor=t.color;}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(26,58,107,.05)";e.currentTarget.style.borderColor=C.border;}}>
          <div style={{height:4,background:t.color}}/>
          <div style={{padding:20}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <Avatar short={t.short} color={t.color} size={52}/>
              <div>
                <div style={{fontFamily:FF.display,fontWeight:800,fontSize:16,color:C.textHi}}>{t.name}</div>
                <div style={{fontSize:12,color:C.textDim,marginTop:2}}>{t.email}</div>
                <div style={{marginTop:6,display:"flex",gap:4,flexWrap:"wrap"}}>{locs.map(l=><LocBadge key={l.id} locationId={l.id}/>)}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>{t.subjects.map(s=><Badge key={s} color={C.primaryLi}>{s}</Badge>)}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
              {[{label:"SCHÜLER",value:myS.length,color:C.primary},{label:"STD OFFEN",value:openH.toFixed(1)+"h",color:C.accent},{label:"PRO STD",value:t.rate+"€",color:C.success}].map(stat=><div key={stat.label} style={{textAlign:"center"}}>
                <div style={{fontFamily:FF.display,fontSize:18,fontWeight:800,color:stat.color}}>{stat.value}</div>
                <div style={{fontSize:9,fontWeight:800,color:C.textVeryDim,letterSpacing:1,marginTop:3}}>{stat.label}</div>
              </div>)}
            </div>
          </div>
        </div>;
      })}
    </div>

    {/* Add Teacher Modal */}
    {showAdd&&<div style={{position:"fixed",inset:0,background:"rgba(15,27,45,.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(3px)"}}>
      <div style={{background:C.surface,borderRadius:18,padding:28,width:480,maxHeight:"85vh",overflow:"auto",boxShadow:"0 24px 48px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <h3 style={{fontFamily:FF.display,fontSize:20,fontWeight:800,color:C.textHi,margin:0}}>Neue Lehrkraft</h3>
          <button onClick={()=>setShowAdd(false)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.textDim}}><X size={20}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="Name *" value={draft.name} onChange={v=>setDraft(p=>({...p,name:v}))} placeholder="Vor- und Nachname"/>
          <Input label="E-Mail" value={draft.email} onChange={v=>setDraft(p=>({...p,email:v}))} type="email" placeholder="name@lernwelt.de"/>
          <Input label="Stundensatz (€)" value={draft.rate} onChange={v=>setDraft(p=>({...p,rate:v}))} type="number" placeholder="z.B. 24"/>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.textDim,display:"block",marginBottom:8}}>Fächer</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {ALL_SUBJECTS.map(s=>{const on=draft.subjects.includes(s);return <button key={s} onClick={()=>setDraft(p=>({...p,subjects:on?p.subjects.filter(x=>x!==s):[...p.subjects,s]}))} style={{padding:"6px 12px",borderRadius:7,border:`1.5px solid ${on?C.accent:C.border}`,background:on?C.accentTint:C.surfaceAlt,color:on?C.accent:C.textDim,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FF.body}}>{s}</button>;})}
            </div>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:C.textDim,display:"block",marginBottom:8}}>Farbe</label>
            <div style={{display:"flex",gap:8}}>
              {TEACHER_COLORS.map(c=><button key={c} onClick={()=>setDraft(p=>({...p,color:c}))} style={{width:32,height:32,borderRadius:"50%",background:c,border:draft.color===c?"3px solid #fff":"3px solid transparent",outline:draft.color===c?`2px solid ${c}`:"none",cursor:"pointer"}}/>)}
            </div>
          </div>
          {draft.name&&<div style={{padding:14,background:C.surfaceAlt,borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
            <Avatar short={initials(draft.name)} color={draft.color} size={38}/>
            <div><div style={{fontWeight:700,fontSize:14,color:C.textHi}}>{draft.name}</div><div style={{fontSize:11,color:C.textDim}}>{draft.subjects.join(" · ")||"Keine Fächer"} · {draft.rate||22}€/h</div></div>
          </div>}
          <div style={{display:"flex",gap:10,marginTop:4}}>
            <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:13,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textDim,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FF.body}}>Abbrechen</button>
            <button onClick={add} disabled={!draft.name} style={{flex:1,padding:13,background:draft.name?`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`:C.border,border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:draft.name?"pointer":"not-allowed",fontFamily:FF.body,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <UserPlus size={13}/> Einladen
            </button>
          </div>
        </div>
      </div>
    </div>}
  </div>;
}

/* =========================================================
   LEHRKRAFT DETAIL
   ========================================================= */
function TeacherDetail({teacherId,teachers,students,apts,onBack}){
  const t=teachers.find(x=>x.id===teacherId); if(!t) return null;
  const myS=students.filter(s=>s.teacherId===t.id);
  const myApts=apts.filter(a=>a.teacherId===t.id);
  const openApts=myApts.filter(a=>a.status==="completed"&&!a.billed);
  const openHrs=openApts.reduce((s,a)=>s+(a.completedDur||60)/60,0);
  const locs=[...new Set(myS.map(s=>s.locationId))].map(id=>LOCATIONS.find(l=>l.id===id)).filter(Boolean);

  return <div style={{padding:"28px 40px 60px",maxWidth:800}}>
    <button onClick={onBack} style={{background:"transparent",border:"none",color:C.textDim,display:"flex",alignItems:"center",gap:6,padding:0,cursor:"pointer",marginBottom:20,fontFamily:FF.body,fontSize:13,fontWeight:600}}>
      <ArrowLeft size={16}/> Zurück
    </button>
    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
      <Avatar short={t.short} color={t.color} size={64}/>
      <div>
        <h1 style={{fontFamily:FF.display,fontSize:28,fontWeight:800,color:C.textHi,margin:"0 0 6px",letterSpacing:-0.8}}>{t.name}</h1>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {t.subjects.map(s=><Badge key={s} color={C.primaryLi}>{s}</Badge>)}
          {locs.map(l=><LocBadge key={l.id} locationId={l.id}/>)}
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20}}>
      {[{label:"Schüler",value:myS.length,color:C.primary},{label:"Offene Stunden",value:openHrs.toFixed(1)+"h",color:C.accent},{label:"Stundensatz",value:t.rate+"€",color:C.success}].map(s=><Card key={s.label}>
        <div style={{fontFamily:FF.display,fontSize:28,fontWeight:800,color:s.color,letterSpacing:-1}}>{s.value}</div>
        <div style={{fontSize:12,color:C.textDim,marginTop:6,fontWeight:600}}>{s.label}</div>
      </Card>)}
    </div>
    <Card>
      <SecTitle>Meine Schüler ({myS.length})</SecTitle>
      {myS.map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.surfaceAlt,borderRadius:8,marginBottom:6}}>
        <Avatar short={s.short} size={30}/>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.textHi}}>{s.name}</div><div style={{fontSize:10,color:C.textDim}}>Kl. {s.grade} · {s.subjects.join(", ")}</div></div>
        <LocBadge locationId={s.locationId}/>
      </div>)}
    </Card>
  </div>;
}

/* =========================================================
   ABRECHNUNG
   ========================================================= */
function Abrechnung({teachers,students,apts,setApts}){
  const [pinStep,setPinStep]=useState(null);
  const [pin,setPin]=useState("");
  const [pinErr,setPinErr]=useState(false);
  const [billed,setBilled]=useState([]);

  const summaries=teachers.map(t=>{
    const open=apts.filter(a=>a.teacherId===t.id&&a.status==="completed"&&!a.billed&&!billed.includes(t.id));
    const hrs=open.reduce((s,a)=>s+(a.completedDur||60)/60,0);
    return {teacher:t,openCount:open.length,hrs,cost:hrs*t.rate};
  });
  const totalCost=summaries.reduce((s,x)=>s+x.cost,0);
  const totalHrs=summaries.reduce((s,x)=>s+x.hrs,0);

  const handlePin=d=>{
    const next=pin+d; setPin(next);
    if(next.length===4){
      setTimeout(()=>{
        if(next==="1234"){setBilled(prev=>[...prev,pinStep]);setPinStep(null);setPin("");}
        else{setPinErr(true);setPin("");setTimeout(()=>setPinErr(false),1000);}
      },200);
    }
  };

  return <div style={{padding:"32px 40px 60px"}}>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:11,fontWeight:800,color:C.accent,letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>Admin · Lohnabrechnung</div>
      <h1 style={{fontFamily:FF.display,fontSize:32,fontWeight:800,color:C.textHi,margin:0,letterSpacing:-1}}>{today.toLocaleDateString("de-DE",{month:"long",year:"numeric"})}</h1>
    </div>

    {/* Gesamt Banner */}
    <div style={{padding:24,background:`linear-gradient(135deg,${C.primary} 0%,${C.primaryLi} 100%)`,borderRadius:16,marginBottom:24,display:"flex",gap:32,alignItems:"center"}}>
      <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.15)",display:"grid",placeItems:"center"}}><ShieldCheck size={26} color="#fff"/></div>
      <div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.55)",fontWeight:800,letterSpacing:1.5,marginBottom:6}}>OFFENE LOHNSUMME · PIN-GESCHÜTZT</div>
        <div style={{fontFamily:FF.display,fontSize:36,fontWeight:800,color:"#fff",letterSpacing:-1.5}}>{fmtEur(totalCost)}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.65)",marginTop:4}}>{totalHrs.toFixed(1)} Stunden · {teachers.length} Lehrkräfte</div>
      </div>
    </div>

    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {summaries.map(({teacher:t,openCount,hrs,cost})=>{
        const isBilled=billed.includes(t.id);
        return <Card key={t.id}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <Avatar short={t.short} color={t.color} size={44}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15,color:C.textHi}}>{t.name}</div>
              <div style={{fontSize:12,color:C.textDim,marginTop:2}}>{t.subjects.join(" · ")} · {t.rate} €/h</div>
            </div>
            <div style={{textAlign:"right",marginRight:16}}>
              <div style={{fontFamily:FF.display,fontSize:22,fontWeight:800,color:isBilled?C.textDim:C.textHi}}>{fmtEur(cost)}</div>
              <div style={{fontSize:11,color:C.textDim,marginTop:1}}>{hrs.toFixed(1)} Std · {openCount} Termine</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={{padding:"10px 14px",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,color:C.textDim,fontSize:12,fontWeight:700,fontFamily:FF.body,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                <Download size={12}/> CSV
              </button>
              {isBilled?<div style={{padding:"10px 16px",background:C.success+"18",border:`1px solid ${C.success}40`,borderRadius:10,color:C.success,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                <Check size={12}/> Abgerechnet
              </div>:<button onClick={()=>{setPinStep(t.id);setPin("");}} disabled={openCount===0} style={{padding:"10px 16px",background:openCount>0?C.success:C.border,border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,fontFamily:FF.body,cursor:openCount>0?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:4,opacity:openCount===0?.5:1}}>
                <Lock size={12}/> Abrechnen
              </button>}
            </div>
          </div>
        </Card>;
      })}
    </div>

    {/* PIN Modal */}
    {pinStep&&<div style={{position:"fixed",inset:0,background:"rgba(15,27,45,.7)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:C.surface,borderRadius:20,padding:32,width:340,boxShadow:"0 24px 48px rgba(0,0,0,.25)"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{width:56,height:56,borderRadius:16,background:`linear-gradient(135deg,${C.accent} 0%,${C.accentDk} 100%)`,display:"grid",placeItems:"center",margin:"0 auto 14px"}}><Lock size={24} color="#fff"/></div>
          <h3 style={{fontFamily:FF.display,fontSize:20,fontWeight:800,color:C.textHi,margin:"0 0 4px"}}>PIN eingeben</h3>
          <p style={{fontSize:12,color:C.textDim,margin:0}}>{teachers.find(t=>t.id===pinStep)?.name}</p>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:6}}>
          {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<pin.length?(pinErr?C.danger:C.accent):"transparent",border:`2px solid ${pinErr?C.danger:(i<pin.length?C.accent:C.border)}`,transition:"all .15s"}}/>)}
        </div>
        <div style={{fontSize:11,color:pinErr?C.danger:C.textVeryDim,textAlign:"center",marginBottom:18,fontWeight:600,height:16}}>{pinErr?"Falscher PIN":"Demo-PIN: 1234"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {["1","2","3","4","5","6","7","8","9"].map(d=><button key={d} onClick={()=>handlePin(d)} style={{padding:"16px 0",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,color:C.textHi,fontFamily:FF.display,fontSize:20,fontWeight:700,cursor:"pointer"}}>{d}</button>)}
          <button onClick={()=>{setPinStep(null);setPin("");}} style={{padding:"16px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textDim,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FF.body}}>Abbr.</button>
          <button onClick={()=>handlePin("0")} style={{padding:"16px 0",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,color:C.textHi,fontFamily:FF.display,fontSize:20,fontWeight:700,cursor:"pointer"}}>0</button>
          <button onClick={()=>setPin(p=>p.slice(0,-1))} style={{padding:"16px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textDim,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FF.body}}>← Del</button>
        </div>
      </div>
    </div>}
  </div>;
}

/* =========================================================
   STUNDEN
   ========================================================= */
function Stunden({apts,setApts,teachers,students,setView}){
  const [dayOffset,setDayOffset]=useState(0);
  const d=new Date(); d.setDate(d.getDate()+dayOffset);
  const dateKey2=dk(d);
  const todayApts=apts.filter(a=>a.dateKey===dateKey2);
  const byTeacher=teachers.map(t=>({teacher:t,apts:todayApts.filter(a=>a.teacherId===t.id).sort((a,b)=>a.time.localeCompare(b.time))})).filter(x=>x.apts.length>0);
  const done=todayApts.filter(a=>a.status==="completed").length;
  const dateLabel=d.toLocaleDateString("de-DE",{weekday:"long",day:"2-digit",month:"long"});

  const confirm=apt=>setApts(prev=>prev.map(a=>a.id===apt.id?{...a,status:"completed",completedDur:60,checkedOutAt:"jetzt"}:a));

  return <div style={{padding:"32px 40px 60px"}}>
    <div style={{marginBottom:24}}>
      <div style={{fontSize:11,fontWeight:800,color:C.accent,letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>Admin · Stunden</div>
      <h1 style={{fontFamily:FF.display,fontSize:32,fontWeight:800,color:C.textHi,margin:0,letterSpacing:-1}}>Stunden bestätigen</h1>
    </div>

    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 20px"}}>
      <button onClick={()=>setDayOffset(o=>o-1)} style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,width:36,height:36,display:"grid",placeItems:"center",cursor:"pointer",color:C.text}}><ChevronLeft size={18}/></button>
      <div style={{flex:1,textAlign:"center"}}>
        <div style={{fontFamily:FF.display,fontSize:18,fontWeight:800,color:C.textHi}}>{dateLabel}{dayOffset===0?" · heute":""}</div>
        <div style={{fontSize:12,color:C.textDim,marginTop:2}}>{done}/{todayApts.length} erfasst</div>
      </div>
      <button onClick={()=>setDayOffset(o=>o+1)} style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,width:36,height:36,display:"grid",placeItems:"center",cursor:"pointer",color:C.text}}><ChevronRight size={18}/></button>
    </div>

    {byTeacher.length===0?<Card><div style={{padding:"40px 20px",textAlign:"center",color:C.textDim,fontSize:14}}>Keine Stunden an diesem Tag.</div></Card>:
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {byTeacher.map(({teacher:t,apts:ta})=><Card key={t.id} accent={t.color}>
        <div style={{paddingTop:6,display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <Avatar short={t.short} color={t.color} size={38}/>
          <div><div style={{fontWeight:800,fontSize:15,color:C.textHi}}>{t.name}</div><div style={{fontSize:12,color:C.textDim}}>{ta.filter(a=>a.status==="completed").length}/{ta.length} erfasst</div></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {ta.map(a=>{
            const loc=LOCATIONS.find(l=>l.id===a.locationId);
            const names=a.studentIds.map(id=>students.find(s=>s.id===id)?.name).filter(Boolean);
            const sc={completed:{color:C.success,label:"Erfasst"},"checked-in":{color:C.accent,label:"Läuft"},scheduled:{color:C.textDim,label:"Geplant"}};
            const s=sc[a.status]||sc.scheduled;
            const started=Date.now()>=new Date(`${a.dateKey}T${a.time}:00`).getTime();
            return <div key={a.id} onClick={()=>setView({type:"apt",id:a.id})} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.surfaceAlt,borderRadius:10,cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.primaryTint||"#EBF0FA"}
              onMouseLeave={e=>e.currentTarget.style.background=C.surfaceAlt}>
              <span style={{fontFamily:FF.display,fontWeight:800,fontSize:14,color:C.textHi,minWidth:44}}>{a.time}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textHi,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{names.join(", ")||"—"}</div>
                <div style={{fontSize:10,color:C.textDim,marginTop:1}}>{loc?.short} · {a.room}</div>
              </div>
              <LocBadge locationId={a.locationId}/>
              <span style={{fontSize:11,fontWeight:700,color:s.color,background:s.color+"18",padding:"3px 9px",borderRadius:6,flexShrink:0}}>{s.label}</span>
              {a.status==="scheduled"&&started&&<button onClick={e=>{e.stopPropagation();confirm(a);}} style={{padding:"6px 12px",background:C.success,border:"none",borderRadius:8,color:"#fff",fontSize:11,fontWeight:700,fontFamily:FF.body,cursor:"pointer",flexShrink:0}}>Bestätigen</button>}
            </div>;
          })}
        </div>
      </Card>)}
    </div>}
  </div>;
}

/* =========================================================
   MAIN APP
   ========================================================= */
export default function App(){
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("dashboard");
  const [view,setView]=useState(null);
  const [teachers,setTeachers]=useState(INIT_TEACHERS);
  const [students,setStudents]=useState(INIT_STUDENTS);
  const [apts,setApts]=useState(INIT_APTS);

  const navTab=t=>{setTab(t);setView(null);};

  const renderView=()=>{
    if(view?.type==="apt") return <AptDetail aptId={view.id} apts={apts} teachers={teachers} students={students} setApts={setApts} onBack={()=>setView(null)}/>;
    if(view?.type==="student") return <StudentDetail studentId={view.id} students={students} teachers={teachers} apts={apts} setStudents={setStudents} onBack={()=>setView(null)}/>;
    if(view?.type==="teacher") return <TeacherDetail teacherId={view.id} teachers={teachers} students={students} apts={apts} onBack={()=>setView(null)}/>;
    return null;
  };

  const renderTab=()=>{
    if(view) return renderView();
    if(tab==="dashboard") return <Dashboard apts={apts} teachers={teachers} students={students} slots={INIT_SLOTS} setTab={navTab} setView={setView}/>;
    if(tab==="plan")      return <Wochenplan slots={INIT_SLOTS} teachers={teachers} students={students}/>;
    if(tab==="students")  return <Schueler students={students} setStudents={setStudents} teachers={teachers} setView={setView}/>;
    if(tab==="teachers")  return <Lehrkraefte teachers={teachers} setTeachers={setTeachers} students={students} apts={apts} setView={setView}/>;
    if(tab==="billing")   return <Abrechnung teachers={teachers} students={students} apts={apts} setApts={setApts}/>;
    if(tab==="stunden")   return <Stunden apts={apts} setApts={setApts} teachers={teachers} students={students} setView={setView}/>;
    return null;
  };

  if(!user) return <Login onLogin={setUser}/>;

  return <>
    <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{background:${C.bg};}button:active{opacity:.85;}input,select,textarea{font-family:${FF.body};}`}</style>
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar tab={tab} setTab={navTab} onLogout={()=>{setUser(null);setView(null);}} view={view}/>
      <main style={{flex:1,overflow:"auto",background:C.bg}}>{renderTab()}</main>
    </div>
  </>;
}

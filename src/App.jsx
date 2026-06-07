import React, { useState, useEffect } from "react";
import {
  Calendar, Clock, Users, User, Home as HomeIcon,
  ChevronRight, ChevronLeft, BookOpen, MapPin, Search,
  Check, LogOut, Bell, ArrowLeft, X, Plus,
  GraduationCap, AlertCircle, DollarSign,
  Edit2, Trash2, Lock, ShieldCheck, CheckCircle2,
  Download, Play, Square, Coffee, TrendingUp,
  UserPlus, Eye, EyeOff, Repeat, History,
} from "lucide-react";

/* =========================================================
   LERNWELT DESIGN — Orange + Dunkelblau, inspiriert von nachhilfeschule-lernwelt.de
   ========================================================= */
const C = {
  bg:        "#F8F9FC",
  bgDark:    "#1A2B4A",
  surface:   "#FFFFFF",
  surfaceAlt:"#F0F4FA",
  border:    "#E2E8F2",
  borderHi:  "#C8D4E8",

  primary:   "#1A3A6B",   // Dunkelblau — Lernwelt Hauptfarbe
  primaryLi: "#2A5298",
  primaryTint:"#EBF0FA",

  accent:    "#E8650A",   // Orange — Lernwelt Akzentfarbe
  accentDk:  "#C4520A",
  accentLi:  "#F07820",
  accentTint:"#FEF0E7",

  success:   "#16A34A",
  warn:      "#D97706",
  danger:    "#DC2626",
  info:      "#2563EB",

  textHi:    "#0F1B2D",
  text:      "#374151",
  textDim:   "#6B7280",
  textVeryDim:"#9CA3AF",
};

const FF = {
  display: '"Sora", "DM Sans", system-ui, sans-serif',
  body:    '"DM Sans", system-ui, sans-serif',
  mono:    '"JetBrains Mono", monospace',
};

/* =========================================================
   STANDORTE & RÄUME
   ========================================================= */
const LOCATIONS = [
  { id: "heerdt",  name: "Düsseldorf Heerdt",  short: "Heerdt",   color: "#1A3A6B" },
  { id: "garath",  name: "Düsseldorf Garath",  short: "Garath",   color: "#2A5298" },
  { id: "neuss-i", name: "Neuss Innenstadt",   short: "Neuss-I",  color: "#E8650A" },
  { id: "neuss-f", name: "Neuss Furth",        short: "Neuss-F",  color: "#C4520A" },
];

const ROOMS = {
  heerdt:  [{ id: "h1", name: "Raum 1" }, { id: "h2", name: "Raum 2" }, { id: "h3", name: "Raum 3" }],
  garath:  [{ id: "g1", name: "Raum 1" }, { id: "g2", name: "Raum 2" }, { id: "g3", name: "Raum 3" }],
  "neuss-i":[{ id: "n1", name: "Raum 1" }, { id: "n2", name: "Raum 2" }],
  "neuss-f":[{ id: "f1", name: "Raum 1" }, { id: "f2", name: "Raum 2" }],
};

const ALL_SUBJECTS = ["Mathe","Deutsch","Englisch","Französisch","Spanisch","Latein",
  "Physik","Chemie","Biologie","Informatik","Geschichte","DaZ","LRS","Dyskalkulie","ZP10","Abitur","Vorschule"];

/* =========================================================
   DEMO-DATEN
   ========================================================= */
const DEMO_TEACHERS = [
  { id: "t1", name: "Herr Stolle",     short: "ST", subjects: ["Mathe","Physik","Informatik"], color: "#1A3A6B", rate: 25, email: "stolle@lernwelt.de", role: "teacher" },
  { id: "t2", name: "Frau Yılmaz",     short: "YI", subjects: ["Deutsch","DaZ","LRS"],         color: "#E8650A", rate: 24, email: "yilmaz@lernwelt.de", role: "teacher" },
  { id: "t3", name: "Herr Kovač",      short: "KO", subjects: ["Englisch","Französisch","Spanisch"], color: "#2A5298", rate: 23, email: "kovac@lernwelt.de", role: "teacher" },
  { id: "t4", name: "Frau Nguyen",     short: "NG", subjects: ["Mathe","Dyskalkulie","ZP10"],  color: "#16A34A", rate: 26, email: "nguyen@lernwelt.de", role: "teacher" },
  { id: "t5", name: "Herr Schreiber",  short: "SC", subjects: ["Chemie","Biologie","Latein"],  color: "#7C3AED", rate: 24, email: "schreiber@lernwelt.de", role: "teacher" },
  { id: "t6", name: "Frau Becker",     short: "BE", subjects: ["Vorschule","Deutsch","LRS"],   color: "#DB2777", rate: 22, email: "becker@lernwelt.de", role: "teacher" },
];

const DEMO_STUDENTS = [
  { id: "s1",  name: "Mia Hoffmann",    short: "MH", grade: 9,  subjects: ["Mathe"],     teacherId: "t1", focus: "ZP10-Vorbereitung",  locationId: "heerdt",  since: "Sep 2024" },
  { id: "s2",  name: "Leon Müller",     short: "LM", grade: 5,  subjects: ["Deutsch","LRS"], teacherId: "t2", focus: "LRS-Förderung",    locationId: "heerdt",  since: "Jan 2025" },
  { id: "s3",  name: "Sophia Kaya",     short: "SK", grade: 7,  subjects: ["Englisch"],  teacherId: "t3", focus: "Grammatik",          locationId: "garath",  since: "Okt 2024" },
  { id: "s4",  name: "Noah Bauer",      short: "NB", grade: 11, subjects: ["Mathe","Physik"], teacherId: "t1", focus: "Abi-Vorbereitung", locationId: "heerdt", since: "Aug 2024" },
  { id: "s5",  name: "Emma Schäfer",    short: "ES", grade: 3,  subjects: ["Vorschule"], teacherId: "t6", focus: "Schulstart",         locationId: "neuss-f", since: "Mär 2025" },
  { id: "s6",  name: "Lukas Fischer",   short: "LF", grade: 8,  subjects: ["Chemie"],    teacherId: "t5", focus: "Klausur-Prep",       locationId: "neuss-i", since: "Nov 2024" },
  { id: "s7",  name: "Hana Al-Rashid",  short: "HA", grade: 6,  subjects: ["Deutsch","DaZ"], teacherId: "t2", focus: "Sprachförderung", locationId: "garath",  since: "Feb 2025" },
  { id: "s8",  name: "Tim Weber",       short: "TW", grade: 10, subjects: ["Spanisch"],  teacherId: "t3", focus: "Abitur-Niveau",      locationId: "garath",  since: "Sep 2024" },
  { id: "s9",  name: "Lena Braun",      short: "LB", grade: 4,  subjects: ["Mathe","Dyskalkulie"], teacherId: "t4", focus: "Dyskalkulie", locationId: "neuss-i", since: "Okt 2024" },
  { id: "s10", name: "Felix Richter",   short: "FR", grade: 12, subjects: ["Mathe"],     teacherId: "t4", focus: "Abi-Vorbereitung",  locationId: "neuss-f", since: "Aug 2024" },
  { id: "s11", name: "Amira Hassan",    short: "AH", grade: 5,  subjects: ["Deutsch","DaZ"], teacherId: "t2", focus: "Integration",    locationId: "heerdt",  since: "Jan 2025" },
  { id: "s12", name: "Jonas Klein",     short: "JK", grade: 9,  subjects: ["Latein"],    teacherId: "t5", focus: "ZP10",              locationId: "neuss-i", since: "Sep 2024" },
];

const today = new Date();
const dk = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayKey = dk(today);

const DEMO_APPOINTMENTS = [
  // Heute — Heerdt
  { id: "a1", slotId: "sl1", dateKey: todayKey, teacherId: "t1", studentIds: ["s1","s4"], locationId: "heerdt", room: "Raum 1", time: "14:00", plannedDur: 60, status: "completed", completedDur: 60, checkedInAt: "13:58", checkedOutAt: "14:58", billed: false, subject: "Mathe" },
  { id: "a2", slotId: "sl2", dateKey: todayKey, teacherId: "t2", studentIds: ["s2"], locationId: "heerdt", room: "Raum 2", time: "15:00", plannedDur: 60, status: "checked-in", completedDur: null, checkedInAt: "14:57", billed: false, subject: "Deutsch / LRS", _checkedInTs: Date.now() - 12*60*1000 },
  { id: "a3", slotId: "sl3", dateKey: todayKey, teacherId: "t1", studentIds: ["s4"], locationId: "heerdt", room: "Raum 1", time: "16:00", plannedDur: 60, status: "scheduled", billed: false, subject: "Physik" },
  // Heute — Garath
  { id: "a4", slotId: "sl4", dateKey: todayKey, teacherId: "t3", studentIds: ["s3","s8"], locationId: "garath", room: "Raum 1", time: "14:30", plannedDur: 60, status: "completed", completedDur: 55, checkedInAt: "14:30", checkedOutAt: "15:25", billed: false, subject: "Englisch" },
  { id: "a5", slotId: "sl5", dateKey: todayKey, teacherId: "t2", studentIds: ["s7"], locationId: "garath", room: "Raum 2", time: "15:30", plannedDur: 60, status: "scheduled", billed: false, subject: "DaZ" },
  // Heute — Neuss-I
  { id: "a6", slotId: "sl6", dateKey: todayKey, teacherId: "t5", studentIds: ["s6"], locationId: "neuss-i", room: "Raum 1", time: "15:00", plannedDur: 60, status: "completed", completedDur: 60, checkedInAt: "15:01", checkedOutAt: "16:01", billed: false, subject: "Chemie" },
  { id: "a7", slotId: "sl7", dateKey: todayKey, teacherId: "t4", studentIds: ["s9"], locationId: "neuss-i", room: "Raum 2", time: "16:00", plannedDur: 60, status: "scheduled", billed: false, subject: "Mathe / Dyskalkulie" },
  // Heute — Neuss-F
  { id: "a8", slotId: "sl8", dateKey: todayKey, teacherId: "t6", studentIds: ["s5"], locationId: "neuss-f", room: "Raum 1", time: "14:00", plannedDur: 60, status: "completed", completedDur: 60, checkedInAt: "14:00", checkedOutAt: "15:00", billed: false, subject: "Vorschule" },
  { id: "a9", slotId: "sl9", dateKey: todayKey, teacherId: "t4", studentIds: ["s10"], locationId: "neuss-f", room: "Raum 2", time: "17:00", plannedDur: 60, status: "scheduled", billed: false, subject: "Mathe" },
  // Diese Woche — vergangene Stunden (abrechenbar)
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `prev${i}`, slotId: `psl${i}`, 
    dateKey: dk(new Date(today.getTime() - (1 + Math.floor(i/3)) * 24*60*60*1000)),
    teacherId: DEMO_TEACHERS[i % 6].id,
    studentIds: [DEMO_STUDENTS[i % 12].id],
    locationId: LOCATIONS[i % 4].id,
    room: "Raum 1",
    time: ["13:30","14:00","15:00","16:00","17:00"][i % 5],
    plannedDur: 60, status: "completed", completedDur: 60,
    checkedInAt: "14:00", checkedOutAt: "15:00",
    billed: i < 9, billedMonth: i < 9 ? "Mai 2025" : null,
    subject: ALL_SUBJECTS[i % 10],
  })),
];

const DEMO_SLOTS = [
  { id: "sl1", day: 0, time: "14:00", locationId: "heerdt",  roomId: "h1", teacherId: "t1", studentIds: ["s1","s4"], type: "gruppe" },
  { id: "sl2", day: 0, time: "15:00", locationId: "heerdt",  roomId: "h2", teacherId: "t2", studentIds: ["s2"],       type: "einzel" },
  { id: "sl3", day: 0, time: "16:00", locationId: "heerdt",  roomId: "h1", teacherId: "t1", studentIds: ["s4"],       type: "einzel" },
  { id: "sl4", day: 0, time: "14:30", locationId: "garath",  roomId: "g1", teacherId: "t3", studentIds: ["s3","s8"], type: "gruppe" },
  { id: "sl5", day: 0, time: "15:30", locationId: "garath",  roomId: "g2", teacherId: "t2", studentIds: ["s7"],       type: "einzel" },
  { id: "sl6", day: 0, time: "15:00", locationId: "neuss-i", roomId: "n1", teacherId: "t5", studentIds: ["s6"],       type: "einzel" },
  { id: "sl7", day: 0, time: "16:00", locationId: "neuss-i", roomId: "n2", teacherId: "t4", studentIds: ["s9"],       type: "einzel" },
  { id: "sl8", day: 0, time: "14:00", locationId: "neuss-f", roomId: "f1", teacherId: "t6", studentIds: ["s5"],       type: "einzel" },
  { id: "sl9", day: 0, time: "17:00", locationId: "neuss-f", roomId: "f2", teacherId: "t4", studentIds: ["s10"],      type: "einzel" },
  { id: "sl10",day: 1, time: "14:00", locationId: "heerdt",  roomId: "h1", teacherId: "t1", studentIds: ["s1"],       type: "einzel" },
  { id: "sl11",day: 1, time: "15:30", locationId: "garath",  roomId: "g1", teacherId: "t3", studentIds: ["s8"],       type: "einzel" },
  { id: "sl12",day: 2, time: "14:00", locationId: "neuss-i", roomId: "n1", teacherId: "t4", studentIds: ["s9","s12"], type: "gruppe" },
  { id: "sl13",day: 2, time: "16:00", locationId: "heerdt",  roomId: "h3", teacherId: "t5", studentIds: ["s6"],       type: "einzel" },
  { id: "sl14",day: 3, time: "15:00", locationId: "garath",  roomId: "g2", teacherId: "t2", studentIds: ["s2","s11"], type: "gruppe" },
  { id: "sl15",day: 3, time: "17:00", locationId: "neuss-f", roomId: "f1", teacherId: "t4", studentIds: ["s10"],      type: "einzel" },
  { id: "sl16",day: 4, time: "14:30", locationId: "heerdt",  roomId: "h1", teacherId: "t1", studentIds: ["s1","s4"], type: "gruppe" },
  { id: "sl17",day: 4, time: "16:00", locationId: "neuss-i", roomId: "n2", teacherId: "t3", studentIds: ["s3"],       type: "einzel" },
];

const DEMO_USER = { id: "admin1", name: "Admin", short: "AD", role: "admin", email: "admin@lernwelt.de" };

/* =========================================================
   HELPERS
   ========================================================= */
const fmtEur = (n) => `${Number(n).toFixed(2).replace(".", ",")} €`;
const initials = (name) => (name || "").split(" ").filter(Boolean).map(p => p[0]).join("").slice(0,2).toUpperCase();
const WEEKDAYS = ["Mo","Di","Mi","Do","Fr"];
const WEEKDAYS_LONG = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag"];
const mondayOf = (d) => { const x = new Date(d); const dow = x.getDay(); x.setDate(x.getDate() + (dow===0?-6:1-dow)); x.setHours(0,0,0,0); return x; };
const appDayFromJS = (d) => { const x = d.getDay(); return x===0?6:x-1; };
const isoWeek = (date) => { const d = new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())); const day = d.getUTCDay()||7; d.setUTCDate(d.getUTCDate()+4-day); const ys = new Date(Date.UTC(d.getUTCFullYear(),0,1)); return Math.ceil((((d-ys)/86400000)+1)/7); };

/* =========================================================
   FONT INJECTOR
   ========================================================= */
function FontInjector() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
}

/* =========================================================
   LOGO
   ========================================================= */
function LernweltLogo({ size = 40 }) {
  return (
    <svg width={size * 2.2} height={size * 0.7} viewBox="0 0 200 60">
      {/* Globus */}
      <circle cx="28" cy="30" r="22" fill="none" stroke={C.primary} strokeWidth="2"/>
      <ellipse cx="28" cy="30" rx="11" ry="22" fill="none" stroke={C.primary} strokeWidth="1.5"/>
      <line x1="6" y1="20" x2="50" y2="20" stroke={C.primary} strokeWidth="1.5"/>
      <line x1="6" y1="30" x2="50" y2="30" stroke={C.primary} strokeWidth="1.5"/>
      <line x1="6" y1="40" x2="50" y2="40" stroke={C.primary} strokeWidth="1.5"/>
      {/* Orange Bogen */}
      <path d="M 14 10 Q 28 2 42 10" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round"/>
      {/* Text */}
      <text x="60" y="26" fontFamily="Sora, sans-serif" fontSize="18" fontWeight="700" fill={C.primary} letterSpacing="-0.5">Lernwelt</text>
      <text x="60" y="44" fontFamily="DM Sans, sans-serif" fontSize="10" fontWeight="500" fill={C.accent} letterSpacing="1">NACHHILFESCHULE</text>
    </svg>
  );
}

/* =========================================================
   PRIMITIVES
   ========================================================= */
function Avatar({ short, color, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size/2, background: color || C.primary, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.36, fontFamily: FF.display, flexShrink: 0 }}>
      {short}
    </div>
  );
}

function Badge({ children, color = C.primary }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 6, background: color + "18", color, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      {children}
    </span>
  );
}

function LocationBadge({ locationId }) {
  const loc = LOCATIONS.find(l => l.id === locationId);
  if (!loc) return null;
  return <Badge color={loc.color}>{loc.short}</Badge>;
}

function Card({ children, padding = 20, accent }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding, position: "relative", overflow: "hidden", boxShadow: "0 1px 4px rgba(26,58,107,.06)" }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }}/>}
      {children}
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase" }}>{children}</div>
      {action}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = C.primary, sub }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(26,58,107,.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "15", display: "grid", placeItems: "center" }}>
          <Icon size={18} color={color}/>
        </div>
      </div>
      <div style={{ fontFamily: FF.display, fontSize: 28, fontWeight: 700, color: C.textHi, lineHeight: 1, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.textDim, marginTop: 6, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function PrimaryBtn({ children, onClick, icon: Icon, disabled, color }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "14px 20px",
      background: disabled ? C.border : (color || `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDk} 100%)`),
      color: "#fff", border: "none", borderRadius: 12,
      fontSize: 14, fontWeight: 700, fontFamily: FF.body,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: disabled ? "none" : `0 8px 20px -6px ${C.accent}60`,
      opacity: disabled ? 0.6 : 1,
    }}>
      {Icon && <Icon size={16}/>} {children}
    </button>
  );
}

/* =========================================================
   DESKTOP SIDEBAR
   ========================================================= */
function Sidebar({ tab, setTab, onLogout }) {
  const tabs = [
    { key: "dashboard", label: "Dashboard",  icon: HomeIcon },
    { key: "plan",      label: "Wochenplan", icon: Calendar },
    { key: "students",  label: "Schüler",    icon: Users },
    { key: "teachers",  label: "Lehrkräfte", icon: GraduationCap },
    { key: "billing",   label: "Abrechnung", icon: DollarSign },
    { key: "stunden",   label: "Stunden",    icon: Clock },
  ];
  return (
    <div style={{ width: 240, flexShrink: 0, background: C.primary, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 24px", borderBottom: "1px solid rgba(255,255,255,.12)" }}>
        <LernweltLogo size={32}/>
        <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 600, letterSpacing: 1 }}>
          VERWALTUNGSPORTAL · DEMO
        </div>
      </div>

      {/* Standorte Übersicht */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Standorte</div>
        {LOCATIONS.map(loc => (
          <div key={loc.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: loc.color === C.primary ? C.accent : loc.color }}/>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{loc.name}</span>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {tabs.map(t => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              background: active ? "rgba(255,255,255,.15)" : "transparent",
              border: active ? "1px solid rgba(255,255,255,.2)" : "1px solid transparent",
              color: active ? "#fff" : "rgba(255,255,255,.6)",
              fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer",
              fontFamily: FF.body, textAlign: "left",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Icon size={16} strokeWidth={active ? 2.5 : 2}/>
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accent, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>AD</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Admin</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginTop: 1 }}>Geschäftsführung</div>
        </div>
        <button onClick={onLogout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.6)", width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", cursor: "pointer" }}>
          <LogOut size={13}/>
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN
   ========================================================= */
function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@lernwelt.de");
  const [pw, setPw] = useState("demo1234");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setTimeout(() => {
      if (email === "admin@lernwelt.de" && pw === "demo1234") {
        onLogin(DEMO_USER);
      } else {
        setErr("Demo-Zugangsdaten: admin@lernwelt.de / demo1234");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: C.bg }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: C.primary, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: "rgba(232,101,10,.15)", borderRadius: "50%" }}/>
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, background: "rgba(255,255,255,.05)", borderRadius: "50%" }}/>
        <div style={{ position: "relative" }}>
          <LernweltLogo size={36}/>
          <div style={{ marginTop: 48 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 600, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>Verwaltungsportal</div>
            <h1 style={{ fontFamily: FF.display, fontSize: 38, fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: "0 0 20px", letterSpacing: -1 }}>
              Alle 4 Standorte.<br/>
              <span style={{ color: C.accentLi }}>Ein System.</span>
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", lineHeight: 1.7, maxWidth: 380 }}>
              Lehrkräfte, Schüler, Stunden, Abrechnung — standortübergreifend in einer modernen Verwaltungslösung.
            </p>
          </div>
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 12 }}>
            {["Heerdt · Garath · Neuss Innenstadt · Neuss Furth", "Lehrkraft-Einladung per E-Mail", "Lohnabrechnung mit PIN-Schutz", "CSV-Export für den Steuerberater"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,.8)", fontSize: 13 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: C.accent, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Check size={11} color="#fff" strokeWidth={3}/>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: 60, background: C.surface }}>
        <div style={{ width: "100%" }}>
          <h2 style={{ fontFamily: FF.display, fontSize: 28, fontWeight: 700, color: C.textHi, margin: "0 0 8px", letterSpacing: -0.5 }}>Anmelden</h2>
          <p style={{ fontSize: 14, color: C.textDim, margin: "0 0 32px" }}>Demo-Zugangsdaten sind bereits eingetragen.</p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 8, letterSpacing: 0.3 }}>E-Mail</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surfaceAlt, color: C.textHi, fontSize: 14, fontFamily: FF.body, outline: "none", boxSizing: "border-box" }}/>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 8, letterSpacing: 0.3 }}>Passwort</label>
              <div style={{ position: "relative" }}>
                <input value={pw} onChange={e => setPw(e.target.value)} type={showPw ? "text" : "password"}
                  style={{ width: "100%", padding: "13px 44px 13px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surfaceAlt, color: C.textHi, fontSize: 14, fontFamily: FF.body, outline: "none", boxSizing: "border-box" }}/>
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: C.textDim }}>
                  {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            {err && <div style={{ padding: "10px 14px", background: C.danger + "15", border: `1px solid ${C.danger}40`, borderRadius: 8, color: C.danger, fontSize: 13, fontWeight: 600 }}>{err}</div>}
            <button type="submit" disabled={loading} style={{
              padding: "14px 20px", background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDk} 100%)`,
              color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
              fontFamily: FF.body, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: `0 8px 20px -6px ${C.accent}60`,
            }}>
              {loading ? "Anmelden…" : "Einloggen"}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: "14px 16px", background: C.accentTint, border: `1px solid ${C.accent}30`, borderRadius: 10, fontSize: 12, color: C.accentDk }}>
            <strong>Demo-Zugangsdaten:</strong> admin@lernwelt.de / demo1234
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */
function Dashboard({ setTab }) {
  const todayApts = DEMO_APPOINTMENTS.filter(a => a.dateKey === todayKey);
  const checkedIn = todayApts.filter(a => a.status === "checked-in").length;
  const completed = todayApts.filter(a => a.status === "completed").length;
  const scheduled = todayApts.filter(a => a.status === "scheduled").length;
  const openBilling = DEMO_APPOINTMENTS.filter(a => a.status === "completed" && !a.billed);
  const totalOpenCost = openBilling.reduce((s, a) => {
    const t = DEMO_TEACHERS.find(x => x.id === a.teacherId);
    return s + (a.completedDur || 60) / 60 * (t?.rate || 22);
  }, 0);

  const byLocation = LOCATIONS.map(loc => {
    const apts = todayApts.filter(a => a.locationId === loc.id);
    return { ...loc, count: apts.length, done: apts.filter(a => a.status === "completed").length };
  });

  return (
    <div style={{ padding: "32px 40px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
          {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </div>
        <h1 style={{ fontFamily: FF.display, fontSize: 36, fontWeight: 800, color: C.textHi, margin: 0, letterSpacing: -1.2 }}>
          Guten Morgen, Admin.
        </h1>
        <p style={{ fontSize: 15, color: C.textDim, margin: "8px 0 0" }}>Heute laufen <strong style={{ color: C.primary }}>{todayApts.length} Stunden</strong> an 4 Standorten.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Heute geplant" value={todayApts.length} icon={Calendar} color={C.primary}/>
        <StatCard label="Gerade aktiv" value={checkedIn} icon={Play} color={C.accent} sub={checkedIn > 0 ? "läuft jetzt" : ""}/>
        <StatCard label="Abgeschlossen" value={completed} icon={CheckCircle2} color={C.success}/>
        <StatCard label="Offene Abrechnung" value={fmtEur(totalOpenCost)} icon={DollarSign} color={C.warn} sub={`${openBilling.length} Termine`}/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Standorte heute */}
        <Card accent={C.primary}>
          <SectionTitle>Standorte heute</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {byLocation.map(loc => (
              <div key={loc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.surfaceAlt, borderRadius: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: loc.color, flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textHi }}>{loc.name}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{loc.count} Stunden · {loc.done} abgeschlossen</div>
                </div>
                {/* Progress bar */}
                <div style={{ width: 80, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${loc.count ? (loc.done/loc.count)*100 : 0}%`, background: loc.color, borderRadius: 3 }}/>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: loc.color, minWidth: 30, textAlign: "right" }}>{loc.count ? Math.round((loc.done/loc.count)*100) : 0}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Lehrkräfte aktiv */}
        <Card>
          <SectionTitle>Lehrkräfte heute</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEMO_TEACHERS.map(t => {
              const tApts = todayApts.filter(a => a.teacherId === t.id);
              if (tApts.length === 0) return null;
              const active = tApts.find(a => a.status === "checked-in");
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.surfaceAlt, borderRadius: 10 }}>
                  <Avatar short={t.short} color={t.color} size={32}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: C.textDim }}>{tApts.length} Stunden</div>
                  </div>
                  {active && <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, background: C.accentTint, padding: "2px 7px", borderRadius: 6 }}>AKTIV</span>}
                </div>
              );
            }).filter(Boolean)}
          </div>
        </Card>
      </div>

      {/* Heutige Stunden */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <SectionTitle>Heutige Stunden aller Standorte</SectionTitle>
          <button onClick={() => setTab("stunden")} style={{ fontSize: 12, fontWeight: 700, color: C.accent, background: "transparent", border: "none", cursor: "pointer", fontFamily: FF.body }}>Alle ansehen →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {todayApts.slice(0, 8).map(a => {
            const t = DEMO_TEACHERS.find(x => x.id === a.teacherId);
            const loc = LOCATIONS.find(l => l.id === a.locationId);
            const names = a.studentIds.map(id => DEMO_STUDENTS.find(s => s.id === id)?.name).filter(Boolean);
            const statusColors = { completed: C.success, "checked-in": C.accent, scheduled: C.textDim };
            return (
              <div key={a.id} style={{ display: "flex", gap: 10, padding: "10px 12px", background: C.surfaceAlt, borderRadius: 10, border: a.status === "checked-in" ? `1.5px solid ${C.accent}60` : "1px solid transparent" }}>
                <div style={{ fontFamily: FF.display, fontSize: 13, fontWeight: 700, color: C.textHi, minWidth: 44 }}>{a.time}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{names.join(", ")}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{t?.name} · {loc?.short} · {a.room}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: statusColors[a.status] || C.textDim, flexShrink: 0, marginTop: 4 }}/>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================
   WOCHENPLAN
   ========================================================= */
function Wochenplan() {
  const [locId, setLocId] = useState("heerdt");
  const [dayIdx, setDayIdx] = useState(appDayFromJS(new Date()) <= 4 ? appDayFromJS(new Date()) : 0);
  const [view, setView] = useState("week"); // "day" | "week"

  const loc = LOCATIONS.find(l => l.id === locId);
  const slots = DEMO_SLOTS.filter(s => s.locationId === locId);
  const daySlots = slots.filter(s => s.day === dayIdx).sort((a,b) => a.time.localeCompare(b.time));
  const rooms = ROOMS[locId] || [];

  return (
    <div style={{ padding: "32px 40px 60px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Admin · Wochenplan</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 32, fontWeight: 800, color: C.textHi, margin: 0, letterSpacing: -1 }}>Wochenplan</h1>
      </div>

      {/* Standort-Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {LOCATIONS.map(l => (
          <button key={l.id} onClick={() => setLocId(l.id)} style={{
            padding: "10px 18px", borderRadius: 10,
            background: locId === l.id ? l.color : C.surface,
            border: `1.5px solid ${locId === l.id ? l.color : C.border}`,
            color: locId === l.id ? "#fff" : C.textDim,
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FF.body,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <MapPin size={13}/> {l.short}
            <span style={{ fontSize: 11, opacity: 0.8 }}>({slots.filter(s => s.locationId === l.id).length})</span>
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: C.surfaceAlt, padding: 4, borderRadius: 10, width: "fit-content" }}>
        {[{id:"day",label:"Tag"},{id:"week",label:"Woche"}].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            padding: "8px 20px", borderRadius: 8,
            background: view === v.id ? C.primary : "transparent",
            border: "none", color: view === v.id ? "#fff" : C.textDim,
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FF.body,
          }}>{v.label}</button>
        ))}
      </div>

      {view === "day" && (
        <>
          {/* Tag-Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {WEEKDAYS.map((d, i) => {
              const cnt = slots.filter(s => s.day === i).length;
              return (
                <button key={d} onClick={() => setDayIdx(i)} style={{
                  flex: 1, padding: "12px 8px", borderRadius: 10,
                  background: dayIdx === i ? `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDk} 100%)` : C.surface,
                  border: `1.5px solid ${dayIdx === i ? "transparent" : C.border}`,
                  color: dayIdx === i ? "#fff" : C.text,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FF.body, textAlign: "center",
                }}>
                  <div>{d}</div>
                  <div style={{ fontSize: 11, marginTop: 3, opacity: 0.8 }}>{cnt} Std</div>
                </button>
              );
            })}
          </div>

          {/* Räume */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${rooms.length}, 1fr)`, gap: 16 }}>
            {rooms.map(room => {
              const roomSlots = daySlots.filter(s => s.roomId === room.id);
              return (
                <div key={room.id}>
                  <div style={{ padding: "10px 14px", background: C.primary, borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,.15)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>
                      {room.name.replace("Raum ","")}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{room.name}</span>
                  </div>
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "0 0 10px 10px", padding: 8, minHeight: 120, display: "flex", flexDirection: "column", gap: 6 }}>
                    {roomSlots.length === 0 ? (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.textVeryDim, fontSize: 12 }}>Frei</div>
                    ) : roomSlots.map(s => {
                      const t = DEMO_TEACHERS.find(x => x.id === s.teacherId);
                      const students = s.studentIds.map(id => DEMO_STUDENTS.find(x => x.id === id)).filter(Boolean);
                      return (
                        <div key={s.id} style={{ padding: "10px 12px", background: loc.color + "12", border: `1.5px solid ${loc.color}40`, borderRadius: 8 }}>
                          <div style={{ fontFamily: FF.display, fontSize: 13, fontWeight: 700, color: loc.color }}>{s.time}</div>
                          <div style={{ fontSize: 11, color: C.text, marginTop: 3, fontWeight: 600 }}>{t?.name}</div>
                          <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{students.map(s => s.name.split(" ")[0]).join(", ")}</div>
                          <div style={{ marginTop: 4 }}><Badge color={s.type === "gruppe" ? C.info : C.success}>{s.type === "gruppe" ? `Gruppe · ${students.length}` : "Einzel"}</Badge></div>
                        </div>
                      );
                    })}
                    <button style={{ padding: "8px 0", background: "transparent", border: `1.5px dashed ${C.border}`, borderRadius: 8, color: C.textDim, fontSize: 12, cursor: "pointer", fontFamily: FF.body, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <Plus size={12}/> Hinzufügen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === "week" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "6px 0" }}>
            <thead>
              <tr>
                {WEEKDAYS_LONG.map((d, i) => (
                  <th key={d} style={{ padding: "12px 14px", background: i === appDayFromJS(new Date()) ? C.accent : C.primary, color: "#fff", borderRadius: "10px 10px 0 0", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                    {d}
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{slots.filter(s => s.day === i).length} Stunden</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {WEEKDAYS.map((_, dayI) => {
                  const daySlots2 = slots.filter(s => s.day === dayI).sort((a,b) => a.time.localeCompare(b.time));
                  return (
                    <td key={dayI} style={{ verticalAlign: "top", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "0 0 10px 10px", padding: 8, minWidth: 160 }}>
                      {daySlots2.length === 0 ? (
                        <div style={{ padding: "20px 0", textAlign: "center", color: C.textVeryDim, fontSize: 12 }}>Keine Stunden</div>
                      ) : daySlots2.map(s => {
                        const t = DEMO_TEACHERS.find(x => x.id === s.teacherId);
                        const students = s.studentIds.map(id => DEMO_STUDENTS.find(x => x.id === id)).filter(Boolean);
                        return (
                          <div key={s.id} style={{ marginBottom: 6, padding: "8px 10px", background: loc.color + "10", border: `1px solid ${loc.color}30`, borderRadius: 8 }}>
                            <div style={{ fontFamily: FF.display, fontWeight: 700, fontSize: 12, color: loc.color }}>{s.time}</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.textHi, marginTop: 2 }}>{t?.short} · {ROOMS[locId]?.find(r => r.id === s.roomId)?.name}</div>
                            <div style={{ fontSize: 10, color: C.textDim }}>{students.map(s => s.name.split(" ")[0]).join(", ")}</div>
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SCHÜLER
   ========================================================= */
function Schueler() {
  const [q, setQ] = useState("");
  const [locFilter, setLocFilter] = useState("all");
  const filtered = DEMO_STUDENTS.filter(s =>
    (locFilter === "all" || s.locationId === locFilter) &&
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.subjects.some(x => x.toLowerCase().includes(q.toLowerCase())))
  );

  return (
    <div style={{ padding: "32px 40px 60px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Admin · Schüler</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 32, fontWeight: 800, color: C.textHi, margin: 0, letterSpacing: -1 }}>{DEMO_STUDENTS.length} Schülerinnen & Schüler</h1>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={16} color={C.textDim} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name oder Fach suchen…"
            style={{ width: "100%", padding: "12px 12px 12px 42px", border: `1.5px solid ${C.border}`, borderRadius: 10, background: C.surface, color: C.textHi, fontSize: 14, fontFamily: FF.body, outline: "none", boxSizing: "border-box" }}/>
        </div>
        <select value={locFilter} onChange={e => setLocFilter(e.target.value)} style={{ padding: "12px 16px", border: `1.5px solid ${C.border}`, borderRadius: 10, background: C.surface, color: C.textHi, fontSize: 13, fontFamily: FF.body, cursor: "pointer" }}>
          <option value="all">Alle Standorte</option>
          {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <button style={{ padding: "12px 20px", background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDk} 100%)`, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <UserPlus size={15}/> Neu anlegen
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {filtered.map(s => {
          const t = DEMO_TEACHERS.find(x => x.id === s.teacherId);
          const loc = LOCATIONS.find(l => l.id === s.locationId);
          return (
            <Card key={s.id} accent={loc?.color}>
              <div style={{ paddingTop: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  <Avatar short={s.short} size={42}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.textHi }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>Klasse {s.grade} · seit {s.since}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {s.subjects.map(sub => <Badge key={sub} color={C.primary}>{sub}</Badge>)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                  {t ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar short={t.short} color={t.color} size={24}/>
                      <span style={{ fontSize: 12, color: C.textDim }}>{t.name}</span>
                    </div>
                  ) : <span style={{ fontSize: 11, color: C.warn }}>Keine Zuweisung</span>}
                  <LocationBadge locationId={s.locationId}/>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   LEHRKRÄFTE
   ========================================================= */
function Lehrkraefte() {
  return (
    <div style={{ padding: "32px 40px 60px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Admin · Lehrkräfte</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 32, fontWeight: 800, color: C.textHi, margin: 0, letterSpacing: -1 }}>{DEMO_TEACHERS.length} Lehrkräfte</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button style={{ padding: "12px 20px", background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDk} 100%)`, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <UserPlus size={15}/> Neue Lehrkraft einladen
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {DEMO_TEACHERS.map(t => {
          const myStudents = DEMO_STUDENTS.filter(s => s.teacherId === t.id);
          const openHrs = DEMO_APPOINTMENTS.filter(a => a.teacherId === t.id && a.status === "completed" && !a.billed).reduce((s, a) => s + (a.completedDur||60)/60, 0);
          const locs = [...new Set(myStudents.map(s => s.locationId))].map(id => LOCATIONS.find(l => l.id === id)).filter(Boolean);
          return (
            <Card key={t.id} accent={t.color}>
              <div style={{ paddingTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <Avatar short={t.short} color={t.color} size={52}/>
                  <div>
                    <div style={{ fontFamily: FF.display, fontWeight: 700, fontSize: 17, color: C.textHi }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>{t.email}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {locs.map(l => <LocationBadge key={l.id} locationId={l.id}/>)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
                  {t.subjects.map(s => <Badge key={s} color={C.primaryLi}>{s}</Badge>)}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, color: C.textHi }}>{myStudents.length}</div>
                    <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600 }}>SCHÜLER</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, color: C.accent }}>{openHrs.toFixed(1)}h</div>
                    <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600 }}>OFFEN</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, color: C.primary }}>{t.rate}€</div>
                    <div style={{ fontSize: 10, color: C.textDim, fontWeight: 600 }}>PRO STD</div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   ABRECHNUNG
   ========================================================= */
function Abrechnung() {
  const [pinStep, setPinStep] = useState(null); // null | teacherId
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [billed, setBilled] = useState([]);

  const summaries = DEMO_TEACHERS.map(t => {
    const open = DEMO_APPOINTMENTS.filter(a => a.teacherId === t.id && a.status === "completed" && !a.billed && !billed.includes(t.id));
    const hrs = open.reduce((s, a) => s + (a.completedDur||60)/60, 0);
    return { teacher: t, openCount: open.length, hrs, cost: hrs * t.rate };
  });

  const totalCost = summaries.reduce((s, x) => s + x.cost, 0);
  const totalHrs = summaries.reduce((s, x) => s + x.hrs, 0);

  const handlePin = (d) => {
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === "1234") {
          setBilled(prev => [...prev, pinStep]);
          setPinStep(null);
          setPin("");
        } else {
          setPinErr(true);
          setPin("");
          setTimeout(() => setPinErr(false), 1000);
        }
      }, 200);
    }
  };

  return (
    <div style={{ padding: "32px 40px 60px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Admin · Lohnabrechnung</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 32, fontWeight: 800, color: C.textHi, margin: 0, letterSpacing: -1 }}>
          {new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
        </h1>
      </div>

      {/* Gesamt */}
      <div style={{ padding: 24, background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLi} 100%)`, borderRadius: 16, marginBottom: 24, display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.15)", display: "grid", placeItems: "center" }}>
            <ShieldCheck size={24} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PIN-GESCHÜTZT</div>
            <div style={{ fontFamily: FF.display, fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>{fmtEur(totalCost)}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{totalHrs.toFixed(1)} Stunden · {DEMO_TEACHERS.length} Lehrkräfte</div>
          </div>
        </div>
      </div>

      {/* Pro Lehrkraft */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {summaries.map(({ teacher: t, openCount, hrs, cost }) => {
          const isBilled = billed.includes(t.id);
          return (
            <Card key={t.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar short={t.short} color={t.color} size={44}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.textHi }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{t.subjects.join(" · ")} · {t.rate} €/h</div>
                </div>
                <div style={{ textAlign: "right", marginRight: 16 }}>
                  <div style={{ fontFamily: FF.display, fontSize: 22, fontWeight: 700, color: isBilled ? C.textDim : C.textHi }}>{fmtEur(cost)}</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 1 }}>{hrs.toFixed(1)} Std · {openCount} Termine</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ padding: "10px 14px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.textDim, fontSize: 12, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Download size={13}/> CSV
                  </button>
                  {isBilled ? (
                    <div style={{ padding: "10px 16px", background: C.success + "18", border: `1px solid ${C.success}40`, borderRadius: 10, color: C.success, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                      <Check size={13}/> Abgerechnet
                    </div>
                  ) : (
                    <button onClick={() => { setPinStep(t.id); setPin(""); }} disabled={openCount === 0} style={{ padding: "10px 16px", background: openCount > 0 ? C.success : C.border, border: "none", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: FF.body, cursor: openCount > 0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 5, opacity: openCount === 0 ? 0.5 : 1 }}>
                      <Lock size={13}/> Abrechnen
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* PIN Modal */}
      {pinStep && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,27,45,.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: C.surface, borderRadius: 20, padding: 32, width: 340, boxShadow: "0 24px 48px rgba(0,0,0,.2)" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDk} 100%)`, display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                <Lock size={24} color="#fff"/>
              </div>
              <h3 style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, color: C.textHi, margin: "0 0 4px" }}>PIN eingeben</h3>
              <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>{DEMO_TEACHERS.find(t => t.id === pinStep)?.name}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 8 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < pin.length ? (pinErr ? C.danger : C.accent) : "transparent", border: `2px solid ${pinErr ? C.danger : (i < pin.length ? C.accent : C.border)}`, transition: "all .15s" }}/>
              ))}
            </div>
            <div style={{ fontSize: 11, color: pinErr ? C.danger : C.textVeryDim, textAlign: "center", marginBottom: 20, fontWeight: 600, height: 16 }}>
              {pinErr ? "Falscher PIN" : "Demo-PIN: 1234"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {["1","2","3","4","5","6","7","8","9"].map(d => (
                <button key={d} onClick={() => handlePin(d)} style={{ padding: "16px 0", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.textHi, fontFamily: FF.display, fontSize: 20, fontWeight: 600, cursor: "pointer" }}>{d}</button>
              ))}
              <button onClick={() => { setPinStep(null); setPin(""); }} style={{ padding: "16px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.textDim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FF.body }}>Abbruch</button>
              <button onClick={() => handlePin("0")} style={{ padding: "16px 0", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, color: C.textHi, fontFamily: FF.display, fontSize: 20, fontWeight: 600, cursor: "pointer" }}>0</button>
              <button onClick={() => setPin(p => p.slice(0,-1))} style={{ padding: "16px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.textDim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FF.body }}>← Del</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STUNDEN
   ========================================================= */
function Stunden() {
  const [dayOffset, setDayOffset] = useState(0);
  const date = new Date(); date.setDate(date.getDate() + dayOffset);
  const dateKey2 = dk(date);
  const apts = DEMO_APPOINTMENTS.filter(a => a.dateKey === dateKey2);
  const byTeacher = DEMO_TEACHERS.map(t => ({
    teacher: t,
    apts: apts.filter(a => a.teacherId === t.id).sort((a,b) => a.time.localeCompare(b.time)),
  })).filter(x => x.apts.length > 0);

  const dateLabel = date.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });
  const done = apts.filter(a => a.status === "completed").length;

  return (
    <div style={{ padding: "32px 40px 60px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>Admin · Stunden</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 32, fontWeight: 800, color: C.textHi, margin: 0, letterSpacing: -1 }}>Stunden bestätigen</h1>
      </div>

      {/* Tag Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 20px" }}>
        <button onClick={() => setDayOffset(d => d-1)} style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer", color: C.text }}>
          <ChevronLeft size={18}/>
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, color: C.textHi }}>{dateLabel}{dayOffset === 0 ? " · heute" : ""}</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{done}/{apts.length} Stunden erfasst</div>
        </div>
        <button onClick={() => setDayOffset(d => d+1)} style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer", color: C.text }}>
          <ChevronRight size={18}/>
        </button>
      </div>

      {byTeacher.length === 0 ? (
        <Card><div style={{ padding: "40px 20px", textAlign: "center", color: C.textDim }}>Keine Stunden an diesem Tag.</div></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {byTeacher.map(({ teacher: t, apts: tApts }) => (
            <Card key={t.id} accent={t.color}>
              <div style={{ paddingTop: 8, display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <Avatar short={t.short} color={t.color} size={38}/>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.textHi }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.textDim }}>{tApts.filter(a => a.status === "completed").length}/{tApts.length} erfasst</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tApts.map(a => {
                  const loc = LOCATIONS.find(l => l.id === a.locationId);
                  const names = a.studentIds.map(id => DEMO_STUDENTS.find(s => s.id === id)?.name).filter(Boolean);
                  const statusMap = { completed: { color: C.success, label: "Erfasst", bg: C.success + "15" }, "checked-in": { color: C.accent, label: "Läuft", bg: C.accentTint }, scheduled: { color: C.textDim, label: "Geplant", bg: C.surfaceAlt } };
                  const s = statusMap[a.status] || statusMap.scheduled;
                  return (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.surfaceAlt, borderRadius: 10 }}>
                      <span style={{ fontFamily: FF.display, fontWeight: 700, fontSize: 14, color: C.textHi, minWidth: 44 }}>{a.time}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{names.join(", ")}</div>
                        <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{loc?.short} · {a.room} · {a.subject}</div>
                      </div>
                      <LocationBadge locationId={a.locationId}/>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: "4px 10px", borderRadius: 6, flexShrink: 0 }}>{s.label}</span>
                      {a.status === "scheduled" && (
                        <button style={{ padding: "6px 12px", background: C.success, border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>
                          Bestätigen
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN APP
   ========================================================= */
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");

  const renderContent = () => {
    if (tab === "dashboard") return <Dashboard setTab={setTab}/>;
    if (tab === "plan")      return <Wochenplan/>;
    if (tab === "students")  return <Schueler/>;
    if (tab === "teachers")  return <Lehrkraefte/>;
    if (tab === "billing")   return <Abrechnung/>;
    if (tab === "stunden")   return <Stunden/>;
    return <Dashboard setTab={setTab}/>;
  };

  if (!user) return (
    <>
      <FontInjector/>
      <Login onLogin={setUser}/>
    </>
  );

  return (
    <>
      <FontInjector/>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${C.bg}; } button:active { opacity: .85; }`}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar tab={tab} setTab={setTab} onLogout={() => setUser(null)}/>
        <main style={{ flex: 1, overflow: "auto", background: C.bg }}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}

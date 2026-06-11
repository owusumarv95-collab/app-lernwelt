import React, { useState, useEffect, useRef } from "react";
import {
  Calendar, Clock, Users, User, Home as HomeIcon, Settings,
  ChevronRight, ChevronLeft, BookOpen, MapPin, Search,
  Check, LogOut, Bell, ArrowLeft, X, Plus, Minus,
  GraduationCap, FileText, AlertCircle, Wifi,
  BatteryFull, Signal, Coffee, Sparkles,
  UserPlus, CheckCircle2, Play, Square, DollarSign,
  Download, TrendingUp, Briefcase,
  Edit2, Trash2, Lock, ShieldCheck, History, Repeat,
} from "lucide-react";


// Demo-Modus: kein Supabase


const C = {
  bg: "#F5F7FB", bgGrad: "linear-gradient(180deg, #FFFFFF 0%, #F0F4FA 100%)",
  surface: "#FFFFFF", surfaceHi: "#EEF2F9", surfaceLo: "#F0F4FA",
  border: "#DDE3EF", borderHi: "#C8D4E8",
  primary: "#6D28D9", primaryGrad: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
  success: "#16A34A", warn: "#D97706", danger: "#DC2626", info: "#2563EB",
  textHi: "#0F1B2D", text: "#374151", textDim: "#6B7280", textVeryDim: "#9CA3AF",
};

const FF = {
  display: '"Bricolage Grotesque", "Outfit", system-ui, sans-serif',
  body: '"Manrope", system-ui, sans-serif',
};

const ALL_SUBJECTS = ["Mathe", "Deutsch", "Englisch", "Französisch", "Latein", "Spanisch", "Physik", "Chemie", "Biologie", "LRS", "Dyskalkulie", "ZAP"];
const TODAY_LABEL = "Mittwoch, 29. April";
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr"];
const WEEKDAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const HOURLY_RATE = 22; // EUR — demo rate for payroll display
const ADMIN_PIN = "1234"; // Demo PIN for billing confirmation

const LOCATIONS = [
  { id: "remscheid", name: "Remscheid", short: "Remscheid", color: "#6D28D9" },
];

const ROOMS_BY_LOCATION = {
  "remscheid": [{id:"r1",name:"Raum 1"},{id:"r2",name:"Raum 2"},{id:"r3",name:"Raum 3"}],
};

// Possible start times — every 30 min from 13:00 to 18:00 (last course ends at 19:00)
const TIME_SLOTS = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
const COURSE_DURATION = 60; // minutes — fixed for all courses

const timeToMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
// Two slots conflict if their time ranges overlap (60-min courses)
const slotsConflict = (timeA, timeB) => Math.abs(timeToMin(timeA) - timeToMin(timeB)) < COURSE_DURATION;

// --- Echte Datums-Helfer (für Stunden aus dem Wochenplan) ---
const appDayFromJS = (d) => { const x = d.getDay(); return x === 0 ? 6 : x - 1; }; // 0=Mo .. 6=So
const isoDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const mondayOf = (d) => {
  const x = new Date(d); const dow = x.getDay();
  x.setDate(x.getDate() + (dow === 0 ? -6 : 1 - dow));
  x.setHours(0,0,0,0); return x;
};
const hhmm = (d) => `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
const isoWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const TEACHERS = [
  { id: 1, name: "Herr Stolle", short: "ST", subjects: ["Mathe","Physik","Informatik"], color: "#6D28D9", role: "teacher", email: "stolle@beck-up.de", rate: 25, locationId: "remscheid" },
  { id: 2, name: "Frau Albrecht", short: "AL", subjects: ["Deutsch","Englisch","LRS"], color: "#0891B2", role: "teacher", email: "albrecht@beck-up.de", rate: 23, locationId: "remscheid" },
  { id: 3, name: "Frau Nguyen", short: "NG", subjects: ["Mathe","Chemie","Biologie"], color: "#16A34A", role: "teacher", email: "nguyen@beck-up.de", rate: 24, locationId: "remscheid" },
];

const ADMIN_USER = {
  id: 99, name: "Herr Beck", short: "BK", color: "#6D28D9",
  role: "admin", email: "beck@beck-up.de",
};

const DEMO_USERS = [
  { id: 99, name: "Herr Beck", short: "BK", color: "#6D28D9", role: "admin",   email: "beck@beck-up.de", password: "demo1234", subtitle: "Inhaber · Gesamtübersicht" },
  { id: 1,  name: "Herr Stolle", short: "ST", color: "#6D28D9", role: "teacher", email: "stolle@beck-up.de", password: "demo1234", subtitle: "Mathe · Physik · Informatik" },
  { id: 2,  name: "Frau Albrecht", short: "AL", color: "#0891B2", role: "teacher", email: "albrecht@beck-up.de", password: "demo1234", subtitle: "Deutsch · Englisch · LRS" },
  { id: 3,  name: "Frau Nguyen", short: "NG", color: "#16A34A", role: "teacher", email: "nguyen@beck-up.de", password: "demo1234", subtitle: "Mathe · Chemie · Biologie" },
];

const INITIAL_STUDENTS = [
  { id: 1, name: "Leon Braun", short: "LB", grade: 10, subjects: ["Mathe"], teacherId: 1, locationId: "remscheid", focus: "ZP10-Vorbereitung", since: "Mrz 2026", notes: "Algebra sicher, Stochastik schwach." },
  { id: 2, name: "Emma Wagner", short: "EW", grade: 8, subjects: ["Deutsch","LRS"], teacherId: 2, locationId: "remscheid", focus: "LRS-Förderung", since: "Jan 2026", notes: "Großer Fortschritt beim Lesen." },
  { id: 3, name: "Finn Schmidt", short: "FS", grade: 12, subjects: ["Mathe","Physik"], teacherId: 1, locationId: "remscheid", focus: "Abi-Vorbereitung", since: "Sep 2025", notes: "Klausurniveau erreicht." },
  { id: 4, name: "Mia Hoffmann", short: "MH", grade: 5, subjects: ["Englisch"], teacherId: 2, locationId: "remscheid", focus: "Grammatik", since: "Apr 2026", notes: "Vokabeln sehr gut." },
  { id: 5, name: "Noah Krause", short: "NK", grade: 11, subjects: ["Physik"], teacherId: 1, locationId: "remscheid", focus: "Klausur-Prep", since: "Feb 2026", notes: "Mechanik solide." },
  { id: 6, name: "Sophie Klein", short: "SK", grade: 9, subjects: ["Chemie"], teacherId: 3, locationId: "remscheid", focus: "ZP10", since: "Okt 2025", notes: "Organik schwierig." },
  { id: 7, name: "Lukas Berg", short: "LK", grade: 7, subjects: ["Mathe"], teacherId: 3, locationId: "remscheid", focus: "Grundlagen", since: "Mrz 2026", notes: "Bruchrechnung im Aufbau." },
  { id: 8, name: "Hana Demir", short: "HD", grade: 6, subjects: ["Deutsch"], teacherId: 2, locationId: "remscheid", focus: "Lesekompetenz", since: "Feb 2026", notes: "Toll motiviert." },
];

// status: scheduled | checked-in | completed
// completedDur in min, only set when checked out
const INITIAL_APPOINTMENTS = [
  { id: 101, day: 0, date: "08.06.", time: "14:00", plannedDur: 60, studentId: 1, teacherId: 1, subject: "Mathe", room: "Raum 1", locationId: "remscheid", status: "completed", completedDur: 60, checkedInAt: "13:58", checkedOutAt: "14:58", notes: "", billed: false, dateKey: "2026-06-08" },
  { id: 102, day: 0, date: "08.06.", time: "14:00", plannedDur: 60, studentId: 2, teacherId: 2, subject: "Deutsch", room: "Raum 2", locationId: "remscheid", status: "completed", completedDur: 60, checkedInAt: "14:01", checkedOutAt: "15:01", notes: "", billed: false, dateKey: "2026-06-08" },
  { id: 103, day: 0, date: "08.06.", time: "15:00", plannedDur: 60, studentId: 5, teacherId: 1, subject: "Physik", room: "Raum 1", locationId: "remscheid", status: "checked-in", completedDur: null, checkedInAt: "14:59", _checkedInTs: null, notes: "", billed: false, dateKey: "2026-06-08" },
  { id: 104, day: 0, date: "08.06.", time: "15:00", plannedDur: 60, studentId: 6, teacherId: 3, subject: "Chemie", room: "Raum 3", locationId: "remscheid", status: "scheduled", completedDur: null, notes: "", billed: false, dateKey: "2026-06-08" },
  { id: 201, day: 1, date: "02.06.", time: "14:00", plannedDur: 60, studentId: 1, teacherId: 1, subject: "Mathe", room: "Raum 1", locationId: "remscheid", status: "completed", completedDur: 60, checkedInAt: "14:00", checkedOutAt: "15:00", notes: "", billed: false, dateKey: "2026-06-02" },
  { id: 202, day: 1, date: "02.06.", time: "15:00", plannedDur: 60, studentId: 2, teacherId: 2, subject: "Deutsch", room: "Raum 2", locationId: "remscheid", status: "completed", completedDur: 60, checkedInAt: "15:00", checkedOutAt: "16:00", notes: "", billed: false, dateKey: "2026-06-02" },
  { id: 203, day: 2, date: "03.06.", time: "14:00", plannedDur: 60, studentId: 3, teacherId: 1, subject: "Physik", room: "Raum 1", locationId: "remscheid", status: "completed", completedDur: 60, checkedInAt: "14:00", checkedOutAt: "15:00", notes: "", billed: false, dateKey: "2026-06-03" },
  { id: 204, day: 2, date: "03.06.", time: "15:00", plannedDur: 60, studentId: 4, teacherId: 2, subject: "Englisch", room: "Raum 2", locationId: "remscheid", status: "completed", completedDur: 60, checkedInAt: "15:00", checkedOutAt: "16:00", notes: "", billed: false, dateKey: "2026-06-03" },
  { id: 205, day: 3, date: "04.06.", time: "16:00", plannedDur: 60, studentId: 7, teacherId: 3, subject: "Mathe", room: "Raum 1", locationId: "remscheid", status: "completed", completedDur: 60, checkedInAt: "16:00", checkedOutAt: "17:00", notes: "", billed: false, dateKey: "2026-06-04" },
  { id: 206, day: 3, date: "04.06.", time: "14:00", plannedDur: 60, studentId: 6, teacherId: 3, subject: "Chemie", room: "Raum 3", locationId: "remscheid", status: "completed", completedDur: 90, checkedInAt: "14:00", checkedOutAt: "15:30", notes: "", billed: false, dateKey: "2026-06-04" },
];

// Schedule slots — the new admin-created weekly plan
// Each slot: who teaches whom, where, when (60 min duration)
// type: "einzel" | "gruppe"
const INITIAL_SCHEDULE_SLOTS = [
  { id: "s001", day: 0, time: "14:00", locationId: "remscheid", roomId: "r1", teacherId: 1, studentIds: [1,3], type: "gruppe", notes: "" },
  { id: "s002", day: 0, time: "14:00", locationId: "remscheid", roomId: "r2", teacherId: 2, studentIds: [2,8], type: "gruppe", notes: "" },
  { id: "s003", day: 0, time: "15:00", locationId: "remscheid", roomId: "r1", teacherId: 1, studentIds: [5], type: "einzel", notes: "" },
  { id: "s004", day: 0, time: "15:00", locationId: "remscheid", roomId: "r3", teacherId: 3, studentIds: [6], type: "einzel", notes: "" },
  { id: "s005", day: 1, time: "14:00", locationId: "remscheid", roomId: "r1", teacherId: 1, studentIds: [3], type: "einzel", notes: "" },
  { id: "s006", day: 1, time: "15:00", locationId: "remscheid", roomId: "r2", teacherId: 2, studentIds: [4], type: "einzel", notes: "" },
  { id: "s007", day: 1, time: "16:00", locationId: "remscheid", roomId: "r1", teacherId: 3, studentIds: [7], type: "einzel", notes: "" },
  { id: "s008", day: 2, time: "14:00", locationId: "remscheid", roomId: "r1", teacherId: 2, studentIds: [2,8], type: "gruppe", notes: "" },
  { id: "s009", day: 2, time: "15:00", locationId: "remscheid", roomId: "r1", teacherId: 1, studentIds: [1], type: "einzel", notes: "" },
  { id: "s010", day: 2, time: "16:00", locationId: "remscheid", roomId: "r3", teacherId: 3, studentIds: [6], type: "einzel", notes: "" },
  { id: "s011", day: 3, time: "14:00", locationId: "remscheid", roomId: "r1", teacherId: 1, studentIds: [1,3], type: "gruppe", notes: "" },
  { id: "s012", day: 3, time: "14:00", locationId: "remscheid", roomId: "r2", teacherId: 2, studentIds: [4], type: "einzel", notes: "" },
  { id: "s013", day: 3, time: "15:00", locationId: "remscheid", roomId: "r1", teacherId: 1, studentIds: [5], type: "einzel", notes: "" },
  { id: "s014", day: 3, time: "15:30", locationId: "remscheid", roomId: "r2", teacherId: 3, studentIds: [7], type: "einzel", notes: "" },
  { id: "s015", day: 4, time: "14:00", locationId: "remscheid", roomId: "r1", teacherId: 2, studentIds: [8], type: "einzel", notes: "" },
  { id: "s016", day: 4, time: "15:00", locationId: "remscheid", roomId: "r1", teacherId: 1, studentIds: [3], type: "einzel", notes: "" },
];

// --- Übersetzung zwischen DB-Spalten (snake_case) und App-Form (camelCase) ---
const monthLabel = (d) => d ? new Date(d).toLocaleDateString("de-DE", { month: "short", year: "numeric" }) : "";
// Kürzel aus Namen ableiten, falls keins hinterlegt ist ("Sarah Klein" -> "SK")
const initials = (name) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
const teacherFromDB = (r) => ({ ...r, short: r.short || initials(r.name) });
const studentFromDB = (r) => ({
  id: r.id, name: r.name, short: r.short, grade: r.grade,
  subjects: r.subjects || [], teacherId: r.teacher_id,
  focus: r.focus, since: monthLabel(r.since), notes: r.notes,
});
const slotFromDB = (r) => ({
  id: r.id, day: r.weekday, time: (r.start_time || "").slice(0, 5),
  locationId: r.location_id, roomId: r.room_id, teacherId: r.teacher_id,
  studentIds: r.student_ids || [], type: r.type, notes: r.notes,
  onDate: r.on_date || null,
});
// Termin (erfasste/laufende Stunde) — eine Zeile pro Slot+Datum, mit der ganzen Gruppe.
// room/type werden bewusst NICHT gesetzt: die kommen frisch aus dem Slot (in buildSlotLesson).
const appointmentFromDB = (r) => {
  const start = r.starts_at ? new Date(r.starts_at) : null;
  return {
    id: r.id,
    slotId: r.slot_id,
    dateKey: start ? isoDateKey(start) : null,
    day: start ? appDayFromJS(start) : null,
    date: start ? start.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" }) : "",
    time: start ? hhmm(start) : "",
    teacherId: r.teacher_id,
    roomId: r.room_id,
    studentIds: r.student_ids || [],
    plannedDur: r.planned_duration || 60,
    status: r.status,
    checkedInAt: r.checked_in_at ? hhmm(new Date(r.checked_in_at)) : null,
    checkedOutAt: r.checked_out_at ? hhmm(new Date(r.checked_out_at)) : null,
    completedDur: r.completed_duration || null,
    _checkedInTs: r.checked_in_at ? Date.parse(r.checked_in_at) : null,
    heldMethod: r.held_method || null,
    notes: r.notes || "",
    billed: r.billed || false,
    billedMonth: r.billed_month || null,
  };
};
const billingLogFromDB = (r) => {
  const d = r.created_at ? new Date(r.created_at) : new Date();
  return {
    id: r.id, teacherId: r.teacher_id, teacherName: r.teacher_name,
    month: r.month, hours: Number(r.hours) || 0, cost: Number(r.cost) || 0,
    billedBy: r.billed_by, timestamp: d.getTime(),
    formatted: d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) + " · " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
  };
};
const EMPTY_STUDENT_DRAFT = { name: "", grade: "", subjects: [], focus: "", notes: "", teacherId: null, locationId: null };

function makeStore(teachers, setTeachers, students, setStudents, appointments, setAppointments, billingLog, setBillingLog, scheduleSlots, setScheduleSlots) {
  const studentById = (id) => students.find(s => s.id === id);
  const teacherById = (id) => teachers.find(t => t.id === id);
  const subjectForSlot = (slot) => { const t = teachers.find(x => x.id === slot.teacherId); return t?.subjects?.[0] || "Nachhilfe"; };
  const roomNameForSlot = (slot) => ROOMS_BY_LOCATION[slot.locationId]?.find(r => r.id === slot.roomId)?.name || "Raum";

  const buildSlotLesson = (slot, dk) => {
    const [y, m, d] = dk.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const studentObjs = slot.studentIds.map(id => students.find(x => x.id === id)).filter(Boolean);
    const single = studentObjs.length === 1 ? studentObjs[0] : null;
    const subject = single ? (single.subjects?.length ? single.subjects.join(" · ") : subjectForSlot(slot)) : null;
    const base = {
      id: `${slot.id}|${dk}`, slotId: slot.id, dateKey: dk, teacherId: slot.teacherId, day: slot.day,
      date: dateObj.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" }),
      time: slot.time, plannedDur: COURSE_DURATION, room: roomNameForSlot(slot), type: slot.type,
      studentIds: slot.studentIds, students: studentObjs, subject, status: "scheduled", notes: slot.notes || "",
    };
    const existing = appointments.find(a => a.slotId === slot.id && a.dateKey === dk);
    return existing ? { ...base, ...existing, studentIds: slot.studentIds, students: studentObjs, subject } : base;
  };

  const lessonsForDate = (tid, dateObj) => {
    const wd = appDayFromJS(dateObj); const dk = isoDateKey(dateObj);
    return scheduleSlots.filter(s => s.teacherId === tid && ((!s.onDate && s.day === wd) || s.onDate === dk))
      .map(slot => buildSlotLesson(slot, dk)).sort((a, b) => a.time.localeCompare(b.time));
  };
  const aptsForToday = (tid) => lessonsForDate(tid, new Date());
  const aptsForWeek = (tid) => {
    const mon = mondayOf(new Date()); const out = [];
    for (let i = 0; i < 5; i++) { const d = new Date(mon); d.setDate(mon.getDate() + i); out.push(...lessonsForDate(tid, d)); }
    return out;
  };
  const aptsAllToday = () => {
    const dt = new Date(); const wd = appDayFromJS(dt); const dk = isoDateKey(dt);
    return scheduleSlots.filter(s => (!s.onDate && s.day === wd) || s.onDate === dk)
      .map(slot => buildSlotLesson(slot, dk)).sort((a, b) => a.time.localeCompare(b.time));
  };
  const lessonsForDateAll = (dateObj) => {
    const wd = appDayFromJS(dateObj); const dk = isoDateKey(dateObj);
    return scheduleSlots.filter(s => (!s.onDate && s.day === wd) || s.onDate === dk)
      .map(slot => buildSlotLesson(slot, dk)).sort((a, b) => a.time.localeCompare(b.time));
  };
  const lessonById = (id) => {
    const mat = appointments.find(a => a.id === id);
    if (mat) { const slot = scheduleSlots.find(s => s.id === mat.slotId); if (slot) return buildSlotLesson(slot, mat.dateKey); return mat; }
    const [slotId, dk] = id.split("|"); const slot = scheduleSlots.find(s => s.id === slotId);
    if (!slot) return null; return buildSlotLesson(slot, dk);
  };
  const openHoursForTeacher = (tid) => appointments.filter(a => a.teacherId === tid && a.status === "completed" && !a.billed);
  const billedHoursForTeacher = (tid, month) => appointments.filter(a => a.teacherId === tid && a.status === "completed" && a.billed && (!month || a.billedMonth === month));
  const auditForTeacher = (tid) => billingLog.filter(e => e.teacherId === tid).sort((a,b) => b.timestamp - a.timestamp);
  const slotsForDayLoc = (day, locationId) => scheduleSlots.filter(s => s.day === day && s.locationId === locationId && !s.onDate);
  const slotsForDateLoc = (dateObj, locationId) => {
    const wd = appDayFromJS(dateObj); const dk = isoDateKey(dateObj);
    return scheduleSlots.filter(s => s.locationId === locationId && ((!s.onDate && s.day === wd) || s.onDate === dk));
  };

  return {
    teachers, students, appointments, billingLog, scheduleSlots,
    userLocationId: null, // wird von App überschrieben
    studentById, teacherById, aptsForToday, aptsForWeek, aptsAllToday,
    lessonsForDateAll, lessonById, openHoursForTeacher, billedHoursForTeacher,
    auditForTeacher, slotsForDayLoc, slotsForDateLoc,

    addStudent: (data) => {
      const id = Date.now();
      const short = (data.name||"?").split(" ").filter(Boolean).map(p=>p[0]).join("").slice(0,2).toUpperCase()||"??";
      const student = { id, name: data.name||"Neuer Schueler", short, grade: data.grade||1, subjects: data.subjects||[], teacherId: data.teacherId??null, focus: data.focus||"Neu", notes: data.notes||"", since: new Date().toLocaleDateString("de-DE",{month:"short",year:"numeric"}), locationId: data.locationId||LOCATIONS[0].id };
      setStudents(prev => [...prev, student]);
      return Promise.resolve(id);
    },
    updateStudent: (sid, patch) => {
      setStudents(prev => prev.map(s => {
        if (s.id !== sid) return s;
        const u = { ...s, ...patch };
        if (patch.name) u.short = patch.name.split(" ").filter(Boolean).map(p=>p[0]).join("").slice(0,2).toUpperCase()||"??";
        return u;
      }));
    },
    removeStudent: (sid) => { setStudents(prev => prev.filter(s => s.id !== sid)); },
    assignStudent: (sid, tid) => { setStudents(prev => prev.map(s => s.id === sid ? { ...s, teacherId: tid } : s)); },
    updateTeacher: (tid, patch) => {
      setTeachers(prev => prev.map(t => {
        if (t.id !== tid) return t;
        const u = { ...t, ...patch };
        if (patch.name) u.short = patch.name.split(" ").filter(Boolean).map(p=>p[0]).join("").slice(0,2).toUpperCase()||"??";
        return u;
      }));
      return Promise.resolve(true);
    },
    checkIn: (lesson) => {
      const now = new Date();
      setAppointments(prev => [...prev, { id: `apt_${Date.now()}`, slotId: lesson.slotId, dateKey: lesson.dateKey, day: lesson.day, date: lesson.date, time: lesson.time, teacherId: lesson.teacherId, studentIds: lesson.studentIds||[], students: lesson.students||[], plannedDur: lesson.plannedDur||60, status: "checked-in", checkedInAt: hhmm(now), checkedOutAt: null, completedDur: null, _checkedInTs: now.getTime(), heldMethod: "live", notes: lesson.notes||"", billed: false, subject: lesson.subject }]);
    },
    checkOut: (aptId, notes) => {
      const now = new Date();
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: "completed", checkedOutAt: hhmm(now), completedDur: a.plannedDur||60, notes: notes||a.notes } : a));
    },
    revertLesson: (aptId) => { setAppointments(prev => prev.filter(a => a.id !== aptId)); },
    confirmHeld: (lesson, notes) => {
      const start = new Date(`${lesson.dateKey}T${lesson.time}:00`);
      const dur = lesson.plannedDur||60;
      const end = new Date(start.getTime() + dur*60000);
      const existing = appointments.find(a => a.slotId === lesson.slotId && a.dateKey === lesson.dateKey);
      if (existing) { setAppointments(prev => prev.map(a => a.id === existing.id ? { ...a, status: "completed", checkedOutAt: hhmm(end), completedDur: dur, heldMethod: "confirmed", notes: notes||a.notes } : a)); return; }
      setAppointments(prev => [...prev, { id: `apt_${Date.now()}`, slotId: lesson.slotId, dateKey: lesson.dateKey, day: lesson.day, date: lesson.date, time: lesson.time, teacherId: lesson.teacherId, studentIds: lesson.studentIds||[], students: lesson.students||[], plannedDur: dur, status: "completed", checkedInAt: hhmm(start), checkedOutAt: hhmm(end), completedDur: dur, _checkedInTs: start.getTime(), heldMethod: "confirmed", notes: notes||"", billed: false, subject: lesson.subject }]);
    },
    confirmManyHeld: (lessons) => {
      const toInsert = lessons.filter(l => !appointments.find(a => a.slotId === l.slotId && a.dateKey === l.dateKey));
      if (!toInsert.length) return;
      setAppointments(prev => [...prev, ...toInsert.map(l => {
        const start = new Date(`${l.dateKey}T${l.time}:00`); const dur = l.plannedDur||60; const end = new Date(start.getTime()+dur*60000);
        return { id: `apt_${Date.now()}_${l.slotId}`, slotId: l.slotId, dateKey: l.dateKey, day: l.day, date: l.date, time: l.time, teacherId: l.teacherId, studentIds: l.studentIds||[], students: l.students||[], plannedDur: dur, status: "completed", checkedInAt: hhmm(start), checkedOutAt: hhmm(end), completedDur: dur, _checkedInTs: start.getTime(), heldMethod: "confirmed", notes: "", billed: false };
      })]);
    },
    markAsBilled: (teacherId, month, billedBy) => {
      const now = new Date(); const teacher = teachers.find(t => t.id === teacherId);
      const open = appointments.filter(a => a.teacherId === teacherId && a.status === "completed" && !a.billed);
      if (!open.length) return;
      const hours = open.reduce((s,a) => s+(a.completedDur||0)/60, 0);
      const cost = hours*(teacher?.rate||0); const ids = open.map(a => a.id);
      setAppointments(prev => prev.map(a => ids.includes(a.id) ? { ...a, billed: true, billedMonth: month, billedBy } : a));
      const entry = { id: Date.now(), teacherId, teacherName: teacher?.name, month, hours, cost, billedBy, timestamp: now.getTime(), formatted: now.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"})+" · "+now.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}) };
      setBillingLog(prev => [...prev, entry]);
      // CSV direkt nach Abrechnung anbieten
      const wdS=["So","Mo","Di","Mi","Do","Fr","Sa"]; const rateStr=(teacher?.rate||0).toFixed(2).replace(".",",");
      const byDay={}; open.forEach(a=>{byDay[a.dateKey||""]=(byDay[a.dateKey||""]||0)+(a.completedDur||0);});
      const days=Object.keys(byDay).filter(Boolean).sort(); const totalMin=days.reduce((s,dk)=>s+byDay[dk],0); const totalHrs=totalMin/60;
      const rows=[["Leistungsnachweis",teacher?.name||""],["Zeitraum",month],["Stundensatz",rateStr],[],["Datum","Wochentag","Stunden","Satz","Betrag"],...days.map(dk=>{const h=byDay[dk]/60;return[dk,wdS[new Date(dk+"T00:00:00").getDay()],h.toFixed(2).replace(".",","),rateStr,(h*(teacher?.rate||0)).toFixed(2).replace(".",",")];}),[], ["Summe","",totalHrs.toFixed(2).replace(".",","),"",(totalHrs*(teacher?.rate||0)).toFixed(2).replace(".",",")]];
      const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(";")).join("\r\n");
      const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
      const url=URL.createObjectURL(blob); const link=document.createElement("a");
      link.href=url; link.download=`leistungsnachweis_${(teacher?.name||"").replace(/\s+/g,"_")}_${month.replace(/\s+/g,"_")}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    },
    exportCSV: (teacherId) => {
      const t = teachers.find(x => x.id === teacherId); if (!t) return;
      const open = appointments.filter(a => a.teacherId === teacherId && a.status === "completed" && !a.billed);
      if (!open.length) return;
      const byDay = {}; open.forEach(a => { byDay[a.dateKey||""] = (byDay[a.dateKey||""]||0)+(a.completedDur||0); });
      const days = Object.keys(byDay).filter(Boolean).sort();
      const wdS = ["So","Mo","Di","Mi","Do","Fr","Sa"]; const totalMin = days.reduce((s,dk)=>s+byDay[dk],0);
      const totalHrs = totalMin/60; const rateStr = t.rate.toFixed(2).replace(".",",");
      const rows = [["Leistungsnachweis",t.name],["Zeitraum",days[0]||""],["Stundensatz",rateStr],[],["Datum","Wochentag","Stunden","Satz","Betrag"],...days.map(dk=>{const hrs=byDay[dk]/60;return[dk,wdS[new Date(dk+"T00:00:00").getDay()],hrs.toFixed(2).replace(".",","),rateStr,(hrs*t.rate).toFixed(2).replace(".",",")];}),[], ["Summe","",totalHrs.toFixed(2).replace(".",","),"",(totalHrs*t.rate).toFixed(2).replace(".",",")]];
      const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(";")).join("\r\n");
      const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = `leistungsnachweis_${t.name.replace(/\s+/g,"_")}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    },
    saveSlot: (slotData) => {
      if (slotData.id && scheduleSlots.find(s => s.id === slotData.id)) {
        setScheduleSlots(prev => prev.map(s => s.id === slotData.id ? { ...s, ...slotData } : s));
      } else {
        setScheduleSlots(prev => [...prev, { ...slotData, id: slotData.id||`slot_${Date.now()}` }]);
      }
    },
    removeSlot: (slotId) => { setScheduleSlots(prev => prev.filter(s => s.id !== slotId)); },
    addTeacher: (data) => { setTeachers(prev => [...prev, data]); },
    copyDayToDay: (fromDay, toDay, locationId) => {
      const source = scheduleSlots.filter(s => s.day === fromDay && s.locationId === locationId && !s.onDate);
      setScheduleSlots(prev => [...prev.filter(s => !(s.day === toDay && s.locationId === locationId && !s.onDate)), ...source.map(s => ({ ...s, id: `slot_${Date.now()}_${Math.random()}`, day: toDay }))]);
    },
    clearDay: (day, locationId) => { setScheduleSlots(prev => prev.filter(s => !(s.day === day && s.locationId === locationId && !s.onDate))); },
  };
}

const statusColor = (s) => s === "completed" ? C.success : s === "checked-in" ? C.primary : C.info;
const statusLabel = (s) => s === "completed" ? "Erledigt" : s === "checked-in" ? "Läuft jetzt" : "Geplant";
const subjectsMatch = (ts, ss) => ts.some(sub => ss.some(x => sub.toLowerCase().includes(x.toLowerCase()) || x.toLowerCase().includes(sub.toLowerCase())));
const fmtEur = (n) => `${n.toFixed(2).replace(".", ",")} €`;

function FontInjector() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);
  return null;
}

/* PRIMITIVES */
function Avatar({ short, color, size = 32 }) {
  return <div style={{ width: size, height: size, borderRadius: size/2, background: color || C.surfaceHi, border: `1.5px solid ${color || C.borderHi}`, display: "grid", placeItems: "center", color: color ? "#fff" : C.textHi, fontWeight: 700, fontSize: size * 0.36, fontFamily: FF.display, letterSpacing: -0.5, flexShrink: 0 }}>{short}</div>;
}

function SectionHeader({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: C.textDim, letterSpacing: 1, margin: 0, textTransform: "uppercase" }}>{children}</h2>
      {action}
    </div>
  );
}

function Tag({ children, color = C.text }) {
  return <div style={{ padding: "5px 10px", borderRadius: 6, background: color + "18", color, fontSize: 11, fontWeight: 700, letterSpacing: .3 }}>{children}</div>;
}

function Field({ label, value, onChange, type = "text", placeholder, hint }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: .3 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, color: C.textHi, fontSize: 15, fontFamily: FF.body, outline: "none", boxSizing: "border-box" }}/>
      {hint && <div style={{ fontSize: 11, color: C.textVeryDim, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, icon: Icon, color }) {
  const bg = color || C.primaryGrad;
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: "100%", padding: 16, background: disabled ? C.borderHi : bg, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, fontFamily: FF.body, cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : "0 12px 24px -8px rgba(244,145,86,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: disabled ? .5 : 1 }}>
      {Icon && <Icon size={18}/>} {children}
    </button>
  );
}

function SubjectsPicker({ selected, onChange }) {
  const toggle = (s) => selected.includes(s) ? onChange(selected.filter(x => x !== s)) : onChange([...selected, s]);
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: .3 }}>Fächer · mehrere möglich</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {ALL_SUBJECTS.map(s => {
          const isOn = selected.includes(s);
          return (
            <button key={s} onClick={() => toggle(s)} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: isOn ? "rgba(244,145,86,.18)" : C.surface, border: `1.5px solid ${isOn ? C.primary : C.border}`, color: isOn ? C.primary : C.text, fontSize: 13, fontWeight: 600, fontFamily: FF.body, display: "flex", alignItems: "center", gap: 6 }}>
              {isOn && <Check size={12} strokeWidth={3}/>} {s}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && <div style={{ fontSize: 11, color: C.textVeryDim, marginTop: 8 }}>Mindestens ein Fach auswählen.</div>}
    </div>
  );
}

/* CHROME */
function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px 8px", fontFamily: FF.body, fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
      <span style={{ color: C.textHi }}>9:41</span>
      <div style={{ width: 130 }}/>
      <div style={{ display: "flex", gap: 6, alignItems: "center", color: C.textHi }}>
        <Signal size={14}/><Wifi size={14}/><BatteryFull size={18}/>
      </div>
    </div>
  );
}

function AppHeader({ user, onLogout }) {
  const isAdmin = user.role === "admin";
  return (
    <div style={{ padding: "8px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, background: C.bgGrad, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: C.primaryGrad, display: "grid", placeItems: "center", color: "#fff", fontFamily: FF.display, fontWeight: 800, fontSize: 24 }}>b</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.textHi, lineHeight: 1.1 }}>{user.name}</div>
          <div style={{ fontSize: 10, color: isAdmin ? C.primary : C.textDim, fontWeight: 700, letterSpacing: .5 }}>
            {user.role === "admin" ? "INHABER" : user.role === "loc_admin" ? "STANDORTLEITUNG" : "LEHRKRAFT"}
          </div>
        </div>
      </div>
      <button onClick={onLogout} title="Abmelden" style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", cursor: "pointer" }}>
        <LogOut size={14}/>
      </button>
    </div>
  );
}

function BottomTabs({ tab, setTab, isAdmin }) {
  const tabs = isAdmin
    ? [
        { key: "admin-billing", label: "Lohn", icon: DollarSign },
        { key: "admin-schedule", label: "Plan", icon: Calendar },
        { key: "admin-students", label: "Schüler", icon: Users },
        { key: "admin-staff", label: "Lehrer", icon: GraduationCap },
        { key: "admin-today", label: "Stunden", icon: Clock },
      ]
    : [
        { key: "today", label: "Heute", icon: HomeIcon },
        { key: "week", label: "Woche", icon: Calendar },
        { key: "students", label: "Schüler", icon: Users },
        { key: "profile", label: "Profil", icon: User },
      ];
  return (
    <div style={{ flexShrink: 0, background: "rgba(15,27,45,.92)", backdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`, padding: "10px 4px max(28px, env(safe-area-inset-bottom))", display: "flex", justifyContent: "space-around" }}>
      {tabs.map(t => {
        const active = tab === t.key;
        const Icon = t.icon;
        return (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ background: "transparent", border: "none", padding: "6px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: active ? C.primary : C.textVeryDim, cursor: "pointer", flex: 1, minWidth: 0 }}>
            <Icon size={isAdmin ? 18 : 20} strokeWidth={active ? 2.5 : 2}/>
            <span style={{ fontSize: isAdmin ? 9 : 10, fontWeight: 700, fontFamily: FF.body }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* DESKTOP SIDEBAR — only visible on desktop (>= 768px). Replaces BottomTabs. */
function DesktopSidebar({ user, tab, setTab, isAdmin, onLogout }) {
  const tabs = isAdmin
    ? [
        { key: "admin-billing", label: "Lohn", icon: DollarSign },
        { key: "admin-schedule", label: "Plan", icon: Calendar },
        { key: "admin-students", label: "Schüler", icon: Users },
        { key: "admin-staff", label: "Lehrer", icon: GraduationCap },
        { key: "admin-today", label: "Stunden", icon: Clock },
      ]
    : [
        { key: "today", label: "Heute", icon: HomeIcon },
        { key: "week", label: "Woche", icon: Calendar },
        { key: "students", label: "Schüler", icon: Users },
        { key: "profile", label: "Profil", icon: User },
      ];
  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: C.surfaceLo, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
      fontFamily: FF.body,
    }}>
      {/* Logo & brand */}
      <div style={{ padding: "20px 20px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, background: C.primaryGrad, display: "grid", placeItems: "center", color: "#fff", fontFamily: FF.display, fontWeight: 800, fontSize: 26 }}>b</div>
        <div>
          <div style={{ fontFamily: FF.display, fontSize: 17, fontWeight: 700, color: C.textHi, lineHeight: 1 }}>beck-up</div>
          <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1.4, fontWeight: 700, marginTop: 3 }}>VERWALTUNG</div>
        </div>
      </div>

      {/* Tab list */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, overflow: "auto" }}>
        {tabs.map(t => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              background: active ? "rgba(244,145,86,.12)" : "transparent",
              border: active ? `1px solid ${C.primary}40` : "1px solid transparent",
              color: active ? C.primary : C.text,
              fontSize: 13, fontWeight: active ? 700 : 600, cursor: "pointer",
              fontFamily: FF.body, textAlign: "left",
              display: "flex", alignItems: "center", gap: 11,
            }}>
              <Icon size={17} strokeWidth={active ? 2.4 : 2}/>
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* User card at bottom */}
      <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar short={user.short || (user.name || "?").split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase()} color={user.color || C.primary} size={36}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textHi, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
          <div style={{ fontSize: 10, color: (user.role === "admin" || user.role === "loc_admin") ? C.primary : C.textDim, fontWeight: 700, letterSpacing: .5, marginTop: 2 }}>
            {user.role === "admin" ? "INHABER" : user.role === "loc_admin" ? "STANDORTLEITUNG" : "LEHRKRAFT"}
          </div>
        </div>
        <button onClick={onLogout} title="Abmelden" style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <LogOut size={13}/>
        </button>
      </div>
    </div>
  );
}

/* SHELL — wraps the app in the right container depending on device.
 * Mobile (< 768px): phone-style full-bleed layout with bottom tabs (handled outside).
 * Desktop (>= 768px): sidebar-left + content-right layout.
 */
function PhoneFrame({ children, isMobile }) {
  if (isMobile) return <div style={{ position: "relative", width: "100vw", height: "100vh", background: C.bg, fontFamily: FF.body, color: C.textHi, overflow: "hidden" }}>{children}</div>;
  // Desktop: just provide the global background — the actual sidebar/content split is built in the App component
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: FF.body, color: C.textHi,
    }}>
      {children}
    </div>
  );
}

/* LOGIN — with role picker */
/* LOGIN — Demo mit E-Mail + Autocomplete */
function Login({ onLogin }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showSugg, setShowSugg] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const filtered = DEMO_USERS.filter(u => !email || u.email.toLowerCase().includes(email.toLowerCase()) || u.name.toLowerCase().includes(email.toLowerCase()));
  const roleLabel = r => r === "admin" ? "Inhaber" : r === "loc_admin" ? "Standortleitung" : "Lehrkraft";
  const roleColor = r => r === "admin" ? C.primary : r === "loc_admin" ? "#D97706" : C.success;

  const select = (u) => { setEmail(u.email); setPassword("demo1234"); setShowSugg(false); setError(""); };

  const handleSubmit = (e) => {
    e && e.preventDefault(); setError("");
    const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) { setError("E-Mail nicht gefunden — sieh die Vorschläge."); return; }
    if (password !== user.password) { setError("Falsches Passwort. Demo: demo1234"); return; }
    setLoading(true);
    setTimeout(() => onLogin({ ...user }), 600);
  };

  return (
    <div style={{ minHeight: "100%", maxHeight: "100%", overflow: "auto", display: "flex", flexDirection: "column", padding: "48px 28px 40px", background: C.bgGrad }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, borderRadius: 22, background: C.primaryGrad, display: "grid", placeItems: "center", color: "#fff", fontFamily: FF.display, fontWeight: 800, fontSize: 40 }}>b</div>
        <div>
          <div style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, color: C.textHi, lineHeight: 1 }}>beck-up</div>
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 1.5, fontWeight: 600, marginTop: 2 }}>VERWALTUNGSPORTAL</div>
        </div>
      </div>

      <h1 style={{ fontFamily: FF.display, fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: C.textHi, letterSpacing: -0.5 }}>Anmelden.</h1>
      <p style={{ color: C.textDim, fontSize: 13, margin: "0 0 22px", lineHeight: 1.5 }}>Mit deiner Institut-E-Mail einloggen.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600 }}>E-Mail Adresse</label>
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setShowSugg(true); setError(""); }}
            onFocus={() => setShowSugg(true)} onBlur={() => setTimeout(() => setShowSugg(false), 200)}
            placeholder="name@beck-up.de" autoComplete="off"
            style={{ width: "100%", padding: "13px 14px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, color: C.textHi, fontSize: 14, fontFamily: FF.body, outline: "none", boxSizing: "border-box" }}/>
          {showSugg && filtered.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
              {filtered.slice(0,6).map(u => (
                <button key={u.id} type="button" onMouseDown={() => select(u)} style={{ width: "100%", padding: "10px 14px", background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left", fontFamily: FF.body, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: u.color, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 10, flexShrink: 0 }}>{u.short}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.textHi }}>{u.name}</div>
                    <div style={{ fontSize: 10, color: C.textDim }}>{u.email}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: roleColor(u.role), background: roleColor(u.role)+"18", padding: "2px 7px", borderRadius: 5, flexShrink: 0 }}>{roleLabel(u.role)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {email && (
          <div>
            <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600 }}>Passwort</label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              style={{ width: "100%", padding: "13px 14px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, color: C.textHi, fontSize: 14, fontFamily: FF.body, outline: "none", boxSizing: "border-box" }}/>
          </div>
        )}

        {error && <div style={{ padding: "10px 14px", background: C.danger+"22", border: `1px solid ${C.danger}60`, borderRadius: 10, color: C.danger, fontSize: 13, fontWeight: 600 }}>{error}</div>}

        <button type="submit" disabled={loading || !email || !password} style={{ padding: 14, background: email && password ? C.primaryGrad : C.borderHi, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: email && password ? "pointer" : "not-allowed", marginTop: 4 }}>
          {loading ? "Anmelden…" : "Einloggen →"}
        </button>
      </form>

      <div style={{ marginTop: 20, padding: "12px 14px", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, marginBottom: 8, letterSpacing: 1 }}>DEMO-ZUGÄNGE</div>
        {[{l:"Inhaber",e:"beck@beck-up.de"},{l:"Lehrkraft",e:"stolle@beck-up.de"},{l:"Lehrkraft",e:"albrecht@beck-up.de"}].map(x => (
          <button key={x.e} type="button" onClick={() => select(DEMO_USERS.find(u=>u.email===x.e))} style={{ background:"transparent",border:"none",padding:"3px 0",cursor:"pointer",textAlign:"left",fontFamily:FF.body,display:"flex",gap:8,alignItems:"center",width:"100%" }}>
            <span style={{ fontSize:10, color:C.textVeryDim, minWidth:110 }}>{x.l}:</span>
            <span style={{ fontSize:11, color:C.primary, fontWeight:600 }}>{x.e}</span>
          </button>
        ))}
        <div style={{ fontSize:10, color:C.textVeryDim, marginTop:6 }}>Passwort: demo1234 (alle Accounts)</div>
      </div>
    </div>
  );
}


/* TEACHER: APPOINTMENT CARD with check-in/out */
function Stat({ label, value, color }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 12px" }}>
      <div style={{ fontFamily: FF.display, fontSize: 28, fontWeight: 700, color, lineHeight: 1, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textDim, fontWeight: 700, letterSpacing: .8, marginTop: 6 }}>{label.toUpperCase()}</div>
    </div>
  );
}

function CheckedInCard({ apt, store, onClick, liveSeconds }) {
  const students = apt.students || [];
  const single = students.length === 1 ? students[0] : null;
  const title = single ? single.name : `Gruppe · ${students.length} Schüler`;
  const subLine = single ? `Klasse ${single.grade} · ${apt.subject}` : `${apt.time} · ${apt.room}`;
  const elapsedSec = apt._checkedInTs ? Math.max(0, Math.floor((Date.now() - apt._checkedInTs) / 1000)) : 0;
  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", padding: 0, background: "transparent" }}>
      <div style={{ position: "relative", padding: 20, borderRadius: 18, background: "linear-gradient(135deg, rgba(244,145,86,.18) 0%, rgba(231,111,81,.08) 100%)", border: `1.5px solid ${C.primary}80` }}>
        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 6, color: C.primary }}>
          <span style={{ width: 8, height: 8, background: C.primary, borderRadius: 4, animation: "pulse 1.5s infinite" }}/>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>EINGECHECKT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          {single ? (
            <Avatar short={single.short} color={C.primary} size={48}/>
          ) : (
            <div style={{ display: "flex" }}>
              {students.slice(0, 3).map((st, i) => (
                <div key={st.id} style={{ marginLeft: i ? -12 : 0, borderRadius: "50%", border: `2px solid #2a2320` }}>
                  <Avatar short={st.short} color={C.primary} size={42}/>
                </div>
              ))}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, color: C.textHi, letterSpacing: -0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
            <div style={{ fontSize: 12, color: C.textDim }}>{subLine}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(0,0,0,.25)", borderRadius: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: C.textDim, fontWeight: 600, letterSpacing: .5 }}>LAUFZEIT</span>
          <span style={{ fontFamily: FF.display, fontSize: 22, fontWeight: 700, color: C.primary, letterSpacing: -0.5 }}>
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </span>
        </div>
        <div style={{ padding: "12px 14px", background: C.danger, color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Square size={14}/> Stunde beenden & abrechnen
        </div>
      </div>
    </button>
  );
}

function AptCard({ apt, store, onClick, dim }) {
  const students = apt.students || [];
  const single = students.length === 1 ? students[0] : null;
  const title = single ? single.name : (students.length ? students.map(s => s.name).join(", ") : "Keine Schüler");
  const sub = single
    ? `Kl. ${single.grade} · ${apt.subject} · ${apt.room}`
    : `Gruppe · ${students.length} Schüler · ${apt.room}`;
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", padding: 0, background: "transparent" }}>
      <div style={{ display: "flex", gap: 14, padding: 14, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, opacity: dim ? .65 : 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 50 }}>
          <div style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, color: C.textHi, letterSpacing: -0.3 }}>{apt.time}</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{apt.plannedDur} Min</div>
        </div>
        <div style={{ width: 1, background: C.border }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            {single ? (
              <Avatar short={single.short} size={28}/>
            ) : (
              <div style={{ display: "flex" }}>
                {students.slice(0, 3).map((st, i) => (
                  <div key={st.id} style={{ marginLeft: i ? -8 : 0, borderRadius: "50%", border: `2px solid ${C.surface}` }}>
                    <Avatar short={st.short} size={26}/>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontWeight: 700, fontSize: 14, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          </div>
          <div style={{ fontSize: 12, color: C.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
          <div style={{ marginTop: 6, display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, color: statusColor(apt.status), background: statusColor(apt.status) + "20", letterSpacing: .5 }}>
            {statusLabel(apt.status).toUpperCase()}
            {apt.status === "completed" && apt.completedDur && ` · ${apt.completedDur}m`}
          </div>
        </div>
        <ChevronRight size={20} color={C.textVeryDim} style={{ alignSelf: "center", flexShrink: 0 }}/>
      </div>
    </button>
  );
}

function TodayScreen({ user, store, onAptClick, liveSeconds }) {
  const apts = store.aptsForToday(user.id);
  const checkedIn = apts.find(a => a.status === "checked-in");
  const upcoming = apts.filter(a => a.status === "scheduled");
  const completed = apts.filter(a => a.status === "completed");
  const completedHrs = completed.reduce((s,a) => s + (a.completedDur || 0)/60, 0);
  const todayLabel = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });
  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: C.textDim, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>{todayLabel.toUpperCase()}</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.6, color: C.textHi }}>
          Hallo {user.name.split(" ")[0]},<br/><span style={{ color: C.primary }}>{apts.length} Termine</span> heute.
        </h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 28 }}>
        <Stat label="Erfasst" value={`${completedHrs.toFixed(1)}h`} color={C.success}/>
        <Stat label="Aktuell" value={checkedIn ? 1 : 0} color={C.primary}/>
        <Stat label="Geplant" value={upcoming.length} color={C.info}/>
      </div>
      {checkedIn && <div style={{ marginBottom: 24 }}><SectionHeader>Eingecheckt</SectionHeader><CheckedInCard apt={checkedIn} store={store} onClick={() => onAptClick(checkedIn.id)} liveSeconds={liveSeconds}/></div>}
      {upcoming.length > 0 && <div style={{ marginBottom: 24 }}><SectionHeader>Als nächstes</SectionHeader><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{upcoming.map(a => <AptCard key={a.id} apt={a} store={store} onClick={() => onAptClick(a.id)}/>)}</div></div>}
      {completed.length > 0 && <div><SectionHeader>Bereits erfasst</SectionHeader><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{completed.map(a => <AptCard key={a.id} apt={a} store={store} onClick={() => onAptClick(a.id)} dim/>)}</div></div>}
    </div>
  );
}

function WeekScreen({ user, store, onAptClick }) {
  const today = new Date();
  const mon = mondayOf(today);
  const todayIdx = appDayFromJS(today); // 0=Mo..6=So
  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i); return d;
  });
  const [selectedDay, setSelectedDay] = useState(todayIdx >= 0 && todayIdx <= 4 ? todayIdx : 0);
  const all = store.aptsForWeek(user.id);
  const kwLabel = `KW ${isoWeek(today)} · ${mon.toLocaleDateString("de-DE", { month: "long", year: "numeric" }).toUpperCase()}`;
  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: C.textDim, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>{kwLabel}</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.6, color: C.textHi }}>Diese Woche</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 22 }}>
        {WEEKDAYS.map((d, i) => {
          const isSelected = i === selectedDay;
          const isToday = i === todayIdx;
          const count = all.filter(a => a.day === i).length;
          return (
            <button key={d} onClick={() => setSelectedDay(i)} style={{ padding: "10px 4px", border: `1.5px solid ${isSelected ? C.primary : C.border}`, background: isSelected ? "rgba(244,145,86,.12)" : C.surface, borderRadius: 12, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: isSelected ? C.primary : C.textDim, fontWeight: 700, letterSpacing: .5 }}>{d.toUpperCase()}</div>
              <div style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, color: isSelected ? C.primary : C.textHi, marginTop: 2, lineHeight: 1 }}>{weekDates[i].getDate()}</div>
              <div style={{ marginTop: 4, fontSize: 9, fontWeight: 700, color: count > 0 ? (isSelected ? C.primary : C.textDim) : C.textVeryDim }}>{count > 0 ? `${count} T.` : "—"}</div>
              {isToday && <div style={{ width: 4, height: 4, borderRadius: 2, background: C.primary, margin: "4px auto 0" }}/>}
            </button>
          );
        })}
      </div>
      <SectionHeader>{WEEKDAYS_LONG[selectedDay]}{selectedDay === todayIdx ? " (heute)" : ""}</SectionHeader>
      {all.filter(a => a.day === selectedDay).length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: C.textDim, background: C.surface, borderRadius: 14, border: `1px dashed ${C.border}` }}>
          <Coffee size={28} style={{ marginBottom: 10, opacity: .5 }}/>
          <div style={{ fontSize: 13 }}>Keine Stunden an diesem Tag.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {all.filter(a => a.day === selectedDay).sort((a,b) => a.time.localeCompare(b.time)).map(a => <AptCard key={a.id} apt={a} store={store} onClick={() => onAptClick(a.id)}/>)}
        </div>
      )}
    </div>
  );
}

function StudentsScreen({ user, store, onStudentClick }) {
  const [q, setQ] = useState("");
  const myStudents = store.students.filter(s => s.teacherId === user.id);
  const filtered = myStudents.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: C.textDim, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>MEINE SCHÜLER</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.6 }}>{myStudents.length} Schüler</h1>
      </div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={16} color={C.textDim} style={{ position: "absolute", left: 14, top: 14 }}/>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Nach Namen suchen…" style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, color: C.textHi, fontSize: 14, fontFamily: FF.body, outline: "none", boxSizing: "border-box" }}/>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(s => (
          <button key={s.id} onClick={() => onStudentClick(s.id)} style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", padding: 0, background: "transparent" }}>
            <div style={{ display: "flex", gap: 14, padding: 14, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, alignItems: "center" }}>
              <Avatar short={s.short} size={42}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.textHi, letterSpacing: -0.2 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>Klasse {s.grade} · {s.subjects.join(", ")}</div>
                <div style={{ marginTop: 6, display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: C.primary + "18", color: C.primary, letterSpacing: .3 }}>{s.focus}</div>
              </div>
              <ChevronRight size={18} color={C.textVeryDim}/>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BigStat({ value, unit, label, color }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 14px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: FF.display, fontSize: 32, fontWeight: 700, color, letterSpacing: -1.2, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 14, color: C.textDim, fontWeight: 600 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: .8, marginTop: 8 }}>{label.toUpperCase()}</div>
    </div>
  );
}

function Row({ icon: Icon, label, sub, action, last, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: last ? "none" : `1px solid ${C.border}`, cursor: onClick ? "pointer" : "default" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: C.surfaceHi, display: "grid", placeItems: "center", marginRight: 12 }}>
        <Icon size={15} color={C.textDim}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textHi }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.textDim, marginTop: 1 }}>{sub}</div>}
      </div>
      {action ? <span style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{action}</span> : <ChevronRight size={16} color={C.textVeryDim}/>}
    </div>
  );
}

function ProfileScreen({ user, store, onLogout, onShowTimesheet }) {
  const nowD = new Date();
  const monthKey = isoDateKey(nowD).slice(0, 7);
  const curMonthName = nowD.toLocaleDateString("de-DE", { month: "long" });
  const curMonthFull = nowD.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const isTeacher = user.role === "teacher";
  const open = isTeacher ? store.openHoursForTeacher(user.id).filter(a => !a.dateKey || a.dateKey.slice(0, 7) === monthKey) : [];
  const openHrs = open.reduce((s,a) => s + (a.completedDur || 0)/60, 0);
  const billedThisYear = isTeacher ? store.billedHoursForTeacher(user.id) : [];
  const billedHrs = billedThisYear.reduce((s,a) => s + (a.completedDur || 0)/60, 0);
  const roleLabel = user.role === "admin" ? "Inhaber · Gesamtübersicht" :
    user.role === "loc_admin" ? `Standortleitung · ${user.subtitle || ""}` :
    (user.subjects || store.teachers.find(t=>t.id===user.id)?.subjects || []).join(" · ");

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ marginBottom: 22, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Avatar short={user.short} color={user.color} size={80}/>
        <div style={{ fontFamily: FF.display, fontSize: 22, fontWeight: 700, marginTop: 14, color: C.textHi, letterSpacing: -0.4 }}>{user.name}</div>
        <div style={{ fontSize: 13, color: C.textDim, marginTop: 3 }}>{roleLabel}</div>
        <div style={{ fontSize: 11, color: C.textVeryDim, marginTop: 4 }}>{user.email}</div>
      </div>

      {isTeacher && <>
        <SectionHeader>Stundenkonto</SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          <BigStat value={openHrs.toFixed(1)} unit="h" label={`Offen (${curMonthName})`} color={C.primary}/>
          <BigStat value={billedHrs.toFixed(1)} unit="h" label="Abgerechnet" color={C.success}/>
        </div>
        <SectionHeader>Stundenzettel</SectionHeader>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 28 }}>
          <Row icon={FileText} label={`${curMonthFull} (offen)`} sub={`${openHrs.toFixed(1)} Std. erfasst`} action="Anzeigen" onClick={() => onShowTimesheet && onShowTimesheet()}/>
          <Row icon={Download} label="CSV-Export" sub="Erfasste Stunden als CSV" action="Exportieren" last onClick={() => store.exportCSV(user.id)}/>
        </div>
      </>}

      {!isTeacher && <>
        <SectionHeader>Übersicht</SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          <BigStat value={store.students.length} unit="" label="Schüler" color={C.primary}/>
          <BigStat value={store.teachers.length} unit="" label="Lehrkräfte" color={C.success}/>
        </div>
      </>}

      <SectionHeader>Einstellungen</SectionHeader>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 28 }}>
        <Row icon={Bell} label="Benachrichtigungen" sub="Erinnerung 15 Min vorher"/>
        <Row icon={Settings} label="Konto" sub={user.email}/>
        <Row icon={AlertCircle} label="Hilfe & Support" last/>
      </div>
      <button onClick={onLogout} style={{ width: "100%", padding: 14, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 12, color: C.danger, fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <LogOut size={16}/> Abmelden
      </button>
    </div>
  );
}

/* STUNDENZETTEL — Detail der erfassten Stunden eines Monats (Lehrer) */
function Stundenzettel({ user, store, onBack }) {
  const nowD = new Date();
  const monthKey = isoDateKey(nowD).slice(0, 7);
  const monthFull = nowD.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const lessons = store.appointments
    .filter(a => a.teacherId === user.id && a.status === "completed" && (a.dateKey || "").slice(0, 7) === monthKey)
    .sort((a, b) => (a.dateKey || "").localeCompare(b.dateKey || "") || (a.time || "").localeCompare(b.time || ""));
  const totalMin = lessons.reduce((s, a) => s + (a.completedDur || 0), 0);
  const totalHrs = totalMin / 60;
  const rate = user.rate || 0;
  return (
    <div style={{ padding: "16px 20px 40px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.text, display: "flex", alignItems: "center", gap: 6, padding: 0, cursor: "pointer", marginBottom: 18, fontFamily: FF.body }}>
        <ArrowLeft size={18}/> <span style={{ fontSize: 14, fontWeight: 600 }}>Zurück</span>
      </button>

      <div style={{ marginBottom: 16 }}>
        <div style={{ color: C.textDim, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>STUNDENZETTEL</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5, color: C.textHi }}>{monthFull}</h1>
      </div>

      <div style={{ padding: 18, background: "linear-gradient(135deg, rgba(244,145,86,.16) 0%, rgba(231,111,81,.06) 100%)", border: `1.5px solid ${C.primary}80`, borderRadius: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: FF.display, fontSize: 34, fontWeight: 700, color: C.textHi, letterSpacing: -1.2, lineHeight: 1 }}>{totalHrs.toFixed(1)}</span>
          <span style={{ fontSize: 14, color: C.textDim, fontWeight: 600 }}>Stunden</span>
        </div>
        <div style={{ fontSize: 13, color: C.textDim, marginTop: 8 }}>{lessons.length} erfasste Stunden{rate ? ` · ${fmtEur(totalHrs * rate)}` : ""}</div>
      </div>

      <button onClick={() => store.exportCSV(user.id)} style={{ width: "100%", padding: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        <Download size={14}/> Als CSV exportieren
      </button>

      <SectionHeader>Erfasste Stunden ({lessons.length})</SectionHeader>
      {lessons.length === 0 ? (
        <div style={{ padding: "30px 20px", textAlign: "center", color: C.textDim, background: C.surface, borderRadius: 14, fontSize: 13, border: `1px dashed ${C.border}` }}>
          Noch keine erfassten Stunden in diesem Monat.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lessons.map(a => {
            const names = (a.studentIds || []).map(id => store.studentById(id)?.name).filter(Boolean).join(", ") || "—";
            const isGroup = (a.studentIds || []).length > 1;
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                <span style={{ fontFamily: FF.display, fontWeight: 700, color: C.textHi, minWidth: 78, fontSize: 13 }}>{a.date}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isGroup ? `Gruppe: ${names}` : names}</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>{a.time}{a.billed ? " · abgerechnet" : a.heldMethod === "confirmed" ? " · bestätigt" : ""}</div>
                </div>
                <span style={{ fontFamily: FF.display, fontWeight: 700, color: a.billed ? C.textDim : C.success, fontSize: 14, flexShrink: 0 }}>{a.completedDur}m</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value, valueColor }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.textDim, fontSize: 11, fontWeight: 600, marginBottom: 4, letterSpacing: .3 }}>
        <Icon size={12}/> {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: valueColor || C.textHi }}>{value}</div>
    </div>
  );
}

/* APPOINTMENT DETAIL — Stunde mit Schülerliste; Check-in/out gilt für die ganze Stunde */
function AppointmentDetail({ aptId, store, onBack, onStudentClick, liveSeconds }) {
  const apt = store.lessonById(aptId);
  const students = apt?.students || [];
  const single = students.length === 1 ? students[0] : null;
  const startTs = apt ? new Date(`${apt.dateKey}T${apt.time}:00`).getTime() : 0;
  const canStart = Date.now() >= startTs;
  const [notes, setNotes] = useState(apt?.notes || "");
  const [hasHomework, setHasHomework] = useState(false);

  const handleCheckIn = () => { if (apt && canStart) store.checkIn(apt); };
  const handleConfirm = () => { if (apt && canStart) { store.confirmHeld(apt, notes); onBack(); } };
  const handleCheckOut = () => {
    if (apt) store.checkOut(apt.id, notes);
    onBack();
  };

  // Zusatz-Features für Lehrkräfte
  const [showFrueher, setShowFrueher] = React.useState(false);
  const [showNeuSchueler, setShowNeuSchueler] = React.useState(false);
  const [neuName, setNeuName] = React.useState("");
  const [neuGrade, setNeuGrade] = React.useState("");
  const [neuNotiz, setNeuNotiz] = React.useState("");

  const handleCheckOutFrueher = (minuten) => {
    if (apt) {
      const now = new Date();
      // checkOut mit angepasster Dauer
      setShowFrueher(false);
      store.checkOut && store.checkOut(apt.id, (notes || "") + ` [Früher: ${minuten}min]`);
    }
    onBack();
  };
  const handleNeuSchuelerHinzufuegen = () => {
    if (!neuName.trim()) return;
    const zusatz = ` [Gast: ${neuName.trim()} Kl.${neuGrade}${neuNotiz?" - "+neuNotiz:""}]`;
    setNotes(n => (n||"") + zusatz);
    setNeuName(""); setNeuGrade(""); setNeuNotiz("");
    setShowNeuSchueler(false);
  };

  // Echte Laufzeit seit Check-in (liveSeconds als Sekunden-Takt zum Neu-Rendern)
  const elapsedSec = apt?._checkedInTs ? Math.max(0, Math.floor((Date.now() - apt._checkedInTs) / 1000)) : 0;
  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;

  if (!apt) {
    return (
      <div style={{ padding: "16px 20px 40px" }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.text, display: "flex", alignItems: "center", gap: 6, padding: 0, cursor: "pointer", marginBottom: 18, fontFamily: FF.body }}>
          <ArrowLeft size={18}/> <span style={{ fontSize: 14, fontWeight: 600 }}>Zurück</span>
        </button>
        <div style={{ padding: "40px 20px", textAlign: "center", color: C.textDim }}>Diese Stunde ist nicht mehr verfügbar.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px 40px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.text, display: "flex", alignItems: "center", gap: 6, padding: 0, cursor: "pointer", marginBottom: 18, fontFamily: FF.body }}>
        <ArrowLeft size={18}/> <span style={{ fontSize: 14, fontWeight: 600 }}>Zurück</span>
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        {single ? (
          <Avatar short={single.short} size={56}/>
        ) : (
          <div style={{ display: "flex" }}>
            {students.slice(0, 3).map((st, i) => (
              <div key={st.id} style={{ marginLeft: i ? -14 : 0, borderRadius: "50%", border: `2px solid ${C.bg}` }}>
                <Avatar short={st.short} size={48}/>
              </div>
            ))}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FF.display, fontSize: 22, fontWeight: 700, color: C.textHi, letterSpacing: -0.4, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {single ? single.name : `Gruppe · ${students.length} Schüler`}
          </div>
          <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>
            {single ? `Klasse ${single.grade} · seit ${single.since}` : `${apt.time} · ${apt.room}`}
          </div>
        </div>
      </div>
      {single && (
        <div style={{ marginTop: 6, marginBottom: 22, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {single.focus && <Tag color={C.primary}>{single.focus}</Tag>}
          {apt.subject && <Tag>{apt.subject}</Tag>}
        </div>
      )}
      {!single && <div style={{ height: 16 }}/>}

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Detail icon={Clock} label="Geplant" value={`${apt.time} · ${apt.plannedDur} Min`}/>
          <Detail icon={MapPin} label="Ort" value={apt.room}/>
          {apt.checkedInAt && <Detail icon={Play} label="Check-in" value={apt.checkedInAt} valueColor={C.primary}/>}
          {apt.checkedOutAt && <Detail icon={Square} label="Check-out" value={apt.checkedOutAt} valueColor={C.success}/>}
          {apt.completedDur && <Detail icon={Calendar} label="Erfasst" value={`${apt.completedDur} Min`} valueColor={C.success}/>}
          {apt.status === "scheduled" && <Detail icon={Calendar} label="Status" value="Bevorstehend" valueColor={C.info}/>}
        </div>
      </div>

      {/* Live timer for checked-in */}
      {apt.status === "checked-in" && (
        <div style={{ padding: 18, background: "linear-gradient(135deg, rgba(244,145,86,.18) 0%, rgba(231,111,81,.08) 100%)", border: `1.5px solid ${C.primary}80`, borderRadius: 14, marginBottom: 22, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 1.5, marginBottom: 8 }}>STUNDE LÄUFT</div>
          <div style={{ fontFamily: FF.display, fontSize: 44, fontWeight: 700, color: C.textHi, letterSpacing: -2, lineHeight: 1 }}>
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>seit Check-in um {apt.checkedInAt}</div>
        </div>
      )}

      {/* Schülerliste der Stunde */}
      <SectionHeader>Schüler in dieser Stunde ({students.length})</SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        {students.length === 0 && (
          <div style={{ padding: "14px 16px", background: C.surfaceLo, border: `1px dashed ${C.border}`, borderRadius: 12, fontSize: 13, color: C.textDim }}>Keine Schüler hinterlegt.</div>
        )}
        {students.map(st => (
          <button key={st.id} onClick={() => onStudentClick && onStudentClick(st.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%", fontFamily: FF.body }}>
            <Avatar short={st.short} size={34}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.name}</div>
              <div style={{ fontSize: 12, color: C.textDim }}>Kl. {st.grade} · {st.subjects?.length ? st.subjects.join(" · ") : "—"}</div>
            </div>
            <ChevronRight size={18} color={C.textVeryDim} style={{ flexShrink: 0 }}/>
          </button>
        ))}
      </div>

      {single && single.notes && (
        <>
          <SectionHeader>Letzter Stand</SectionHeader>
          <div style={{ padding: "14px 16px", background: C.surfaceLo, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 22, fontSize: 13, color: C.text, lineHeight: 1.5 }}>{single.notes}</div>
        </>
      )}

      <SectionHeader>{apt.status === "completed" ? "Notizen aus dieser Stunde" : "Notizen"}</SectionHeader>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Was habt ihr gemacht? Worauf reagiert die Gruppe?" style={{ width: "100%", minHeight: 100, padding: "14px 16px", borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, color: C.textHi, fontSize: 14, fontFamily: FF.body, outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }}/>

      {apt.status !== "completed" && (
        <>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <span style={{ fontSize: 14, color: C.textHi }}>Hausaufgaben aufgegeben?</span>
            <button onClick={() => setHasHomework(!hasHomework)} style={{ width: 48, height: 28, borderRadius: 14, background: hasHomework ? C.primary : C.borderHi, border: "none", cursor: "pointer", position: "relative", padding: 0 }}>
              <span style={{ position: "absolute", top: 3, left: hasHomework ? 23 : 3, width: 22, height: 22, borderRadius: 11, background: "#fff", transition: "left .2s" }}/>
            </button>
          </div>

          <div style={{ marginTop: 22 }}>
            {apt.status === "scheduled" ? (
              canStart ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <PrimaryButton onClick={handleCheckIn} icon={Play}>Stunde starten · einchecken</PrimaryButton>
                  <button onClick={handleConfirm} style={{ width: "100%", padding: 14, background: "transparent", border: `1.5px solid ${C.success}`, borderRadius: 12, color: C.success, fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Check size={16}/> Als gehalten bestätigen
                  </button>
                  <div style={{ fontSize: 11, color: C.textVeryDim, textAlign: "center" }}>
                    Einchecken misst die Zeit live · Bestätigen bucht die geplanten 60 Min.
                  </div>
                </div>
              ) : (
                <>
                  <PrimaryButton onClick={() => {}} icon={Clock} disabled>Startet um {apt.time}</PrimaryButton>
                  <div style={{ marginTop: 8, fontSize: 12, color: C.textDim, textAlign: "center" }}>
                    Die Stunde kann erst ab Beginn ({apt.time}) gestartet werden.
                  </div>
                </>
              )
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <PrimaryButton onClick={handleCheckOut} icon={Square} color={`linear-gradient(135deg, ${C.danger} 0%, ${C.primaryDk} 100%)`}>
                  Auschecken & Stunde erfassen
                </PrimaryButton>

                {/* Früher gegangen */}
                <button onClick={() => setShowFrueher(!showFrueher)} style={{ width:"100%", padding:12, background:"transparent", border:`1px solid ${C.border}`, borderRadius:12, color:C.textDim, fontSize:13, fontWeight:600, fontFamily:FF.body, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Minus size={14}/> Früher gegangen
                </button>
                {showFrueher && (
                  <div style={{ background:C.surfaceLo, border:`1px solid ${C.border}`, borderRadius:12, padding:14 }}>
                    <div style={{ fontSize:12, color:C.textDim, marginBottom:10, fontWeight:600 }}>Tatsächlich anwesend:</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                      {[15,30,45].map(m => (
                        <button key={m} onClick={() => handleCheckOutFrueher(m)} style={{ padding:"10px 0", background:C.primaryGrad, border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, fontFamily:FF.body, cursor:"pointer" }}>{m} Min</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Neuer Schüler war dabei */}
                <button onClick={() => setShowNeuSchueler(!showNeuSchueler)} style={{ width:"100%", padding:12, background:"transparent", border:`1px solid ${C.border}`, borderRadius:12, color:C.textDim, fontSize:13, fontWeight:600, fontFamily:FF.body, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Plus size={14}/> Neuer Schüler war dabei
                </button>
                {showNeuSchueler && (
                  <div style={{ background:C.surfaceLo, border:`1px solid ${C.border}`, borderRadius:12, padding:14 }}>
                    <div style={{ fontSize:12, color:C.textDim, marginBottom:10, fontWeight:600 }}>Nicht im System — notieren:</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <div style={{ display:"flex", gap:8 }}>
                        <input value={neuName} onChange={e=>setNeuName(e.target.value)} placeholder="Name" style={{ flex:1, padding:"9px 12px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.textHi, fontSize:13, fontFamily:FF.body, outline:"none" }}/>
                        <input value={neuGrade} onChange={e=>setNeuGrade(e.target.value)} placeholder="Kl." style={{ width:52, padding:"9px 10px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.textHi, fontSize:13, fontFamily:FF.body, outline:"none" }}/>
                      </div>
                      <input value={neuNotiz} onChange={e=>setNeuNotiz(e.target.value)} placeholder="Notiz (optional)" style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.textHi, fontSize:13, fontFamily:FF.body, outline:"none", boxSizing:"border-box" }}/>
                      <button onClick={handleNeuSchuelerHinzufuegen} disabled={!neuName.trim()} style={{ padding:"9px 0", background:neuName.trim()?C.success:C.borderHi, border:"none", borderRadius:8, color:"#fff", fontSize:12, fontWeight:700, fontFamily:FF.body, cursor:neuName.trim()?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                        <Check size={13}/> In Notizen übernehmen
                      </button>
                    </div>
                    <div style={{ fontSize:11, color:C.textVeryDim, marginTop:8 }}>Wird in den Notizen vermerkt. Danach als echten Schüler anlegen.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StudentProfile({ studentId, store, onBack, isAdmin, onRemoved }) {
  const s = store.studentById(studentId);
  if (!s) return null;
  const apts = store.appointments.filter(a => a.studentIds?.includes(studentId));
  const currentTeacher = s.teacherId ? store.teacherById(s.teacherId) : null;

  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [showTeacherPicker, setShowTeacherPicker] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Edit state
  const [eName, setEName] = useState(s.name);
  const [eGrade, setEGrade] = useState(s.grade);
  const [eFocus, setEFocus] = useState(s.focus);
  const [eSubjects, setESubjects] = useState(s.subjects);
  const [eNotes, setENotes] = useState(s.notes);

  const startEdit = () => {
    setEName(s.name); setEGrade(s.grade); setEFocus(s.focus);
    setESubjects(s.subjects); setENotes(s.notes);
    setMode("edit");
  };
  const saveEdit = () => {
    store.updateStudent(s.id, {
      name: eName, grade: Number(eGrade) || 1, focus: eFocus,
      subjects: eSubjects, notes: eNotes,
    });
    setMode("view");
  };
  const handleRemove = () => {
    store.removeStudent(s.id);
    setConfirmRemove(false);
    if (onRemoved) onRemoved();
    else onBack();
  };
  const handleReassign = (newTeacherId) => {
    store.assignStudent(s.id, newTeacherId);
    setShowTeacherPicker(false);
  };

  if (mode === "edit") {
    return (
      <div style={{ padding: "16px 20px 40px" }}>
        <button onClick={() => setMode("view")} style={{ background: "transparent", border: "none", color: C.text, display: "flex", alignItems: "center", gap: 6, padding: 0, cursor: "pointer", marginBottom: 18, fontFamily: FF.body }}>
          <ArrowLeft size={18}/> <span style={{ fontSize: 14, fontWeight: 600 }}>Zurück</span>
        </button>
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>SCHÜLER BEARBEITEN</div>
          <h1 style={{ fontFamily: FF.display, fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.4, color: C.textHi }}>{s.name}</h1>
        </div>
        <Field label="Name" value={eName} onChange={setEName}/>
        <Field label="Klasse (1–13)" value={String(eGrade)} onChange={(v) => setEGrade(v)} type="number"/>
        <Field label="Schwerpunkt" value={eFocus} onChange={setEFocus} placeholder="z.B. LRS-Förderung, ZAP-Vorbereitung"/>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Fächer</div>
          <SubjectsPicker selected={eSubjects} onChange={setESubjects}/>
        </div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Notizen</div>
          <textarea value={eNotes} onChange={e => setENotes(e.target.value)} placeholder="Was sollten Lehrer wissen?" style={{ width: "100%", minHeight: 80, padding: "12px 14px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, color: C.textHi, fontSize: 13, fontFamily: FF.body, outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }}/>
        </div>
        <PrimaryButton onClick={saveEdit} icon={Check}>Änderungen speichern</PrimaryButton>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px 40px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.text, display: "flex", alignItems: "center", gap: 6, padding: 0, cursor: "pointer", marginBottom: 18, fontFamily: FF.body }}>
        <ArrowLeft size={18}/> <span style={{ fontSize: 14, fontWeight: 600 }}>Zurück</span>
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 22 }}>
        <Avatar short={s.short} size={72}/>
        <div style={{ fontFamily: FF.display, fontSize: 22, fontWeight: 700, marginTop: 14, color: C.textHi, letterSpacing: -0.4 }}>{s.name}</div>
        <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>Klasse {s.grade} · seit {s.since}</div>
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          <Tag color={C.primary}>{s.focus}</Tag>
          {s.subjects.map(sub => <Tag key={sub}>{sub}</Tag>)}
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button onClick={startEdit} style={{ flex: 1, padding: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Edit2 size={13}/> Bearbeiten
            </button>
            <button onClick={() => setConfirmRemove(true)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${C.danger}80`, borderRadius: 12, color: C.danger, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Trash2 size={13}/> Entfernen
            </button>
          </div>

          <SectionHeader>Lehrkraft</SectionHeader>
          <button onClick={() => setShowTeacherPicker(true)} style={{ width: "100%", padding: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 22, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
            {currentTeacher ? (
              <>
                <Avatar short={currentTeacher.short} color={currentTeacher.color} size={36}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.textHi }}>{currentTeacher.name}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>Tippen zum Wechseln</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: C.warn + "22", display: "grid", placeItems: "center" }}>
                  <AlertCircle size={18} color={C.warn}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.warn }}>Keine Zuweisung</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>Tippen, um Lehrkraft zu wählen</div>
                </div>
              </>
            )}
            <ChevronRight size={18} color={C.textVeryDim}/>
          </button>
        </>
      )}

      <SectionHeader>Notizen</SectionHeader>
      <div style={{ padding: "14px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 22, fontSize: 13, color: C.text, lineHeight: 1.5, minHeight: 50 }}>
        {s.notes || <span style={{ color: C.textVeryDim }}>Noch keine Notizen.</span>}
      </div>
      <SectionHeader>Termine ({apts.length})</SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {apts.slice(0, 6).map(a => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: statusColor(a.status) }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textHi }}>{a.date} · {a.time}</div>
              <div style={{ fontSize: 11, color: C.textDim }}>{a.type === "gruppe" ? "Gruppe" : "Einzel"} · {a.room}</div>
            </div>
            {a.completedDur && <span style={{ fontSize: 11, color: C.success, fontWeight: 700 }}>{a.completedDur}m</span>}
          </div>
        ))}
      </div>

      {/* Teacher picker modal */}
      {showTeacherPicker && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: C.surface, borderRadius: "20px 20px 0 0", padding: 22, width: "100%", maxHeight: "85%", overflow: "auto", borderTop: `1px solid ${C.border}` }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.borderHi, margin: "0 auto 18px" }}/>
            <h3 style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: C.textHi }}>Lehrkraft wählen</h3>
            <p style={{ fontSize: 12, color: C.textDim, margin: "0 0 16px" }}>Passende Lehrer für {s.subjects.join(", ") || "—"}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {store.teachers.map(t => {
                const matches = subjectsMatch(t.subjects, s.subjects);
                const isCurrent = t.id === s.teacherId;
                const load = store.students.filter(x => x.teacherId === t.id).length;
                return (
                  <button key={t.id} onClick={() => handleReassign(t.id)} disabled={isCurrent} style={{ width: "100%", textAlign: "left", border: `1.5px solid ${isCurrent ? C.primary : matches ? C.success + "60" : C.border}`, cursor: isCurrent ? "default" : "pointer", padding: 12, background: isCurrent ? "rgba(244,145,86,.1)" : C.surfaceLo, borderRadius: 12, display: "flex", alignItems: "center", gap: 10, opacity: isCurrent ? .7 : 1 }}>
                    <Avatar short={t.short} color={t.color} size={34}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: C.textHi }}>{t.name}</span>
                        {isCurrent && <span style={{ padding: "1px 6px", background: C.primary + "33", color: C.primary, fontSize: 9, fontWeight: 700, borderRadius: 4 }}>AKTUELL</span>}
                        {matches && !isCurrent && <span style={{ padding: "1px 6px", background: C.success + "22", color: C.success, fontSize: 9, fontWeight: 700, borderRadius: 4 }}>PASST</span>}
                      </div>
                      <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{t.subjects.join(" · ")} · {load} Schüler</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowTeacherPicker(false)} style={{ width: "100%", marginTop: 14, padding: 12, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Abbrechen</button>
          </div>
        </div>
      )}

      {/* Remove confirmation */}
      {confirmRemove && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.danger}40`, borderRadius: 18, padding: 22, width: "100%" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: C.danger + "22", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
              <AlertCircle size={28} color={C.danger}/>
            </div>
            <h3 style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: C.textHi, textAlign: "center" }}>{s.name} entfernen?</h3>
            <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5, margin: "0 0 22px", textAlign: "center" }}>
              Der Schüler wird aus der Liste gelöscht. Bereits eingecheckte Stunden bleiben für die Buchhaltung erhalten.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmRemove(false)} style={{ flex: 1, padding: 14, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Abbrechen</button>
              <button onClick={handleRemove} style={{ flex: 1, padding: 14, background: C.danger, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Ja, entfernen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ADMIN: BILLING — the new core admin view */
function AdminBilling({ store, onTeacherClick }) {
  const nowD = new Date();
  const curMonthFull = nowD.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const recentMonths = [2, 1, 0].map(back => new Date(nowD.getFullYear(), nowD.getMonth() - back, 1).toLocaleDateString("de-DE", { month: "long" }));
  const curMonthName = recentMonths[2];
  const teacherSummaries = store.teachers.map(t => {
    const open = store.openHoursForTeacher(t.id);
    const openHrs = open.reduce((s,a) => s + (a.completedDur || 0)/60, 0);
    const cost = openHrs * t.rate;
    return { teacher: t, openCount: open.length, openHrs, cost };
  });

  const totalHrs = teacherSummaries.reduce((s,x) => s + x.openHrs, 0);
  const totalCost = teacherSummaries.reduce((s,x) => s + x.cost, 0);

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>ADMIN · LOHNERFASSUNG</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.6, color: C.textHi }}>{curMonthFull}</h1>
      </div>

      {/* Security indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: C.surfaceLo, border: `1px solid ${C.success}30`, borderRadius: 10, marginBottom: 18, fontSize: 11, color: C.textDim }}>
        <ShieldCheck size={13} color={C.success}/>
        <span>PIN-geschützter Bereich · Alle Aktionen werden protokolliert</span>
      </div>

      {/* Month selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
        {recentMonths.map(m => {
          const isOn = m === curMonthName;
          return (
            <div key={m} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, textAlign: "center", background: isOn ? "rgba(244,145,86,.12)" : C.surface, border: `1.5px solid ${isOn ? C.primary : C.border}`, color: isOn ? C.primary : C.textDim, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: .3 }}>
              {m}
              {isOn && <div style={{ fontSize: 9, marginTop: 2 }}>OFFEN</div>}
            </div>
          );
        })}
      </div>

      {/* Total summary card */}
      <div style={{ padding: 20, background: "linear-gradient(135deg, rgba(244,145,86,.18) 0%, rgba(231,111,81,.06) 100%)", border: `1.5px solid ${C.primary}80`, borderRadius: 18, marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>OFFENE LOHNSUMME</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
          <span style={{ fontFamily: FF.display, fontSize: 36, fontWeight: 700, color: C.textHi, letterSpacing: -1.5, lineHeight: 1 }}>{fmtEur(totalCost)}</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.text, paddingTop: 12, borderTop: `1px solid ${C.primary}30` }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12}/> {totalHrs.toFixed(1)} Stunden</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={12}/> {teacherSummaries.filter(x => x.openHrs > 0).length} Lehrkräfte</span>
        </div>
      </div>

      <SectionHeader>Pro Lehrkraft</SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {teacherSummaries.map(({ teacher, openCount, openHrs, cost }) => (
          <button key={teacher.id} onClick={() => onTeacherClick(teacher.id)} style={{ width: "100%", textAlign: "left", border: `1px solid ${C.border}`, cursor: "pointer", padding: 14, background: C.surface, borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: openHrs > 0 ? 12 : 0 }}>
              <Avatar short={teacher.short} color={teacher.color} size={40}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.textHi }}>{teacher.name}</div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{teacher.subjects.join(" · ")} · {fmtEur(teacher.rate)}/h</div>
              </div>
              <ChevronRight size={18} color={C.textVeryDim}/>
            </div>
            {openHrs > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <MiniStat label="Stunden" value={openHrs.toFixed(1)}/>
                <MiniStat label="Termine" value={openCount}/>
                <MiniStat label="Lohn" value={fmtEur(cost)} small/>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: C.textVeryDim, fontStyle: "italic" }}>Keine offenen Stunden.</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value, small }) {
  return (
    <div style={{ background: C.surfaceLo, padding: "8px 6px", borderRadius: 8, textAlign: "center" }}>
      <div style={{ fontFamily: FF.display, fontSize: small ? 13 : 18, fontWeight: 700, color: C.textHi, lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 9, color: C.textDim, fontWeight: 700, letterSpacing: .5, marginTop: 4 }}>{label.toUpperCase()}</div>
    </div>
  );
}

/* ADMIN: TEACHER BILLING DETAIL */
function AdminTeacherBilling({ teacherId, store, onBack, billedBy }) {
  const t = store.teachers.find(x => x.id === teacherId);
  const open = store.openHoursForTeacher(teacherId);
  const billMonth = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const billed = store.billedHoursForTeacher(teacherId);
  const audit = store.auditForTeacher(teacherId);
  const openHrs = open.reduce((s,a) => s + (a.completedDur || 0)/60, 0);
  const cost = openHrs * t.rate;
  const [step, setStep] = useState(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [done, setDone] = useState(false);
  const [csvFeedback, setCsvFeedback] = useState(false);

  // Lehrer bearbeiten
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [eName, setEName] = useState(t.name);
  const [eEmail, setEEmail] = useState(t.email);
  const [eRate, setERate] = useState(String(t.rate));
  const [eSubjects, setESubjects] = useState(t.subjects || []);

  const startEdit = () => {
    setEName(t.name); setEEmail(t.email);
    setERate(String(t.rate)); setESubjects(t.subjects || []);
    setSaveOk(false); setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    const ok = await store.updateTeacher(t.id, {
      name: eName, email: eEmail,
      rate: parseFloat(eRate) || t.rate,
      subjects: eSubjects,
    });
    setSaving(false);
    if (ok) {
      setSaveOk(true);
      setTimeout(() => { setSaveOk(false); setEditing(false); }, 2000);
    }
  };

  const handleConfirm = () => { setStep("pin"); setPin(""); setPinError(false); };

  const handlePinSubmit = (enteredPin) => {
    if (enteredPin === ADMIN_PIN) {
      setStep("processing");
      setTimeout(() => {
        store.markAsBilled(teacherId, billMonth, billedBy);
        setDone(true);
        setTimeout(() => onBack(), 1800);
      }, 600);
    } else {
      setPinError(true);
      setPin("");
      setTimeout(() => setPinError(false), 1200);
    }
  };

  const handleCsv = () => {
    store.exportCSV(teacherId);
    setCsvFeedback(true);
    setTimeout(() => setCsvFeedback(false), 2200);
  };

  if (done) {
    return (
      <div style={{ padding: "60px 24px 40px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: C.success + "22", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
          <Check size={40} color={C.success} strokeWidth={2.5}/>
        </div>
        <h1 style={{ fontFamily: FF.display, fontSize: 22, fontWeight: 700, margin: "0 0 10px", color: C.textHi, letterSpacing: -0.4 }}>Abgerechnet.</h1>
        <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.5, margin: "0 0 6px" }}>{t.name} · {openHrs.toFixed(1)} Std · {fmtEur(cost)}</p>
        <p style={{ fontSize: 11, color: C.textVeryDim, margin: 0 }}>Geprüft & protokolliert</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px 40px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.text, display: "flex", alignItems: "center", gap: 6, padding: 0, cursor: "pointer", marginBottom: 18, fontFamily: FF.body }}>
        <ArrowLeft size={18}/> <span style={{ fontSize: 14, fontWeight: 600 }}>Zurück</span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <Avatar short={t.short} color={t.color} size={56}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FF.display, fontSize: 22, fontWeight: 700, color: C.textHi, letterSpacing: -0.4, lineHeight: 1.1 }}>{t.name}</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{t.email} · {fmtEur(t.rate)}/h</div>
        </div>
        <button onClick={editing ? () => setEditing(false) : startEdit} style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: editing ? C.danger : C.text, fontSize: 12, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <Edit2 size={13}/> {editing ? "Abbrechen" : "Bearbeiten"}
        </button>
      </div>

      {/* Edit-Formular */}
      {editing && (
        <div style={{ background: C.surfaceLo, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: 1.5, marginBottom: 14 }}>LEHRKRAFT BEARBEITEN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Name" value={eName} onChange={setEName}/>
            <Field label="E-Mail" type="email" value={eEmail} onChange={setEEmail}/>
            <Field label="Stundensatz (€)" type="number" value={eRate} onChange={setERate} placeholder="22"/>
            <div>
              <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: .3 }}>Fächer</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ALL_SUBJECTS.map(s => {
                  const on = eSubjects.includes(s);
                  return <button key={s} type="button" onClick={() => setESubjects(prev => on ? prev.filter(x=>x!==s) : [...prev,s])} style={{ padding: "5px 10px", borderRadius: 7, border: `1.5px solid ${on ? C.primary : C.border}`, background: on ? C.primary+"22" : C.surfaceLo, color: on ? C.primary : C.textDim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FF.body }}>{s}</button>;
                })}
              </div>
            </div>
            {saveOk ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, background: C.success+"22", border: `1px solid ${C.success}`, borderRadius: 10, color: C.success, fontSize: 13, fontWeight: 700 }}>
                <Check size={16}/> Gespeichert — Änderungen übernommen!
              </div>
            ) : (
              <button onClick={saveEdit} disabled={saving} style={{ width: "100%", padding: 12, background: saving ? C.borderHi : C.primaryGrad, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: saving ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {saving ? "Wird gespeichert…" : <><Check size={14}/> Änderungen speichern</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ padding: 18, background: "linear-gradient(135deg, rgba(244,145,86,.18) 0%, rgba(231,111,81,.06) 100%)", border: `1.5px solid ${C.primary}80`, borderRadius: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>OFFEN · {billMonth.toUpperCase()}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
          <span style={{ fontFamily: FF.display, fontSize: 32, fontWeight: 700, color: C.textHi, letterSpacing: -1.2, lineHeight: 1 }}>{fmtEur(cost)}</span>
        </div>
        <div style={{ fontSize: 13, color: C.textDim }}>{openHrs.toFixed(1)} Stunden · {open.length} Termine</div>
      </div>

      {/* Security badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: C.surfaceLo, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 18, fontSize: 11, color: C.textDim }}>
        <ShieldCheck size={13} color={C.success}/>
        <span>Abrechnung PIN-geschützt · Aktionen werden protokolliert</span>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        <button onClick={handleCsv} disabled={open.length === 0} style={{ flex: 1, padding: 14, background: csvFeedback ? C.success : C.surface, border: `1px solid ${csvFeedback ? C.success : C.border}`, borderRadius: 12, color: csvFeedback ? "#fff" : C.text, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: open.length === 0 ? "not-allowed" : "pointer", opacity: open.length === 0 ? .5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}>
          {csvFeedback ? <><Check size={14}/> CSV geladen</> : <><Download size={14}/> CSV exportieren</>}
        </button>
        <button onClick={handleConfirm} disabled={open.length === 0} style={{ flex: 1.4, padding: 14, background: open.length === 0 ? C.borderHi : C.success, border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: open.length === 0 ? "not-allowed" : "pointer", opacity: open.length === 0 ? .5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Lock size={13}/> Abrechnen
        </button>
      </div>

      <SectionHeader>Eingecheckte Stunden ({open.length})</SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {open.length === 0 ? (
          <div style={{ padding: "30px 20px", textAlign: "center", color: C.textDim, background: C.surface, borderRadius: 14, fontSize: 13 }}>
            Keine offenen Stunden.
          </div>
        ) : open.map(a => {
          const names = (a.studentIds || []).map(id => store.studentById(id)?.name).filter(Boolean).join(", ") || "—";
          const isGroup = (a.studentIds || []).length > 1;
          return (
            <div key={a.id} style={{ padding: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: C.surfaceLo, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {isGroup ? <Users size={14} color={C.textDim}/> : <BookOpen size={14} color={C.textDim}/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isGroup ? `Gruppe: ${names}` : names}</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>{a.date} · {a.time}{a.heldMethod === "confirmed" ? " · bestätigt" : ""}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: FF.display, fontWeight: 700, color: C.success, fontSize: 14 }}>{a.completedDur}m</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 1 }}>{fmtEur((a.completedDur/60) * t.rate)}</div>
                </div>
              </div>
              {a.notes && <div style={{ fontSize: 11, color: C.textDim, paddingLeft: 38, fontStyle: "italic", lineHeight: 1.4 }}>"{a.notes}"</div>}
            </div>
          );
        })}
      </div>

      {/* Audit log */}
      {audit.length > 0 && (
        <>
          <SectionHeader>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <History size={12}/> Abrechnungs-Verlauf ({audit.length})
            </span>
          </SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
            {audit.map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: C.surfaceLo, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 11 }}>
                <CheckCircle2 size={13} color={C.success} style={{ marginTop: 1, flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.textHi, fontWeight: 600 }}>
                    {e.hours.toFixed(1)} Std · {fmtEur(e.cost)}
                  </div>
                  <div style={{ color: C.textDim, marginTop: 2 }}>
                    {e.formatted} · von {e.billedBy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {billed.length > 0 && (
        <>
          <SectionHeader>Abgerechnete Stunden ({billed.length})</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {billed.slice(0, 5).map(a => {
              const names = (a.studentIds || []).map(id => store.studentById(id)?.name).filter(Boolean).join(", ") || "—";
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.surfaceLo, borderRadius: 8, fontSize: 12, opacity: .7 }}>
                  <Check size={12} color={C.success}/>
                  <span style={{ fontFamily: FF.display, fontWeight: 700, color: C.textHi, minWidth: 50, fontSize: 12 }}>{a.date}</span>
                  <span style={{ flex: 1, minWidth: 0, color: C.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{names}</span>
                  <span style={{ color: C.success, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{a.completedDur}m</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Step 1: Confirm modal */}
      {step === "confirm" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, width: "100%" }}>
            <h3 style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: C.textHi }}>Abrechnen?</h3>
            <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5, margin: "0 0 22px" }}>
              <strong style={{ color: C.textHi }}>{t.name}</strong> · {openHrs.toFixed(1)} Std · <strong style={{ color: C.textHi }}>{fmtEur(cost)}</strong><br/>
              Im nächsten Schritt PIN bestätigen.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(null)} style={{ flex: 1, padding: 14, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Abbrechen</button>
              <button onClick={() => setStep("pin")} style={{ flex: 1, padding: 14, background: C.success, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Weiter</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: PIN modal */}
      {step === "pin" && (
        <PinModal
          title="Abrechnung bestätigen"
          subtitle={`${t.name} · ${fmtEur(cost)}`}
          pin={pin}
          setPin={setPin}
          error={pinError}
          onSubmit={handlePinSubmit}
          onCancel={() => setStep(null)}
        />
      )}

      {step === "processing" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 50, height: 50, border: `3px solid ${C.border}`, borderTopColor: C.primary, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }}/>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Wird abgerechnet…</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ADMIN: PIN MODAL — reusable for sensitive actions */
function PinModal({ title, subtitle, pin, setPin, error, onSubmit, onCancel }) {
  const handleDigit = (d) => {
    if (pin.length < 4) {
      const next = pin + d;
      setPin(next);
      if (next.length === 4) {
        setTimeout(() => onSubmit(next), 150);
      }
    }
  };
  const handleDelete = () => setPin(pin.slice(0, -1));

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, width: "100%", maxWidth: 340 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: C.primaryGrad, display: "grid", placeItems: "center" }}>
            <Lock size={24} color="#fff"/>
          </div>
        </div>
        <h3 style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: C.textHi, textAlign: "center" }}>{title}</h3>
        <p style={{ fontSize: 12, color: C.textDim, textAlign: "center", margin: "0 0 18px" }}>{subtitle}</p>

        {/* PIN dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 8 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: "50%",
              background: i < pin.length ? (error ? C.danger : C.primary) : "transparent",
              border: `2px solid ${error ? C.danger : (i < pin.length ? C.primary : C.borderHi)}`,
              transition: "all .15s",
            }}/>
          ))}
        </div>
        <div style={{ height: 16, fontSize: 11, color: error ? C.danger : C.textVeryDim, textAlign: "center", marginBottom: 14, fontWeight: 600 }}>
          {error ? "Falscher PIN" : `Demo-PIN: 1234`}
        </div>

        {/* Numpad */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {["1","2","3","4","5","6","7","8","9"].map(d => (
            <button key={d} onClick={() => handleDigit(d)} style={{
              padding: "16px 0", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 12,
              color: C.textHi, fontFamily: FF.display, fontSize: 22, fontWeight: 600, cursor: "pointer",
            }}>{d}</button>
          ))}
          <button onClick={onCancel} style={{
            padding: "16px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 12,
            color: C.textDim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FF.body,
          }}>Abbrechen</button>
          <button onClick={() => handleDigit("0")} style={{
            padding: "16px 0", background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 12,
            color: C.textHi, fontFamily: FF.display, fontSize: 22, fontWeight: 600, cursor: "pointer",
          }}>0</button>
          <button onClick={handleDelete} style={{
            padding: "16px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 12,
            color: C.textDim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FF.body,
          }}>← Löschen</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN SCHEDULE — weekly plan builder
   ========================================================= */
function AdminSchedule({ store }) {
  const [viewMode, setViewMode] = useState("week");
  const [day, setDay] = useState(2);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  // loc_admin sieht nur seinen Standort — kein Wechsel möglich
  const [locId, setLocId] = useState(store.userLocationId || LOCATIONS[0].id);
  const [editingSlot, setEditingSlot] = useState(null);
  const [confirmCopy, setConfirmCopy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Welche Standorte darf dieser User sehen?
  const visibleLocations = store.userLocationId
    ? LOCATIONS.filter(l => l.id === store.userLocationId)
    : LOCATIONS;

  const rooms = ROOMS_BY_LOCATION[locId] || [];

  // === Date math for the navigation labels ===
  const today = new Date(); // demo: current real date
  const baseMonday = (() => {
    const d = new Date(today);
    const dow = d.getDay(); // 0=Sun..6=Sat
    const diff = dow === 0 ? -6 : 1 - dow; // shift to Monday
    d.setDate(d.getDate() + diff);
    return d;
  })();
  const weekStart = new Date(baseMonday);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4);
  const fmtDM = (d) => `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.`;
  const monthName = (d) => d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const monthRef = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  // For day view: derive a date label
  const dayDate = new Date(weekStart);
  dayDate.setDate(weekStart.getDate() + day);

  // === Handlers ===
  const handleCopyFromPrev = () => {
    const fromDay = day === 0 ? 4 : day - 1;
    store.copyDayToDay(fromDay, day, locId);
    setConfirmCopy(false);
  };
  const handleClear = () => {
    store.clearDay(day, locId);
    setConfirmClear(false);
  };

  return (
    <div style={{ padding: "20px 16px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 14, padding: "0 4px" }}>
        <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>ADMIN · PLAN</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.6, color: C.textHi }}>
          {viewMode === "day" && WEEKDAYS_LONG[day]}
          {viewMode === "week" && `Woche ${fmtDM(weekStart).slice(0,6)}–${fmtDM(weekEnd)}`}
          {viewMode === "month" && monthName(monthRef)}
        </h1>
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <ShieldCheck size={11} style={{ color: C.primary }}/>
          <span>Standard-Wochenplan · Änderungen gelten für alle Wochen</span>
        </div>
      </div>

      {/* View-mode toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, padding: 4, background: C.surfaceLo, borderRadius: 12, border: `1px solid ${C.border}` }}>
        {[
          { id: "day", label: "Tag" },
          { id: "week", label: "Woche" },
          { id: "month", label: "Monat" },
        ].map(v => {
          const isOn = viewMode === v.id;
          return (
            <button key={v.id} onClick={() => setViewMode(v.id)} style={{
              flex: 1, padding: "9px 0", borderRadius: 9,
              background: isOn ? C.primaryGrad : "transparent",
              border: "none",
              color: isOn ? "#fff" : C.text,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: FF.body,
            }}>{v.label}</button>
          );
        })}
      </div>

      {/* Location switcher — nur für Ober-Admin alle Standorte, loc_admin sieht nur seinen */}
      {visibleLocations.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, padding: "0 4px" }}>
          {visibleLocations.map(loc => {
            const isOn = loc.id === locId;
            return (
              <button key={loc.id} onClick={() => setLocId(loc.id)} style={{
                flex: 1, padding: "10px 8px", borderRadius: 10,
                background: isOn ? "rgba(244,145,86,.12)" : C.surface,
                border: `1.5px solid ${isOn ? C.primary : C.border}`,
                color: isOn ? C.primary : C.textDim,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: FF.body,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}>
                <MapPin size={11}/> {loc.short}
              </button>
            );
          })}
        </div>
      )}
      {visibleLocations.length === 1 && (
        <div style={{ padding: "8px 12px", background: C.surfaceLo, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 14, fontSize: 12, color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={12}/> <strong style={{ color: C.textHi }}>{visibleLocations[0].name}</strong>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === "day" && (
        <DayView
          day={day} setDay={setDay} locId={locId} store={store}
          rooms={rooms} dayDate={dayDate}
          setEditingSlot={setEditingSlot}
          onCopyFromPrev={() => setConfirmCopy(true)}
          onClearDay={() => setConfirmClear(true)}
        />
      )}

      {/* WEEK VIEW */}
      {viewMode === "week" && (
        <WeekView
          locId={locId} store={store} weekOffset={weekOffset} setWeekOffset={setWeekOffset}
          rooms={rooms} weekStart={weekStart} weekEnd={weekEnd} fmtDM={fmtDM}
          onSelectDay={(d) => { setDay(d); setViewMode("day"); }}
          setEditingSlot={setEditingSlot}
        />
      )}

      {/* MONTH VIEW */}
      {viewMode === "month" && (
        <MonthView
          locId={locId} store={store} monthOffset={monthOffset} setMonthOffset={setMonthOffset}
          monthRef={monthRef} baseMonday={baseMonday}
          onSelectDay={(dayIdx, weekIdx) => { setWeekOffset(weekIdx); setDay(dayIdx); setViewMode("day"); }}
        />
      )}

      {/* Slot editor */}
      {editingSlot && (
        <ScheduleSlotEditor
          slot={editingSlot}
          store={store}
          onSave={(data) => { store.saveSlot(data); setEditingSlot(null); }}
          onDelete={(id) => { store.removeSlot(id); setEditingSlot(null); }}
          onCancel={() => setEditingSlot(null)}
        />
      )}

      {/* Copy from previous confirmation */}
      {confirmCopy && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, width: "100%" }}>
            <h3 style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: C.textHi }}>Plan vom Vortag übernehmen?</h3>
            <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5, margin: "0 0 22px" }}>
              {WEEKDAYS_LONG[day]} wird mit dem Plan von {WEEKDAYS_LONG[day === 0 ? 4 : day - 1]} überschrieben. Bestehende Einträge gehen verloren.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmCopy(false)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Abbrechen</button>
              <button onClick={handleCopyFromPrev} style={{ flex: 1, padding: 12, background: C.primary, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Übernehmen</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear day confirmation */}
      {confirmClear && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.danger}40`, borderRadius: 18, padding: 22, width: "100%" }}>
            <h3 style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: C.textHi }}>{WEEKDAYS_LONG[day]} leeren?</h3>
            <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5, margin: "0 0 22px" }}>
              Alle geplanten Stunden werden entfernt. Eingecheckte Stunden in der Buchhaltung bleiben.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmClear(false)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Abbrechen</button>
              <button onClick={handleClear} style={{ flex: 1, padding: 12, background: C.danger, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Leeren</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* DayView — single day, rooms with their slots (the original logic) */
function DayView({ day, setDay, locId, store, rooms, dayDate, setEditingSlot, onCopyFromPrev, onClearDay }) {
  const slots = store.slotsForDateLoc(dayDate, locId);
  const dateKey = isoDateKey(dayDate);
  const totalSlots = slots.length;
  const totalStudentsScheduled = slots.reduce((sum, s) => sum + s.studentIds.length, 0);

  return (
    <>
      {/* Day tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, padding: "0 4px" }}>
        {WEEKDAYS.map((wd, idx) => {
          const isOn = idx === day;
          const slotsThisDay = store.slotsForDayLoc(idx, locId).length;
          return (
            <button key={wd} onClick={() => setDay(idx)} style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              background: isOn ? C.primaryGrad : C.surface,
              border: `1.5px solid ${isOn ? "transparent" : C.border}`,
              color: isOn ? "#fff" : C.text,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: FF.body, position: "relative",
            }}>
              {wd}
              {slotsThisDay > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: 6,
                  fontSize: 9, fontWeight: 700,
                  color: isOn ? "rgba(255,255,255,.85)" : C.primary,
                }}>{slotsThisDay}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats line */}
      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 14, padding: "0 4px" }}>
        {totalSlots} Stunden geplant · {totalStudentsScheduled} Schüler-Plätze
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, padding: "0 4px" }}>
        <button onClick={onCopyFromPrev} style={{
          flex: 1, padding: "10px 8px", borderRadius: 10,
          background: C.surfaceLo, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 11, fontWeight: 600, cursor: "pointer",
          fontFamily: FF.body, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        }}>
          <Calendar size={12}/> Vom Vortag kopieren
        </button>
        {totalSlots > 0 && (
          <button onClick={onClearDay} style={{
            padding: "10px 14px", borderRadius: 10,
            background: "transparent", border: `1px solid ${C.danger}40`,
            color: C.danger, fontSize: 11, fontWeight: 600, cursor: "pointer",
            fontFamily: FF.body, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}>
            <Trash2 size={11}/> Tag leeren
          </button>
        )}
      </div>

      {/* Rooms with their planned slots */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rooms.map(room => {
          const roomSlots = slots
            .filter(s => s.roomId === room.id)
            .sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
          const suggestNextTime = () => {
            for (const t of TIME_SLOTS) {
              if (!roomSlots.some(s => s.time === t)) return t;
            }
            return TIME_SLOTS[0];
          };
          return (
            <div key={room.id} style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 14px",
                background: C.surfaceLo,
                borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: C.primary + "22", display: "grid", placeItems: "center", color: C.primary, fontWeight: 700, fontSize: 12, fontFamily: FF.display }}>
                  {room.name.replace("Raum ", "")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.textHi, lineHeight: 1.1 }}>{room.name}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>
                    {roomSlots.length === 0 ? "Keine Stunden geplant" : `${roomSlots.length} Stunde${roomSlots.length === 1 ? "" : "n"} geplant`}
                  </div>
                </div>
              </div>
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {roomSlots.map(s => (
                  <SlotChip key={s.id} slot={s} store={store} onTap={() => setEditingSlot(s)}/>
                ))}
                <button
                  onClick={() => setEditingSlot({ day, date: dateKey, time: suggestNextTime(), locationId: locId, roomId: room.id, teacherId: null, studentIds: [], type: "einzel", notes: "" })}
                  style={{
                    width: "100%", padding: "10px 12px",
                    background: "transparent", border: `1.5px dashed ${C.border}`,
                    borderRadius: 10, color: C.textDim,
                    fontSize: 12, fontWeight: 600, fontFamily: FF.body, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <Plus size={13}/> Stunde hinzufügen
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* WeekView — overview of all 5 weekdays with their slot counts; tap a day to drill in */
function WeekView({ locId, store, weekOffset, setWeekOffset, rooms, weekStart, weekEnd, fmtDM, onSelectDay, setEditingSlot }) {
  const weekDates = WEEKDAYS.map((_, idx) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + idx); return d; });
  const totalSlotsWeek = weekDates.reduce((sum, d) => sum + store.slotsForDateLoc(d, locId).length, 0);
  const totalStudentsWeek = weekDates.reduce((sum, d) =>
    sum + store.slotsForDateLoc(d, locId).reduce((s2, slot) => s2 + slot.studentIds.length, 0), 0);

  return (
    <>
      {/* Week navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "0 4px" }}>
        <button onClick={() => setWeekOffset(weekOffset - 1)} style={{
          width: 36, height: 36, borderRadius: 10, background: C.surface,
          border: `1px solid ${C.border}`, color: C.text, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronLeft size={16}/></button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textHi, fontFamily: FF.body }}>
            {weekOffset === 0 ? "Diese Woche" : weekOffset === 1 ? "Nächste Woche" : weekOffset === -1 ? "Letzte Woche" : `${weekOffset > 0 ? "+" : ""}${weekOffset} Wochen`}
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
            {fmtDM(weekStart)} – {fmtDM(weekEnd)}
          </div>
        </div>
        <button onClick={() => setWeekOffset(weekOffset + 1)} style={{
          width: 36, height: 36, borderRadius: 10, background: C.surface,
          border: `1px solid ${C.border}`, color: C.text, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronRight size={16}/></button>
      </div>

      {/* Week stats */}
      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 14, padding: "0 4px" }}>
        {totalSlotsWeek} Stunden · {totalStudentsWeek} Schüler-Plätze in dieser Woche
      </div>

      {/* Day cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {WEEKDAYS_LONG.map((dayName, idx) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + idx);
          const slots = store.slotsForDateLoc(date, locId).sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
          return (
            <button
              key={idx}
              onClick={() => onSelectDay(idx)}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 0, overflow: "hidden",
                cursor: "pointer", textAlign: "left",
                fontFamily: FF.body,
              }}
            >
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 40, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: 1 }}>{WEEKDAYS[idx]}</div>
                  <div style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, color: C.textHi, lineHeight: 1, marginTop: 2 }}>{String(date.getDate()).padStart(2,"0")}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textHi }}>{dayName}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
                    {slots.length === 0 ? "Keine Stunden geplant" :
                      `${slots.length} Stunde${slots.length === 1 ? "" : "n"} · ${slots.reduce((s, sl) => s + sl.studentIds.length, 0)} Schüler`}
                  </div>
                  {slots.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
                      {slots.map(s => {
                        const t = store.teachers.find(x => x.id === s.teacherId);
                        const room = ROOMS_BY_LOCATION[locId]?.find(r => r.id === s.roomId);
                        const names = s.studentIds
                          .map(sid => store.students.find(x => x.id === sid)?.name)
                          .filter(Boolean);
                        return (
                          <div key={s.id} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            background: C.bg, border: `1px solid ${C.border}`,
                            borderRadius: 8, padding: "6px 8px",
                          }}>
                            <div style={{ fontFamily: FF.display, fontSize: 12, fontWeight: 700, color: C.textHi, width: 38, flexShrink: 0 }}>{s.time}</div>
                            <div style={{ width: 18, height: 18, borderRadius: 5, background: t?.color || C.surfaceLo, color: "#fff", fontSize: 9, fontWeight: 700, display: "grid", placeItems: "center", flexShrink: 0 }}>{t?.short || "?"}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, color: C.textHi, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {names.length ? names.join(", ") : "— keine Schüler —"}
                              </div>
                              <div style={{ fontSize: 10, color: C.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {t?.name || "Kein Lehrer"} · {room?.name || "—"} · {s.type === "gruppe" ? "Gruppe" : "Einzel"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <ChevronRight size={16} style={{ color: C.textDim, flexShrink: 0 }}/>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* MonthView — calendar grid; tap a weekday cell to jump to that day */
function MonthView({ locId, store, monthOffset, setMonthOffset, monthRef, baseMonday, onSelectDay }) {
  // Build a calendar grid for monthRef
  const firstOfMonth = new Date(monthRef.getFullYear(), monthRef.getMonth(), 1);
  const firstDow = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const offsetToMonday = firstDow === 0 ? 6 : firstDow - 1;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - offsetToMonday);
  // 6 weeks × 7 days = 42 cells
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
  const today = new Date();
  const isSameDay = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  // Compute the weekOffset that a given cell maps to (relative to current real-week Monday)
  const weekOffsetForCell = (cellDate) => {
    const cellMonday = new Date(cellDate);
    const dow = cellMonday.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    cellMonday.setDate(cellMonday.getDate() + diff);
    const baseTs = baseMonday.getTime();
    return Math.round((cellMonday.getTime() - baseTs) / (7 * 24 * 60 * 60 * 1000));
  };

  return (
    <>
      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "0 4px" }}>
        <button onClick={() => setMonthOffset(monthOffset - 1)} style={{
          width: 36, height: 36, borderRadius: 10, background: C.surface,
          border: `1px solid ${C.border}`, color: C.text, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronLeft size={16}/></button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textHi, fontFamily: FF.body }}>
            {monthOffset === 0 ? "Dieser Monat" : monthOffset === 1 ? "Nächster Monat" : monthOffset === -1 ? "Letzter Monat" : monthRef.toLocaleDateString("de-DE", { month: "long" })}
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
            {monthRef.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
          </div>
        </div>
        <button onClick={() => setMonthOffset(monthOffset + 1)} style={{
          width: 36, height: 36, borderRadius: 10, background: C.surface,
          border: `1px solid ${C.border}`, color: C.text, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronRight size={16}/></button>
      </div>

      {/* Weekday header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4, padding: "0 4px" }}>
        {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1, padding: "6px 0" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, padding: "0 4px" }}>
        {cells.map((d, i) => {
          const dow = d.getDay(); // 0=Sun..6=Sat
          const isWeekend = dow === 0 || dow === 6;
          const inMonth = d.getMonth() === monthRef.getMonth();
          const dayIdx = dow === 0 ? -1 : dow - 1; // 0..4 = Mo..Fr, -1 = weekend
          const slots = dayIdx >= 0 && dayIdx <= 4 ? store.slotsForDateLoc(d, locId) : [];
          const isToday = isSameDay(d, today);
          const clickable = !isWeekend;

          return (
            <button
              key={i}
              onClick={clickable ? () => onSelectDay(dayIdx, weekOffsetForCell(d)) : undefined}
              disabled={!clickable}
              style={{
                aspectRatio: "1 / 1",
                padding: 4,
                background: isToday ? "rgba(244,145,86,.15)" : (inMonth ? C.surface : "transparent"),
                border: `1px solid ${isToday ? C.primary : C.border}`,
                borderRadius: 8,
                cursor: clickable ? "pointer" : "default",
                opacity: !inMonth ? 0.35 : (isWeekend ? 0.5 : 1),
                display: "flex", flexDirection: "column",
                alignItems: "flex-start", justifyContent: "space-between",
                fontFamily: FF.body, textAlign: "left",
                overflow: "hidden",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? C.primary : C.text }}>
                {d.getDate()}
              </div>
              {slots.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                  <div style={{ fontSize: 9, color: C.primary, fontWeight: 700 }}>{slots.length} Std</div>
                  <div style={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {slots.slice(0, 3).map(s => {
                      const t = store.teachers.find(x => x.id === s.teacherId);
                      return (
                        <div key={s.id} style={{
                          width: 5, height: 5, borderRadius: 2,
                          background: t?.color || C.textDim,
                        }}/>
                      );
                    })}
                    {slots.length > 3 && (
                      <div style={{ fontSize: 8, color: C.textDim, lineHeight: 1 }}>+{slots.length - 3}</div>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 14, padding: "12px 14px", background: C.surfaceLo, borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>
        Tippe auf einen Werktag, um zur Tagesansicht zu springen. Wochenenden sind ausgegraut, weil im Standardplan keine Stunden vorgesehen sind.
      </div>
    </>
  );
}

/* SlotChip — one planned course in a room (60 min) */
function SlotChip({ slot, store, onTap }) {
  const t = slot.teacherId ? store.teacherById(slot.teacherId) : null;
  const studs = slot.studentIds.map(id => store.studentById(id)).filter(Boolean);
  const endTime = (() => {
    const m = timeToMin(slot.time) + COURSE_DURATION;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  })();
  return (
    <button onClick={onTap} style={{
      width: "100%", padding: "10px 12px",
      background: C.surfaceLo, border: `1.5px solid ${C.primary}50`,
      borderRadius: 10, color: C.textHi,
      fontFamily: FF.body, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 10, textAlign: "left",
    }}>
      <div style={{ flexShrink: 0, minWidth: 50 }}>
        <div style={{ fontFamily: FF.display, fontWeight: 700, color: C.primary, fontSize: 13, lineHeight: 1 }}>{slot.time}</div>
        <div style={{ fontSize: 9, color: C.textVeryDim, marginTop: 3 }}>bis {endTime}</div>
      </div>
      {t && <Avatar short={t.short} color={t.color} size={26}/>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ fontWeight: 700, fontSize: 12, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {t?.name || "—"}
          </span>
          <span style={{ padding: "1px 5px", background: slot.type === "gruppe" ? C.info + "33" : C.success + "22", color: slot.type === "gruppe" ? C.info : C.success, fontSize: 9, fontWeight: 700, borderRadius: 4, letterSpacing: .3, textTransform: "uppercase", flexShrink: 0 }}>
            {slot.type === "gruppe" ? `Grp · ${studs.length}` : "Einzel"}
          </span>
        </div>
        <div style={{ fontSize: 10, color: C.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {studs.length > 0 ? studs.map(s => s.name.split(" ")[0]).join(", ") : "Keine Schüler"}
        </div>
      </div>
    </button>
  );
}

/* ScheduleSlotEditor — bottom sheet for creating/editing a slot */
function ScheduleSlotEditor({ slot, store, onSave, onDelete, onCancel }) {
  const isNew = !slot.id;
  const [time, setTime] = useState(slot.time);
  const [teacherId, setTeacherId] = useState(slot.teacherId);
  const [studentIds, setStudentIds] = useState(slot.studentIds || []);
  const [type, setType] = useState(slot.type || (slot.studentIds?.length === 1 ? "einzel" : "gruppe"));
  const [recurring, setRecurring] = useState(slot.onDate ? false : true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  // Konkretes Datum für eine einmalige Stunde (vom Tag, an dem sie angelegt/bearbeitet wird)
  const oneTimeDate = slot.onDate || slot.date || null;
  const oneTimeLabel = oneTimeDate
    ? new Date(oneTimeDate + "T00:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : null;

  // Other slots in same room — used to mark overlapping start times (still allowed, just visually noted)
  const otherSlotsInRoom = store.scheduleSlots.filter(s =>
    s.day === slot.day && s.locationId === slot.locationId && s.roomId === slot.roomId && s.id !== slot.id
  );

  const teacher = teacherId ? store.teacherById(teacherId) : null;
  // Alle Schüler zur Auswahl — keine harte Fach-Filterung (blockierte sonst,
  // sobald ein Lehrer noch keine Fächer hinterlegt hat). Die Suche bleibt.
  const filtered = studentSearch
    ? store.students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
    : store.students;

  const toggleStudent = (sid) => {
    setStudentIds(prev => {
      const next = prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid];
      // Auto-set type based on count, but only if user hasn't manually picked
      if (next.length === 1) setType("einzel");
      else if (next.length > 1) setType("gruppe");
      return next;
    });
  };

  const canSave = teacherId && studentIds.length > 0 && time && (recurring || oneTimeDate);
  const handleSave = () => {
    if (!canSave) return;
    onSave({ ...slot, time, teacherId, studentIds, type, onDate: recurring ? null : oneTimeDate });
  };

  const room = ROOMS_BY_LOCATION[slot.locationId]?.find(r => r.id === slot.roomId);

  // End time display
  const endTime = (() => {
    if (!time) return "";
    const m = timeToMin(time) + COURSE_DURATION;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  })();

  return (
    <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "92%", display: "flex", flexDirection: "column", borderTop: `1px solid ${C.border}` }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.borderHi, margin: "0 auto 14px" }}/>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: 1 }}>
                {WEEKDAYS_LONG[slot.day]} · {time}{endTime ? `–${endTime}` : ""} · {room?.name || "—"}
              </div>
              <h2 style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, margin: "4px 0 0", color: C.textHi }}>
                {isNew ? "Stunde planen" : "Stunde bearbeiten"}
              </h2>
            </div>
            <button onClick={onCancel} style={{ width: 32, height: 32, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.text, display: "grid", placeItems: "center", cursor: "pointer" }}>
              <X size={16}/>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {/* Wiederholung — wöchentlich vs. einmalig */}
          <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Wiederholung</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
            <button onClick={() => setRecurring(true)} style={{
              padding: "12px 10px", borderRadius: 10,
              background: recurring ? "rgba(244,145,86,.12)" : C.surface,
              border: `1.5px solid ${recurring ? C.primary : C.border}`,
              color: recurring ? C.primary : C.text, cursor: "pointer",
              fontFamily: FF.body, fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Repeat size={13}/> Jede Woche
            </button>
            <button onClick={() => oneTimeDate && setRecurring(false)} disabled={!oneTimeDate} style={{
              padding: "12px 10px", borderRadius: 10,
              background: !recurring ? "rgba(244,145,86,.12)" : C.surface,
              border: `1.5px solid ${!recurring ? C.primary : C.border}`,
              color: !oneTimeDate ? C.textVeryDim : (!recurring ? C.primary : C.text),
              cursor: oneTimeDate ? "pointer" : "not-allowed", opacity: oneTimeDate ? 1 : .5,
              fontFamily: FF.body, fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Calendar size={13}/> Nur einmal
            </button>
          </div>
          <div style={{ fontSize: 11, color: recurring ? C.textDim : C.primary, marginBottom: 20, lineHeight: 1.4 }}>
            {recurring
              ? `Wiederholt sich jede Woche am ${WEEKDAYS_LONG[slot.day]}.`
              : (oneTimeLabel ? `Nur am ${oneTimeLabel}.` : "Für eine einmalige Stunde im Plan ein Datum wählen.")}
          </div>

          {/* Time picker — overlaps allowed */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
              Startzeit
            </div>
            <div style={{ fontSize: 10, color: C.textVeryDim }}>
              60 Min · endet {endTime}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, marginBottom: 18 }}>
            {TIME_SLOTS.map(t => {
              const isOn = t === time;
              const overlapping = otherSlotsInRoom.some(s => slotsConflict(s.time, t));
              return (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  style={{
                    padding: "10px 4px", borderRadius: 8,
                    background: isOn ? C.primaryGrad : C.surface,
                    border: `1.5px solid ${isOn ? "transparent" : (overlapping ? C.info + "60" : C.borderHi)}`,
                    color: isOn ? "#fff" : C.text,
                    fontSize: 12, fontWeight: 700, fontFamily: FF.display,
                    cursor: "pointer",
                    letterSpacing: -.3,
                    position: "relative",
                  }}>
                  {t}
                  {overlapping && !isOn && (
                    <div style={{ position: "absolute", top: 3, right: 4, width: 5, height: 5, borderRadius: "50%", background: C.info }}/>
                  )}
                </button>
              );
            })}
          </div>

          {/* Teacher selection */}
          <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Lehrkraft</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 18 }}>
            {store.teachers.map(t => {
              const isOn = t.id === teacherId;
              return (
                <button key={t.id} onClick={() => setTeacherId(t.id)} style={{
                  padding: 10, borderRadius: 10,
                  background: isOn ? "rgba(244,145,86,.12)" : C.surface,
                  border: `1.5px solid ${isOn ? C.primary : C.border}`,
                  cursor: "pointer", textAlign: "left", fontFamily: FF.body,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Avatar short={t.short} color={t.color} size={26}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                    <div style={{ fontSize: 9, color: C.textDim, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.subjects.slice(0,2).join(" · ")}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Type toggle (auto-set, but overridable) */}
          {studentIds.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Stundenart</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                <button onClick={() => setType("einzel")} disabled={studentIds.length > 1} style={{
                  flex: 1, padding: 10, borderRadius: 10,
                  background: type === "einzel" ? C.success + "22" : C.surface,
                  border: `1.5px solid ${type === "einzel" ? C.success : C.border}`,
                  color: type === "einzel" ? C.success : C.textDim,
                  fontSize: 12, fontWeight: 700, cursor: studentIds.length > 1 ? "not-allowed" : "pointer",
                  fontFamily: FF.body, opacity: studentIds.length > 1 ? .4 : 1,
                }}>
                  Einzel
                </button>
                <button onClick={() => setType("gruppe")} style={{
                  flex: 1, padding: 10, borderRadius: 10,
                  background: type === "gruppe" ? C.info + "22" : C.surface,
                  border: `1.5px solid ${type === "gruppe" ? C.info : C.border}`,
                  color: type === "gruppe" ? C.info : C.textDim,
                  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FF.body,
                }}>
                  Gruppe ({studentIds.length})
                </button>
              </div>
            </>
          )}

          {/* Student selection */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
              Schüler ({studentIds.length})
            </div>
            {teacher && teacher.subjects?.length > 0 && (
              <div style={{ fontSize: 10, color: C.textVeryDim }}>
                Fächer: {teacher.subjects.join(", ")}
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Search size={14} color={C.textVeryDim} style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)" }}/>
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Schüler suchen…"
              style={{
                width: "100%", padding: "9px 12px 9px 34px",
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.textHi, fontSize: 12, fontFamily: FF.body,
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "20px 14px", textAlign: "center", color: C.textVeryDim, fontSize: 12, background: C.surface, borderRadius: 10 }}>
                Keine Schüler gefunden.
              </div>
            )}
            {filtered.map(s => {
              const isOn = studentIds.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleStudent(s.id)} style={{
                  padding: 10, borderRadius: 10,
                  background: isOn ? "rgba(244,145,86,.12)" : C.surface,
                  border: `1.5px solid ${isOn ? C.primary : C.border}`,
                  cursor: "pointer", textAlign: "left", fontFamily: FF.body,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <Avatar short={s.short} size={28}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: C.textDim, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Kl. {s.grade} · {s.subjects.join(", ")}</div>
                  </div>
                  {isOn && <Check size={16} color={C.primary}/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky footer with actions */}
        <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0, display: "flex", gap: 8 }}>
          {!isNew && (
            <button onClick={() => setConfirmDelete(true)} style={{
              padding: "12px 14px", borderRadius: 10,
              background: "transparent", border: `1px solid ${C.danger}80`,
              color: C.danger, fontSize: 13, fontWeight: 700, fontFamily: FF.body,
              cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              <Trash2 size={14}/>
            </button>
          )}
          <button onClick={handleSave} disabled={!canSave} style={{
            flex: 1, padding: 12, borderRadius: 10,
            background: canSave ? C.primaryGrad : C.borderHi, border: "none",
            color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: FF.body,
            cursor: canSave ? "pointer" : "not-allowed", opacity: canSave ? 1 : .5,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Check size={15}/> {isNew ? "Stunde anlegen" : "Speichern"}
          </button>
        </div>

        {/* Delete confirm */}
        {confirmDelete && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.danger}40`, borderRadius: 18, padding: 22, width: "100%" }}>
              <h3 style={{ fontFamily: FF.display, fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: C.textHi, textAlign: "center" }}>Stunde entfernen?</h3>
              <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5, margin: "0 0 22px", textAlign: "center" }}>
                {WEEKDAYS_LONG[slot.day]} · {slot.time} · {room?.name}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Abbrechen</button>
                <button onClick={() => onDelete(slot.id)} style={{ flex: 1, padding: 12, background: C.danger, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Entfernen</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminToday({ store }) {
  const [dayOffset, setDayOffset] = useState(0);
  const [confirmAll, setConfirmAll] = useState(false);
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const date = new Date(base); date.setDate(base.getDate() + dayOffset);
  const all = store.lessonsForDateAll(date);
  const byTeacher = store.teachers
    .map(t => ({ teacher: t, apts: all.filter(a => a.teacherId === t.id) }))
    .filter(x => x.apts.length > 0);
  const heldCount = all.filter(a => a.status === "completed").length;
  const openCount = all.length - heldCount;
  const dateLabel = date.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" });
  const isToday = dayOffset === 0;
  const now = Date.now();
  // Fällige, noch nicht erfasste Stunden (Startzeit vorbei) — für "Ganzen Tag buchen"
  const eligible = all.filter(a => a.status === "scheduled" && now >= new Date(`${a.dateKey}T${a.time}:00`).getTime());
  const goDay = (delta) => { setConfirmAll(false); setDayOffset(dayOffset + delta); };

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>ADMIN · STUNDEN</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5, color: C.textHi }}>Stunden bestätigen</h1>
      </div>

      {/* Tagesnavigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 10px" }}>
        <button onClick={() => goDay(-1)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.text, padding: 6, display: "flex" }}><ChevronLeft size={20}/></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.textHi }}>{dateLabel}{isToday ? " · heute" : ""}</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{heldCount} erfasst · {openCount} offen</div>
        </div>
        <button onClick={() => goDay(1)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.text, padding: 6, display: "flex" }}><ChevronRight size={20}/></button>
      </div>

      {/* Ganzen Tag auf einmal buchen */}
      {eligible.length > 0 && (
        <button
          onClick={() => {
            if (confirmAll) { store.confirmManyHeld(eligible); setConfirmAll(false); }
            else { setConfirmAll(true); setTimeout(() => setConfirmAll(false), 3500); }
          }}
          style={{
            width: "100%", padding: 13, marginBottom: 16, borderRadius: 12, border: "none",
            background: confirmAll ? C.primary : C.success, color: "#fff",
            fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          <Check size={15}/> {confirmAll ? `Sicher? ${eligible.length} Stunden buchen` : `Ganzen Tag buchen (${eligible.length})`}
        </button>
      )}

      {byTeacher.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: C.textDim, background: C.surface, borderRadius: 14, border: `1px dashed ${C.border}` }}>
          Keine Stunden an diesem Tag.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {byTeacher.map(({ teacher, apts }) => (
            <div key={teacher.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Avatar short={teacher.short} color={teacher.color} size={32}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.textHi }}>{teacher.name}</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>{apts.filter(a => a.status === "completed").length}/{apts.length} erfasst</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {apts.map(a => {
                  const names = (a.students || []).map(s => s.name).join(", ") || "—";
                  const label = a.students && a.students.length > 1 ? `Gruppe: ${names}` : names;
                  const held = a.status === "completed";
                  const running = a.status === "checked-in";
                  const startTs = new Date(`${a.dateKey}T${a.time}:00`).getTime();
                  const started = now >= startTs;
                  return (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: C.surfaceLo, borderRadius: 8, fontSize: 12 }}>
                      <span style={{ fontFamily: FF.display, fontWeight: 700, color: C.textHi, minWidth: 42, fontSize: 13 }}>{a.time}</span>
                      <span style={{ flex: 1, minWidth: 0, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {label} <span style={{ color: C.textDim }}>· {a.room}</span>
                      </span>
                      {held ? (
                        <button onClick={() => store.revertLesson(a.id)} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, fontSize: 11, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          <Check size={12} color={C.success}/> erfasst · zurück
                        </button>
                      ) : running ? (
                        <button onClick={() => store.revertLesson(a.id)} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.primary, fontSize: 11, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>
                          läuft · zurück
                        </button>
                      ) : started ? (
                        <button onClick={() => store.confirmHeld(a, "")} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 6, border: "none", background: C.success, color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>
                          Bestätigen
                        </button>
                      ) : (
                        <span style={{ flexShrink: 0, fontSize: 11, color: C.textVeryDim, fontWeight: 700 }}>geplant</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminStaff({ store, onTeacherClick }) {
  const [showInvite, setShowInvite] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: "", email: "", subjects: [], rate: "22", locationId: LOCATIONS[0].id });
  const [invited, setInvited] = React.useState(false);
  const COLORS = ["#F49156","#5BCFB1","#7AB8E8","#F4D35E","#A78BFA","#F472B6","#34D399","#60A5FA"];

  const handleInvite = () => {
    if (!draft.name || !draft.email) return;
    const short = draft.name.split(" ").filter(Boolean).map(p=>p[0]).join("").slice(0,2).toUpperCase();
    const color = COLORS[store.teachers.length % COLORS.length];
    store.addTeacher && store.addTeacher({ id: Date.now(), name: draft.name, short, email: draft.email, rate: parseFloat(draft.rate)||22, subjects: draft.subjects, color, role: "teacher", locationId: draft.locationId });
    setInvited(true);
    setTimeout(() => { setShowInvite(false); setInvited(false); setDraft({ name:"", email:"", subjects:[], rate:"22", locationId: LOCATIONS[0].id }); }, 2000);
  };

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>ADMIN · LEHRKRÄFTE</div>
          <h1 style={{ fontFamily: FF.display, fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.6, color: C.textHi }}>{store.teachers.length} Lehrer aktiv</h1>
        </div>
        <button onClick={() => setShowInvite(true)} style={{ padding: "10px 16px", background: C.primaryGrad, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <UserPlus size={15}/> Einladen
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {store.teachers.map(t => {
          const myStudents = store.students.filter(s => s.teacherId === t.id);
          const open = store.openHoursForTeacher(t.id);
          const hrs = open.reduce((s,a) => s + (a.completedDur || 0)/60, 0);
          const loc = LOCATIONS.find(l => l.id === t.locationId);
          return (
            <button key={t.id} onClick={() => onTeacherClick(t.id)} style={{ width: "100%", textAlign: "left", padding: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <Avatar short={t.short} color={t.color} size={42}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.textHi }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{(t.subjects||[]).join(" · ")} · {t.rate}€/h</div>
                  {loc && <div style={{ fontSize: 10, color: loc.color||C.primary, fontWeight: 700, marginTop: 2 }}>{loc.name}</div>}
                </div>
                <ChevronRight size={18} color={C.textVeryDim}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <MiniStat label="Schüler" value={myStudents.length}/>
                <MiniStat label="Std offen" value={hrs.toFixed(1)}/>
                <MiniStat label="Stundensatz" value={`${t.rate}€`}/>
              </div>
            </button>
          );
        })}
      </div>

      {showInvite && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, width: "100%", maxWidth: 420, maxHeight: "85vh", overflow: "auto" }}>
            {invited ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle2 size={48} color={C.success} style={{ marginBottom: 14 }}/>
                <div style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, color: C.textHi }}>Einladung gesendet!</div>
                <div style={{ fontSize: 13, color: C.textDim, marginTop: 8 }}>{draft.name} wurde angelegt.</div>
              </div>
            ) : <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <h3 style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, margin: 0, color: C.textHi }}>Lehrkraft einladen</h3>
                <button onClick={() => setShowInvite(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textDim }}><X size={20}/></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Name *" value={draft.name} onChange={v => setDraft(p=>({...p,name:v}))} placeholder="Vor- und Nachname"/>
                <Field label="E-Mail" type="email" value={draft.email} onChange={v => setDraft(p=>({...p,email:v}))} placeholder="name@beck-up.de"/>
                <Field label="Stundensatz (€)" type="number" value={draft.rate} onChange={v => setDraft(p=>({...p,rate:v}))} placeholder="22"/>
                <div>
                  <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600 }}>Standort</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(store.userLocationId ? LOCATIONS.filter(l=>l.id===store.userLocationId) : LOCATIONS).map(loc => { const on = draft.locationId === loc.id; return <button key={loc.id} type="button" onClick={() => setDraft(p=>({...p,locationId:loc.id}))} style={{ padding:"6px 12px", borderRadius:7, border:`1.5px solid ${on?C.primary:C.border}`, background:on?C.primary+"22":C.surfaceLo, color:on?C.primary:C.textDim, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:FF.body }}>{loc.short}</button>; })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600 }}>Fächer</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ALL_SUBJECTS.map(s => { const on = draft.subjects.includes(s); return <button key={s} type="button" onClick={() => setDraft(p=>({...p,subjects:on?p.subjects.filter(x=>x!==s):[...p.subjects,s]}))} style={{ padding:"5px 10px", borderRadius:7, border:`1.5px solid ${on?C.primary:C.border}`, background:on?C.primary+"22":C.surfaceLo, color:on?C.primary:C.textDim, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:FF.body }}>{s}</button>; })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button onClick={() => setShowInvite(false)} style={{ flex:1, padding:12, background:"transparent", border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, fontWeight:700, fontFamily:FF.body, cursor:"pointer" }}>Abbrechen</button>
                  <button onClick={handleInvite} disabled={!draft.name||!draft.email} style={{ flex:1, padding:12, background:draft.name&&draft.email?C.primaryGrad:C.borderHi, border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, fontFamily:FF.body, cursor:draft.name&&draft.email?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <UserPlus size={13}/> Einladen
                  </button>
                </div>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminStudentCard({ s, store, unassigned, onAssign, onClick, onRemove }) {
  const t = s.teacherId ? store.teacherById(s.teacherId) : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, background: C.surface, border: `1px solid ${unassigned ? C.warn + "60" : C.border}`, borderRadius: 12 }}>
      <button onClick={onClick} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, textAlign: "left" }}>
        <Avatar short={s.short} size={36}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Kl. {s.grade} · {s.subjects.join(", ")}</div>
        </div>
      </button>
      {unassigned ? (
        <button onClick={onAssign} style={{ padding: "6px 10px", borderRadius: 8, background: C.warn, color: "#0A1628", fontSize: 11, fontWeight: 700, letterSpacing: .3, border: "none", cursor: "pointer", fontFamily: FF.body }}>Zuweisen</button>
      ) : t ? (
        <Avatar short={t.short} color={t.color} size={26}/>
      ) : null}
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label="Entfernen" style={{ width: 32, height: 32, padding: 0, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, cursor: "pointer", display: "grid", placeItems: "center" }}>
        <Trash2 size={14}/>
      </button>
    </div>
  );
}

function AdminStudents({ store, onAdd, onAssignClick, onStudentClick }) {
  const [query, setQuery] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null); // student object
  const q = query.trim().toLowerCase();
  const filtered = q ? store.students.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.subjects.some(sub => sub.toLowerCase().includes(q)) ||
    String(s.grade).includes(q) ||
    (s.focus || "").toLowerCase().includes(q)
  ) : store.students;

  const unassigned = filtered.filter(s => !s.teacherId);
  const assigned = filtered.filter(s => s.teacherId);

  const handleRemove = () => {
    if (confirmRemove) {
      store.removeStudent(confirmRemove.id);
      setConfirmRemove(null);
    }
  };

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>ADMIN · ALLE SCHÜLER</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.6, color: C.textHi }}>{store.students.length} Schüler</h1>
      </div>
      <button onClick={onAdd} style={{ width: "100%", marginBottom: 14, padding: 14, background: C.primaryGrad, color: "#fff", border: "none", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer", boxShadow: "0 8px 18px -6px rgba(244,145,86,.4)" }}>
        <UserPlus size={16}/> Neuen Schüler anlegen
      </button>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 22 }}>
        <Search size={15} color={C.textVeryDim} style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)" }}/>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchen: Name, Klasse, Fach …"
          style={{
            width: "100%", padding: "11px 12px 11px 36px",
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            color: C.textHi, fontSize: 13, fontFamily: FF.body,
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "30px 20px", textAlign: "center", color: C.textDim, background: C.surface, borderRadius: 14, fontSize: 13 }}>
          Keine Schüler gefunden für „{query}".
        </div>
      )}

      {unassigned.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <AlertCircle size={14} color={C.warn}/>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: C.warn, letterSpacing: 1, margin: 0, textTransform: "uppercase" }}>Ohne Zuweisung ({unassigned.length})</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {unassigned.map(s => <AdminStudentCard key={s.id} s={s} store={store} unassigned onAssign={() => onAssignClick(s.id)} onClick={() => onStudentClick(s.id)} onRemove={() => setConfirmRemove(s)}/>)}
          </div>
        </>
      )}
      {assigned.length > 0 && (
        <>
          <SectionHeader>Zugewiesen ({assigned.length})</SectionHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assigned.map(s => <AdminStudentCard key={s.id} s={s} store={store} onClick={() => onStudentClick(s.id)} onRemove={() => setConfirmRemove(s)}/>)}
          </div>
        </>
      )}

      {/* Inline remove confirmation */}
      {confirmRemove && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.danger}40`, borderRadius: 18, padding: 22, width: "100%" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: C.danger + "22", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
              <AlertCircle size={28} color={C.danger}/>
            </div>
            <h3 style={{ fontFamily: FF.display, fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: C.textHi, textAlign: "center" }}>{confirmRemove.name} entfernen?</h3>
            <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5, margin: "0 0 22px", textAlign: "center" }}>
              Schüler wird gelöscht. Bereits eingecheckte Stunden bleiben für die Buchhaltung erhalten.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmRemove(null)} style={{ flex: 1, padding: 14, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Abbrechen</button>
              <button onClick={handleRemove} style={{ flex: 1, padding: 14, background: C.danger, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Ja, entfernen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminAssign({ store, prefilledStudentId, onDone }) {
  const unassigned = store.students.filter(s => !s.teacherId);
  const initialStudent = prefilledStudentId ? store.studentById(prefilledStudentId) : null;
  const [step, setStep] = useState(initialStudent ? 2 : 1);
  const [pickedStudent, setPickedStudent] = useState(initialStudent);
  const [pickedTeacher, setPickedTeacher] = useState(null);
  const [done, setDone] = useState(false);
  const confirm = () => { store.assignStudent(pickedStudent.id, pickedTeacher.id); setDone(true); };

  if (done) return (
    <div style={{ padding: "60px 24px 40px", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: 40, background: C.success + "22", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
        <Check size={40} color={C.success} strokeWidth={2.5}/>
      </div>
      <h1 style={{ fontFamily: FF.display, fontSize: 24, fontWeight: 700, margin: "0 0 10px", color: C.textHi, letterSpacing: -0.4 }}>Erfolgreich zugewiesen.</h1>
      <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.5, margin: "0 0 32px" }}>{pickedStudent.name} wird ab jetzt von {pickedTeacher.name} betreut.</p>
      <button onClick={() => onDone()} style={{ padding: "14px 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Fertig</button>
    </div>
  );

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>ADMIN · ZUWEISEN</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.6, color: C.textHi }}>
          {step === 1 && "Schüler auswählen"}{step === 2 && "Lehrkraft wählen"}{step === 3 && "Bestätigen"}
        </h1>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[1,2,3].map(n => <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= n ? C.primary : C.border }}/>)}
      </div>
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {unassigned.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: C.textDim, background: C.surface, borderRadius: 14 }}>
              <Sparkles size={28} color={C.success} style={{ marginBottom: 10 }}/>
              <div style={{ fontSize: 14, color: C.textHi, fontWeight: 600 }}>Alle Schüler zugewiesen.</div>
            </div>
          ) : unassigned.map(s => (
            <button key={s.id} onClick={() => { setPickedStudent(s); setStep(2); }} style={{ width: "100%", textAlign: "left", border: `1px solid ${C.border}`, cursor: "pointer", padding: 14, background: C.surface, borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar short={s.short} size={40}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.textHi }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>Kl. {s.grade} · {s.subjects.join(", ")}</div>
              </div>
              <ChevronRight size={18} color={C.textVeryDim}/>
            </button>
          ))}
        </div>
      )}
      {step === 2 && pickedStudent && (
        <>
          <div style={{ padding: 12, background: C.surfaceLo, borderRadius: 12, marginBottom: 16, fontSize: 13, color: C.text }}>
            Für <strong style={{ color: C.textHi }}>{pickedStudent.name}</strong> ({pickedStudent.subjects.join(", ") || "—"}, Kl. {pickedStudent.grade})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {store.teachers.map(t => {
              const matches = subjectsMatch(t.subjects, pickedStudent.subjects);
              const load = store.students.filter(s => s.teacherId === t.id).length;
              return (
                <button key={t.id} onClick={() => { setPickedTeacher(t); setStep(3); }} style={{ width: "100%", textAlign: "left", border: `1.5px solid ${matches ? C.success + "60" : C.border}`, cursor: "pointer", padding: 14, background: C.surface, borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar short={t.short} color={t.color} size={40}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.textHi }}>{t.name}</span>
                      {matches && <span style={{ padding: "1px 6px", background: C.success + "22", color: C.success, fontSize: 9, fontWeight: 700, borderRadius: 4 }}>PASST</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{t.subjects.join(" · ")} · {load} Schüler</div>
                  </div>
                  <ChevronRight size={18} color={C.textVeryDim}/>
                </button>
              );
            })}
          </div>
        </>
      )}
      {step === 3 && pickedStudent && pickedTeacher && (
        <>
          <div style={{ padding: 18, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: C.textDim, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>NEUE ZUWEISUNG</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Avatar short={pickedStudent.short} size={36}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.textHi }}>{pickedStudent.name}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>Klasse {pickedStudent.grade} · {pickedStudent.subjects.join(", ") || "—"}</div>
              </div>
            </div>
            <div style={{ height: 1, background: C.border, margin: "10px 0" }}/>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar short={pickedTeacher.short} color={pickedTeacher.color} size={36}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.textHi }}>{pickedTeacher.name}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>{pickedTeacher.subjects.join(" · ")}</div>
              </div>
            </div>
          </div>
          <PrimaryButton onClick={confirm} icon={CheckCircle2}>Zuweisung bestätigen</PrimaryButton>
          <button onClick={() => setStep(2)} style={{ marginTop: 12, width: "100%", padding: 12, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontSize: 14, fontFamily: FF.body, cursor: "pointer" }}>Zurück</button>
        </>
      )}
    </div>
  );
}

function AdminAddStudent({ store, onBack, onCreated, draft, setDraft, userLocationId }) {
  const { name, grade, subjects, focus, notes, teacherId } = draft;
  const setName = (v) => setDraft(d => ({ ...d, name: v }));
  const setGrade = (v) => setDraft(d => ({ ...d, grade: v }));
  const setSubjects = (v) => setDraft(d => ({ ...d, subjects: v }));
  const setFocus = (v) => setDraft(d => ({ ...d, focus: v }));
  const setNotes = (v) => setDraft(d => ({ ...d, notes: v }));
  const setTeacherId = (v) => setDraft(d => ({ ...d, teacherId: v }));
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [createdName, setCreatedName] = useState("");
  const [createdTeacherId, setCreatedTeacherId] = useState(null);
  const [saving, setSaving] = useState(false);
  const canSubmit = name.trim().length > 1 && grade && subjects.length > 0;
  const submit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    const id = await store.addStudent({ name: name.trim(), grade: parseInt(grade) || 1, subjects, focus: focus.trim(), notes: notes.trim(), teacherId, locationId: userLocationId || draft.locationId || LOCATIONS[0].id });
    setSaving(false);
    if (!id) return; // Fehler -> im Formular bleiben, Entwurf bleibt erhalten
    setCreatedName(name.trim());
    setCreatedTeacherId(teacherId);
    setCreatedId(id);
    setDone(true);
    setDraft(EMPTY_STUDENT_DRAFT);
  };

  if (done) {
    const assignedTeacher = createdTeacherId ? store.teacherById(createdTeacherId) : null;
    return (
      <div style={{ padding: "60px 24px 40px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: C.success + "22", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
          <Check size={40} color={C.success} strokeWidth={2.5}/>
        </div>
        <h1 style={{ fontFamily: FF.display, fontSize: 24, fontWeight: 700, margin: "0 0 10px", color: C.textHi, letterSpacing: -0.4 }}>Schüler angelegt.</h1>
        <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.5, margin: "0 0 32px" }}>
          <strong style={{ color: C.textHi }}>{createdName}</strong> ist im System.<br/>
          {assignedTeacher ? <>Zugewiesen an <strong style={{ color: C.textHi }}>{assignedTeacher.name}</strong>.</> : "Steht aktuell ohne Zuweisung in der Liste."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!assignedTeacher && (
            <button onClick={() => onCreated(createdId, true)} style={{ padding: "14px 22px", background: C.primary, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Jetzt zuweisen</button>
          )}
          <button onClick={() => onCreated(createdId, false)} style={{ padding: "12px 22px", background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: FF.body, cursor: "pointer" }}>Fertig</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px 40px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.text, display: "flex", alignItems: "center", gap: 6, padding: 0, cursor: "pointer", marginBottom: 16, fontFamily: FF.body }}>
        <ArrowLeft size={18}/> <span style={{ fontSize: 14, fontWeight: 600 }}>Zurück</span>
      </button>
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>NEUER SCHÜLER</div>
        <h1 style={{ fontFamily: FF.display, fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.5, color: C.textHi }}>Stammdaten anlegen</h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 26 }}>
        <Field label="Name *" value={name} onChange={setName} placeholder="z.B. Anna Müller"/>
        <Field label="Klassenstufe *" value={grade} onChange={setGrade} type="number" placeholder="1 – 13"/>
        {!userLocationId && (
          <div>
            <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: .3 }}>Standort *</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {LOCATIONS.map(loc => {
                const on = (draft.locationId || LOCATIONS[0].id) === loc.id;
                return <button key={loc.id} type="button" onClick={() => setDraft(d => ({...d, locationId: loc.id}))} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${on ? C.primary : C.border}`, background: on ? C.primary+"22" : C.surface, color: on ? C.primary : C.text, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FF.body }}>{loc.name}</button>;
              })}
            </div>
          </div>
        )}
        {userLocationId && (
          <div style={{ padding:"8px 14px", background:C.surfaceLo, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, color:C.textDim }}>
            Standort: <strong style={{color:C.textHi}}>{LOCATIONS.find(l=>l.id===userLocationId)?.name}</strong>
          </div>
        )}
        <SubjectsPicker selected={subjects} onChange={setSubjects}/>
        <Field label="Schwerpunkt" value={focus} onChange={setFocus} placeholder="z.B. ZAP-Vorbereitung, LRS-Förderung"/>
        <div>
          <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: .3 }}>Notizen</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Hintergrund, Lernstand…" style={{ width: "100%", minHeight: 80, padding: "14px 16px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, color: C.textHi, fontSize: 14, fontFamily: FF.body, outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }}/>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: C.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: .3 }}>Lehrkraft zuweisen · optional</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={() => setTeacherId(null)} style={{ padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left", background: teacherId === null ? "rgba(244,145,86,.12)" : C.surface, border: `1.5px solid ${teacherId === null ? C.primary : C.border}`, color: teacherId === null ? C.primary : C.text, fontSize: 13, fontWeight: 600, fontFamily: FF.body, display: "flex", alignItems: "center", gap: 10 }}>
              {teacherId === null && <Check size={14}/>}
              <span style={{ flex: 1 }}>Später zuweisen</span>
            </button>
            {store.teachers.map(t => {
              const matches = subjects.length > 0 && subjectsMatch(t.subjects, subjects);
              const isOn = teacherId === t.id;
              return (
                <button key={t.id} onClick={() => setTeacherId(t.id)} style={{ padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left", background: isOn ? "rgba(244,145,86,.12)" : C.surface, border: `1.5px solid ${isOn ? C.primary : (matches ? C.success + "60" : C.border)}`, display: "flex", alignItems: "center", gap: 10, fontFamily: FF.body }}>
                  <Avatar short={t.short} color={t.color} size={28}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.textHi, display: "flex", alignItems: "center", gap: 6 }}>
                      {t.name}
                      {matches && <span style={{ padding: "1px 6px", background: C.success + "22", color: C.success, fontSize: 9, fontWeight: 700, borderRadius: 4 }}>PASST</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{t.subjects.join(" · ")}</div>
                  </div>
                  {isOn && <Check size={16} color={C.primary}/>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <PrimaryButton onClick={submit} disabled={!canSubmit || saving} icon={UserPlus}>{saving ? "Speichert…" : "Schüler anlegen"}</PrimaryButton>
    </div>
  );
}


export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [authedUser, setAuthedUser] = useState(null);
  const [tab, setTab] = useState("today");
  const [view, setView] = useState(null);
  const [studentDraft, setStudentDraft] = useState(EMPTY_STUDENT_DRAFT);
  // Menüwechsel: Tab setzen UND offenes Unterfenster ausblenden (Entwurf bleibt erhalten)
  const navTab = (t) => { setTab(t); setView(null); };
  
  // STATT DEN DEMO-DATEN STARTEN WIR JETZT KOMPLETT LEER:
  const [teachers, setTeachers] = useState(TEACHERS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [billingLog, setBillingLog] = useState([]);
  const [scheduleSlots, setScheduleSlots] = useState(INITIAL_SCHEDULE_SLOTS);
  const [liveSeconds, setLiveSeconds] = useState(120);

  // Demo: Daten bereits initialisiert
  // Rollenbasierter Filter
  const userLocId = authedUser?.locationId || null;
  const isLocAdmin = authedUser?.role === "loc_admin";
  const filteredTeachers = isLocAdmin ? teachers.filter(t => !t.locationId || t.locationId === userLocId) : teachers;
  const filteredStudents = isLocAdmin ? students.filter(s => !s.locationId || s.locationId === userLocId) : students;
  const filteredApts = isLocAdmin ? appointments.filter(a => a.locationId ? a.locationId === userLocId : true) : appointments;
  const filteredSlots = isLocAdmin ? scheduleSlots.filter(s => !s.locationId || s.locationId === userLocId) : scheduleSlots;

  // Store mit gefilterten Daten für loc_admin, vollen Daten für ober-admin/lehrer
  const storeTeachers = isLocAdmin ? filteredTeachers : teachers;
  const storeStudents = isLocAdmin ? filteredStudents : students;
  const storeApts = isLocAdmin ? filteredApts : appointments;
  const storeSlots = isLocAdmin ? filteredSlots : scheduleSlots;

  const store = makeStore(storeTeachers, setTeachers, storeStudents, setStudents, storeApts, setAppointments, billingLog, setBillingLog, storeSlots, setScheduleSlots);
  // UserLocationId in store schreiben für Komponenten
  store.userLocationId = isLocAdmin ? userLocId : null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Live ticker for any checked-in appointment
  useEffect(() => {
    const interval = setInterval(() => setLiveSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Browser back-button handling: when in a detail view, back navigates within the app
  // instead of leaving it. When at tab level, back leaves normally.
  useEffect(() => {
    if (!view) return;
    // Push a state when entering a detail view, so the next back-press fires popstate
    window.history.pushState({ bendiasView: true }, "");
    const handlePop = () => setView(null);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [view]);

  // 60-minute auto-stop: any appointment that's been checked in for >= 60 minutes
  // gets automatically checked out (and saved). Checks every 20 seconds; also at mount.
  useEffect(() => {
    const autoStop = () => {
      const now = Date.now();
      const SIXTY_MIN = 60 * 60 * 1000;
      setAppointments(prev => {
        const overdue = prev.filter(a => a.status === "checked-in" && a._checkedInTs && now - a._checkedInTs >= SIXTY_MIN);
        if (overdue.length === 0) return prev;
        // In der Datenbank festschreiben (sonst nach Reload wieder "offen")
        // Demo: kein Supabase
        return prev.map(a => {
          if (!overdue.includes(a)) return a;
          const end = new Date(a._checkedInTs + SIXTY_MIN);
          return { ...a, status: "completed", checkedOutAt: hhmm(end), completedDur: a.plannedDur || 60, _autoStop: true };
        });
      });
    };
    autoStop(); // run once on mount/login
    const t = setInterval(autoStop, 20000); // check every 20s
    return () => clearInterval(t);
  }, [authedUser]);
  const handleLogin = (profile) => {
    setAuthedUser(profile);
    setTab(profile.role === 'admin' || profile.role === 'loc_admin' ? 'admin-billing' : 'today');
    setView(null);
  };

  const isAdmin = authedUser?.role === "admin" || authedUser?.role === "loc_admin";

  const renderContent = () => {
    if (view?.type === "apt") return <AppointmentDetail aptId={view.id} store={store} onBack={() => setView(null)} onStudentClick={(id) => setView({ type: "student", id })} liveSeconds={liveSeconds}/>;
    if (view?.type === "student") return <StudentProfile studentId={view.id} store={store} onBack={() => setView(null)} isAdmin={isAdmin} onRemoved={() => setView(null)}/>;
    if (view?.type === "timesheet") return <Stundenzettel user={authedUser} store={store} onBack={() => setView(null)}/>;
    if (view?.type === "add-student") return <AdminAddStudent store={store} draft={studentDraft} setDraft={setStudentDraft} userLocationId={authedUser?.role==="loc_admin"?authedUser.locationId:null} onBack={() => setView(null)} onCreated={(id, wantsAssign) => { setStudentDraft(EMPTY_STUDENT_DRAFT); wantsAssign ? setView({ type: "assign", studentId: id }) : setView(null); }}/>;
    if (view?.type === "assign") return <AdminAssign store={store} prefilledStudentId={view.studentId} onDone={() => setView(null)}/>;
    if (view?.type === "teacher-billing") return <AdminTeacherBilling teacherId={view.id} store={store} onBack={() => setView(null)} billedBy={authedUser?.name || "Admin"}/>;

    if (isAdmin) {
      if (tab === "admin-billing") return <AdminBilling store={store} onTeacherClick={(id) => setView({ type: "teacher-billing", id })}/>;
      if (tab === "admin-schedule") return <AdminSchedule store={store}/>;
      if (tab === "admin-staff") return <AdminStaff store={store} onTeacherClick={(id) => setView({ type: "teacher-billing", id })}/>;
      if (tab === "admin-students") return <AdminStudents store={store} onAdd={() => setView({ type: "add-student" })} onAssignClick={(id) => setView({ type: "assign", studentId: id })} onStudentClick={(id) => setView({ type: "student", id })}/>;
      if (tab === "admin-today") return <AdminToday store={store}/>;
    }
    if (tab === "today") return <TodayScreen user={authedUser} store={store} onAptClick={(id) => setView({ type: "apt", id })} liveSeconds={liveSeconds}/>;
    if (tab === "week") return <WeekScreen user={authedUser} store={store} onAptClick={(id) => setView({ type: "apt", id })}/>;
    if (tab === "students") return <StudentsScreen user={authedUser} store={store} onStudentClick={(id) => setView({ type: "student", id })}/>;
    if (tab === "profile") return <ProfileScreen user={authedUser} store={store} onLogout={() => setAuthedUser(null)} onShowTimesheet={() => setView({ type: "timesheet" })}/>;
    return null;
  };

  return (
    <>
      <FontInjector/>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: .4 } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { -webkit-tap-highlight-color: transparent; }
        button:active { transform: scale(.98); }
      `}</style>
      <PhoneFrame isMobile={isMobile}>
        {!authedUser ? (
          isMobile ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <StatusBar/>
              <div style={{ flex: 1, overflow: "auto" }}><Login onLogin={handleLogin}/></div>
            </div>
          ) : (
            // Desktop login: centered card on a moody background
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "radial-gradient(circle at 30% 20%, #1B2B45 0%, #050B17 60%, #02050C 100%)" }}>
              <div style={{ width: "100%", maxWidth: 440, borderRadius: 22, overflow: "hidden", background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 30px 80px -20px rgba(0,0,0,.6)" }}>
                <Login onLogin={handleLogin}/>
              </div>
            </div>
          )
        ) : (
          isMobile ? (
            <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
              <StatusBar/>
              <AppHeader user={authedUser} onLogout={() => setAuthedUser(null)}/>
              <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>{renderContent()}</div>
              <BottomTabs tab={tab} setTab={navTab} isAdmin={isAdmin}/>
            </div>
          ) : (
            // Desktop: sidebar + content area
            <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
              <DesktopSidebar user={authedUser} tab={tab} setTab={navTab} isAdmin={isAdmin} onLogout={() => setAuthedUser(null)}/>
              <main style={{ flex: 1, overflow: "auto", maxWidth: "100%", padding: "32px 40px 60px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 960 }}>{renderContent()}</div>
              </main>
            </div>
          )
        )}
      </PhoneFrame>
    </>
  );
}

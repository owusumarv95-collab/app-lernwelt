/* ============================================================================
   beck-up VERWALTUNG — UMSTELLUNG: STANDORTE  ->  BEREICHE
   ----------------------------------------------------------------------------
   So setzt du es ein:
   In deiner App.jsx ersetzt du die alten Konstanten-Blöcke
   (LOCATIONS, ROOMS_BY_LOCATION, ALL_SUBJECTS, TEACHERS, DEMO_USERS,
    INITIAL_STUDENTS, INITIAL_APPOINTMENTS, INITIAL_SCHEDULE_SLOTS)
   durch die folgenden. Der Rest der App läuft unverändert weiter, weil
   die gesamte Filter-/Switcher-Logik schon generisch über "locationId"
   arbeitet — nur dass ein "Standort" jetzt ein BEREICH ist.
   ============================================================================ */

// Die drei Bereiche von beck-up (ersetzen die Standorte)
const LOCATIONS = [
  { id: "learning",  name: "Nachhilfe",        short: "Nachhilfe", color: "#6D28D9" },
  { id: "elearning", name: "eLearning",        short: "eLearning", color: "#0891B2" },
  { id: "sport",     name: "Sport & Freizeit", short: "Sport",     color: "#D97706" },
];

// Räume/Plätze je Bereich — Nachhilfe hat Räume, eLearning Online-Räume, Sport Plätze
const ROOMS_BY_LOCATION = {
  "learning":  [{ id: "r1", name: "Raum 1" }, { id: "r2", name: "Raum 2" }, { id: "r3", name: "Raum 3" }],
  "elearning": [{ id: "o1", name: "Online-Raum A" }, { id: "o2", name: "Online-Raum B" }],
  "sport":     [{ id: "p1", name: "Tennisplatz 1" }, { id: "p2", name: "Tennisplatz 2" }, { id: "h1", name: "Sporthalle" }],
};

// Fächer/Disziplinen je Bereich. ALL_SUBJECTS bleibt als Gesamtliste erhalten,
// damit der bestehende SubjectsPicker ohne Änderung funktioniert.
const SUBJECTS_BY_AREA = {
  "learning":  ["Mathe", "Deutsch", "Englisch", "Französisch", "Latein", "Physik", "Chemie", "Biologie", "LRS", "Dyskalkulie", "ZAP"],
  "elearning": ["Mathe", "Deutsch", "Englisch", "Französisch", "Physik", "Chemie", "Biologie", "Informatik", "Prüfungs-Prep"],
  "sport":     ["Tennis Einzel", "Tennis Gruppe", "Athletik", "Fitness", "Koordination", "Ferien-Camp"],
};
const ALL_SUBJECTS = [...new Set(Object.values(SUBJECTS_BY_AREA).flat())];

const TEACHERS = [
  { id: 1, name: "Herr Stolle",   short: "ST", subjects: ["Mathe", "Physik", "Informatik"],            color: "#6D28D9", role: "teacher", email: "stolle@beck-up.de",   rate: 25, locationId: "learning" },
  { id: 2, name: "Frau Albrecht", short: "AL", subjects: ["Deutsch", "Englisch", "Prüfungs-Prep"],     color: "#0891B2", role: "teacher", email: "albrecht@beck-up.de", rate: 23, locationId: "elearning" },
  { id: 3, name: "Frau Nguyen",   short: "NG", subjects: ["Mathe", "Chemie", "Biologie"],              color: "#16A34A", role: "teacher", email: "nguyen@beck-up.de",   rate: 24, locationId: "learning" },
  { id: 4, name: "Herr Yilmaz",   short: "YI", subjects: ["Tennis Einzel", "Tennis Gruppe", "Athletik"], color: "#D97706", role: "teacher", email: "yilmaz@beck-up.de",   rate: 28, locationId: "sport" },
  { id: 5, name: "Frau Sahin",    short: "SA", subjects: ["Mathe", "Englisch", "Prüfungs-Prep"],       color: "#7C3AED", role: "teacher", email: "sahin@beck-up.de",    rate: 24, locationId: "elearning" },
];

// Login-Demo: Inhaber sieht alles, Bereichsleitung Sport sieht nur Sport,
// dazu zwei Lehrer. (Mehr Bereichsleiter einfach analog ergänzen.)
const DEMO_USERS = [
  { id: 99, name: "Herr Beck",   short: "BK", color: "#6D28D9", role: "admin",     email: "beck@beck-up.de",    password: "demo1234", subtitle: "Inhaber · Alle Bereiche" },
  { id: 50, name: "Frau Köhler", short: "KÖ", color: "#D97706", role: "loc_admin", email: "koehler@beck-up.de", password: "demo1234", subtitle: "Bereichsleitung Sport", locationId: "sport" },
  { id: 1,  name: "Herr Stolle", short: "ST", color: "#6D28D9", role: "teacher",   email: "stolle@beck-up.de",  password: "demo1234", subtitle: "Nachhilfe · Mathe · Physik", locationId: "learning" },
  { id: 4,  name: "Herr Yilmaz", short: "YI", color: "#D97706", role: "teacher",   email: "yilmaz@beck-up.de",  password: "demo1234", subtitle: "Sport · Tennis", locationId: "sport" },
];

const INITIAL_STUDENTS = [
  { id: 1, name: "Leon Braun",   short: "LB", grade: 10, subjects: ["Mathe"],         teacherId: 1, locationId: "learning",  focus: "ZP10-Vorbereitung",  since: "Mrz 2026", notes: "Algebra sicher, Stochastik schwach." },
  { id: 2, name: "Emma Wagner",  short: "EW", grade: 8,  subjects: ["Deutsch"],       teacherId: 2, locationId: "elearning", focus: "Online-Förderung",   since: "Jan 2026", notes: "Großer Fortschritt beim Lesen." },
  { id: 3, name: "Finn Schmidt", short: "FS", grade: 12, subjects: ["Mathe", "Physik"], teacherId: 1, locationId: "learning",  focus: "Abi-Vorbereitung",   since: "Sep 2025", notes: "Klausurniveau erreicht." },
  { id: 4, name: "Mia Hoffmann", short: "MH", grade: 5,  subjects: ["Englisch"],      teacherId: 5, locationId: "elearning", focus: "Grammatik",          since: "Apr 2026", notes: "Vokabeln sehr gut." },
  { id: 5, name: "Noah Krause",  short: "NK", grade: 11, subjects: ["Prüfungs-Prep"], teacherId: 5, locationId: "elearning", focus: "Klausur-Prep",       since: "Feb 2026", notes: "Sehr zielstrebig." },
  { id: 6, name: "Sophie Klein", short: "SK", grade: 9,  subjects: ["Chemie"],        teacherId: 3, locationId: "learning",  focus: "ZP10",               since: "Okt 2025", notes: "Organik schwierig." },
  { id: 7, name: "Lukas Berg",   short: "LK", grade: 7,  subjects: ["Tennis Gruppe"], teacherId: 4, locationId: "sport",     focus: "Tennis Anfänger",    since: "Mrz 2026", notes: "Rückhand im Aufbau." },
  { id: 8, name: "Hana Demir",   short: "HD", grade: 6,  subjects: ["Tennis Einzel"], teacherId: 4, locationId: "sport",     focus: "Wettkampf-Training", since: "Feb 2026", notes: "Sehr ehrgeizig." },
  { id: 9, name: "Jonas Vogel",  short: "JV", grade: 8,  subjects: ["Athletik"],      teacherId: 4, locationId: "sport",     focus: "Athletik-Gruppe",    since: "Jan 2026", notes: "Gute Kondition." },
];

// Erfasste Stunden — über alle drei Bereiche verteilt, jeder Lehrer hat offene Stunden
const INITIAL_APPOINTMENTS = [
  { id: 101, day: 0, date: "08.06.", time: "14:00", plannedDur: 60, studentId: 1, teacherId: 1, subject: "Mathe",         room: "Raum 1",        locationId: "learning",  status: "completed", completedDur: 60, checkedInAt: "13:58", checkedOutAt: "14:58", notes: "", billed: false, dateKey: "2026-06-08" },
  { id: 102, day: 1, date: "02.06.", time: "14:00", plannedDur: 60, studentId: 3, teacherId: 1, subject: "Physik",        room: "Raum 1",        locationId: "learning",  status: "completed", completedDur: 60, checkedInAt: "14:00", checkedOutAt: "15:00", notes: "", billed: false, dateKey: "2026-06-02" },
  { id: 103, day: 2, date: "03.06.", time: "14:00", plannedDur: 60, studentId: 6, teacherId: 3, subject: "Chemie",        room: "Raum 3",        locationId: "learning",  status: "completed", completedDur: 90, checkedInAt: "14:00", checkedOutAt: "15:30", notes: "", billed: false, dateKey: "2026-06-03" },
  { id: 201, day: 0, date: "08.06.", time: "16:00", plannedDur: 60, studentId: 2, teacherId: 2, subject: "Deutsch",       room: "Online-Raum A", locationId: "elearning", status: "completed", completedDur: 60, checkedInAt: "16:01", checkedOutAt: "17:01", notes: "", billed: false, dateKey: "2026-06-08" },
  { id: 202, day: 2, date: "03.06.", time: "16:00", plannedDur: 60, studentId: 5, teacherId: 5, subject: "Prüfungs-Prep", room: "Online-Raum A", locationId: "elearning", status: "completed", completedDur: 60, checkedInAt: "16:00", checkedOutAt: "17:00", notes: "", billed: false, dateKey: "2026-06-03" },
  { id: 301, day: 0, date: "08.06.", time: "17:00", plannedDur: 60, studentId: 8, teacherId: 4, subject: "Tennis Einzel", room: "Tennisplatz 1", locationId: "sport",     status: "completed", completedDur: 60, checkedInAt: "17:00", checkedOutAt: "18:00", notes: "", billed: false, dateKey: "2026-06-08" },
  { id: 302, day: 3, date: "04.06.", time: "17:00", plannedDur: 60, studentId: 7, teacherId: 4, subject: "Tennis Gruppe", room: "Sporthalle",    locationId: "sport",     status: "completed", completedDur: 60, checkedInAt: "17:00", checkedOutAt: "18:00", notes: "", billed: false, dateKey: "2026-06-04" },
  { id: 104, day: 0, date: "08.06.", time: "15:00", plannedDur: 60, studentId: 3, teacherId: 1, subject: "Physik",        room: "Raum 1",        locationId: "learning",  status: "scheduled", completedDur: null, notes: "", billed: false, dateKey: "2026-06-08" },
];

const INITIAL_SCHEDULE_SLOTS = [
  // Nachhilfe (Mo + Mi)
  { id: "s001", day: 0, time: "14:00", locationId: "learning",  roomId: "r1", teacherId: 1, studentIds: [1, 3], type: "gruppe", notes: "" },
  { id: "s002", day: 0, time: "15:00", locationId: "learning",  roomId: "r1", teacherId: 1, studentIds: [3],    type: "einzel", notes: "" },
  { id: "s003", day: 0, time: "14:00", locationId: "learning",  roomId: "r3", teacherId: 3, studentIds: [6],    type: "einzel", notes: "" },
  { id: "s008", day: 2, time: "14:00", locationId: "learning",  roomId: "r1", teacherId: 1, studentIds: [1],    type: "einzel", notes: "" },
  // eLearning (Mo + Mi)
  { id: "s004", day: 0, time: "16:00", locationId: "elearning", roomId: "o1", teacherId: 2, studentIds: [2],    type: "einzel", notes: "" },
  { id: "s005", day: 0, time: "16:00", locationId: "elearning", roomId: "o2", teacherId: 5, studentIds: [4, 5], type: "gruppe", notes: "" },
  { id: "s009", day: 2, time: "16:00", locationId: "elearning", roomId: "o1", teacherId: 5, studentIds: [5],    type: "einzel", notes: "" },
  // Sport (Mo + Do)
  { id: "s006", day: 0, time: "17:00", locationId: "sport",     roomId: "p1", teacherId: 4, studentIds: [8],    type: "einzel", notes: "" },
  { id: "s007", day: 0, time: "17:00", locationId: "sport",     roomId: "h1", teacherId: 4, studentIds: [7, 9], type: "gruppe", notes: "" },
  { id: "s010", day: 3, time: "17:00", locationId: "sport",     roomId: "p1", teacherId: 4, studentIds: [8],    type: "einzel", notes: "" },
];

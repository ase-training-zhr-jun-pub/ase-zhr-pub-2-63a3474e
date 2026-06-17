// Zentrale Mock-Daten für den Calvin Prototypen — kein Backend.
// Realistische INNOQ-Standorte, plausible Raumnamen und Zeitslots.

export type AusstattungsMerkmal =
  | "Whiteboard"
  | "TV"
  | "Videokonferenz"
  | "Beamer"
  | "Telefon"
  | "Flipchart"

export interface Standort {
  id: string
  name: string
  stadt: string
  raeumeAnzahl: number
}

export interface Raum {
  id: string
  name: string
  standortId: string
  kapazitaet: number
  etage: string
  ausstattung: AusstattungsMerkmal[]
  beschreibung: string
}

export interface Zeitfenster {
  start: string // "HH:MM"
  ende: string // "HH:MM"
}

export interface Belegung {
  raumId: string
  datum: string // ISO "YYYY-MM-DD"
  zeitfenster: Zeitfenster
  titel: string
}

export type BuchungsStatus = "bestätigt" | "storniert"

export interface Buchung {
  id: string
  raumId: string
  standortId: string
  datum: string // ISO "YYYY-MM-DD"
  zeitfenster: Zeitfenster
  titel: string
  notiz?: string
  status: BuchungsStatus
  gebuchtVon: string
}

export interface Kollege {
  id: string
  name: string
  initialen: string
  standortId: string
}

// --- Standorte (alle 8 INNOQ-Standorte) ---

export const standorte: Standort[] = [
  { id: "koeln", name: "Köln", stadt: "Köln", raeumeAnzahl: 6 },
  { id: "monheim", name: "Monheim", stadt: "Monheim", raeumeAnzahl: 5 },
  { id: "berlin", name: "Berlin", stadt: "Berlin", raeumeAnzahl: 7 },
  { id: "hamburg", name: "Hamburg", stadt: "Hamburg", raeumeAnzahl: 5 },
  { id: "muenchen", name: "München", stadt: "München", raeumeAnzahl: 4 },
  { id: "offenbach", name: "Offenbach", stadt: "Offenbach", raeumeAnzahl: 4 },
  { id: "zuerich", name: "Zürich", stadt: "Zürich", raeumeAnzahl: 3 },
  { id: "baar", name: "Baar", stadt: "Baar", raeumeAnzahl: 2 },
]

// --- Räume (nach Standort, mit thematischen Namen) ---

export const raeume: Raum[] = [
  // Köln — Edelsteine
  {
    id: "koeln-bergkristall",
    name: "Bergkristall",
    standortId: "koeln",
    kapazitaet: 4,
    etage: "2. OG",
    ausstattung: ["Whiteboard", "TV", "Videokonferenz"],
    beschreibung: "Heller Besprechungsraum mit Blick auf den Rhein, ideal für Team-Meetings.",
  },
  {
    id: "koeln-rheingold",
    name: "Rheingold",
    standortId: "koeln",
    kapazitaet: 8,
    etage: "3. OG",
    ausstattung: ["Whiteboard", "TV", "Beamer"],
    beschreibung: "Großer Workshop-Raum mit flexibler Bestuhlung.",
  },
  {
    id: "koeln-mosel",
    name: "Mosel",
    standortId: "koeln",
    kapazitaet: 10,
    etage: "EG",
    ausstattung: ["Beamer", "Whiteboard", "Videokonferenz", "Flipchart"],
    beschreibung: "Unser größter Raum für Kundenworkshops und Präsentationen.",
  },
  {
    id: "koeln-spessart",
    name: "Spessart",
    standortId: "koeln",
    kapazitaet: 2,
    etage: "2. OG",
    ausstattung: ["Telefon", "TV"],
    beschreibung: "Fokus-Box für vertrauliche Gespräche und Remote-Calls.",
  },
  {
    id: "koeln-eifel",
    name: "Eifel",
    standortId: "koeln",
    kapazitaet: 6,
    etage: "3. OG",
    ausstattung: ["Whiteboard", "Videokonferenz", "Flipchart"],
    beschreibung: "Kompakter Raum für agile Team-Sessions.",
  },
  {
    id: "koeln-ahr",
    name: "Ahr",
    standortId: "koeln",
    kapazitaet: 4,
    etage: "EG",
    ausstattung: ["TV", "Videokonferenz"],
    beschreibung: "Gemütlicher Raum für kleine Runden.",
  },
  // Hamburg — Flüsse & Wasser
  {
    id: "hamburg-elbe",
    name: "Elbe",
    standortId: "hamburg",
    kapazitaet: 12,
    etage: "4. OG",
    ausstattung: ["Beamer", "Whiteboard", "Videokonferenz", "Flipchart"],
    beschreibung: "Repräsentativer Raum mit Hafenblick für große Workshops.",
  },
  {
    id: "hamburg-alster",
    name: "Alster",
    standortId: "hamburg",
    kapazitaet: 6,
    etage: "4. OG",
    ausstattung: ["Whiteboard", "TV", "Videokonferenz"],
    beschreibung: "Lichtdurchfluteter Meetingraum.",
  },
  {
    id: "hamburg-speicher",
    name: "Speicher",
    standortId: "hamburg",
    kapazitaet: 4,
    etage: "2. OG",
    ausstattung: ["TV", "Whiteboard"],
    beschreibung: "Industrie-Charme im historischen Speichergebäude.",
  },
  {
    id: "hamburg-koehlbrand",
    name: "Köhlbrand",
    standortId: "hamburg",
    kapazitaet: 2,
    etage: "2. OG",
    ausstattung: ["Telefon"],
    beschreibung: "Telefonbox für ungestörte Calls.",
  },
  {
    id: "hamburg-binnen",
    name: "Binnenalster",
    standortId: "hamburg",
    kapazitaet: 8,
    etage: "3. OG",
    ausstattung: ["Beamer", "Whiteboard", "Videokonferenz"],
    beschreibung: "Vielseitiger Raum für Team- und Kundentermine.",
  },
  // Berlin — Bezirke & Wahrzeichen
  {
    id: "berlin-spree",
    name: "Spree",
    standortId: "berlin",
    kapazitaet: 10,
    etage: "5. OG",
    ausstattung: ["Beamer", "Whiteboard", "Videokonferenz", "Flipchart"],
    beschreibung: "Großzügiger Workshop-Raum über den Dächern Berlins.",
  },
  {
    id: "berlin-kreuzberg",
    name: "Kreuzberg",
    standortId: "berlin",
    kapazitaet: 6,
    etage: "5. OG",
    ausstattung: ["Whiteboard", "TV", "Videokonferenz"],
    beschreibung: "Kreativer Raum für Design-Sessions.",
  },
  {
    id: "berlin-prenzlberg",
    name: "Prenzlauer Berg",
    standortId: "berlin",
    kapazitaet: 4,
    etage: "4. OG",
    ausstattung: ["TV", "Whiteboard"],
    beschreibung: "Ruhiger Raum für konzentrierte Arbeit.",
  },
  {
    id: "berlin-funkturm",
    name: "Funkturm",
    standortId: "berlin",
    kapazitaet: 2,
    etage: "4. OG",
    ausstattung: ["Telefon", "TV"],
    beschreibung: "Fokus-Box mit Aussicht.",
  },
  // München — Berge & Seen
  {
    id: "muenchen-isar",
    name: "Isar",
    standortId: "muenchen",
    kapazitaet: 8,
    etage: "2. OG",
    ausstattung: ["Beamer", "Whiteboard", "Videokonferenz"],
    beschreibung: "Heller Workshop-Raum nahe der Isar.",
  },
  {
    id: "muenchen-zugspitze",
    name: "Zugspitze",
    standortId: "muenchen",
    kapazitaet: 12,
    etage: "3. OG",
    ausstattung: ["Beamer", "Whiteboard", "Videokonferenz", "Flipchart"],
    beschreibung: "Unser höchstes Highlight für große Runden.",
  },
  {
    id: "muenchen-tegernsee",
    name: "Tegernsee",
    standortId: "muenchen",
    kapazitaet: 4,
    etage: "2. OG",
    ausstattung: ["TV", "Videokonferenz"],
    beschreibung: "Erholsamer Raum für kleine Meetings.",
  },
  {
    id: "muenchen-eisbach",
    name: "Eisbach",
    standortId: "muenchen",
    kapazitaet: 2,
    etage: "2. OG",
    ausstattung: ["Telefon"],
    beschreibung: "Telefonbox.",
  },
  // Monheim
  {
    id: "monheim-gaensekiel",
    name: "Gänseliesel",
    standortId: "monheim",
    kapazitaet: 6,
    etage: "1. OG",
    ausstattung: ["Whiteboard", "TV", "Videokonferenz"],
    beschreibung: "Freundlicher Meetingraum im Herzen Monheims.",
  },
  {
    id: "monheim-rhein",
    name: "Rheinblick",
    standortId: "monheim",
    kapazitaet: 8,
    etage: "2. OG",
    ausstattung: ["Beamer", "Whiteboard", "Videokonferenz"],
    beschreibung: "Workshop-Raum mit Panoramablick.",
  },
  {
    id: "monheim-apfel",
    name: "Apfelhain",
    standortId: "monheim",
    kapazitaet: 4,
    etage: "1. OG",
    ausstattung: ["TV", "Whiteboard"],
    beschreibung: "Kleiner gemütlicher Raum.",
  },
  // Offenbach
  {
    id: "offenbach-main",
    name: "Mainufer",
    standortId: "offenbach",
    kapazitaet: 8,
    etage: "3. OG",
    ausstattung: ["Beamer", "Whiteboard", "Videokonferenz"],
    beschreibung: "Moderner Workshop-Raum am Main.",
  },
  {
    id: "offenbach-leder",
    name: "Ledermuseum",
    standortId: "offenbach",
    kapazitaet: 4,
    etage: "2. OG",
    ausstattung: ["TV", "Whiteboard"],
    beschreibung: "Stilvoller Raum für Team-Termine.",
  },
  // Zürich
  {
    id: "zuerich-limmat",
    name: "Limmat",
    standortId: "zuerich",
    kapazitaet: 6,
    etage: "4. OG",
    ausstattung: ["Whiteboard", "TV", "Videokonferenz"],
    beschreibung: "Eleganter Meetingraum mit Blick auf die Limmat.",
  },
  {
    id: "zuerich-uetliberg",
    name: "Uetliberg",
    standortId: "zuerich",
    kapazitaet: 10,
    etage: "5. OG",
    ausstattung: ["Beamer", "Whiteboard", "Videokonferenz", "Flipchart"],
    beschreibung: "Großer Raum für Kundenworkshops mit Bergblick.",
  },
  {
    id: "zuerich-bahnhof",
    name: "Bahnhofstrasse",
    standortId: "zuerich",
    kapazitaet: 2,
    etage: "4. OG",
    ausstattung: ["Telefon"],
    beschreibung: "Telefonbox an der Bahnhofstrasse.",
  },
  // Baar
  {
    id: "baar-zugersee",
    name: "Zugersee",
    standortId: "baar",
    kapazitaet: 6,
    etage: "2. OG",
    ausstattung: ["Whiteboard", "TV", "Videokonferenz"],
    beschreibung: "Ruhiger Raum mit Seeblick.",
  },
  {
    id: "baar-lorzen",
    name: "Lorzen",
    standortId: "baar",
    kapazitaet: 4,
    etage: "1. OG",
    ausstattung: ["TV", "Whiteboard"],
    beschreibung: "Kompakter Besprechungsraum.",
  },
]

// --- Heutiges Datum für den Prototypen (passend zur currentDate) ---

export const HEUTE = "2026-06-17"

// --- Belegungen (für Verfügbarkeitsprüfung & Raumkalender) ---

export const belegungen: Belegung[] = [
  // Köln, heute (17.06.)
  { raumId: "koeln-bergkristall", datum: HEUTE, zeitfenster: { start: "09:00", ende: "10:00" }, titel: "Daily Standup" },
  { raumId: "koeln-bergkristall", datum: HEUTE, zeitfenster: { start: "12:00", ende: "14:00" }, titel: "Sprint Planning" },
  { raumId: "koeln-bergkristall", datum: HEUTE, zeitfenster: { start: "16:00", ende: "17:00" }, titel: "Retro" },
  { raumId: "koeln-rheingold", datum: HEUTE, zeitfenster: { start: "11:00", ende: "13:00" }, titel: "Architektur-Review" },
  { raumId: "koeln-rheingold", datum: HEUTE, zeitfenster: { start: "15:00", ende: "16:00" }, titel: "1:1" },
  { raumId: "koeln-mosel", datum: HEUTE, zeitfenster: { start: "09:00", ende: "13:00" }, titel: "Kundenworkshop ACME" },
  { raumId: "koeln-mosel", datum: HEUTE, zeitfenster: { start: "14:00", ende: "15:00" }, titel: "Vertriebsmeeting" },
  { raumId: "koeln-spessart", datum: HEUTE, zeitfenster: { start: "09:00", ende: "10:00" }, titel: "Remote-Call" },
  { raumId: "koeln-spessart", datum: HEUTE, zeitfenster: { start: "10:00", ende: "11:00" }, titel: "Remote-Call" },
  { raumId: "koeln-spessart", datum: HEUTE, zeitfenster: { start: "15:00", ende: "17:00" }, titel: "Kundengespräch" },
  { raumId: "koeln-eifel", datum: HEUTE, zeitfenster: { start: "13:00", ende: "14:00" }, titel: "Refinement" },
  { raumId: "koeln-ahr", datum: HEUTE, zeitfenster: { start: "10:00", ende: "11:00" }, titel: "Pairing" },

  // Köln, morgen (18.06.)
  { raumId: "koeln-bergkristall", datum: "2026-06-18", zeitfenster: { start: "09:00", ende: "10:00" }, titel: "Daily Standup" },
  { raumId: "koeln-mosel", datum: "2026-06-18", zeitfenster: { start: "10:00", ende: "12:00" }, titel: "Workshop" },
  { raumId: "koeln-rheingold", datum: "2026-06-18", zeitfenster: { start: "14:00", ende: "16:00" }, titel: "Design Session" },

  // Hamburg, diverse Tage
  { raumId: "hamburg-elbe", datum: "2026-06-22", zeitfenster: { start: "10:00", ende: "12:00" }, titel: "Kundenworkshop" },
  { raumId: "hamburg-alster", datum: HEUTE, zeitfenster: { start: "13:00", ende: "14:00" }, titel: "Team-Lunch-Planung" },
]

// --- Eigene Buchungen (Alex Berger) ---

export const meineBuchungen: Buchung[] = [
  {
    id: "buchung-1",
    raumId: "koeln-bergkristall",
    standortId: "koeln",
    datum: HEUTE,
    zeitfenster: { start: "14:00", ende: "15:30" },
    titel: "Q3 Planungsmeeting",
    notiz: "Bitte Whiteboard vorbereiten",
    status: "bestätigt",
    gebuchtVon: "Alex Berger",
  },
  {
    id: "buchung-2",
    raumId: "hamburg-elbe",
    standortId: "hamburg",
    datum: "2026-06-22",
    zeitfenster: { start: "10:00", ende: "12:00" },
    titel: "Kundenworkshop",
    notiz: "Catering für 10 Personen bestellt",
    status: "bestätigt",
    gebuchtVon: "Alex Berger",
  },
  {
    id: "buchung-3",
    raumId: "koeln-rheingold",
    standortId: "koeln",
    datum: "2026-06-24",
    zeitfenster: { start: "09:00", ende: "10:30" },
    titel: "Architektur-Sync",
    status: "bestätigt",
    gebuchtVon: "Alex Berger",
  },
  // Vergangene Buchungen
  {
    id: "buchung-4",
    raumId: "koeln-mosel",
    standortId: "koeln",
    datum: "2026-06-10",
    zeitfenster: { start: "13:00", ende: "17:00" },
    titel: "Strategie-Offsite",
    status: "bestätigt",
    gebuchtVon: "Alex Berger",
  },
  {
    id: "buchung-5",
    raumId: "koeln-spessart",
    standortId: "koeln",
    datum: "2026-06-05",
    zeitfenster: { start: "11:00", ende: "12:00" },
    titel: "Bewerbungsgespräch",
    status: "storniert",
    gebuchtVon: "Alex Berger",
  },
]

// --- Kollegen im Büro (Persona-Need: Wer ist heute da?) ---

export const kollegenHeute: Record<string, Kollege[]> = {
  koeln: [
    { id: "k1", name: "Petra Müller", initialen: "PM", standortId: "koeln" },
    { id: "k2", name: "Jonas Klein", initialen: "JK", standortId: "koeln" },
    { id: "k3", name: "Sarah Wagner", initialen: "SW", standortId: "koeln" },
    { id: "k4", name: "Tim Becker", initialen: "TB", standortId: "koeln" },
    { id: "k5", name: "Lena Hoffmann", initialen: "LH", standortId: "koeln" },
  ],
  hamburg: [
    { id: "k6", name: "Max Schulz", initialen: "MS", standortId: "hamburg" },
    { id: "k7", name: "Nina Brandt", initialen: "NB", standortId: "hamburg" },
  ],
  berlin: [
    { id: "k8", name: "Felix Wolf", initialen: "FW", standortId: "berlin" },
    { id: "k9", name: "Clara Vogel", initialen: "CV", standortId: "berlin" },
    { id: "k10", name: "David Krüger", initialen: "DK", standortId: "berlin" },
  ],
}

// --- Aktueller Nutzer ---

export const aktuellerNutzer = {
  name: "Alex Berger",
  initialen: "AB",
  rolle: "Senior Consultant",
  standortId: "koeln",
}

// --- Hilfsfunktionen ---

export function getStandort(id: string): Standort | undefined {
  return standorte.find((s) => s.id === id)
}

export function getRaum(id: string): Raum | undefined {
  return raeume.find((r) => r.id === id)
}

export function getRaeumeByStandort(standortId: string): Raum[] {
  return raeume.filter((r) => r.standortId === standortId)
}

export function getBelegungen(raumId: string, datum: string): Belegung[] {
  return belegungen.filter((b) => b.raumId === raumId && b.datum === datum)
}

// Standard-Zeitslots (Arbeitstag in Stundenschritten)
export const ZEIT_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
]

// Prüft, ob ein Raum in einem Zeitfenster frei ist
export function istRaumFrei(
  raumId: string,
  datum: string,
  start: string,
  ende: string
): boolean {
  const bel = getBelegungen(raumId, datum)
  return !bel.some((b) => start < b.zeitfenster.ende && ende > b.zeitfenster.start)
}

// Findet das nächste freie Zeitfenster nach einer belegten Zeit
export function naechsteFreieZeit(raumId: string, datum: string): string | null {
  const bel = getBelegungen(raumId, datum).sort((a, b) =>
    a.zeitfenster.ende.localeCompare(b.zeitfenster.ende)
  )
  if (bel.length === 0) return null
  return bel[bel.length - 1].zeitfenster.ende
}

// Formatiert ein ISO-Datum als lesbares deutsches Datum
export function formatDatum(iso: string): string {
  const [jahr, monat, tag] = iso.split("-").map(Number)
  const wochentage = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
  const monate = [
    "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
  ]
  const d = new Date(jahr, monat - 1, tag)
  return `${wochentage[d.getDay()]}, ${tag}. ${monate[monat - 1]} ${jahr}`
}

export function formatDatumKurz(iso: string): string {
  const [, monat, tag] = iso.split("-").map(Number)
  const monate = [
    "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
  ]
  return `${tag}. ${monate[monat - 1]}`
}

export function istHeute(iso: string): boolean {
  return iso === HEUTE
}

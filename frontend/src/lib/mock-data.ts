// Ressourcen-Stammdaten (Standorte, Räume, Ausstattung) als Mock in der SPA — gemäß
// ADR-002 besitzt der Booking Service keinen Ressourcenkatalog, sondern arbeitet nur
// mit den hier vergebenen IDs. Buchungen und Belegungen kommen dagegen aus dem Backend
// (siehe lib/buchungen-api.ts); sie werden hier NICHT mehr gemockt.

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
  // Gehört die Buchung zu einem Serientermin (CLVN-031), tragen alle Einzeltermine
  // dieselbe serienId. Einzelbuchungen lassen das Feld leer.
  serienId?: string
}

export interface Kollege {
  id: string
  name: string
  initialen: string
  standortId: string
}

// Grund der Anwesenheit: entweder selbst angekündigt (signalisiert, CLVN-038) oder
// aus einer bestehenden Raumbuchung am Standort abgeleitet.
export type AnwesenheitsGrund = "signalisiert" | "raumbuchung"

// Ein abgeleiteter Eintrag der Anwesenheitsliste (CLVN-037, reine Ansicht).
export interface AnwesenheitsEintrag {
  kollege: Kollege
  grund: AnwesenheitsGrund
  /** Markiert die eigene Anwesenheit des aktuellen Nutzers. */
  istIchSelbst: boolean
}

// Eine angekündigte Büroanwesenheit (CLVN-038): vom Mitarbeiter signalisiert,
// unabhängig von einer Raumbuchung. Quelle der "signalisiert"-Einträge oben.
export interface Anwesenheit {
  id: string
  personId: string
  name: string
  initialen: string
  standortId: string
  datum: string // ISO "YYYY-MM-DD"
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

// --- Kollegen (Stammdaten) ---

export const kollegen: Kollege[] = [
  { id: "k1", name: "Petra Müller", initialen: "PM", standortId: "koeln" },
  { id: "k2", name: "Jonas Klein", initialen: "JK", standortId: "koeln" },
  { id: "k3", name: "Sarah Wagner", initialen: "SW", standortId: "koeln" },
  { id: "k4", name: "Tim Becker", initialen: "TB", standortId: "koeln" },
  { id: "k5", name: "Lena Hoffmann", initialen: "LH", standortId: "koeln" },
  { id: "k6", name: "Max Schulz", initialen: "MS", standortId: "hamburg" },
  { id: "k7", name: "Nina Brandt", initialen: "NB", standortId: "hamburg" },
  { id: "k8", name: "Felix Wolf", initialen: "FW", standortId: "berlin" },
  { id: "k9", name: "Clara Vogel", initialen: "CV", standortId: "berlin" },
  { id: "k10", name: "David Krüger", initialen: "DK", standortId: "berlin" },
  { id: "k11", name: "Anja Roth", initialen: "AR", standortId: "muenchen" },
  { id: "k12", name: "Bernd Lang", initialen: "BL", standortId: "muenchen" },
  { id: "k13", name: "Sofia Reim", initialen: "SR", standortId: "zuerich" },
]

// Angekündigte Anwesenheiten siehe `anwesenheitenInitial` weiter unten (CLVN-038).

// --- Aktueller Nutzer ---

export const aktuellerNutzer = {
  id: "me",
  name: "Alex Berger",
  initialen: "AB",
  rolle: "Senior Consultant",
  standortId: "koeln",
}

// --- Angekündigte Büroanwesenheiten (CLVN-038) ---
// Start-Mock kompakt als Datum→IDs ("me" = aktueller Nutzer), expandiert zu Records.
// Diese Liste ist die Quelle der "signalisiert"-Einträge in der Anwesenheitsliste und
// wird zur Laufzeit über den Anwesenheits-Context (CLVN-038) ergänzt.
const ANGEKUENDIGT_MOCK: Record<string, string[]> = {
  "2026-06-17": ["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "k9", "k10"],
  "2026-06-18": ["me", "k1", "k3", "k6", "k11"],
  "2026-06-19": ["k2", "k4", "k9", "k13"],
  "2026-06-22": ["me", "k1", "k2", "k8", "k12"],
  "2026-06-23": ["k5", "k7", "k10"],
}

export const anwesenheitenInitial: Anwesenheit[] = Object.entries(ANGEKUENDIGT_MOCK).flatMap(
  ([datum, ids]) =>
    ids.flatMap((id) => {
      const p =
        id === "me"
          ? {
              id: "me",
              name: aktuellerNutzer.name,
              initialen: aktuellerNutzer.initialen,
              standortId: aktuellerNutzer.standortId,
            }
          : kollegen.find((k) => k.id === id)
      if (!p) return []
      return [
        {
          id: `${id}-${datum}`,
          personId: p.id,
          name: p.name,
          initialen: p.initialen,
          standortId: p.standortId,
          datum,
        },
      ]
    })
)

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

export function getKollege(id: string): Kollege | undefined {
  return kollegen.find((k) => k.id === id)
}

/**
 * Ermittelt die anwesenden Kollegen für einen Standort an einem Datum (CLVN-037).
 *
 * Grundlage sind (a) die angekündigte (signalisierte) Anwesenheit für den Tag (CLVN-038),
 * gefiltert auf den Standort, sowie (b) bestehende Raumbuchungen am Standort/Tag, aus denen
 * sich eine Anwesenheit der buchenden Person ableiten lässt. Datenschutzkonform werden nur
 * Name und Anwesenheitsgrund zurückgegeben.
 */
export function anwesenheitFuer(
  standortId: string,
  datum: string,
  angekuendigte: Anwesenheit[],
  buchungen: Buchung[] = []
): AnwesenheitsEintrag[] {
  const ergebnis = new Map<string, AnwesenheitsEintrag>()

  // (a) Angekündigte Anwesenheit für Standort + Tag.
  for (const a of angekuendigte) {
    if (a.standortId !== standortId || a.datum !== datum) continue
    ergebnis.set(a.personId, {
      kollege: {
        id: a.personId,
        name: a.name,
        initialen: a.initialen,
        standortId: a.standortId,
      },
      grund: "signalisiert",
      istIchSelbst: a.personId === aktuellerNutzer.id,
    })
  }

  // (b) Anwesenheit aus bestehenden Raumbuchungen am Standort/Tag ableiten.
  for (const b of buchungen) {
    if (b.standortId !== standortId || b.datum !== datum || b.status !== "bestätigt") continue
    const istIch = b.gebuchtVon === aktuellerNutzer.name
    const kollege: Kollege | undefined = istIch
      ? {
          id: aktuellerNutzer.id,
          name: aktuellerNutzer.name,
          initialen: aktuellerNutzer.initialen,
          standortId,
        }
      : kollegen.find((k) => k.name === b.gebuchtVon)
    if (!kollege) continue
    if (ergebnis.has(kollege.id)) continue // signalisierte Anwesenheit hat Vorrang
    ergebnis.set(kollege.id, { kollege, grund: "raumbuchung", istIchSelbst: istIch })
  }

  // Eigene Anwesenheit zuerst, sonst alphabetisch nach Name.
  return [...ergebnis.values()].sort((a, b) => {
    if (a.istIchSelbst !== b.istIchSelbst) return a.istIchSelbst ? -1 : 1
    return a.kollege.name.localeCompare(b.kollege.name, "de")
  })
}

// Rückwärtskompatibler Helfer für das Dashboard („Wer ist heute da?"). Liefert die
// anwesenden Kollegen am heutigen Tag, ohne den aktuellen Nutzer selbst.
export const kollegenHeute: Record<string, Kollege[]> = Object.fromEntries(
  standorte.map((s) => [
    s.id,
    anwesenheitFuer(s.id, HEUTE, anwesenheitenInitial)
      .filter((a) => !a.istIchSelbst)
      .map((a) => a.kollege),
  ])
)

// Filtert eine (vom Backend geladene) Belegungsliste auf einen Raum/Tag.
export function belegungenFuerRaum(
  belegungen: Belegung[],
  raumId: string,
  datum: string
): Belegung[] {
  return belegungen.filter((b) => b.raumId === raumId && b.datum === datum)
}

// Standard-Zeitslots (Arbeitstag in Stundenschritten)
export const ZEIT_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
]

// Prüft anhand der übergebenen Belegungen, ob ein Raum in einem Zeitfenster frei ist.
export function istRaumFreiIn(
  belegungen: Belegung[],
  raumId: string,
  datum: string,
  start: string,
  ende: string
): boolean {
  const bel = belegungenFuerRaum(belegungen, raumId, datum)
  return !bel.some((b) => start < b.zeitfenster.ende && ende > b.zeitfenster.start)
}

// Findet das nächste freie Zeitfenster nach der letzten Belegung des Tages.
export function naechsteFreieZeitIn(
  belegungen: Belegung[],
  raumId: string,
  datum: string
): string | null {
  const bel = belegungenFuerRaum(belegungen, raumId, datum).sort((a, b) =>
    a.zeitfenster.ende.localeCompare(b.zeitfenster.ende)
  )
  if (bel.length === 0) return null
  return bel[bel.length - 1].zeitfenster.ende
}

// --- Datums-Helfer für die Büroanwesenheit (CLVN-038) ---

// Addiert eine Anzahl Tage zu einem ISO-Datum und gibt wieder ISO zurück.
export function addiereTage(iso: string, tage: number): string {
  const [jahr, monat, tag] = iso.split("-").map(Number)
  const d = new Date(jahr, monat - 1, tag + tage)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Ein Datum liegt in der Vergangenheit, wenn es vor HEUTE liegt (ISO-String-Vergleich).
export function istVergangen(iso: string): boolean {
  return iso < HEUTE
}

// Die nächsten n Tage ab HEUTE als auswählbare Optionen (für Datums-Selects).
export function naechsteTageOptionen(anzahl = 14): { iso: string; label: string }[] {
  const wt = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
  const mon = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
  const optionen: { iso: string; label: string }[] = []
  for (let i = 0; i < anzahl; i++) {
    const iso = addiereTage(HEUTE, i)
    const [jahr, monat, tag] = iso.split("-").map(Number)
    const d = new Date(jahr, monat - 1, tag)
    const prefix = i === 0 ? "Heute" : i === 1 ? "Morgen" : wt[d.getDay()]
    optionen.push({ iso, label: `${prefix}, ${tag}. ${mon[monat - 1]} ${jahr}` })
  }
  return optionen
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

// --- Datums-Helfer für Serientermine (CLVN-031) ---

// Addiert eine Anzahl Tage auf ein ISO-Datum und gibt wieder ISO zurück.
export function addTage(iso: string, tage: number): string {
  const [jahr, monat, tag] = iso.split("-").map(Number)
  const d = new Date(jahr, monat - 1, tag + tage)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

// Vergleicht zwei ISO-Daten (a < b → negativ, a > b → positiv).
export function vergleicheDatum(a: string, b: string): number {
  return a.localeCompare(b)
}

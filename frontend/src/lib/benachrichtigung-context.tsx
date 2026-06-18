import { createContext, useContext, useState } from "react"
import { HEUTE, type Buchung } from "@/lib/mock-data"

// CLVN-035 — Benachrichtigungen über Aenderungen/Stornierungen eigener Buchungen.
// Im Prototyp komplett gemockt: Stornierungen aus "Meine Buchungen" erzeugen eine
// Benachrichtigung, zusaetzlich gibt es eine vorab als geaendert/abgesagt markierte
// System-Buchung, damit die Glocke direkt etwas Sinnvolles anzeigt.

export type BenachrichtigungsTyp = "storniert" | "geaendert" | "serie-fehlgeschlagen"

export interface BenachrichtigungBuchung {
  raumId: string
  standortId: string
  datum: string
  zeitfenster: { start: string; ende: string }
  titel?: string
}

export interface Benachrichtigung {
  id: string
  typ: BenachrichtigungsTyp
  zeitstempel: string // ISO-Datum/-Zeit der Benachrichtigung
  buchung: BenachrichtigungBuchung
  grund?: string
  gelesen: boolean
}

interface BenachrichtigungContextValue {
  benachrichtigungen: Benachrichtigung[]
  ungeleseneAnzahl: number
  alsGelesenMarkieren: () => void
  einzelnGelesen: (id: string) => void
  stornoBenachrichtigung: (buchung: Buchung) => void
}

const BenachrichtigungContext = createContext<BenachrichtigungContextValue | null>(null)

let idZaehler = 1000
function neueId(): string {
  idZaehler += 1
  return `bn-${idZaehler}`
}

// Vorab gemockte System-Benachrichtigungen (Auslöser außerhalb des Nutzers).
const initialeBenachrichtigungen: Benachrichtigung[] = [
  {
    id: "bn-1",
    typ: "geaendert",
    zeitstempel: `${HEUTE}T08:15:00`,
    buchung: {
      raumId: "koeln-mosel",
      standortId: "koeln",
      datum: HEUTE,
      zeitfenster: { start: "14:00", ende: "16:00" },
      titel: "Architektur-Workshop",
    },
    grund: "Der Raum wurde wegen einer Wartung kurzfristig getauscht.",
    gelesen: false,
  },
  {
    id: "bn-2",
    typ: "serie-fehlgeschlagen",
    zeitstempel: `${HEUTE}T07:50:00`,
    buchung: {
      raumId: "koeln-spessart",
      standortId: "koeln",
      datum: "2026-06-24",
      zeitfenster: { start: "10:00", ende: "11:00" },
      titel: "Wöchentliches Sync",
    },
    grund: "Der Raum war zum gewünschten Zeitpunkt bereits belegt.",
    gelesen: false,
  },
]

export function BenachrichtigungProvider({ children }: { children: React.ReactNode }) {
  const [benachrichtigungen, setBenachrichtigungen] = useState<Benachrichtigung[]>(
    initialeBenachrichtigungen
  )

  const ungeleseneAnzahl = benachrichtigungen.filter((b) => !b.gelesen).length

  const alsGelesenMarkieren = () =>
    setBenachrichtigungen((prev) => prev.map((b) => ({ ...b, gelesen: true })))

  const einzelnGelesen = (id: string) =>
    setBenachrichtigungen((prev) =>
      prev.map((b) => (b.id === id ? { ...b, gelesen: true } : b))
    )

  const stornoBenachrichtigung = (buchung: Buchung) =>
    setBenachrichtigungen((prev) => [
      {
        id: neueId(),
        typ: "storniert",
        zeitstempel: new Date().toISOString(),
        buchung: {
          raumId: buchung.raumId,
          standortId: buchung.standortId,
          datum: buchung.datum,
          zeitfenster: buchung.zeitfenster,
          titel: buchung.titel,
        },
        grund: "Du hast diese Buchung storniert.",
        gelesen: false,
      },
      ...prev,
    ])

  return (
    <BenachrichtigungContext.Provider
      value={{
        benachrichtigungen,
        ungeleseneAnzahl,
        alsGelesenMarkieren,
        einzelnGelesen,
        stornoBenachrichtigung,
      }}
    >
      {children}
    </BenachrichtigungContext.Provider>
  )
}

export function useBenachrichtigung() {
  const ctx = useContext(BenachrichtigungContext)
  if (!ctx)
    throw new Error(
      "useBenachrichtigung muss innerhalb von BenachrichtigungProvider verwendet werden"
    )
  return ctx
}

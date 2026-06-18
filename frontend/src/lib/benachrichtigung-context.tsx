import { createContext, useContext, useMemo, useState } from "react"
import { HEUTE, type Buchung } from "@/lib/mock-data"
import { useBuchung } from "@/lib/buchung-context"
import { erinnerungenAusBuchungen } from "@/lib/benachrichtigungen"

// Vereintes Benachrichtigungs-Center (CLVN-034 + CLVN-035).
// Im Prototyp komplett gemockt. Es vereint zwei Quellen in EINER Glocke:
//  - Erinnerungen (CLVN-034): aus den bestätigten, zukünftigen Buchungen abgeleitet.
//  - Änderungen/Stornierungen (CLVN-035): zustandsbehaftet — Stornierungen aus
//    "Meine Buchungen" erzeugen eine Meldung; zusätzlich gibt es vorab gemockte
//    System-Benachrichtigungen, damit die Glocke direkt etwas Sinnvolles anzeigt.

export type BenachrichtigungsTyp =
  | "storniert"
  | "geaendert"
  | "serie-fehlgeschlagen"
  | "erinnerung"

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
const initialeAenderungen: Benachrichtigung[] = [
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
  const { buchungen } = useBuchung()

  // Zustandsbehaftete Änderungs-/Storno-Benachrichtigungen (CLVN-035).
  const [aenderungen, setAenderungen] = useState<Benachrichtigung[]>(initialeAenderungen)
  // Gelesen-Status der (abgeleiteten) Erinnerungen (CLVN-034) — nur deren IDs.
  const [erinnerungGelesen, setErinnerungGelesen] = useState<Set<string>>(new Set())

  // Erinnerungen aus den Buchungen ableiten und ins Benachrichtigungs-Schema mappen.
  const erinnerungen = useMemo<Benachrichtigung[]>(() => {
    return erinnerungenAusBuchungen(buchungen).map((e) => {
      const b = buchungen.find((x) => x.id === e.buchungId)
      return {
        id: e.id,
        typ: "erinnerung" as const,
        zeitstempel: `${e.datum}T00:00:00`,
        buchung: {
          raumId: b?.raumId ?? "",
          standortId: b?.standortId ?? "",
          datum: e.datum,
          zeitfenster: { start: e.zeitfensterStart, ende: e.zeitfensterEnde },
          titel: e.titel,
        },
        grund: "Erinnerung an deine bevorstehende Buchung.",
        gelesen: erinnerungGelesen.has(e.id),
      }
    })
  }, [buchungen, erinnerungGelesen])

  // Änderungen zuerst (aktuell), dann die Erinnerungen.
  const benachrichtigungen = useMemo<Benachrichtigung[]>(
    () => [...aenderungen, ...erinnerungen],
    [aenderungen, erinnerungen]
  )

  const ungeleseneAnzahl = benachrichtigungen.filter((b) => !b.gelesen).length

  const alsGelesenMarkieren = () => {
    setAenderungen((prev) => prev.map((b) => ({ ...b, gelesen: true })))
    setErinnerungGelesen(new Set(erinnerungen.map((e) => e.id)))
  }

  const einzelnGelesen = (id: string) => {
    if (id.startsWith("erinnerung-")) {
      setErinnerungGelesen((prev) => new Set(prev).add(id))
    } else {
      setAenderungen((prev) =>
        prev.map((b) => (b.id === id ? { ...b, gelesen: true } : b))
      )
    }
  }

  const stornoBenachrichtigung = (buchung: Buchung) =>
    setAenderungen((prev) => [
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

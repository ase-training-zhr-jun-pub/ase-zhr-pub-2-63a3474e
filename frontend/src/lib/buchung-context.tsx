import { createContext, useContext, useEffect, useState } from "react"
import { aktuellerNutzer, type Buchung } from "@/lib/mock-data"
import { getBuchungen, storniereBuchung, storniereSerie } from "@/lib/buchungen-api"

// Wiederholungsrhythmus eines Serientermins (CLVN-031)
export type Wiederholung = "keine" | "woechentlich" | "zweiwoechentlich"

// Wie das Ende der Serie festgelegt wird: per Anzahl der Termine oder per Enddatum.
export type SerienEndeArt = "anzahl" | "enddatum"

// Entwurf einer Buchung während des Wizard-Flows
export interface BuchungsEntwurf {
  standortId?: string
  datum?: string
  startzeit?: string
  endzeit?: string
  raumId?: string
  titel?: string
  notiz?: string
  // Serientermin-Einstellungen (CLVN-031)
  wiederholung?: Wiederholung
  serienEndeArt?: SerienEndeArt
  serienAnzahl?: number
  serienEnddatum?: string
}

interface BuchungContextValue {
  entwurf: BuchungsEntwurf
  setEntwurf: (e: Partial<BuchungsEntwurf>) => void
  entwurfZuruecksetzen: () => void
  buchungen: Buchung[]
  ladenLaeuft: boolean
  buchungHinzufuegen: (b: Buchung) => void
  buchungenHinzufuegen: (bs: Buchung[]) => void
  buchungStornieren: (id: string) => Promise<void>
  serieStornieren: (serienId: string) => Promise<void>
  buchungenNeuLaden: () => Promise<void>
}

const BuchungContext = createContext<BuchungContextValue | null>(null)

export function BuchungProvider({ children }: { children: React.ReactNode }) {
  const [entwurf, setEntwurfState] = useState<BuchungsEntwurf>({})
  const [buchungen, setBuchungen] = useState<Buchung[]>([])
  const [ladenLaeuft, setLadenLaeuft] = useState(true)

  const buchungenNeuLaden = async () => {
    setLadenLaeuft(true)
    try {
      const geladen = await getBuchungen({ nutzer: aktuellerNutzer.name })
      setBuchungen(geladen)
    } finally {
      setLadenLaeuft(false)
    }
  }

  // Eigene Buchungen beim Start aus dem Booking Service laden (CLVN-023).
  useEffect(() => {
    buchungenNeuLaden().catch(() => setLadenLaeuft(false))
  }, [])

  const setEntwurf = (e: Partial<BuchungsEntwurf>) =>
    setEntwurfState((prev) => ({ ...prev, ...e }))

  const entwurfZuruecksetzen = () => setEntwurfState({})

  const buchungHinzufuegen = (b: Buchung) =>
    setBuchungen((prev) => [b, ...prev.filter((x) => x.id !== b.id)])

  // Mehrere Buchungen (z. B. eine Serie) auf einmal in den State übernehmen.
  const buchungenHinzufuegen = (bs: Buchung[]) =>
    setBuchungen((prev) => {
      const neueIds = new Set(bs.map((b) => b.id))
      return [...bs, ...prev.filter((x) => !neueIds.has(x.id))]
    })

  const buchungStornieren = async (id: string) => {
    const aktualisiert = await storniereBuchung(id)
    setBuchungen((prev) => prev.map((b) => (b.id === id ? aktualisiert : b)))
  }

  // Alle Einzeltermine einer Serie auf einmal stornieren (CLVN-031).
  const serieStornieren = async (serienId: string) => {
    const aktualisiert = await storniereSerie(buchungen, serienId)
    const byId = new Map(aktualisiert.map((b) => [b.id, b]))
    setBuchungen((prev) => prev.map((b) => byId.get(b.id) ?? b))
  }

  return (
    <BuchungContext.Provider
      value={{
        entwurf,
        setEntwurf,
        entwurfZuruecksetzen,
        buchungen,
        ladenLaeuft,
        buchungHinzufuegen,
        buchungenHinzufuegen,
        buchungStornieren,
        serieStornieren,
        buchungenNeuLaden,
      }}
    >
      {children}
    </BuchungContext.Provider>
  )
}

export function useBuchung() {
  const ctx = useContext(BuchungContext)
  if (!ctx) throw new Error("useBuchung muss innerhalb von BuchungProvider verwendet werden")
  return ctx
}

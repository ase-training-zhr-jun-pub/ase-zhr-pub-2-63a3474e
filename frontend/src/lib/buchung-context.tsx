import { createContext, useContext, useEffect, useState } from "react"
import { aktuellerNutzer, type Buchung } from "@/lib/mock-data"
import { getBuchungen, storniereBuchung } from "@/lib/buchungen-api"

// Entwurf einer Buchung während des Wizard-Flows
export interface BuchungsEntwurf {
  standortId?: string
  datum?: string
  startzeit?: string
  endzeit?: string
  raumId?: string
  titel?: string
  notiz?: string
}

interface BuchungContextValue {
  entwurf: BuchungsEntwurf
  setEntwurf: (e: Partial<BuchungsEntwurf>) => void
  entwurfZuruecksetzen: () => void
  buchungen: Buchung[]
  ladenLaeuft: boolean
  buchungHinzufuegen: (b: Buchung) => void
  buchungStornieren: (id: string) => Promise<void>
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

  const buchungStornieren = async (id: string) => {
    const aktualisiert = await storniereBuchung(id)
    setBuchungen((prev) => prev.map((b) => (b.id === id ? aktualisiert : b)))
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
        buchungStornieren,
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

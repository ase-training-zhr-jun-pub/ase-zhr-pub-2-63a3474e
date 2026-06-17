import { createContext, useContext, useState } from "react"
import {
  meineBuchungen as initialeBuchungen,
  type Buchung,
} from "@/lib/mock-data"

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
  buchungHinzufuegen: (b: Buchung) => void
  buchungStornieren: (id: string) => void
}

const BuchungContext = createContext<BuchungContextValue | null>(null)

export function BuchungProvider({ children }: { children: React.ReactNode }) {
  const [entwurf, setEntwurfState] = useState<BuchungsEntwurf>({})
  const [buchungen, setBuchungen] = useState<Buchung[]>(initialeBuchungen)

  const setEntwurf = (e: Partial<BuchungsEntwurf>) =>
    setEntwurfState((prev) => ({ ...prev, ...e }))

  const entwurfZuruecksetzen = () => setEntwurfState({})

  const buchungHinzufuegen = (b: Buchung) =>
    setBuchungen((prev) => [b, ...prev])

  const buchungStornieren = (id: string) =>
    setBuchungen((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "storniert" } : b))
    )

  return (
    <BuchungContext.Provider
      value={{
        entwurf,
        setEntwurf,
        entwurfZuruecksetzen,
        buchungen,
        buchungHinzufuegen,
        buchungStornieren,
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

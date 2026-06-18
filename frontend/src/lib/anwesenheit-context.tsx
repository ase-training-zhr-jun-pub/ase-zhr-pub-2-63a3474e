import { createContext, useContext, useMemo, useState } from "react"
import {
  aktuellerNutzer,
  anwesenheitenInitial,
  istVergangen,
  type Anwesenheit,
} from "@/lib/mock-data"

// Context für angekündigte Büroanwesenheiten (CLVN-038). Im Prototyp wird der
// Zustand rein im Frontend gehalten; ein Backend wird später angestöpselt.
interface AnwesenheitContextValue {
  anwesenheiten: Anwesenheit[]
  // Alle Anwesenheiten für einen Standort + Tag (für die Kollegen-Übersicht).
  anwesenheitenFuer: (standortId: string, datum: string) => Anwesenheit[]
  // Ist der aktuelle Nutzer für Standort + Tag bereits angekündigt?
  eigeneAnwesenheit: (standortId: string, datum: string) => Anwesenheit | undefined
  // Eigene Anwesenheit ankündigen. Gibt false zurück, wenn nicht möglich
  // (vergangener Tag oder bereits angekündigt).
  ankuendigen: (standortId: string, datum: string) => boolean
  // Eigene Anwesenheit (per id) wieder entfernen.
  entfernen: (id: string) => void
}

const AnwesenheitContext = createContext<AnwesenheitContextValue | null>(null)

export function AnwesenheitProvider({ children }: { children: React.ReactNode }) {
  const [anwesenheiten, setAnwesenheiten] = useState<Anwesenheit[]>(anwesenheitenInitial)

  const value = useMemo<AnwesenheitContextValue>(() => {
    const anwesenheitenFuer = (standortId: string, datum: string) =>
      anwesenheiten
        .filter((a) => a.standortId === standortId && a.datum === datum)
        .sort((a, b) => a.name.localeCompare(b.name))

    const eigeneAnwesenheit = (standortId: string, datum: string) =>
      anwesenheiten.find(
        (a) =>
          a.personId === aktuellerNutzer.id &&
          a.standortId === standortId &&
          a.datum === datum,
      )

    const ankuendigen = (standortId: string, datum: string) => {
      // Vergangene Tage können nicht angekündigt werden.
      if (istVergangen(datum)) return false
      // Doppelte Ankündigung vermeiden.
      if (eigeneAnwesenheit(standortId, datum)) return false
      const neu: Anwesenheit = {
        id: `me-${standortId}-${datum}`,
        personId: aktuellerNutzer.id,
        name: aktuellerNutzer.name,
        initialen: aktuellerNutzer.initialen,
        standortId,
        datum,
      }
      setAnwesenheiten((prev) => [...prev, neu])
      return true
    }

    const entfernen = (id: string) => {
      // Nur die eigene Anwesenheit darf entfernt werden.
      setAnwesenheiten((prev) =>
        prev.filter((a) => !(a.id === id && a.personId === aktuellerNutzer.id)),
      )
    }

    return { anwesenheiten, anwesenheitenFuer, eigeneAnwesenheit, ankuendigen, entfernen }
  }, [anwesenheiten])

  return (
    <AnwesenheitContext.Provider value={value}>{children}</AnwesenheitContext.Provider>
  )
}

export function useAnwesenheit() {
  const ctx = useContext(AnwesenheitContext)
  if (!ctx)
    throw new Error("useAnwesenheit muss innerhalb von AnwesenheitProvider verwendet werden")
  return ctx
}

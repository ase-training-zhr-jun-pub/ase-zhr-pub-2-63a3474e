// API-Client für den Booking Service. Kapselt alle HTTP-Aufrufe zu /api/buchungen
// und /api/verfuegbarkeit. Die JSON-Form der Buchung entspricht exakt dem Typ `Buchung`
// aus mock-data, sodass keine Umformung nötig ist.
//
// URLs werden über apiUrl() gebaut (proxy-tauglich, siehe lib/api.ts).

import { apiUrl } from "@/lib/api"
import type { Buchung, Belegung } from "@/lib/mock-data"

export interface NeueBuchungAnfrage {
  raumId: string
  standortId: string
  datum: string
  start: string
  ende: string
  titel: string
  notiz?: string
  gebuchtVon: string
  // Optional: kennzeichnet die Buchung als Teil eines Serientermins (CLVN-031).
  serienId?: string
}

interface BuchungFilter {
  nutzer?: string
  standortId?: string
  datum?: string
  raumId?: string
}

/** Wird geworfen, wenn der Raum zwischenzeitlich belegt wurde (HTTP 409, QS-1). */
export class RaumBereitsBelegtError extends Error {
  readonly naechsteFreieZeit?: string
  constructor(message: string, naechsteFreieZeit?: string) {
    super(message)
    this.name = "RaumBereitsBelegtError"
    this.naechsteFreieZeit = naechsteFreieZeit
  }
}

function queryString(filter: BuchungFilter): string {
  const params = new URLSearchParams()
  if (filter.nutzer) params.set("nutzer", filter.nutzer)
  if (filter.standortId) params.set("standortId", filter.standortId)
  if (filter.datum) params.set("datum", filter.datum)
  if (filter.raumId) params.set("raumId", filter.raumId)
  const s = params.toString()
  return s ? `?${s}` : ""
}

/** Lädt Buchungen, optional gefiltert (Buchungsübersicht CLVN-023). */
export async function getBuchungen(filter: BuchungFilter = {}): Promise<Buchung[]> {
  const res = await fetch(apiUrl(`/api/buchungen${queryString(filter)}`))
  if (!res.ok) throw new Error(`Buchungen konnten nicht geladen werden (HTTP ${res.status})`)
  return res.json()
}

/**
 * Lädt die bestätigten Belegungen für einen Standort an einem Datum — Grundlage der
 * Verfügbarkeitsanzeige in der Raumliste und im Kalender (CLVN-010).
 */
export async function ladeBelegungen(standortId: string, datum: string): Promise<Belegung[]> {
  const buchungen = await getBuchungen({ standortId, datum })
  return buchungen
    .filter((b) => b.status === "bestätigt")
    .map((b) => ({
      raumId: b.raumId,
      datum: b.datum,
      zeitfenster: b.zeitfenster,
      titel: b.titel,
    }))
}

/**
 * Legt eine Buchung verbindlich an (CLVN-019).
 *
 * @throws RaumBereitsBelegtError bei einer Doppelbuchung (HTTP 409)
 */
export async function createBuchung(anfrage: NeueBuchungAnfrage): Promise<Buchung> {
  const res = await fetch(apiUrl("/api/buchungen"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(anfrage),
  })
  if (res.status === 409) {
    const fehler = await res.json().catch(() => ({}))
    throw new RaumBereitsBelegtError(
      fehler.fehler ?? "Der Raum ist im gewünschten Zeitraum bereits belegt.",
      fehler.naechsteFreieZeit ?? undefined
    )
  }
  if (!res.ok) throw new Error(`Buchung fehlgeschlagen (HTTP ${res.status})`)
  return res.json()
}

/** Storniert eine Buchung und gibt den Raum wieder frei (CLVN-026). */
export async function storniereBuchung(id: string): Promise<Buchung> {
  const res = await fetch(apiUrl(`/api/buchungen/${encodeURIComponent(id)}/stornierung`), {
    method: "POST",
  })
  if (!res.ok) throw new Error(`Stornierung fehlgeschlagen (HTTP ${res.status})`)
  return res.json()
}

// --- Serientermine (CLVN-031) ---

/** Ein Einzeltermin einer geplanten Serie mit dem Ergebnis der Verfügbarkeitsprüfung. */
export interface SerienTermin {
  datum: string // ISO "YYYY-MM-DD"
  start: string
  ende: string
  /** false, wenn der Raum an diesem Termin bereits belegt ist (Konflikt). */
  frei: boolean
  /** Titel der kollidierenden Buchung, falls belegt. */
  konfliktTitel?: string
}

/**
 * Prüft jeden vorgeschlagenen Einzeltermin einer Serie auf Verfügbarkeit des
 * Konferenzraums (Akzeptanzkriterium: jeder Termin wird separat geprüft, QS-1).
 *
 * Lädt dazu die bestätigten Buchungen des Raums und vergleicht die Zeitfenster.
 */
export async function pruefeSerienVerfuegbarkeit(
  raumId: string,
  termine: { datum: string; start: string; ende: string }[]
): Promise<SerienTermin[]> {
  const buchungen = (await getBuchungen({ raumId })).filter(
    (b) => b.status === "bestätigt"
  )
  return termine.map((t) => {
    const kollision = buchungen.find(
      (b) =>
        b.datum === t.datum &&
        t.start < b.zeitfenster.ende &&
        t.ende > b.zeitfenster.start
    )
    return {
      ...t,
      frei: !kollision,
      konfliktTitel: kollision?.titel,
    }
  })
}

export interface SerienBuchungAnfrage {
  raumId: string
  standortId: string
  titel: string
  notiz?: string
  gebuchtVon: string
  termine: { datum: string; start: string; ende: string }[]
}

/** Ergebnis einer Serienbuchung: erfolgreich angelegte und fehlgeschlagene Termine. */
export interface SerienBuchungErgebnis {
  serienId: string
  gebucht: Buchung[]
  fehlgeschlagen: { datum: string; grund: string }[]
}

/**
 * Legt mehrere Einzeltermine als zusammengehörige Serie an. Alle Buchungen erhalten
 * dieselbe serienId. Schlägt ein Einzeltermin fehl (z. B. zwischenzeitlich belegt),
 * werden die übrigen trotzdem gebucht (best effort) und der Fehler gemeldet.
 */
export async function createSerie(
  anfrage: SerienBuchungAnfrage
): Promise<SerienBuchungErgebnis> {
  const serienId = `serie-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const gebucht: Buchung[] = []
  const fehlgeschlagen: { datum: string; grund: string }[] = []

  for (const t of anfrage.termine) {
    try {
      const buchung = await createBuchung({
        raumId: anfrage.raumId,
        standortId: anfrage.standortId,
        datum: t.datum,
        start: t.start,
        ende: t.ende,
        titel: anfrage.titel,
        notiz: anfrage.notiz,
        gebuchtVon: anfrage.gebuchtVon,
        serienId,
      })
      gebucht.push(buchung)
    } catch (e) {
      const grund =
        e instanceof RaumBereitsBelegtError
          ? "Raum zwischenzeitlich belegt"
          : "Buchung fehlgeschlagen"
      fehlgeschlagen.push({ datum: t.datum, grund })
    }
  }

  return { serienId, gebucht, fehlgeschlagen }
}

/**
 * Storniert alle (noch bestätigten) Termine einer Serie in einem Schritt (CLVN-031).
 * Gibt die aktualisierten Buchungen zurück.
 */
export async function storniereSerie(
  buchungen: Buchung[],
  serienId: string
): Promise<Buchung[]> {
  const zuStornieren = buchungen.filter(
    (b) => b.serienId === serienId && b.status === "bestätigt"
  )
  const ergebnisse: Buchung[] = []
  for (const b of zuStornieren) {
    ergebnisse.push(await storniereBuchung(b.id))
  }
  return ergebnisse
}

// Gemockte Benachrichtigungs-Logik für Buchungserinnerungen (CLVN-034).
//
// Aus den Buchungen des Nutzers werden Erinnerungen abgeleitet: Für jede
// BESTÄTIGTE, ZUKÜNFTIGE Buchung, die innerhalb des konfigurierten Vorlaufs liegt,
// entsteht genau eine Erinnerung. Stornierte und vergangene Buchungen werden
// bewusst ausgeklammert.
//
// Da der Prototyp ohne echtes "Jetzt" arbeitet, dient HEUTE aus mock-data als
// Referenztag. Der Vorlauf wird in Tagen angegeben (z. B. 3 = Erinnerung für
// Buchungen der nächsten drei Tage inkl. heute).

import { getRaum, getStandort, HEUTE, type Buchung } from "@/lib/mock-data"

export interface Erinnerung {
  id: string
  buchungId: string
  raumName: string
  standortName: string
  datum: string // ISO "YYYY-MM-DD"
  zeitfensterStart: string // "HH:MM"
  zeitfensterEnde: string // "HH:MM"
  titel: string
}

/** Standard-Vorlauf in Tagen, mit dem Erinnerungen erzeugt werden. */
export const STANDARD_VORLAUF_TAGE = 3

/** Addiert eine Anzahl Tage auf ein ISO-Datum und gibt wieder ISO zurück. */
function datumPlusTage(iso: string, tage: number): string {
  const [jahr, monat, tag] = iso.split("-").map(Number)
  const d = new Date(jahr, monat - 1, tag + tage)
  const j = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const t = String(d.getDate()).padStart(2, "0")
  return `${j}-${m}-${t}`
}

/**
 * Leitet aus den Buchungen die fälligen Erinnerungen ab.
 *
 * Berücksichtigt werden ausschließlich bestätigte, zukünftige (inkl. heute)
 * Buchungen, deren Datum innerhalb des Vorlaufs liegt. Das Ergebnis ist nach
 * Datum/Startzeit aufsteigend sortiert (die nächste Buchung zuerst).
 */
export function erinnerungenAusBuchungen(
  buchungen: Buchung[],
  vorlaufTage: number = STANDARD_VORLAUF_TAGE,
  heute: string = HEUTE
): Erinnerung[] {
  const grenze = datumPlusTage(heute, Math.max(0, vorlaufTage))

  return buchungen
    .filter(
      (b) =>
        b.status === "bestätigt" && // keine stornierten Buchungen
        b.datum >= heute && // keine vergangenen Buchungen
        b.datum <= grenze // nur innerhalb des Vorlaufs
    )
    .sort(
      (a, b) =>
        a.datum.localeCompare(b.datum) ||
        a.zeitfenster.start.localeCompare(b.zeitfenster.start)
    )
    .map((b) => ({
      id: `erinnerung-${b.id}`,
      buchungId: b.id,
      raumName: getRaum(b.raumId)?.name ?? b.raumId,
      standortName: getStandort(b.standortId)?.name ?? b.standortId,
      datum: b.datum,
      zeitfensterStart: b.zeitfenster.start,
      zeitfensterEnde: b.zeitfenster.ende,
      titel: b.titel,
    }))
}

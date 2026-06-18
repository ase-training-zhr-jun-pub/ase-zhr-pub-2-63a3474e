// Berechnung der Einzeltermine eines Serientermins (CLVN-031).
//
// Aus dem ersten Termin (Startdatum + Zeitfenster), dem Rhythmus und der
// Endbedingung (Anzahl ODER Enddatum) werden die konkreten Einzeltermine erzeugt.
// Reine Logik ohne UI/State, damit sie leicht wiederverwendbar und prüfbar bleibt.

import { addTage } from "@/lib/mock-data"
import type { BuchungsEntwurf } from "@/lib/buchung-context"

export interface BerechneterTermin {
  datum: string // ISO "YYYY-MM-DD"
  start: string
  ende: string
}

// Obergrenze, damit eine fehlerhafte Eingabe (z. B. weit entferntes Enddatum)
// keine endlose Terminliste erzeugt.
const MAX_TERMINE = 52

/**
 * Erzeugt die Einzeltermine einer Serie aus dem Buchungsentwurf.
 * Bei `wiederholung === "keine"` wird genau ein Termin zurückgegeben.
 */
export function berechneSerienTermine(entwurf: BuchungsEntwurf): BerechneterTermin[] {
  const { datum, startzeit, endzeit, wiederholung } = entwurf
  if (!datum || !startzeit || !endzeit) return []

  const einzel: BerechneterTermin = { datum, start: startzeit, ende: endzeit }
  if (!wiederholung || wiederholung === "keine") return [einzel]

  const schrittTage = wiederholung === "zweiwoechentlich" ? 14 : 7

  // Maximale Terminanzahl je nach Endbedingung bestimmen.
  let maxAnzahl = MAX_TERMINE
  if (entwurf.serienEndeArt === "anzahl" && entwurf.serienAnzahl) {
    maxAnzahl = Math.min(entwurf.serienAnzahl, MAX_TERMINE)
  }

  const termine: BerechneterTermin[] = []
  let aktuellesDatum = datum
  for (let i = 0; i < maxAnzahl; i++) {
    if (
      entwurf.serienEndeArt === "enddatum" &&
      entwurf.serienEnddatum &&
      aktuellesDatum > entwurf.serienEnddatum
    ) {
      break
    }
    termine.push({ datum: aktuellesDatum, start: startzeit, ende: endzeit })
    aktuellesDatum = addTage(aktuellesDatum, schrittTage)
  }

  return termine
}

/** Kurzbeschreibung des Rhythmus für die Anzeige. */
export function wiederholungLabel(entwurf: BuchungsEntwurf): string {
  switch (entwurf.wiederholung) {
    case "woechentlich":
      return "Wöchentlich"
    case "zweiwoechentlich":
      return "Alle zwei Wochen"
    default:
      return "Einzeltermin"
  }
}

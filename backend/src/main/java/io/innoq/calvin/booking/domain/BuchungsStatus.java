package io.innoq.calvin.booking.domain;

/** Status einer Raumbuchung im Lebenszyklus. */
public enum BuchungsStatus {
  /** Verbindlich reserviert; blockiert den Konferenzraum im Zeitfenster. */
  BESTAETIGT,
  /** Vom Mitarbeiter zurückgenommen; gibt den Konferenzraum wieder frei. */
  STORNIERT
}

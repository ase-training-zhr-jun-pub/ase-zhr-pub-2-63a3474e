package io.innoq.calvin.booking.application.port.in;

import java.time.LocalDate;

/**
 * Filterkriterien für die Buchungsabfrage. Alle Felder sind optional (null = nicht filtern).
 *
 * @param nutzer nur Buchungen dieses Mitarbeiters (für die Buchungsübersicht, CLVN-023)
 * @param standortId nur Buchungen an diesem Standort
 * @param datum nur Buchungen an diesem Datum
 * @param raumId nur Buchungen für diesen Raum
 */
public record BuchungFilter(String nutzer, String standortId, LocalDate datum, String raumId) {

  public static BuchungFilter leer() {
    return new BuchungFilter(null, null, null, null);
  }
}

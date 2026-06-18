package io.innoq.calvin.booking.application.port.in;

import io.innoq.calvin.booking.domain.Buchung;

/** Eingehender Port: Eine Buchung stornieren und den Raum wieder freigeben (CLVN-026). */
public interface BuchungStornierenUseCase {

  /**
   * Storniert die Buchung mit der gegebenen ID.
   *
   * @throws BuchungNichtGefundenException wenn keine Buchung mit dieser ID existiert
   */
  Buchung storniere(String id);
}

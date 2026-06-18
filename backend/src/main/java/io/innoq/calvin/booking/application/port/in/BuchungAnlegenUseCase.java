package io.innoq.calvin.booking.application.port.in;

import io.innoq.calvin.booking.domain.Buchung;
import io.innoq.calvin.booking.domain.RaumBereitsBelegtException;

/** Eingehender Port: Eine Raumbuchung verbindlich anlegen (CLVN-019). */
public interface BuchungAnlegenUseCase {

  /**
   * Legt die Buchung an, sofern der Raum im Zeitfenster frei ist.
   *
   * @throws RaumBereitsBelegtException wenn der Raum bereits belegt ist (Doppelbuchung, QS-1)
   */
  Buchung anlegen(NeueBuchungBefehl befehl);
}

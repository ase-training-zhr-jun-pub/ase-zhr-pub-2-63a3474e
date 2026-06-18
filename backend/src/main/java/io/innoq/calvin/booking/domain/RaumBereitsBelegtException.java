package io.innoq.calvin.booking.domain;

import java.time.LocalTime;
import java.util.Optional;

/**
 * Wird ausgelöst, wenn ein Konferenzraum für das gewünschte Zeitfenster bereits durch eine
 * bestätigte Buchung belegt ist. Verhindert Doppelbuchungen ([QS-1]).
 *
 * <p>Trägt optional die nächste freie Zeit, damit dem Mitarbeiter ein alternatives Zeitfenster
 * vorgeschlagen werden kann.
 */
public class RaumBereitsBelegtException extends RuntimeException {

  private final transient Optional<LocalTime> naechsteFreieZeit;

  public RaumBereitsBelegtException(String raumId, Optional<LocalTime> naechsteFreieZeit) {
    super("Der Konferenzraum %s ist im gewünschten Zeitraum bereits belegt".formatted(raumId));
    this.naechsteFreieZeit = naechsteFreieZeit;
  }

  public Optional<LocalTime> naechsteFreieZeit() {
    return naechsteFreieZeit;
  }
}

package io.innoq.calvin.booking.application.port.in;

/** Wird ausgelöst, wenn eine angefragte Buchung nicht existiert. */
public class BuchungNichtGefundenException extends RuntimeException {

  public BuchungNichtGefundenException(String id) {
    super("Keine Buchung mit der ID %s gefunden".formatted(id));
  }
}

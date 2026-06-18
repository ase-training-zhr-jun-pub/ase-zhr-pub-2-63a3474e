package io.innoq.calvin.booking.adapter.in.web;

import io.innoq.calvin.booking.adapter.in.web.dto.FehlerAntwort;
import io.innoq.calvin.booking.application.port.in.BuchungNichtGefundenException;
import io.innoq.calvin.booking.domain.RaumBereitsBelegtException;
import java.time.format.DateTimeFormatter;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Übersetzt Domänen-/Anwendungsfehler in passende HTTP-Antworten mit verständlichem Body. */
@RestControllerAdvice
class GlobalExceptionHandler {

  private static final DateTimeFormatter ZEIT = DateTimeFormatter.ofPattern("HH:mm");

  /** Doppelbuchung → 409 Conflict, inkl. Vorschlag für die nächste freie Zeit (QS-1, CLVN-019). */
  @ExceptionHandler(RaumBereitsBelegtException.class)
  ResponseEntity<FehlerAntwort> raumBelegt(RaumBereitsBelegtException e) {
    String alternative = e.naechsteFreieZeit().map(t -> t.format(ZEIT)).orElse(null);
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(new FehlerAntwort(e.getMessage(), alternative));
  }

  @ExceptionHandler(BuchungNichtGefundenException.class)
  ResponseEntity<FehlerAntwort> nichtGefunden(BuchungNichtGefundenException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new FehlerAntwort(e.getMessage()));
  }

  /** Ungültige Eingaben (z. B. kaputtes Datum/Uhrzeit, ende ≤ start) → 400 Bad Request. */
  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<FehlerAntwort> ungueltig(IllegalArgumentException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new FehlerAntwort(e.getMessage()));
  }

  /**
   * Anhaltender Serialisierungskonflikt trotz Wiederholungen (sehr seltene Last-Spitze) → 503,
   * damit der Client den Versuch später wiederholen kann (QS-1 bleibt gewahrt, keine
   * Doppelbuchung).
   */
  @ExceptionHandler(ConcurrencyFailureException.class)
  ResponseEntity<FehlerAntwort> nebenlaeufigkeit(ConcurrencyFailureException e) {
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .body(
            new FehlerAntwort(
                "Die Buchung konnte wegen gleichzeitiger Anfragen nicht abgeschlossen werden."
                    + " Bitte erneut versuchen."));
  }
}

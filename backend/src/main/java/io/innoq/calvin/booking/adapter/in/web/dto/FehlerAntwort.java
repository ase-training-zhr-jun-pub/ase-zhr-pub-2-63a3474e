package io.innoq.calvin.booking.adapter.in.web.dto;

/**
 * Einheitlicher Fehler-Body. Bei einem Buchungskonflikt enthält {@code naechsteFreieZeit} optional
 * einen Vorschlag für ein alternatives Zeitfenster (QS-1 / CLVN-019).
 */
public record FehlerAntwort(String fehler, String naechsteFreieZeit) {

  public FehlerAntwort(String fehler) {
    this(fehler, null);
  }
}

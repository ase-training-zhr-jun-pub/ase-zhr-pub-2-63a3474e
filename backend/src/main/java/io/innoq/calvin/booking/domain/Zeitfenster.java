package io.innoq.calvin.booking.domain;

import java.time.LocalTime;

/**
 * Wertobjekt für einen Zeitraum innerhalb eines Tages (Start bis Ende).
 *
 * <p>Ein Zeitfenster ist immer gültig: Das Ende liegt echt nach dem Start. Die Überschneidungslogik
 * ist Teil der Domäne und Grundlage der Doppelbuchungs-Prüfung (QS-1).
 */
public record Zeitfenster(LocalTime start, LocalTime ende) {

  public Zeitfenster {
    if (start == null || ende == null) {
      throw new IllegalArgumentException(
          "Start und Ende eines Zeitfensters dürfen nicht null sein");
    }
    if (!ende.isAfter(start)) {
      throw new IllegalArgumentException(
          "Die Endzeit (%s) muss nach der Startzeit (%s) liegen".formatted(ende, start));
    }
  }

  /**
   * Prüft, ob sich dieses Zeitfenster mit einem anderen überschneidet. Aneinandergrenzende Fenster
   * (z. B. 09:00–10:00 und 10:00–11:00) überschneiden sich nicht.
   */
  public boolean ueberschneidetSich(Zeitfenster anderes) {
    return start.isBefore(anderes.ende) && ende.isAfter(anderes.start);
  }
}

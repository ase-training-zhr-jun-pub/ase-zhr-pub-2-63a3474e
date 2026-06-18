package io.innoq.calvin.booking.application.port.in;

import io.innoq.calvin.booking.domain.Buchung;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Ergebnis einer Verfügbarkeitsprüfung (CLVN-010).
 *
 * @param verfuegbar true, wenn der Raum im gewünschten Zeitfenster frei ist
 * @param naechsteFreieZeit bei Belegung die nächste freie Zeit (Ende der letzten Belegung)
 * @param konflikte die bestätigten Buchungen, die das Zeitfenster blockieren
 */
public record Verfuegbarkeit(
    boolean verfuegbar, Optional<LocalTime> naechsteFreieZeit, List<Buchung> konflikte) {}

package io.innoq.calvin.booking.adapter.in.web.dto;

/**
 * Ergebnis der Verfügbarkeitsprüfung im JSON-Vertrag.
 *
 * @param verfuegbar true, wenn der Raum im Zeitfenster frei ist
 * @param naechsteFreieZeit "HH:MM" der nächsten freien Zeit bei Belegung, sonst null
 */
public record VerfuegbarkeitDto(boolean verfuegbar, String naechsteFreieZeit) {}

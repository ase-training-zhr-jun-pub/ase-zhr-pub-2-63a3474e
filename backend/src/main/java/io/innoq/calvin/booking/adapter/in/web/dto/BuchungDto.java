package io.innoq.calvin.booking.adapter.in.web.dto;

/**
 * Buchung im JSON-Vertrag mit der SPA. Datum als ISO "YYYY-MM-DD", Status als "bestätigt" /
 * "storniert" (passend zu den Mock-Typen der SPA).
 */
public record BuchungDto(
    String id,
    String raumId,
    String standortId,
    String datum,
    ZeitfensterDto zeitfenster,
    String titel,
    String notiz,
    String status,
    String gebuchtVon) {}

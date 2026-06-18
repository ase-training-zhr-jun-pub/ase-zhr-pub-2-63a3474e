package io.innoq.calvin.booking.adapter.in.web.dto;

/** Anfrage-Body zum Anlegen einer Buchung (POST /api/buchungen). */
public record NeueBuchungAnfrage(
    String raumId,
    String standortId,
    String datum,
    String start,
    String ende,
    String titel,
    String notiz,
    String gebuchtVon) {}

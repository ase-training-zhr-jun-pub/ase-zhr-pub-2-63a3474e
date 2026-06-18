package io.innoq.calvin.booking.adapter.in.web;

import io.innoq.calvin.booking.adapter.in.web.dto.BuchungDto;
import io.innoq.calvin.booking.adapter.in.web.dto.NeueBuchungAnfrage;
import io.innoq.calvin.booking.adapter.in.web.dto.ZeitfensterDto;
import io.innoq.calvin.booking.application.port.in.NeueBuchungBefehl;
import io.innoq.calvin.booking.domain.Buchung;
import io.innoq.calvin.booking.domain.BuchungsStatus;
import io.innoq.calvin.booking.domain.Zeitfenster;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/** Übersetzt zwischen Domänentypen und dem JSON-Vertrag (DTOs) der SPA. */
final class BuchungWebMapper {

  // "HH:MM" — bewusst ohne Sekunden, passend zum SPA-Vertrag.
  private static final DateTimeFormatter ZEIT = DateTimeFormatter.ofPattern("HH:mm");

  private BuchungWebMapper() {}

  static BuchungDto zuDto(Buchung b) {
    return new BuchungDto(
        b.id(),
        b.raumId(),
        b.standortId(),
        b.datum().toString(),
        new ZeitfensterDto(
            b.zeitfenster().start().format(ZEIT), b.zeitfenster().ende().format(ZEIT)),
        b.titel(),
        b.notiz(),
        statusZuString(b.status()),
        b.gebuchtVon());
  }

  static NeueBuchungBefehl zuBefehl(NeueBuchungAnfrage anfrage) {
    return new NeueBuchungBefehl(
        anfrage.raumId(),
        anfrage.standortId(),
        parseDatum(anfrage.datum()),
        new Zeitfenster(parseZeit(anfrage.start()), parseZeit(anfrage.ende())),
        anfrage.titel(),
        anfrage.notiz(),
        anfrage.gebuchtVon());
  }

  static String statusZuString(BuchungsStatus status) {
    return switch (status) {
      case BESTAETIGT -> "bestätigt";
      case STORNIERT -> "storniert";
    };
  }

  static LocalDate parseDatum(String iso) {
    try {
      return LocalDate.parse(iso);
    } catch (RuntimeException e) {
      throw new IllegalArgumentException("Ungültiges Datum: " + iso);
    }
  }

  static LocalTime parseZeit(String hhmm) {
    try {
      return LocalTime.parse(hhmm);
    } catch (RuntimeException e) {
      throw new IllegalArgumentException("Ungültige Uhrzeit: " + hhmm);
    }
  }
}

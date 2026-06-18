package io.innoq.calvin.booking.application.port.in;

import io.innoq.calvin.booking.domain.Zeitfenster;
import java.time.LocalDate;

/** Eingabedaten für das Anlegen einer neuen Raumbuchung. */
public record NeueBuchungBefehl(
    String raumId,
    String standortId,
    LocalDate datum,
    Zeitfenster zeitfenster,
    String titel,
    String notiz,
    String gebuchtVon) {}

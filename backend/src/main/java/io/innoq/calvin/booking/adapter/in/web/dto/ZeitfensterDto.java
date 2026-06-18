package io.innoq.calvin.booking.adapter.in.web.dto;

/** Zeitfenster im JSON-Vertrag mit der SPA: Zeiten als "HH:MM". */
public record ZeitfensterDto(String start, String ende) {}

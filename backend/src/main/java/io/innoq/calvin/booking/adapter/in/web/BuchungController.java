package io.innoq.calvin.booking.adapter.in.web;

import io.innoq.calvin.booking.adapter.in.web.dto.BuchungDto;
import io.innoq.calvin.booking.adapter.in.web.dto.NeueBuchungAnfrage;
import io.innoq.calvin.booking.application.port.in.BuchungAnlegenUseCase;
import io.innoq.calvin.booking.application.port.in.BuchungFilter;
import io.innoq.calvin.booking.application.port.in.BuchungNichtGefundenException;
import io.innoq.calvin.booking.application.port.in.BuchungStornierenUseCase;
import io.innoq.calvin.booking.application.port.in.BuchungenAbfragenUseCase;
import io.innoq.calvin.booking.domain.Buchung;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST-Adapter für Raumbuchungen. Dünner Adapter: delegiert an die Use Cases, enthält keine
 * Geschäftslogik.
 *
 * <ul>
 *   <li>{@code GET /api/buchungen} — Buchungsübersicht, optional gefiltert (CLVN-023)
 *   <li>{@code GET /api/buchungen/{id}} — einzelne Buchung / Bestätigung (CLVN-020)
 *   <li>{@code POST /api/buchungen} — Buchung absenden (CLVN-019); 409 bei Doppelbuchung (QS-1)
 *   <li>{@code POST /api/buchungen/{id}/stornierung} — Buchung stornieren (CLVN-026)
 * </ul>
 */
@RestController
@RequestMapping("/api/buchungen")
class BuchungController {

  private final BuchungAnlegenUseCase anlegen;
  private final BuchungenAbfragenUseCase abfragen;
  private final BuchungStornierenUseCase stornieren;

  BuchungController(
      BuchungAnlegenUseCase anlegen,
      BuchungenAbfragenUseCase abfragen,
      BuchungStornierenUseCase stornieren) {
    this.anlegen = anlegen;
    this.abfragen = abfragen;
    this.stornieren = stornieren;
  }

  @GetMapping
  List<BuchungDto> liste(
      @RequestParam(required = false) String nutzer,
      @RequestParam(required = false) String standortId,
      @RequestParam(required = false) String datum,
      @RequestParam(required = false) String raumId) {
    LocalDate tag = datum == null ? null : BuchungWebMapper.parseDatum(datum);
    return abfragen.finde(new BuchungFilter(nutzer, standortId, tag, raumId)).stream()
        .map(BuchungWebMapper::zuDto)
        .toList();
  }

  @GetMapping("/{id}")
  ResponseEntity<BuchungDto> einzeln(@PathVariable String id) {
    return abfragen
        .findeById(id)
        .map(BuchungWebMapper::zuDto)
        .map(ResponseEntity::ok)
        .orElseThrow(() -> new BuchungNichtGefundenException(id));
  }

  @PostMapping
  ResponseEntity<BuchungDto> anlegen(@RequestBody NeueBuchungAnfrage anfrage) {
    Buchung buchung = anlegen.anlegen(BuchungWebMapper.zuBefehl(anfrage));
    return ResponseEntity.created(URI.create("/api/buchungen/" + buchung.id()))
        .body(BuchungWebMapper.zuDto(buchung));
  }

  @PostMapping("/{id}/stornierung")
  BuchungDto stornieren(@PathVariable String id) {
    return BuchungWebMapper.zuDto(stornieren.storniere(id));
  }
}

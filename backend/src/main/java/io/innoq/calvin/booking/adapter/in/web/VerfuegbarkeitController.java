package io.innoq.calvin.booking.adapter.in.web;

import io.innoq.calvin.booking.adapter.in.web.dto.VerfuegbarkeitDto;
import io.innoq.calvin.booking.application.port.in.Verfuegbarkeit;
import io.innoq.calvin.booking.application.port.in.VerfuegbarkeitPruefenUseCase;
import io.innoq.calvin.booking.domain.Zeitfenster;
import java.time.format.DateTimeFormatter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST-Adapter für die Verfügbarkeitsprüfung eines Konferenzraums (CLVN-010).
 *
 * <p>{@code GET /api/verfuegbarkeit?raumId=&datum=&start=&ende=}
 */
@RestController
class VerfuegbarkeitController {

  private static final DateTimeFormatter ZEIT = DateTimeFormatter.ofPattern("HH:mm");
  private final VerfuegbarkeitPruefenUseCase pruefen;

  VerfuegbarkeitController(VerfuegbarkeitPruefenUseCase pruefen) {
    this.pruefen = pruefen;
  }

  @GetMapping("/api/verfuegbarkeit")
  VerfuegbarkeitDto pruefe(
      @RequestParam String raumId,
      @RequestParam String datum,
      @RequestParam String start,
      @RequestParam String ende) {
    Zeitfenster zeitfenster =
        new Zeitfenster(BuchungWebMapper.parseZeit(start), BuchungWebMapper.parseZeit(ende));
    Verfuegbarkeit v = pruefen.pruefe(raumId, BuchungWebMapper.parseDatum(datum), zeitfenster);
    return new VerfuegbarkeitDto(
        v.verfuegbar(), v.naechsteFreieZeit().map(t -> t.format(ZEIT)).orElse(null));
  }
}

package io.innoq.calvin.booking.application.port.in;

import io.innoq.calvin.booking.domain.Zeitfenster;
import java.time.LocalDate;

/** Eingehender Port: Verfügbarkeit eines Konferenzraums für ein Zeitfenster prüfen (CLVN-010). */
public interface VerfuegbarkeitPruefenUseCase {

  Verfuegbarkeit pruefe(String raumId, LocalDate datum, Zeitfenster zeitfenster);
}

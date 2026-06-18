package io.innoq.calvin.booking.application.port.in;

import io.innoq.calvin.booking.domain.Buchung;
import java.util.List;
import java.util.Optional;

/** Eingehender Port: Buchungen abfragen (Buchungsübersicht CLVN-023, Bestätigung CLVN-020). */
public interface BuchungenAbfragenUseCase {

  /** Liefert die passenden Buchungen, chronologisch sortiert (nächste zuerst). */
  List<Buchung> finde(BuchungFilter filter);

  Optional<Buchung> findeById(String id);
}

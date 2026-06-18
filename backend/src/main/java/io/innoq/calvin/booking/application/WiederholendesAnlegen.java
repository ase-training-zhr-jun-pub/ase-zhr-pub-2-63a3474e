package io.innoq.calvin.booking.application;

import io.innoq.calvin.booking.application.port.in.BuchungAnlegenUseCase;
import io.innoq.calvin.booking.application.port.in.NeueBuchungBefehl;
import io.innoq.calvin.booking.domain.Buchung;
import org.springframework.context.annotation.Primary;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.stereotype.Component;

/**
 * Resilienz-Decorator um {@link BuchungService#anlegen}. Unter Last bricht die {@code
 * SERIALIZABLE}-Transaktion bei konkurrierenden Buchungen mit einer {@link
 * ConcurrencyFailureException} ab (PostgreSQL-SSI). Das ist kein fachlicher Fehler, sondern ein
 * Hinweis zum Wiederholen: Jeder Versuch ruft {@code delegate.anlegen} erneut auf (über den
 * Spring-Proxy → frische Transaktion). Beim Wiederholen sieht die Konfliktprüfung die inzwischen
 * festgeschriebene Buchung und meldet sauber {@link
 * io.innoq.calvin.booking.domain.RaumBereitsBelegtException}.
 *
 * <p>Trennt damit die <b>Resilienz-Policy</b> (Retry) von der <b>fachlichen Atomarität</b>
 * (Transaktion im {@link BuchungService}). {@code @Primary}, damit der Controller diesen Decorator
 * als {@link BuchungAnlegenUseCase} erhält.
 */
@Component
@Primary
class WiederholendesAnlegen implements BuchungAnlegenUseCase {

  private static final int MAX_VERSUCHE = 5;

  private final BuchungService delegate;

  WiederholendesAnlegen(BuchungService delegate) {
    this.delegate = delegate;
  }

  @Override
  public Buchung anlegen(NeueBuchungBefehl befehl) {
    ConcurrencyFailureException letzterAbbruch = null;
    for (int versuch = 1; versuch <= MAX_VERSUCHE; versuch++) {
      try {
        return delegate.anlegen(befehl);
      } catch (ConcurrencyFailureException abbruch) {
        // Serialisierungskonflikt: neue Transaktion versuchen.
        letzterAbbruch = abbruch;
      }
    }
    // Dauerhaft hohe Kollision: an den Aufrufer durchreichen (-> 503, siehe
    // GlobalExceptionHandler).
    throw letzterAbbruch;
  }
}

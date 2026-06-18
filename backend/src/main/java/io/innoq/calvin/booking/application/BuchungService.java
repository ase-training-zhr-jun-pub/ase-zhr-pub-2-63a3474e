package io.innoq.calvin.booking.application;

import io.innoq.calvin.booking.application.port.in.BuchungAnlegenUseCase;
import io.innoq.calvin.booking.application.port.in.BuchungFilter;
import io.innoq.calvin.booking.application.port.in.BuchungNichtGefundenException;
import io.innoq.calvin.booking.application.port.in.BuchungStornierenUseCase;
import io.innoq.calvin.booking.application.port.in.BuchungenAbfragenUseCase;
import io.innoq.calvin.booking.application.port.in.NeueBuchungBefehl;
import io.innoq.calvin.booking.application.port.in.Verfuegbarkeit;
import io.innoq.calvin.booking.application.port.in.VerfuegbarkeitPruefenUseCase;
import io.innoq.calvin.booking.application.port.out.BuchungRepository;
import io.innoq.calvin.booking.domain.Buchung;
import io.innoq.calvin.booking.domain.BuchungsStatus;
import io.innoq.calvin.booking.domain.RaumBereitsBelegtException;
import io.innoq.calvin.booking.domain.Zeitfenster;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orchestriert die Buchungs-Use-Cases. Die fachlichen Regeln (Kollision, Aktiv-Status) liegen in
 * der Domäne; dieser Service koordiniert Prüfung und Persistenz.
 *
 * <p><b>QS-1 (keine Doppelbuchungen):</b> Prüfung auf Konflikt und Speichern müssen atomar
 * geschehen, sonst können zwei quasi-gleichzeitige Anfragen beide die Prüfung bestehen. {@link
 * #anlegen} läuft daher in einer Transaktion mit Isolationsstufe {@code SERIALIZABLE}: Die
 * Datenbank (PostgreSQL/SSI) erkennt die kollidierende Schreib-Lese-Konstellation und bricht eine
 * der Transaktionen ab. Diese Abbrüche fängt der vorgelagerte {@link
 * WiederholendesAnlegen}-Decorator ab und wiederholt den Versuch — beim Wiederholen sieht die
 * Prüfung die nun festgeschriebene Buchung und meldet sauber {@link RaumBereitsBelegtException}.
 */
@Service
public class BuchungService
    implements BuchungAnlegenUseCase,
        BuchungenAbfragenUseCase,
        VerfuegbarkeitPruefenUseCase,
        BuchungStornierenUseCase {

  private final BuchungRepository repository;

  public BuchungService(BuchungRepository repository) {
    this.repository = repository;
  }

  @Override
  @Transactional(isolation = Isolation.SERIALIZABLE)
  public Buchung anlegen(NeueBuchungBefehl befehl) {
    Verfuegbarkeit verfuegbarkeit = pruefe(befehl.raumId(), befehl.datum(), befehl.zeitfenster());
    if (!verfuegbarkeit.verfuegbar()) {
      throw new RaumBereitsBelegtException(befehl.raumId(), verfuegbarkeit.naechsteFreieZeit());
    }
    Buchung buchung =
        new Buchung(
            repository.naechsteId(),
            befehl.raumId(),
            befehl.standortId(),
            befehl.datum(),
            befehl.zeitfenster(),
            titelOderStandard(befehl.titel()),
            leerAlsNull(befehl.notiz()),
            BuchungsStatus.BESTAETIGT,
            befehl.gebuchtVon());
    return repository.speichere(buchung);
  }

  @Override
  public Verfuegbarkeit pruefe(String raumId, LocalDate datum, Zeitfenster zeitfenster) {
    List<Buchung> amTag = repository.findeFuerRaumUndDatum(raumId, datum);
    List<Buchung> konflikte =
        amTag.stream().filter(b -> b.kollidiertMit(raumId, datum, zeitfenster)).toList();
    Optional<LocalTime> naechsteFreieZeit =
        amTag.stream()
            .filter(Buchung::istAktiv)
            .map(b -> b.zeitfenster().ende())
            .max(Comparator.naturalOrder());
    return new Verfuegbarkeit(konflikte.isEmpty(), naechsteFreieZeit, konflikte);
  }

  @Override
  public List<Buchung> finde(BuchungFilter filter) {
    return repository.findeAlle().stream()
        .filter(b -> filter.nutzer() == null || b.gebuchtVon().equals(filter.nutzer()))
        .filter(b -> filter.standortId() == null || b.standortId().equals(filter.standortId()))
        .filter(b -> filter.datum() == null || b.datum().equals(filter.datum()))
        .filter(b -> filter.raumId() == null || b.raumId().equals(filter.raumId()))
        .sorted(Comparator.comparing(Buchung::datum).thenComparing(b -> b.zeitfenster().start()))
        .toList();
  }

  @Override
  public Optional<Buchung> findeById(String id) {
    return repository.findeById(id);
  }

  @Override
  @Transactional
  public Buchung storniere(String id) {
    Buchung buchung =
        repository.findeById(id).orElseThrow(() -> new BuchungNichtGefundenException(id));
    return repository.speichere(buchung.storniert());
  }

  private static String titelOderStandard(String titel) {
    return titel == null || titel.isBlank() ? "Meeting" : titel.trim();
  }

  private static String leerAlsNull(String wert) {
    return wert == null || wert.isBlank() ? null : wert.trim();
  }
}

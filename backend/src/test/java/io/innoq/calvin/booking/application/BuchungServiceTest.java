package io.innoq.calvin.booking.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.innoq.calvin.booking.adapter.out.persistence.InMemoryBuchungRepository;
import io.innoq.calvin.booking.application.port.in.BuchungFilter;
import io.innoq.calvin.booking.application.port.in.NeueBuchungBefehl;
import io.innoq.calvin.booking.application.port.in.Verfuegbarkeit;
import io.innoq.calvin.booking.domain.Buchung;
import io.innoq.calvin.booking.domain.RaumBereitsBelegtException;
import io.innoq.calvin.booking.domain.Zeitfenster;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BuchungServiceTest {

  private static final LocalDate TAG = LocalDate.of(2026, 6, 17);
  private BuchungService service;

  private static Zeitfenster zf(String start, String ende) {
    return new Zeitfenster(LocalTime.parse(start), LocalTime.parse(ende));
  }

  private static NeueBuchungBefehl befehl(String start, String ende) {
    return new NeueBuchungBefehl(
        "koeln-mosel", "koeln", TAG, zf(start, ende), "Workshop", null, "Alex Berger");
  }

  @BeforeEach
  void setUp() {
    service = new BuchungService(new InMemoryBuchungRepository());
  }

  @Test
  void legt_buchung_an_und_liefert_sie_in_der_uebersicht() {
    Buchung b = service.anlegen(befehl("09:00", "10:00"));
    assertThat(b.id()).isNotBlank();
    assertThat(b.istAktiv()).isTrue();
    assertThat(service.finde(new BuchungFilter("Alex Berger", null, null, null)))
        .containsExactly(b);
  }

  @Test
  void verhindert_doppelbuchung_bei_ueberlappung() {
    service.anlegen(befehl("09:00", "11:00"));
    assertThatThrownBy(() -> service.anlegen(befehl("10:00", "12:00")))
        .isInstanceOf(RaumBereitsBelegtException.class);
  }

  @Test
  void erlaubt_anschliessende_buchung() {
    service.anlegen(befehl("09:00", "10:00"));
    assertThat(service.anlegen(befehl("10:00", "11:00")).istAktiv()).isTrue();
  }

  @Test
  void verfuegbarkeit_meldet_belegung_und_naechste_freie_zeit() {
    service.anlegen(befehl("09:00", "11:00"));
    Verfuegbarkeit belegt = service.pruefe("koeln-mosel", TAG, zf("10:00", "12:00"));
    assertThat(belegt.verfuegbar()).isFalse();
    assertThat(belegt.naechsteFreieZeit()).contains(LocalTime.of(11, 0));

    Verfuegbarkeit frei = service.pruefe("koeln-mosel", TAG, zf("11:00", "12:00"));
    assertThat(frei.verfuegbar()).isTrue();
  }

  @Test
  void stornierung_gibt_raum_wieder_frei() {
    Buchung b = service.anlegen(befehl("09:00", "11:00"));
    service.storniere(b.id());
    assertThat(service.pruefe("koeln-mosel", TAG, zf("09:00", "11:00")).verfuegbar()).isTrue();
  }

  // Hinweis: Die QS-1-Garantie unter echter Nebenläufigkeit wird seit der DB-Persistenz auf
  // Integrationsebene gegen PostgreSQL (SERIALIZABLE/SSI) geprüft, siehe
  // adapter.out.persistence.KeineDoppelbuchungTest. Ein reiner Unit-Test mit In-Memory-Repository
  // kann das DB-Transaktionsverhalten nicht abbilden.
}

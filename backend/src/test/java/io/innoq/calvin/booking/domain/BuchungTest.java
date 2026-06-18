package io.innoq.calvin.booking.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;

class BuchungTest {

  private static final LocalDate TAG = LocalDate.of(2026, 6, 17);

  private static Zeitfenster zf(String start, String ende) {
    return new Zeitfenster(LocalTime.parse(start), LocalTime.parse(ende));
  }

  private static Buchung bestaetigt(String start, String ende) {
    return new Buchung(
        "b1",
        "koeln-mosel",
        "koeln",
        TAG,
        zf(start, ende),
        "Meeting",
        null,
        BuchungsStatus.BESTAETIGT,
        "Alex Berger");
  }

  @Test
  void zeitfenster_verlangt_ende_nach_start() {
    assertThatThrownBy(() -> zf("10:00", "10:00")).isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> zf("11:00", "10:00")).isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void aneinandergrenzende_zeitfenster_ueberschneiden_sich_nicht() {
    assertThat(zf("09:00", "10:00").ueberschneidetSich(zf("10:00", "11:00"))).isFalse();
  }

  @Test
  void ueberlappende_zeitfenster_ueberschneiden_sich() {
    assertThat(zf("09:00", "10:30").ueberschneidetSich(zf("10:00", "11:00"))).isTrue();
  }

  @Test
  void bestaetigte_buchung_kollidiert_bei_ueberlappung() {
    assertThat(bestaetigt("09:00", "11:00").kollidiertMit("koeln-mosel", TAG, zf("10:00", "12:00")))
        .isTrue();
  }

  @Test
  void kollidiert_nicht_bei_anderem_raum_oder_tag() {
    Buchung b = bestaetigt("09:00", "11:00");
    assertThat(b.kollidiertMit("koeln-rheingold", TAG, zf("09:00", "11:00"))).isFalse();
    assertThat(b.kollidiertMit("koeln-mosel", TAG.plusDays(1), zf("09:00", "11:00"))).isFalse();
  }

  @Test
  void stornierte_buchung_kollidiert_nie() {
    Buchung storniert = bestaetigt("09:00", "11:00").storniert();
    assertThat(storniert.istAktiv()).isFalse();
    assertThat(storniert.kollidiertMit("koeln-mosel", TAG, zf("10:00", "12:00"))).isFalse();
  }
}

package io.innoq.calvin.booking.domain;

import java.time.LocalDate;

/**
 * Eine Raumbuchung: Reservierung eines Konferenzraums für einen Mitarbeiter in einem Zeitfenster.
 *
 * <p>Gemäß [ADR-002] kennt der Booking Service nur die <b>Ressourcen-IDs</b> (Raum, Standort); den
 * Katalog (Namen, Kapazität, Ausstattung) besitzt die SPA. Verhalten wie die Konfliktprüfung liegt
 * an der Entität, nicht in einem Service-Sumpf (keine anämische Domäne).
 */
public record Buchung(
    String id,
    String raumId,
    String standortId,
    LocalDate datum,
    Zeitfenster zeitfenster,
    String titel,
    String notiz,
    BuchungsStatus status,
    String gebuchtVon) {

  public Buchung {
    if (raumId == null || raumId.isBlank()) {
      throw new IllegalArgumentException("raumId darf nicht leer sein");
    }
    if (standortId == null || standortId.isBlank()) {
      throw new IllegalArgumentException("standortId darf nicht leer sein");
    }
    if (datum == null) {
      throw new IllegalArgumentException("datum darf nicht null sein");
    }
    if (zeitfenster == null) {
      throw new IllegalArgumentException("zeitfenster darf nicht null sein");
    }
    if (gebuchtVon == null || gebuchtVon.isBlank()) {
      throw new IllegalArgumentException("gebuchtVon darf nicht leer sein");
    }
    if (status == null) {
      throw new IllegalArgumentException("status darf nicht null sein");
    }
  }

  /** Eine bestätigte (nicht stornierte) Buchung blockiert den Raum. */
  public boolean istAktiv() {
    return status == BuchungsStatus.BESTAETIGT;
  }

  /** Betrifft diese Buchung denselben Raum am selben Tag? */
  public boolean betrifftRaumAm(String raumId, LocalDate datum) {
    return this.raumId.equals(raumId) && this.datum.equals(datum);
  }

  /**
   * Kollidiert diese Buchung mit einer Anfrage für denselben Raum/Tag und ein überschneidendes
   * Zeitfenster? Stornierte Buchungen kollidieren nie.
   */
  public boolean kollidiertMit(String raumId, LocalDate datum, Zeitfenster zeitfenster) {
    return istAktiv()
        && betrifftRaumAm(raumId, datum)
        && this.zeitfenster.ueberschneidetSich(zeitfenster);
  }

  /** Liefert eine stornierte Kopie dieser Buchung. */
  public Buchung storniert() {
    return new Buchung(
        id,
        raumId,
        standortId,
        datum,
        zeitfenster,
        titel,
        notiz,
        BuchungsStatus.STORNIERT,
        gebuchtVon);
  }
}

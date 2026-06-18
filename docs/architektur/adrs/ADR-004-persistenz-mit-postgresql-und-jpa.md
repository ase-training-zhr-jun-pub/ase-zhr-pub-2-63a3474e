# ADR-004: Persistenz des Booking Service mit PostgreSQL und JPA

**Status**: Akzeptiert

## Kontext

[ADR-001](ADR-001-technologie-stack-fuer-booking-service.md) legt fest, dass Persistenz und
Konfliktprüfung über eine relationale Datenbank mit Transaktionen und Locking (JPA/JDBC)
erfolgen. Der erste Prototyp speicherte Buchungen jedoch nur **prozesslokal in einer Map**
(`InMemoryBuchungRepository`) und serialisierte die Konfliktprüfung über einen
`ReentrantLock`. Damit gingen Daten bei jedem Neustart verloren, und die
Doppelbuchungs-Garantie ([QS-1](../qualitätsanforderungen.md)) galt nur innerhalb einer
einzelnen JVM.

Zu entscheiden war, **wie** die in ADR-001 vorgesehene DB-Persistenz konkret umgesetzt wird.

## Entscheidung

- **Datenbank: PostgreSQL.** Zugriff über **Spring Data JPA / Hibernate**.
- **Hexagonal sauber getrennt:** Die Domäne (`domain/Buchung`) bleibt framework-frei. Der
  Persistenz-Adapter besitzt ein eigenes JPA-Modell (`BuchungJpaEntity`) und einen Mapper;
  `JpaBuchungRepository` implementiert den unveränderten Out-Port `BuchungRepository`. Der
  Domänenkern und die Use Cases bleiben dadurch unberührt.
- **QS-1 über Serializable-Transaktion:** `BuchungService.anlegen` läuft in einer Transaktion
  mit Isolationsstufe `SERIALIZABLE`. PostgreSQLs Serializable Snapshot Isolation (SSI)
  erkennt die kollidierende Lese-/Schreib-Konstellation und bricht eine der gleichzeitigen
  Transaktionen ab. Diese Abbrüche fängt der Decorator `WiederholendesAnlegen` ab und
  wiederholt den Versuch (begrenzt); anhaltende Konflikte werden als HTTP 503 gemeldet. Der
  `ReentrantLock` entfällt.
- **Konfiguration:** Lokaler DB-Betrieb über `backend/docker-compose.yml`. Verbindungsdaten
  über `SPRING_DATASOURCE_*` überschreibbar. Schema im Prototyp via `ddl-auto=update`.

## Betrachtete Alternativen

| Kriterium | **PostgreSQL + JPA + SERIALIZABLE** | H2 (Datei) + JPA | Pessimistisches Locking (FOR UPDATE) |
|---|---|---|---|
| Echte Persistenz | ★★★ produktionsnah | ★★ nur lokal/Prototyp | ★★★ (DB-abhängig) |
| QS-1-Korrektheit, multi-instanz | ★★★ SSI erkennt Write-Skew | ★☆ serializable grobgranular | ★★★, aber Gap-Locking-Fallstricke bei „Erstbuchung" |
| Implementierungsaufwand | ★★ Retry nötig | ★★★ minimal | ★★ Sperrzeile/-strategie nötig |
| Produktionsreife / INNOQ-Stack | ★★★ | ★☆ | ★★★ |

## Begründung

- PostgreSQL ist der produktionsnahe Standard im INNOQ-Umfeld und liefert mit **SSI** eine
  korrekte, deklarative Lösung genau für das hier vorliegende Write-Skew-Problem
  („keine überlappende Buchung für denselben Raum") — ohne manuelle Sperrzeilen.
- Die **getrennte JPA-Entität** wahrt die Architekturregel „kein Framework im Domänenkern"
  und hält den Out-Port stabil — der Adapter ist austauschbar.
- Der **Retry-Decorator** trennt die Resilienz-Policy von der fachlichen Atomarität und macht
  Serializable im Alltag benutzbar (saubere 409-Antwort statt durchgereichter DB-Fehler).

## Konsequenzen

**Positiv**
- Buchungen sind dauerhaft persistent und überleben Neustarts.
- QS-1 gilt jetzt **über Prozessgrenzen hinweg** (mehrere Service-Instanzen möglich).
- Domäne und Use Cases bleiben unverändert; nur der Persistenz-Adapter kam hinzu.

**Negativ / Aufwände**
- Laufende PostgreSQL-Instanz als Betriebsabhängigkeit.
- Serializable + Retry erfordert Sorgfalt (Retry-Grenzen, 503-Behandlung im Client).
- `ddl-auto=update` ist nur für den Prototyp; vor Produktion Schema-Migrationen
  (z. B. Flyway) und `validate` einführen.

> **Umgebungs-Hinweis:** In der Trainingsumgebung kann Docker keine Container starten
> (Docker-in-Docker/Overlay-Limitierung). Dort läuft daher ein **nativ installiertes**
> PostgreSQL; Tests laufen gegen ein lokales Postgres (`calvin_test`) statt Testcontainers.
> In CI/Dev mit funktionierendem Docker bleibt `docker-compose.yml` bzw. Testcontainers der
> vorgesehene Weg.

# CLAUDE.md — Booking Service (Backend)

Diese Datei gilt für Arbeiten im Verzeichnis `backend/`. Sie ergänzt die Regeln im
Repository-Root (`.claude/rules/`). Halte dich zusätzlich an die dortigen Vorgaben
(Conventional Commits, Ubiquitous Language, Nutzung der Dokumentation).

## Dokumentation (immer zuerst lesen)

**Domäne / Produkt**
- [Produktvision](../docs/produkt/produktvision.md)
- [Glossar / Ubiquitous Language](../docs/produkt/glossar.md) — **verbindliches Wording**
- [Persona](../docs/produkt/personas/innoq-mitarbeiter.md)
- [Backlog](../docs/produkt/backlog/backlog.md) · [User Story Map](../docs/produkt/user-story-maps/raumbuchung.md)

**Architektur**
- [arc42-Hauptdokument](../docs/arc42/arc42.md)
- [Architektur-README (Index)](../docs/architektur/README.md)
- [Qualitätsanforderungen (QS-1 … QS-5)](../docs/architektur/qualitätsanforderungen.md)
- [Technische Schulden](../docs/architektur/technische-schulden.md)
- ADRs: [Technologie-Stack](../docs/architektur/adrs/ADR-001-technologie-stack-fuer-booking-service.md) ·
  [Ressourcen als Mock](../docs/architektur/adrs/ADR-002-ressourcendaten-als-mock-in-spa.md) ·
  [Basic-Auth statt Okta](../docs/architektur/adrs/ADR-003-basic-auth-statt-okta-im-prototyp.md)

## Backend-Technologie

- **Java 21** (LTS) — Records, Pattern Matching, Virtual Threads verfügbar
- **Spring Boot 4.1.0** — Web-Starter heißt hier `spring-boot-starter-webmvc`
  (nicht mehr `-web`); Namespace ist **Jakarta** (`jakarta.*`, nicht `javax.*`)
- **Maven** als Build-Tool (Wrapper `./mvnw` vorhanden, System-`mvn` ebenfalls ok)
- Coordinates: `io.innoq.calvin:booking-service`, Basispaket `io.innoq.calvin.booking`

Begründung der Wahl: siehe [ADR-001 Technologie-Stack](../docs/architektur/adrs/ADR-001-technologie-stack-fuer-booking-service.md).

## Ordner-Struktur

```text
backend/
├── pom.xml                     # Maven-Build, Dependencies
├── mvnw / mvnw.cmd             # Maven Wrapper
├── HELP.md                     # Auto-generiert von Spring Initializr
├── src/
│   ├── main/
│   │   ├── java/io/innoq/calvin/booking/
│   │   │   ├── BookingServiceApplication.java   # @SpringBootApplication (Einstiegspunkt)
│   │   │   └── web/HelloController.java          # GET /api/hello -> "Hello World!"
│   │   └── resources/
│   │       └── application.properties           # Konfiguration (u.a. server.port=8081)
│   └── test/java/io/innoq/calvin/booking/
│       └── BookingServiceApplicationTests.java  # Context-Load-Test
└── target/                     # Build-Output (nicht eingecheckt)
```

## Backend-Architektur: Hexagonal (Ports & Adapters)

**Zielarchitektur** für den Service ist **Hexagonal / Ports & Adapters**. Der
Domänenkern (Buchungs- und Konfliktlogik — Kern von [QS-1](../docs/architektur/qualitätsanforderungen.md))
bleibt **frei von Framework-Code**; Web und Persistenz sind austauschbare Adapter.

Zielstruktur, in die neuer Code einsortiert wird (wächst mit dem Service):

```text
io.innoq.calvin.booking
├── domain/            # Entitäten, Wertobjekte, Domänenlogik — KEINE Spring-/JPA-Annotationen
├── application/       # Use Cases (orchestrieren die Domäne)
│   └── port/
│       ├── in/        # eingehende Ports (Use-Case-Interfaces)
│       └── out/       # ausgehende Ports (z.B. BuchungRepository als Interface)
└── adapter/
    ├── in/web/        # REST-Controller (Spring MVC) -> rufen Use Cases auf
    └── out/persistence/  # JPA-Adapter, implementieren die out-Ports
```

> Aktueller Stand: nur ein minimales Skelett (`web/HelloController.java`). Beim ersten
> echten Feature den `HelloController` nach `adapter/in/web/` ziehen und die obige
> Struktur etablieren. Regel: **Abhängigkeiten zeigen nach innen** (Adapter → Application
> → Domain), niemals umgekehrt.

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `src/main/java/io/innoq/calvin/booking/BookingServiceApplication.java` | Einstiegspunkt (`main`) |
| `src/main/java/io/innoq/calvin/booking/web/HelloController.java` | Beispiel-/Health-Endpunkt `GET /api/hello` |
| `src/main/resources/application.properties` | Konfiguration (Port 8081, App-Name) |
| `pom.xml` | Dependencies & Build |

## Wichtige Bash-Commands

> Aus dem `backend/`-Verzeichnis ausführen.

| Aktion | Command |
|--------|---------|
| Service starten (Dev) | `mvn spring-boot:run` |
| Tests ausführen | `mvn test` |
| Bauen (JAR in `target/`) | `mvn clean package` |
| JAR direkt starten | `java -jar target/booking-service-0.0.1-SNAPSHOT.jar` |
| Endpunkt prüfen | `curl http://localhost:8081/api/hello` |
| SDKs (JDK + Maven) installieren | `../scripts/install-sdk.sh` |

## Code Smells (vermeiden)

- **Geschäftslogik in Controllern** — Controller sind dünne Adapter; Logik gehört in
  `application`/`domain`.
- **Framework im Domänenkern** — keine Spring-/JPA-/Jakarta-Annotationen in `domain/`.
- **Anämische Domäne** — Verhalten zur Logik (z.B. Konfliktprüfung) an die Entität/das
  Wertobjekt, nicht in „Service-Sümpfe".
- **Falsches Wording** — Begriffe abweichend vom [Glossar](../docs/produkt/glossar.md)
  (z.B. „Meetingroom" statt „Konferenzraum").
- **Ressourcen-Katalog im Backend nachbauen** — laut
  [ADR-002](../docs/architektur/adrs/ADR-002-ressourcendaten-als-mock-in-spa.md) arbeitet
  der Service **nur mit Ressourcen-IDs**; Standorte/Räume/Ausstattung liegen als Mock in
  der SPA.
- **Doppelbuchungen ohne Transaktionsschutz** — Buchungsschreibvorgänge brauchen
  Transaktion + Locking (optimistic/pessimistic), sonst ist [QS-1](../docs/architektur/qualitätsanforderungen.md)
  verletzt. **Race Conditions sind hier ein echter Bug, kein Edge Case.**
- **`javax.*`-Imports** — in Spring Boot 4 ist alles `jakarta.*`.
- **Secrets/personenbezogene Daten im Log** — DSGVO-Bezug (QS-4).

## Run Configurations

- **Port: 8081.** `8080` ist in der Trainingsumgebung vom code-server (IDE) belegt —
  daher in `application.properties` auf `8081` gesetzt. Nicht zurück auf 8080 ändern.
- **Frontend-Anbindung:** Der Vite-Dev-Server proxyt `/api` → `http://localhost:8081`
  (siehe `frontend/vite.config.ts`). Das Frontend ruft Endpunkte **relativ** (`api/...`)
  auf → kein CORS nötig, funktioniert hinter dem Crucible-Proxy.
- **Profile:** aktuell keine Spring-Profile. Umgebungsspezifische Configs als
  `application-<profil>.properties` ergänzen und mit `--spring.profiles.active=<profil>`
  bzw. `SPRING_PROFILES_ACTIVE` aktivieren.

## Weitere wichtige Hinweise

- **Authentifizierung:** Im Prototyp **Basic-Auth ohne Passwörter** (kein Okta) — siehe
  [ADR-003](../docs/architektur/adrs/ADR-003-basic-auth-statt-okta-im-prototyp.md) und
  technische Schuld [TS-2](../docs/architektur/technische-schulden.md). Keine echte
  Auth-/Okta-Integration bauen, solange das nicht beauftragt ist.
- **API-Stil:** REST/JSON über HTTPS, Endpunkte unter `/api/...`. Eine OpenAPI-Spezifikation
  als gemeinsamer Vertrag mit dem Frontend ist vorgesehen (siehe ADR-001 Konsequenzen).
- **Qualitätsziele beim Implementieren mitdenken:** QS-1 (keine Doppelbuchungen),
  QS-2 (Suche < 500 ms bei 150 Nutzern). Details in den
  [Qualitätsanforderungen](../docs/architektur/qualitätsanforderungen.md).
- **Sprache:** Domänen-/Code-Begriffe deutsch gemäß Glossar; Commits nach Conventional
  Commits.

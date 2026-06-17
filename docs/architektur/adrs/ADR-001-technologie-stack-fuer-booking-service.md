# ADR-001: Technologie-Stack für den Booking Service

**Status**: Akzeptiert

## Kontext

Die Buchungslogik von Calvin wird gemäß
[ADR Frontend-Prototyp und Booking Service](../../arc42/adrs/ADR-001-frontend-prototyp-und-booking-service.md)
in einen eigenständigen **Booking Service** mit REST-API (JSON über HTTPS) ausgelagert.
Das Frontend ist eine eigenständige **Vite-SPA** (React/TypeScript) — bewusst *kein*
Next.js.

Offen war die Technologie für den Service. Maßgeblich sind die
[Qualitätsanforderungen](../qualitätsanforderungen.md):

- **QS-1 (Zuverlässigkeit):** Doppelbuchungen in ≥ 99,9 % verhindern → serverseitige
  Transaktionen und Sperrmechanismen erforderlich.
- **QS-2 (Performance):** Raumsuche p95 ≤ 500 ms bei bis zu 150 gleichzeitigen Nutzern.
- **QS-4 (Sicherheit & Datenschutz):** Authentifizierung und Schutz personenbezogener
  Buchungsdaten (DSGVO).

Betrachtet wurden **Java (Spring Boot)**, **.NET (ASP.NET Core)** und **Next.js (Node/TS)**.

## Entscheidung

Der Booking Service wird mit **Java und Spring Boot** umgesetzt. Persistenz und
Konfliktprüfung erfolgen über eine relationale Datenbank mit Transaktionen und
optimistischem/pessimistischem Locking (JPA/JDBC).

## Betrachtete Alternativen

| Kriterium | **Java (Spring Boot)** | .NET (ASP.NET Core) | Next.js (Node/TS) |
|---|---|---|---|
| Transaktionen / Konfliktschutz (QS-1) | ★★★ `@Transactional`, JPA-Locking | ★★★ EF Core, Concurrency-Tokens | ★☆ kein First-Class-Transaktionsmodell |
| Performance / Durchsatz (QS-2) | ★★★ ausgereift, gut skalierend | ★★★ Kestrel, sehr hoher Durchsatz | ★★ I/O-gebunden ok, Single-Threaded |
| Eignung als dedizierter Service | ★★★ Backend-Framework | ★★★ vollwertiges Service-Framework | ★☆ Frontend-Framework, als Service „off-label" |
| Eine Sprache mit dem Frontend | ☆ separater Stack (Java) | ☆ separater Stack (C#) | ★★★ TypeScript end-to-end |
| INNOQ-Expertise / Ökosystem | ★★★ JVM/Spring Kernkompetenz | ★★★ stark vertreten | ★★ vorhanden, kein Service-Backbone |
| Betrieb / Observability (QS-4/5) | ★★★ Actuator, Micrometer | ★★★ OpenTelemetry | ★★ weniger „batteries included" |

## Begründung

Ausschlaggebend waren Datenintegrität, Team-Expertise und Performance:

- **Datenintegrität (QS-1):** Spring Boot bietet mit deklarativen Transaktionen
  (`@Transactional`) und JPA-Locking den ausgereiftesten Mechanismus, um
  Doppelbuchungen bei gleichzeitigen Anfragen zuverlässig zu verhindern — der
  kritische Kernanwendungsfall von Calvin.
- **Team-Expertise / INNOQ:** Der JVM-/Spring-Stack ist eine Kernkompetenz im
  INNOQ-Umfeld. Das sichert Wartbarkeit, Review-Qualität und langfristigen Betrieb.
- **Performance (QS-2):** Spring Boot skaliert für die geforderten Antwortzeiten bei
  150 gleichzeitigen Nutzern problemlos.
- **.NET** wäre technisch nahezu gleichwertig (vergleichbarer Transaktions- und
  Durchsatz-Stack), wird aber wegen der geringeren Priorisierung im Team nachgeordnet.
- **Next.js** wurde verworfen: Als reiner, transaktionssicherer Backend-Service ist ein
  Frontend-/Fullstack-Framework die schwächste Wahl (kein First-Class-Transaktionsmodell)
  und widerspricht der bewussten „SPA + separater Service"-Architektur. Der Vorteil
  „eine Sprache mit dem Frontend" überwiegt diese Nachteile nicht.

## Konsequenzen

**Positiv**
- Robuste, transaktionssichere Grundlage für die Konfliktprüfung (QS-1).
- Reifes Ökosystem für REST, Security (Spring Security, OAuth2/OIDC für QS-4) und
  Observability (Actuator, Micrometer).
- Hohe Wartbarkeit dank vorhandener INNOQ-Expertise.

**Negativ / Aufwände**
- Zweiter technologischer Stack neben dem TypeScript-Frontend — kein Teilen von
  Typen/Validierung; Kontextwechsel im Team.
- Höherer Speicherbedarf und längere Startzeit als bei Node-basierten Diensten
  (bei Bedarf via GraalVM-Native-Image / Spring AOT optimierbar).
- API-Vertrag (DTOs) muss zwischen Java-Backend und TS-Frontend separat gepflegt
  werden — empfohlen über eine gemeinsame **OpenAPI-Spezifikation** als Single Source
  of Truth (Codegenerierung für den Frontend-Client).

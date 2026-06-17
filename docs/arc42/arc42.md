# Architekturdokumentation Calvin

---

## Einführung und Ziele

### Aufgabenstellung

Calvin ist INNOQs internes Raum- und Arbeitsplatzbuchungssystem zur Verwaltung von Ressourcen an 8 Bürostandorten (Monheim, Berlin, Hamburg, Köln, München, Zürich, Cham, Offenbach).

#### Treibende Kräfte

- INNOQ hat bisher kein dediziertes Buchungssystem
- Hybrides Arbeiten erfordert zuverlässige Arbeitsplatzkoordination
- Vermeidung von Ressourcenkonflikten und Doppelbuchungen

Für die vollständige Produktbeschreibung und Features siehe [Produktvision](../produkt/produktvision.md).

### Qualitätsziele

Die folgenden Qualitätsziele haben die höchste Priorität für die Architektur von Calvin. Die vollständigen Qualitätsszenarien sind in [Kapitel 10](#10-qualitätsanforderungen) dokumentiert.

| Priorität | Qualitätsziel | Szenario |
|-----------|---------------|----------|
| 1 | **Zuverlässigkeit** | Doppelbuchungen werden in 99,9% der Fälle serverseitig verhindert, auch bei gleichzeitigen Buchungsversuchen innerhalb derselben Sekunde. |
| 2 | **Performance** | Suchergebnisse für verfügbare Räume werden innerhalb von 500ms angezeigt, auch bei 150 gleichzeitigen Nutzern. |
| 3 | **Benutzbarkeit** | Neue Mitarbeiter können ohne Schulung ihre erste Buchung in maximal 5 Minuten abschließen. 90% schaffen dies ohne Hilfe. |
| 4 | **Verfügbarkeit** | 98% Verfügbarkeit während der Kernarbeitszeiten (8:00-18:00 Uhr). Bei Ausfall Wiederherstellung innerhalb von 30 Minuten. |

### Stakeholder

| Rolle | Erwartungshaltung |
|-------|-------------------|
| **INNOQ Mitarbeiter** | Einfache, schnelle Buchung von Räumen und Arbeitsplätzen. Übersicht wer im Büro sein wird. |
| **INNOQ Geschäftsführung** | Überblick über Büroauslastung als Basis für Standortstrategie (Büros verkleinern, schließen oder an anderen Standorten eröffnen). Hohe Mitarbeiterakzeptanz. |

---

## Kontextabgrenzung

### Überblick

Das Calvin-System ist INNOQs internes Raum- und Arbeitsplatzbuchungssystem. Das System operiert in einem minimalen Systemkontext.

### Fachlicher Kontext

```plantuml
@startuml
actor "Consultant" as Consultant
actor "Geschäftsleitung" as GL

rectangle "Calvin" as Calvin

Consultant --> Calvin : Bucht Räume &\n Arbeitsplätze
GL --> Calvin : Sieht Reports
@enduml
```

---

## Bausteinsicht

### Ebene 1: Whitebox Gesamtsystem

Das Calvin-System besteht aus einer Single Page Application (SPA) und einem separaten Booking Service. Diese Architektur wurde für die Prototyping-Phase optimiert und ermöglicht eine klare Trennung zwischen Benutzeroberfläche und Geschäftslogik.

Die **Ressourcen** (Standorte, Räume, Ausstattung) werden im Prototyp als **Mock-Daten in der SPA** geführt; es gibt keinen separaten Ressource-Service. Der Booking Service arbeitet ausschließlich mit den **Ressourcen-IDs** aus diesen Mock-Daten (siehe [ADR-002](../architektur/adrs/ADR-002-ressourcendaten-als-mock-in-spa.md)).

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam backgroundColor white

actor "Consultant" as consultant
actor "Geschäftsleitung" as gl

package "Calvin System" {
    component "SPA\n(Single Page Application)" as spa
    component "Ressourcen\n(Mock-Daten)" as resources
    component "Booking Service" as booking
}

consultant --> spa : Bucht Räume &\nArbeitsplätze
gl --> spa : Sieht Reports
spa --> resources : Liest Standorte,\nRäume, Ausstattung
spa --> booking : REST API\n(JSON)
booking ..> resources : referenziert nur\nRessourcen-IDs

@enduml
```

### Enthaltene Bausteine

| Baustein | Verantwortlichkeit | Quellcode |
|----------|-------------------|-----------|
| **SPA** | Benutzeroberfläche für Buchungen, Kalenderansichten und Reports; hält den **Ressourcenkatalog als Mock-Daten** (Standorte, Räume, Ausstattung) | `frontend/` |
| **Booking Service** | Buchungslogik, Validierung, Konfliktprüfung, Auswertungsdaten; arbeitet nur mit **Ressourcen-IDs** (kein eigener Ressourcenkatalog) | `backend/` |

### Ressourcendaten

Standorte, Räume und Ausstattung liegen im Prototyp als Mock-Daten in der SPA. Der Booking Service speichert Buchungen mit Referenz auf die Ressourcen-IDs, validiert deren Existenz aber **nicht** serverseitig. Diese bewusste Vereinfachung ist als technische Schuld erfasst ([TS-1](../architektur/technische-schulden.md#ts-1-ressourcendaten-nur-als-mock-in-der-spa)).

### Authentifizierung (Prototyp)

Der Prototyp verzichtet auf die geplante Okta-Integration und nutzt **Basic-Auth ohne Passwörter** ([ADR-003](../architektur/adrs/ADR-003-basic-auth-statt-okta-im-prototyp.md)). Damit ist [Qualitätsszenario QS-4](../architektur/qualitätsanforderungen.md#qs-4-schutz-von-zugang-und-personenbezogenen-buchungsdaten) im Prototyp noch nicht erfüllt — siehe technische Schuld [TS-2](../architektur/technische-schulden.md#ts-2-basic-auth-ohne-passwörter-statt-okta).

### Schnittstelle: SPA → Booking Service

Die SPA kommuniziert mit dem Booking Service über eine REST API (JSON über HTTPS). Die API-Spezifikation wird als OpenAPI-Dokument im Backend gepflegt. Die Authentifizierung erfolgt im Prototyp über Basic-Auth ohne Passwörter (siehe oben).

---

## Architekturentscheidungen

Architekturentscheidungen sind als Architecture Decision Records (ADR) dokumentiert. Die ADRs findest du unter `docs/arc42/adrs/` sowie unter `docs/architektur/adrs/`.

| ADR | Entscheidung |
|-----|--------------|
| [Frontend-Prototyp & Booking Service](adrs/ADR-001-frontend-prototyp-und-booking-service.md) | SPA-Prototyp plus separater Booking Service (REST/JSON). |
| [Technologie-Stack Booking Service](../architektur/adrs/ADR-001-technologie-stack-fuer-booking-service.md) | Java / Spring Boot für den Booking Service. |
| [Ressourcendaten als Mock in der SPA](../architektur/adrs/ADR-002-ressourcendaten-als-mock-in-spa.md) | Kein Ressource-Service; Standorte/Räume/Ausstattung als Mock-Daten, Booking Service nutzt nur IDs. |
| [Basic-Auth statt Okta im Prototyp](../architektur/adrs/ADR-003-basic-auth-statt-okta-im-prototyp.md) | Basic-Auth ohne Passwörter im Prototyp; Okta/OIDC später. |

Bewusst eingegangene Vereinfachungen sind als [technische Schulden](../architektur/technische-schulden.md) erfasst.

---

## Qualitätsanforderungen

Diese Qualitätsszenarien definieren die wesentlichen Qualitätsmerkmale des Calvin-Systems.

### Qualitätsbaum

1. **QS-2 (Doppelbuchungen)** - Kritisch, Kernfeature
2. **QS-1 (Performance)** - Hoch, direkter Einfluss auf Nutzererfahrung
3. **QS-5 (Benutzbarkeit)** - Hoch, essentiell für Akzeptanz
4. **QS-3 (Verfügbarkeit)** - Mittel, Ausfälle sind kompensierbar
5. **QS-4 (Erweiterbarkeit)** - Mittel, ausreichend Vorlaufzeit

### Qualitätsszenarien

#### QS-1: Performance bei Raumsuche

**Qualitätsmerkmal**: Performance / Antwortzeit

**Szenario**:
Während der normalen Arbeitszeit sucht ein INNOQ-Mitarbeiter im Calvin-System nach verfügbaren Räumen an einem bestimmten Standort für einen ausgewählten Zeitraum. Die Suchergebnisliste mit allen verfügbaren Räumen wird innerhalb von 500ms angezeigt, auch bei gleichzeitiger Nutzung durch bis zu 150 Mitarbeiter.

**Motivation**:
Die schnelle Anzeige von Suchergebnissen ist essentiell für die in der Vision versprochene "unkomplizierte unbürokratische leichte Buchung". Mitarbeiter wie Alex Berger, die nur einen Tag pro Woche im Büro sind, müssen ihre Buchungen schnell und effizient durchführen können.

---

#### QS-2: Verhinderung von Doppelbuchungen

**Qualitätsmerkmal**: Zuverlässigkeit / Datenintegrität

**Szenario**:
In einer normalen Betriebssituation versuchen zwei INNOQ-Mitarbeiter gleichzeitig (innerhalb derselben Sekunde) denselben Raum für denselben Zeitraum zu buchen. Das System verarbeitet die erste vollständige Buchungsanfrage erfolgreich und lehnt die zweite Anfrage mit einer verständlichen Fehlermeldung ab. Doppelbuchungen werden in 99,9% der Fälle serverseitig verhindert.

**Motivation**:
Die Verhinderung von Doppelbuchungen ist ein Kernfeature von Calvin und essentiell für das Nutzervertrauen. Das System muss die "Sicherheit einen Arbeitsplatz, oder Meetingraum wirklich verfügbar zu haben" garantieren.

---

#### QS-3: Verfügbarkeit während Arbeitszeiten

**Qualitätsmerkmal**: Verfügbarkeit

**Szenario**:
Während der typischen INNOQ-Arbeitszeiten (8:00-18:00 Uhr an Werktagen) ist das Calvin-System verfügbar und funktionsfähig. Das System erreicht eine Verfügbarkeit von 98% während dieser Kernarbeitszeiten. Bei einem Ausfall ist das System innerhalb von 30 Minuten wieder betriebsbereit.

**Motivation**:
Obwohl Ausfälle durch alternative Kommunikationswege (z.B. interner Messenger) kompensiert werden können, sollte Calvin während der Arbeitszeiten verlässlich verfügbar sein, um den Buchungsprozess nicht zu behindern.

---

#### QS-4: Erweiterbarkeit um neue Standorte

**Qualitätsmerkmal**: Änderbarkeit / Erweiterbarkeit

**Szenario**:
Bei geplanter INNOQ-Expansion fügt ein Entwickler einen neuen Standort mit allen zugehörigen Räumen und Arbeitsplätzen zum Calvin-System hinzu. Die Implementierung, das Testing und das Deployment der Änderung sind innerhalb eines Release-Zyklus (2 Wochen) abgeschlossen, ohne bestehende Funktionalität zu beeinträchtigen.

**Motivation**:
INNOQ betreibt aktuell 8 Standorte und könnte in Zukunft expandieren. Die Multi-Standort-Architektur muss flexibel genug sein, um neue Standorte mit vertretbarem Aufwand zu integrieren.

---

#### QS-5: Intuitive Bedienbarkeit für neue Mitarbeiter

**Qualitätsmerkmal**: Benutzbarkeit / Erlernbarkeit

**Szenario**:
Ein neuer INNOQ-Mitarbeiter ohne vorherige Schulung nutzt Calvin zum ersten Mal, um einen Arbeitsplatz für den nächsten Tag zu buchen. Der Mitarbeiter findet intuitiv den richtigen Weg durch die Oberfläche und schließt die Buchung erfolgreich in maximal 5 Minuten und maximal 20 Klicks ab. 90% der neuen Mitarbeiter schaffen ihre erste Buchung ohne Hilfe.

**Motivation**:
Die Vision betont "unkomplizierte unbürokratische leichte Buchung für jeden". Das System muss selbsterklärend sein, auch wenn im Zweifel Kollegen helfen können. Eine niedrige Einstiegshürde fördert die angestrebte 90%ige Mitarbeiterakzeptanz.

---

## Glossar

Das Glossar findest du unter [/docs/produkt/glossar.md](/docs/produkt/glossar.md).

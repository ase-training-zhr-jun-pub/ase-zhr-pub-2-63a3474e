# Architekturdokumentation Calvin

Einstiegspunkt in die Architekturdokumentation von Calvin, INNOQs internem
Raumbuchungssystem.

## Inhalt

| Dokument | Beschreibung |
|----------|--------------|
| [arc42-Dokumentation](../arc42/arc42.md) | Hauptdokument der Architektur (Ziele, Kontext, Bausteinsicht, Entscheidungen). |
| [Qualitätsanforderungen](qualitätsanforderungen.md) | Qualitätsszenarien im Template *Environment · Source · Event · Artifact · Response · Measure*. |
| [Technische Schulden](technische-schulden.md) | Bewusst eingegangene Vereinfachungen, die vor Produktivbetrieb aufzulösen sind. |

### Architecture Decision Records (ADRs)

| ADR | Entscheidung |
|-----|--------------|
| [ADR-001 – Technologie-Stack Booking Service](adrs/ADR-001-technologie-stack-fuer-booking-service.md) | Java / Spring Boot für den Booking Service. |
| [ADR-002 – Ressourcendaten als Mock in der SPA](adrs/ADR-002-ressourcendaten-als-mock-in-spa.md) | Kein Ressource-Service; Standorte/Räume/Ausstattung als Mock-Daten, Booking Service nutzt nur IDs. |
| [ADR-003 – Basic-Auth statt Okta im Prototyp](adrs/ADR-003-basic-auth-statt-okta-im-prototyp.md) | Basic-Auth ohne Passwörter im Prototyp; Okta/OIDC später. |
| [Weitere ADRs (arc42)](../arc42/adrs/) | Übrige dokumentierte Architekturentscheidungen. |

## Qualitätsszenarien

Die [Qualitätsanforderungen](qualitätsanforderungen.md) beschreiben fünf testbare
Qualitätsszenarien und decken folgende Merkmale ab:

1. **QS-1 – Zuverlässigkeit:** keine Doppelbuchungen bei gleichzeitigen Anfragen
2. **QS-2 – Performance:** schnelle Anzeige verfügbarer Räume
3. **QS-3 – Benutzbarkeit:** Erstbuchung ohne Schulung
4. **QS-4 – Sicherheit & Datenschutz:** Schutz von Zugang und personenbezogenen Daten
5. **QS-5 – Verfügbarkeit:** Verlässlichkeit während der Kernarbeitszeit

# Technische Schulden: Calvin

Dieses Dokument erfasst bewusst eingegangene **technische Schulden** des Calvin-Systems —
Vereinfachungen, die das Prototyping beschleunigen, aber **vor dem Produktivbetrieb**
aufgelöst werden müssen. Jede Schuld verweist auf die zugrunde liegende
Architekturentscheidung (ADR) und das betroffene Qualitätsszenario.

## Übersicht

| ID | Technische Schuld | Ursache (ADR) | Betroffen | Priorität | Status |
|----|-------------------|---------------|-----------|-----------|--------|
| **TS-1** | Ressourcendaten nur als Mock in der SPA, keine referenzielle Integrität | [ADR-002](adrs/ADR-002-ressourcendaten-als-mock-in-spa.md) | QS-1 (Datenintegrität) | Mittel | Offen |
| **TS-2** | Basic-Auth ohne Passwörter statt Okta/OIDC | [ADR-003](adrs/ADR-003-basic-auth-statt-okta-im-prototyp.md) | QS-4 (Sicherheit & Datenschutz) | Hoch | Offen |

---

## TS-1: Ressourcendaten nur als Mock in der SPA

**Ursache:** [ADR-002 – Ressourcendaten als Mock-Daten in der SPA](adrs/ADR-002-ressourcendaten-als-mock-in-spa.md)

**Beschreibung:**
Standorte, Räume und Ausstattungen liegen als statische Mock-Daten in der SPA
(`frontend/src/lib/mock-data.ts`). Der Booking Service kennt nur Ressourcen-IDs und besitzt
keinen eigenen, validierbaren Ressourcenkatalog.

**Auswirkung:**
- Keine **referenzielle Integrität**: Der Booking Service kann nicht prüfen, ob eine
  gebuchte Raum-ID überhaupt existiert oder ob Kapazität/Ausstattung passen.
- Mock-Daten (Frontend) und ID-Annahmen (Backend) müssen **manuell synchron** gehalten
  werden — Fehlerquelle bei Änderungen.
- Berührt [QS-1](qualitätsanforderungen.md#qs-1-keine-doppelbuchungen-bei-gleichzeitigen-anfragen):
  Zeitliche Konfliktprüfung funktioniert, die Gültigkeit der Ressource selbst wird aber
  nicht serverseitig garantiert.

**Geplante Auflösung:**
Einführung eines echten Ressource-Service bzw. eines persistenten Ressourcenkatalogs mit
serverseitiger Validierung der Buchungen gegen existierende Räume. Umsetzung **vor
Produktivbetrieb**.

---

## TS-2: Basic-Auth ohne Passwörter statt Okta

**Ursache:** [ADR-003 – Basic-Auth ohne Passwörter statt Okta im Prototyp](adrs/ADR-003-basic-auth-statt-okta-im-prototyp.md)

**Beschreibung:**
Der Prototyp nutzt Basic-Auth ohne Passwortprüfung. Der Nutzername identifiziert den
Nutzer; es findet kein Identitätsnachweis statt. Die geplante Okta-/OIDC-Integration ist
zurückgestellt.

**Auswirkung:**
- **Keine echte Authentifizierung/Autorisierung** und kein Zugriffsschutz.
- [QS-4](qualitätsanforderungen.md#qs-4-schutz-von-zugang-und-personenbezogenen-buchungsdaten)
  ist im Prototyp **nicht erfüllt**; personenbezogene Buchungsdaten sind nicht geschützt.
- **Nicht produktionstauglich.**

**Geplante Auflösung:**
Integration von Okta als zentraler Identity Provider (OIDC) über Spring Security, inkl.
Autorisierung und TLS-geschützter Datenübertragung. Umsetzung **vor Produktivbetrieb**
(Voraussetzung für den Go-Live).

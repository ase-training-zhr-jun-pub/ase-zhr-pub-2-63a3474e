# ADR-002: Ressourcendaten als Mock-Daten in der SPA

**Status**: Akzeptiert

## Kontext

Calvin verwaltet **Ressourcen** — Standorte, Konferenzräume und deren Ausstattung. Denkbar
war ein eigenständiger **Ressource-Service**, der diesen Katalog besitzt und bereitstellt.

Für die Prototyping-Phase ist schnelle Iteration ohne zusätzliche Services oder Datenbanken
gewünscht. Die SPA enthält bereits Mock-Daten für Standorte, Räume und Ausstattung
(`frontend/src/lib/mock-data.ts`).

## Entscheidung

Es wird **kein separater Ressource-Service** gebaut. Der Ressource-Service wird in die SPA
**integriert**: Standorte, Räume und Ausstattungen werden als **Mock-Daten in der SPA**
hinterlegt.

Der **Booking Service** arbeitet ausschließlich mit den **Ressourcen-IDs** aus diesen
Mock-Daten. Er verwaltet keinen eigenen Ressourcenkatalog und validiert ihn nicht.

## Begründung

- Schnellere Prototyping-Iteration mit weniger beweglichen Teilen (kein zusätzlicher
  Service, keine zusätzliche Datenbank).
- Ressourcendaten sind im Prototyp weitgehend statisch und ändern sich selten.
- Der Booking Service bleibt fokussiert auf Buchungslogik und Konfliktprüfung
  ([QS-1](../qualitätsanforderungen.md#qs-1-keine-doppelbuchungen-bei-gleichzeitigen-anfragen)).

## Konsequenzen

**Positiv**
- Einfacher Betrieb und schnelle UI-Iteration, keine Catalog-Service-Infrastruktur.
- Klare Verantwortlichkeit: Booking Service kümmert sich nur um Buchungen.

**Negativ / technische Schuld**
- Keine **referenzielle Integrität**: Der Booking Service kann nicht prüfen, ob eine
  Raum-ID existiert oder ob Kapazität/Ausstattung zur Buchung passen.
- Mock-Daten in der SPA und die ID-Annahmen im Backend müssen **manuell konsistent**
  gehalten werden.
- Vor Produktivbetrieb ist ein echter Ressource-Service bzw. ein persistenter Katalog
  erforderlich. → siehe [technische Schulden](../technische-schulden.md) (TS-1).

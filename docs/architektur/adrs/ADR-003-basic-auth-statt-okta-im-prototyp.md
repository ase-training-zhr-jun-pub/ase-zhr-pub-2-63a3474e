# ADR-003: Basic-Auth ohne Passwörter statt Okta im Prototyp

**Status**: Akzeptiert

## Kontext

[QS-4 (Sicherheit & Datenschutz)](../qualitätsanforderungen.md#qs-4-schutz-von-zugang-und-personenbezogenen-buchungsdaten)
verlangt, dass nur authentifizierte INNOQ-Mitarbeiter zugreifen und personenbezogene
Buchungsdaten geschützt sind. Langfristig ist eine **Okta-Integration (OIDC)** als
zentraler Identity Provider vorgesehen.

Für die Prototyping-Phase wollen wir schnell mit **verschiedenen Nutzern** testen und
dabei **keine Abhängigkeit zu Drittsystemen** eingehen.

## Entscheidung

Für den Prototyp wird **auf die Okta-Integration verzichtet**. Stattdessen setzen wir auf
**Basic-Auth ohne Passwörter**: Der übermittelte Nutzername identifiziert den handelnden
Nutzer, ein Passwort wird nicht geprüft.

Die Okta-/OIDC-Integration wird **nachgeliefert**, sobald das System in Produktion geht.

## Begründung

- **Schnelles Testen** mit verschiedenen Nutzern durch einfachen Nutzerwechsel
  (z. B. zum Prüfen von Buchungskonflikten zwischen zwei Personen).
- **Keine Abhängigkeit** zu Drittsystemen während des Prototypings.
- Der Auth-Mechanismus ist über Spring Security gekapselt und später **austauschbar**,
  ohne die Buchungslogik zu berühren.

## Konsequenzen

**Positiv**
- Schnelle Iteration und einfache Testbarkeit unterschiedlicher Nutzer.
- Keine externe Kopplung, kein Onboarding-Aufwand für einen Identity Provider.

**Negativ / technische Schuld**
- **Keine echte Authentifizierung/Autorisierung**: Es gibt keinen Identitätsnachweis und
  keinen Zugriffsschutz. [QS-4](../qualitätsanforderungen.md#qs-4-schutz-von-zugang-und-personenbezogenen-buchungsdaten)
  ist im Prototyp **nicht erfüllt**.
- **Nicht produktionstauglich**. Vor Produktivbetrieb ist die Okta-/OIDC-Integration
  zwingend nachzurüsten. → siehe [technische Schulden](../technische-schulden.md) (TS-2).

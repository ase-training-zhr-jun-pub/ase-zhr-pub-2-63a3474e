---
Ticket-ID: CLVN-029
Type: Subtask
Story: CLVN-016
Status: TODO
---

# Raumauswahl mit Hervorhebung und Inline-Zusammenfassung

## Kontext

In Schritt 2 des Buchungsprozesses (`schritt-raeume.tsx`) führt ein Klick auf „Auswählen"
heute sofort zum nächsten Schritt — ohne Hervorhebung und ohne Möglichkeit, die Auswahl
vorher zu prüfen oder zu ändern. CLVN-016 fordert, dass ein ausgewählter Konferenzraum
visuell hervorgehoben und mit Details + Zeitraum angezeigt wird und die Auswahl änderbar
bleibt. Dieser Subtask baut die Auswahl-Logik um; die Bestätigung folgt in CLVN-030.

## Beschreibung

`schritt-raeume.tsx` wird von der Sofort-Navigation auf eine **lokale Vorauswahl** umgestellt.
Ein Klick auf einen verfügbaren Konferenzraum markiert ihn als vorausgewählt und navigiert
**nicht** mehr. Die vorausgewählte Raumkarte wird visuell hervorgehoben. Unterhalb der Liste
erscheint ein Inline-Panel mit der Zusammenfassung der Vorauswahl (über die in CLVN-028
erstellte `RaumZusammenfassung`): Raumdetails **und** der gewählte Zeitraum.

Die Vorauswahl wird im lokalen Komponenten-State gehalten und aus dem bestehenden
Buchungs-Entwurf initialisiert, sodass ein zuvor bestätigter Raum bei Rückkehr wieder
markiert ist. Ein Klick auf eine andere Karte ändert die Vorauswahl. Der Pfad für belegte
Räume („Ab HH:MM buchen") passt den Zeitraum an und setzt die Vorauswahl, navigiert aber
ebenfalls nicht.

In diesem Subtask wird der Buchungs-Entwurf (`raumId`) noch **nicht** final gesetzt — das
geschieht erst beim Bestätigen in CLVN-030.

**Definition of Done**
- Klick auf einen freien Konferenzraum hebt die Karte hervor, ohne zu navigieren.
- Inline-Panel zeigt Raumdetails (Name, Standort, Ausstattung, Kapazität) und Zeitraum.
- Auswahl ist durch Klick auf eine andere Karte änderbar.
- „Ab HH:MM buchen" passt den Zeitraum an und wählt vor, ohne zu navigieren.
- Noch kein Bestätigen-Button; Entwurf-`raumId` wird hier nicht final gesetzt.
- `npm run build` ist grün; Wording gemäß Glossar.

**Abhängigkeit:** baut auf CLVN-028 auf.

---
Ticket-ID: CLVN-016
Type: Story
Epic: CLVN-015
Status: TODO
---
# Raumauswahl bestätigen

## User Story

Als INNOQ-Mitarbeiter möchte ich meine Raumauswahl bestätigen, damit ich den für mich passenden Konferenzraum reservieren kann.

## Beschreibung

Nachdem ein INNOQ-Mitarbeiter einen verfügbaren Konferenzraum für sein Meeting oder seinen Workshop gefunden hat, möchte er diesen Raum verbindlich auswählen. Die Bestätigung der Raumauswahl ist der erste Schritt im Buchungsprozess und führt den Mitarbeiter zur weiteren Eingabe von Buchungsdetails wie Meetingtitel und optionaler Buchungsnotiz.

Diese User Story ist zentral für das Epic "Raum buchen", da sie den Übergang von der Raumsuche zur eigentlichen Buchung darstellt. Der Mitarbeiter erhält durch die Bestätigung eine visuelle Rückmeldung, dass sein gewünschter Raum für den Buchungsvorgang ausgewählt wurde.

## Akzeptanzkriterien

- [ ] Ein verfügbarer Konferenzraum kann durch Klick/Tap ausgewählt werden
- [ ] Der ausgewählte Konferenzraum wird visuell hervorgehoben
- [ ] Die Raumdetails (Name, Standort, Ausstattung, Kapazität) werden bei der Auswahl angezeigt
- [ ] Der gewählte Zeitraum wird bei der Auswahl angezeigt
- [ ] Eine Bestätigungsschaltfläche ermöglicht das Fortfahren zum nächsten Buchungsschritt
- [ ] Die Auswahl kann vor der Bestätigung geändert werden
- [ ] Nach Bestätigung wird der Mitarbeiter zur Eingabe weiterer Buchungsdetails weitergeleitet

## Betroffene Persona

[INNOQ-Mitarbeiter](/docs/produkt/personas/innoq-mitarbeiter.md)

## Zugehöriges Epic

[CLVN-015 - Raum buchen](/docs/produkt/backlog/CLVN-015-EPIC-raum-buchen.md)

## Planung

Reine Frontend-Story (kein Backend, Daten gemockt). Schritt 2 des Buchungsprozesses
(`schritt-raeume.tsx`) wird vom Sofort-Sprung in den Ablauf
**Auswählen → Hervorheben → Zusammenfassung (Details + Zeitraum) → Bestätigen → Schritt 3**
umgebaut. Die Zusammenfassung wird als wiederverwendbare Komponente extrahiert und mit
Schritt 3 geteilt. Darstellung als Inline-Panel; Auswahl und Bestätigung sind getrennt
(keine Express-Auswahl).

## Subtasks

- [CLVN-028 RaumZusammenfassung-Komponente extrahieren](./CLVN-028-SUBTASK-raumzusammenfassung-extrahieren.md)
- [CLVN-029 Raumauswahl mit Hervorhebung und Inline-Zusammenfassung](./CLVN-029-SUBTASK-auswahl-und-hervorhebung.md)
- [CLVN-030 Raumauswahl bestätigen und fortfahren](./CLVN-030-SUBTASK-auswahl-bestaetigen.md)

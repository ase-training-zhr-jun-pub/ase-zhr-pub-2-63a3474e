---
Ticket-ID: CLVN-031
Type: Story
Epic: CLVN-015
Status: TODO
---
# Wiederkehrende Buchung (Serientermin) anlegen

## User Story

Als INNOQ-Mitarbeiter möchte ich eine Raumbuchung als wiederkehrenden Serientermin anlegen, damit ich meinen festen Bürotag nicht jede Woche einzeln buchen muss.

## Beschreibung

Laut Persona hat Alex Berger einen festen wöchentlichen Bürotag und plant Bürobesuche 3–7 Tage im Voraus. Für solche wiederkehrenden Anlässe ist das wöchentliche Einzelbuchen desselben Konferenzraums mühsam und fehleranfällig. Eine Serienbuchung erlaubt es, einen Raum in einem festen Rhythmus (z. B. „jeden Dienstag 09:00–12:00 in Köln, für 8 Wochen") in einem Schritt zu reservieren.

Da Calvin Doppelbuchungen zuverlässig verhindern muss (Verfügbarkeitsanzeige, QS-1), wird **jeder Einzeltermin der Serie** separat auf Verfügbarkeit geprüft. Termine, an denen der gewünschte Konferenzraum bereits belegt ist, werden vor dem Absenden klar gekennzeichnet, sodass der Mitarbeiter sie abwählen oder einen anderen Raum wählen kann. So bleibt die Serienbuchung transparent und erzeugt keine ungewollten Konflikte.

Die Einzeltermine einer Serie erscheinen als zusammengehörige Buchungen in „Meine Buchungen" und können sowohl einzeln als auch als gesamte Serie storniert werden.

## Akzeptanzkriterien

- [ ] Beim Buchen kann eine Wiederholung gewählt werden (mindestens wöchentlich; optional zweiwöchentlich)
- [ ] Das Ende der Serie ist festlegbar (Enddatum oder Anzahl der Termine)
- [ ] Jeder Einzeltermin der Serie wird auf Verfügbarkeit des Konferenzraums geprüft
- [ ] Einzeltermine mit Konflikt werden vor dem Absenden deutlich gekennzeichnet
- [ ] Konfliktbehaftete Einzeltermine können abgewählt/übersprungen werden, der Rest wird gebucht
- [ ] Die gebuchten Termine erscheinen als zusammengehörige Serie in „Meine Buchungen"
- [ ] Ein einzelner Termin der Serie kann separat storniert werden
- [ ] Die gesamte Serie kann in einem Schritt storniert werden

## Betroffene Persona

[INNOQ-Mitarbeiter](/docs/produkt/personas/innoq-mitarbeiter.md)

## Zugehöriges Epic

[CLVN-015 - Raum buchen](/docs/produkt/backlog/CLVN-015-EPIC-raum-buchen.md)

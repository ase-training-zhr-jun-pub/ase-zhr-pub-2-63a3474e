---
Ticket-ID: CLVN-035
Type: Story
Epic: CLVN-033
Status: TODO
---
# Benachrichtigung bei Änderung oder Stornierung einer Buchung

## User Story

Als INNOQ-Mitarbeiter möchte ich benachrichtigt werden, wenn eine meiner Buchungen geändert oder storniert wird, damit ich rechtzeitig reagieren kann.

## Beschreibung

Buchungen können sich nach dem Anlegen ändern: Ein einzelner Termin einer Serie lässt sich nicht reservieren, eine Buchung wird verschoben, oder eine Reservierung wird storniert. Ohne aktive Rückmeldung würde der Mitarbeiter eine solche Änderung erst bemerken, wenn er vor einem nicht mehr verfügbaren Konferenzraum steht – das widerspricht dem Kernbedürfnis „Sicherheit".

Calvin informiert den betroffenen Mitarbeiter deshalb unmittelbar über relevante Änderungen an seinen eigenen Buchungen. Die Benachrichtigung erscheint in der Anwendung (Glocke), benennt die betroffene Buchung (Konferenzraum, Standort, Datum, Zeitfenster) und – sofern bekannt – den Grund der Änderung. So kann der Mitarbeiter zeitnah einen Ersatz buchen oder seine Planung anpassen.

## Akzeptanzkriterien

- [ ] Wird eine eigene Buchung storniert, erhält der Mitarbeiter eine Benachrichtigung
- [ ] Wird eine eigene Buchung verschoben/geändert, erhält der Mitarbeiter eine Benachrichtigung
- [ ] Kann ein Einzeltermin einer Serie nicht gebucht werden, wird der Mitarbeiter darüber informiert
- [ ] Die Benachrichtigung nennt die betroffene Buchung (Konferenzraum, Standort, Datum, Zeitfenster)
- [ ] Sofern bekannt, wird der Grund der Änderung angegeben
- [ ] Die Glocke im Kopfbereich kennzeichnet neue, ungelesene Benachrichtigungen

## Betroffene Persona

[INNOQ-Mitarbeiter](/docs/produkt/personas/innoq-mitarbeiter.md)

## Zugehöriges Epic

[CLVN-033 - Benachrichtigungen](/docs/produkt/backlog/CLVN-033-EPIC-benachrichtigungen.md)

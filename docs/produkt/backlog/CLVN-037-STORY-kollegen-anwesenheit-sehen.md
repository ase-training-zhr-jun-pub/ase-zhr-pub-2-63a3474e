---
Ticket-ID: CLVN-037
Type: Story
Epic: CLVN-036
Status: TODO
---
# Kollegen-Anwesenheit am Standort sehen

## User Story

Als INNOQ-Mitarbeiter möchte ich sehen, welche Kollegen an einem bestimmten Tag an einem Standort sind, damit ich meinen Bürotag für persönliche Treffen nutzen kann.

## Beschreibung

Ein wesentlicher Pain-Point der Persona ist die fehlende Übersicht über die Anwesenheit von Kollegen am eigenen Bürotag – wodurch Gelegenheiten für persönliche Treffen verloren gehen. Da Mitarbeiter überwiegend remote arbeiten und nur selten vor Ort sind, ist es für die Planung wertvoll zu wissen, wer am gewählten Tag am gewünschten Standort ist.

Calvin zeigt dazu pro Standort und Datum die anwesenden Kollegen an. Grundlage ist die für diesen Tag/Standort signalisierte Anwesenheit (siehe CLVN-038) bzw. eine bestehende Raumbuchung am Standort. Der Mitarbeiter kann Datum und Standort wählen, um seinen Bürotag bewusst zu planen. Es werden ausschließlich die für die Koordination nötigen Informationen angezeigt (Name, Standort, Tag) – personenbezogene Daten werden datenschutzkonform sparsam behandelt (QS-4 / DSGVO).

## Akzeptanzkriterien

- [ ] Für einen gewählten Standort und ein gewähltes Datum werden die anwesenden Kollegen angezeigt
- [ ] Datum und Standort sind frei wählbar
- [ ] Die Anzeige berücksichtigt signalisierte Anwesenheit und/oder bestehende Raumbuchungen am Standort
- [ ] Pro Kollege werden nur Name und Anwesenheit (kein darüber hinausgehendes Profil) angezeigt
- [ ] Sind keine Kollegen angekündigt, wird ein verständlicher Hinweis angezeigt
- [ ] Die eigene Anwesenheit ist in der Übersicht erkennbar

## Betroffene Persona

[INNOQ-Mitarbeiter](/docs/produkt/personas/innoq-mitarbeiter.md)

## Zugehöriges Epic

[CLVN-036 - Büropräsenz](/docs/produkt/backlog/CLVN-036-EPIC-bueropraesenz.md)

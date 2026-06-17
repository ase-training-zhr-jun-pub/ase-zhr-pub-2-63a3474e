---
Ticket-ID: CLVN-028
Type: Subtask
Story: CLVN-016
Status: TODO
---

# RaumZusammenfassung-Komponente extrahieren

## Kontext

Schritt 3 des Buchungsprozesses (`schritt-details.tsx`) enthält bereits eine
Zusammenfassungs-Card, die einen Konferenzraum mit Name, Beschreibung, Standort, Etage,
Datum, Zeitraum, Kapazität und Ausstattung darstellt. CLVN-016 verlangt genau diese
Darstellung „bei der Auswahl" auch in Schritt 2. Damit die Darstellung nur an einer Stelle
gepflegt wird, soll die Card zuerst in eine wiederverwendbare Komponente herausgelöst
werden — als Baustein für CLVN-029.

## Beschreibung

Die Zusammenfassungs-Darstellung eines Konferenzraums wird in eine eigene, wiederverwendbare
Komponente `frontend/src/components/raum-zusammenfassung.tsx` extrahiert. Schritt 3
(`schritt-details.tsx`) nutzt anschließend diese Komponente statt des Inline-Markups.

Es handelt sich um ein **reines Refactoring ohne sichtbare Verhaltensänderung** — Schritt 3
sieht für den Nutzer unverändert aus.

Die Komponente stellt dar: Raumname, Beschreibung, Standort + Etage, Datum, Zeitraum,
Kapazität und die Ausstattung (über die bestehende `AusstattungListe`). Wording gemäß
Glossar („Konferenzraum", „Standort", „Ausstattung", „Kapazität").

**Definition of Done**
- Neue Komponente `raum-zusammenfassung.tsx` rendert alle genannten Angaben aus ihren Props.
- `schritt-details.tsx` verwendet die neue Komponente; Darstellung ist unverändert.
- Keine weitere Änderung am Buchungsverhalten.
- `npm run build` (TypeScript-Typecheck) ist grün.

**Abhängigkeit:** keine. Vorbedingung für CLVN-029.

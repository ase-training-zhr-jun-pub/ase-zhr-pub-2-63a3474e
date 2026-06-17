---
Ticket-ID: CLVN-030
Type: Subtask
Story: CLVN-016
Status: TODO
---

# Raumauswahl bestätigen und fortfahren

## Kontext

Nach CLVN-029 lässt sich ein Konferenzraum in Schritt 2 vorauswählen, hervorheben und mit
Zusammenfassung anzeigen — es fehlt jedoch die eigene Bestätigungsschaltfläche, die CLVN-016
verlangt, sowie die Weiterleitung zum nächsten Buchungsschritt. Dieser Subtask schließt die
Story ab: Aus der unverbindlichen Vorauswahl wird per Klick die verbindliche Übernahme in
den Buchungsvorgang.

## Beschreibung

Im Inline-Panel der Raumauswahl wird eine **Bestätigungsschaltfläche** ergänzt (z. B. „Weiter
zu den Details"). Sie ist nur aktiv, wenn ein Konferenzraum vorausgewählt ist. Beim Klick
wird die Vorauswahl in den Buchungs-Entwurf übernommen (`raumId`) und der Nutzer zu Schritt 3
(Eingabe weiterer Buchungsdetails) weitergeleitet.

Damit ist der vollständige Ablauf der Story abgebildet: Auswählen → Hervorheben →
Zusammenfassung prüfen → ggf. ändern → bestätigen → Schritt 3. Der Pfad für belegte Räume
(angepasster Zeitraum aus CLVN-029) läuft über dieselbe Bestätigung.

**Definition of Done**
- Bestätigungsschaltfläche ist ohne Vorauswahl inaktiv, mit Vorauswahl aktiv.
- Klick übernimmt den Konferenzraum in den Buchungs-Entwurf und navigiert zu Schritt 3.
- Schritt 3 zeigt den korrekten Raum und Zeitraum.
- Der „Ab HH:MM"-Fall führt über denselben Bestätigungspfad.
- Alle Akzeptanzkriterien von CLVN-016 sind erfüllt; `npm run build` ist grün.

**Abhängigkeit:** baut auf CLVN-029 auf.

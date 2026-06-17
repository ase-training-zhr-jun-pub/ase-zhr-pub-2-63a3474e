# Qualitätsanforderungen: Calvin

Dieses Dokument beschreibt die zentralen **Qualitätsszenarien** für Calvin, INNOQs
internes Raumbuchungssystem. Jedes Szenario folgt dem sechsteiligen Template

> **Environment · Source · Event · Artifact · Response · Measure**

und macht damit eine Qualitätsanforderung konkret, testbar und nachvollziehbar.

Die Szenarien ergänzen die Qualitätsziele aus
[Kapitel 1 der arc42-Dokumentation](../arc42/arc42.md#qualitätsziele) und detaillieren
[Kapitel 10 (Qualitätsanforderungen)](../arc42/arc42.md#qualitätsanforderungen).

---

## Interview-Kontext

Die Szenarien wurden auf Basis eines kurzen Interviews mit dem fachlich Verantwortlichen
erstellt. Festgehaltene Rahmenbedingungen:

| Aspekt | Festlegung |
|--------|------------|
| **Abgedeckte Qualitätsmerkmale** | Zuverlässigkeit, Performance, Benutzbarkeit, Sicherheit & Datenschutz sowie ergänzend Verfügbarkeit |
| **Basis der Schwellwerte (Measure)** | Konsistent zu den bestehenden arc42-Zielen (u. a. 500 ms Suche, 150 gleichzeitige Nutzer, 98 % Verfügbarkeit, 99,9 % Konfliktverhinderung, 5 Min Erstbuchung) |
| **Last- und Umgebungsannahme** | Realistisch heute: 8 Standorte, ~40 Konferenzräume, bis zu 150 gleichzeitige Nutzer in Stoßzeiten (Montag-/Freitagmorgen) |

---

## Qualitätsbaum (Priorisierung)

| Priorität | ID | Qualitätsmerkmal | Bewertung |
|-----------|----|------------------|-----------|
| 1 | **QS-1** | Zuverlässigkeit – keine Doppelbuchungen | Kritisch · Kernfeature |
| 2 | **QS-2** | Performance – Raumsuche | Hoch · direkte Nutzererfahrung |
| 3 | **QS-3** | Benutzbarkeit – Erstbuchung ohne Schulung | Hoch · essentiell für Akzeptanz |
| 4 | **QS-4** | Sicherheit & Datenschutz | Hoch · gesetzliche Pflicht (DSGVO) |
| 5 | **QS-5** | Verfügbarkeit – Kernarbeitszeit | Mittel · Ausfälle kompensierbar |

---

## QS-1: Keine Doppelbuchungen bei gleichzeitigen Anfragen

**Qualitätsmerkmal:** Zuverlässigkeit / Datenintegrität · **Priorität:** Kritisch

| Feld | Beschreibung |
|------|--------------|
| **Environment** (Umgebung) | Normalbetrieb während einer Stoßzeit (Montagmorgen), bis zu 150 gleichzeitige Nutzer. |
| **Source** (Quelle) | Zwei INNOQ-Mitarbeiter (Consultants) an unterschiedlichen Standorten/Geräten. |
| **Event** (Ereignis) | Beide senden quasi-gleichzeitig (innerhalb derselben Sekunde) eine Raumbuchung für **denselben** Konferenzraum mit überlappendem Zeitraum. |
| **Artifact** (Artefakt) | Booking Service – Konfliktprüfung und persistente Buchungsdaten. |
| **Response** (Reaktion) | Die erste vollständige Anfrage wird bestätigt; die zweite wird serverseitig abgelehnt, mit verständlicher Fehlermeldung und Hinweis auf alternative Zeitfenster. Es entstehen keine widersprüchlichen Datensätze. |
| **Measure** (Messung) | In ≥ **99,9 %** der konkurrierenden Fälle entsteht keine Doppelbuchung. Die abgelehnte Anfrage erhält eine Antwort in < 1 s. |

> **Bezug:** Verhinderung von Doppelbuchungen ist das Kernversprechen aus der
> Produktvision („Sicherheit, dass ein gebuchter Konferenzraum tatsächlich frei ist").

> ⚠️ **Umsetzungsstand im Prototyp:** Die zeitliche Konfliktprüfung greift, die **Existenz/Gültigkeit
> der Ressource** wird serverseitig aber nicht validiert — Ressourcen liegen als Mock-Daten in der
> SPA ([ADR-002](adrs/ADR-002-ressourcendaten-als-mock-in-spa.md)). Erfasst als technische Schuld
> [TS-1](technische-schulden.md#ts-1-ressourcendaten-nur-als-mock-in-der-spa).

---

## QS-2: Schnelle Anzeige verfügbarer Räume

**Qualitätsmerkmal:** Performance / Antwortzeit · **Priorität:** Hoch

| Feld | Beschreibung |
|------|--------------|
| **Environment** (Umgebung) | Normale Arbeitszeit unter Stoßlast, bis zu 150 gleichzeitige Nutzer. |
| **Source** (Quelle) | Ein INNOQ-Mitarbeiter (z. B. die Persona Alex Berger) über die SPA. |
| **Event** (Ereignis) | Löst eine Verfügbarkeitssuche für einen Standort, ein Datum und einen Zeitraum aus. |
| **Artifact** (Artefakt) | SPA und Such-/Verfügbarkeits-Endpunkt des Booking Service. |
| **Response** (Reaktion) | Die Liste der verfügbaren Konferenzräume inkl. Verfügbarkeits-Status (frei/belegt) wird angezeigt. |
| **Measure** (Messung) | Das **95. Perzentil** der serverseitigen Antwortzeit liegt bei ≤ **500 ms**; das Ergebnis ist im Browser in < 1 s sichtbar. |

> **Bezug:** Schnelle Ergebnisse unterstützen die „unkomplizierte Buchung ohne Bürokratie"
> – besonders für Mitarbeiter mit nur einem Bürotag pro Woche.

---

## QS-3: Erstbuchung ohne Schulung

**Qualitätsmerkmal:** Benutzbarkeit / Erlernbarkeit · **Priorität:** Hoch

| Feld | Beschreibung |
|------|--------------|
| **Environment** (Umgebung) | Normalbetrieb, ohne vorherige Schulung und ohne fremde Hilfe, auf Desktop oder Mobilgerät. |
| **Source** (Quelle) | Ein neuer INNOQ-Mitarbeiter, der Calvin zum ersten Mal nutzt. |
| **Event** (Ereignis) | Möchte für den nächsten Bürotag einen Konferenzraum buchen. |
| **Artifact** (Artefakt) | SPA – Buchungs-Flow (Standort → Zeitraum → Raum → Bestätigung). |
| **Response** (Reaktion) | Findet selbsterklärend durch den Flow und schließt die Raumbuchung erfolgreich ab, inkl. Buchungsbestätigung. |
| **Measure** (Messung) | Die Erstbuchung gelingt in ≤ **5 Minuten** und ≤ **20 Klicks**; ≥ **90 %** der neuen Mitarbeiter schaffen sie ohne Hilfe. |

> **Bezug:** Niedrige Einstiegshürde fördert die angestrebte hohe Mitarbeiterakzeptanz.

---

## QS-4: Schutz von Zugang und personenbezogenen Buchungsdaten

**Qualitätsmerkmal:** Sicherheit & Datenschutz (Authentifizierung, DSGVO) · **Priorität:** Hoch

| Feld | Beschreibung |
|------|--------------|
| **Environment** (Umgebung) | Normalbetrieb; Zugriff erfolgt über das Netzwerk hinter dem Proxy (HTTPS). |
| **Source** (Quelle) | Eine nicht authentifizierte Person bzw. ein Nutzer ohne Berechtigung (externer Akteur oder Mitarbeiter, der fremde Buchungsdaten einsehen will). |
| **Event** (Ereignis) | Versucht, einen Buchungs-Endpunkt aufzurufen oder personenbezogene Buchungsdaten abzurufen, ohne gültige Authentifizierung/Autorisierung. |
| **Artifact** (Artefakt) | Booking Service – API-Endpunkte, Authentifizierung/Autorisierung und gespeicherte personenbezogene Buchungsdaten (wer hat wann welchen Raum gebucht). |
| **Response** (Reaktion) | Der Zugriff wird abgewiesen (401/403); keine personenbezogenen Daten werden preisgegeben. Die Übertragung erfolgt ausschließlich TLS-verschlüsselt, der Versuch wird protokolliert. |
| **Measure** (Messung) | **100 %** der lesenden und schreibenden Buchungs-Endpunkte erfordern eine gültige INNOQ-Authentifizierung; **0** personenbezogene Datensätze ohne Berechtigung abrufbar; Datenübertragung zu 100 % per TLS; Aufbewahrung/Löschung gemäß DSGVO. |

> **Bezug:** Calvin verarbeitet personenbezogene Daten (Anwesenheit/Buchungen). Zugriff nur
> für INNOQ-Mitarbeiter und datensparsamer Umgang sind rechtliche und Vertrauensvoraussetzung.

> ⚠️ **Umsetzungsstand im Prototyp:** Dieses Szenario ist **noch nicht erfüllt**. Der Prototyp
> nutzt Basic-Auth ohne Passwörter statt Okta/OIDC ([ADR-003](adrs/ADR-003-basic-auth-statt-okta-im-prototyp.md)).
> Die Nachrüstung vor Produktivbetrieb ist als technische Schuld
> [TS-2](technische-schulden.md#ts-2-basic-auth-ohne-passwörter-statt-okta) erfasst.

---

## QS-5: Verfügbarkeit während der Kernarbeitszeit

**Qualitätsmerkmal:** Verfügbarkeit · **Priorität:** Mittel

| Feld | Beschreibung |
|------|--------------|
| **Environment** (Umgebung) | Kernarbeitszeit an Werktagen (Mo–Fr, 8:00–18:00 Uhr). |
| **Source** (Quelle) | Ein technischer Ausfall (Crash des Booking Service oder Infrastrukturstörung), erkannt durch die Betriebsüberwachung. |
| **Event** (Ereignis) | Der Booking Service fällt unerwartet aus. |
| **Artifact** (Artefakt) | Booking Service und seine Betriebsumgebung; die SPA als vorgelagerte Schicht. |
| **Response** (Reaktion) | Der Ausfall wird erkannt und der Dienst (automatisch) neu gestartet/wiederhergestellt. Währenddessen zeigt die SPA eine klare Statusmeldung statt fehlerhafter Buchungen. |
| **Measure** (Messung) | ≥ **98 %** Verfügbarkeit während der Kernarbeitszeit; Wiederherstellung (MTTR) ≤ **30 Minuten**. |

> **Bezug:** Ausfälle sind über alternative Kanäle kompensierbar, sollen den Buchungsprozess
> aber nicht spürbar behindern.

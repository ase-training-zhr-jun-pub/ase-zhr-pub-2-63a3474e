---
paths:
  - frontend/**/*
---
# Frontend-Prototyp Scope

## Kein Backend

Der Frontend-Prototyp arbeitet **ohne Backend**. Alle Daten werden im Frontend gemockt.

- Mock-Daten in `frontend/src/lib/mock-data.ts` zentralisieren
- Mock-Daten sollen realistisch sein: echte INNOQ-Standortnamen, plausible Raumnamen, realistische Zeitslots
- Keine HTTP-Requests an ein Backend — das Backend wird an einem anderen Schulungstag gebaut und angestöpselt

## SPA mit Routing

- `react-router-dom` für clientseitiges Routing nutzen
- URLs sollen sich beim Navigieren aktualisieren
- Routen in `frontend/src/App.tsx` definieren

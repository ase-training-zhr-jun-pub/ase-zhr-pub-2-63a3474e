---
paths:
  - frontend/**/*
---
# Frontend Tech-Stack

## Stack

- **React 19** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS v4** (CSS-only Config via `@theme`, kein `tailwind.config.js`)
- **ShadCN UI** (base-nova Style) als Komponentenbibliothek

## Befehle

| Aktion | Befehl |
|---|---|
| Dev-Server starten | `cd frontend && npm run dev` |
| Build erstellen | `cd frontend && npm run build` |
| ShadCN Komponente hinzufügen | `cd frontend && npx shadcn@latest add <name> --overwrite` |
| Mehrere Komponenten auf einmal | `cd frontend && npx shadcn@latest add button dialog card --overwrite` |
| Verfügbare Komponenten anzeigen | `cd frontend && npx shadcn@latest list` |

## Konventionen

- **Import-Alias:** `@/` → `frontend/src/` (z.B. `import { Button } from "@/components/ui/button"`)
- **ShadCN-Komponenten** liegen in `frontend/src/components/ui/`
- **Eigene Komponenten** liegen in `frontend/src/components/`
- **Styling:** Tailwind-Klassen verwenden, `cn()` aus `@/lib/utils` zum Zusammenführen von Klassen
- **Seiten** liegen in `frontend/src/pages/`

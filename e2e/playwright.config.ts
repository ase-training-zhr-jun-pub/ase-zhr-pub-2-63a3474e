import { defineConfig, devices } from "@playwright/test"

/**
 * Calvin E2E-Tests mit Playwright.
 *
 * Voraussetzungen:
 *   - Backend läuft auf http://localhost:8081 (cd ../backend && mvn spring-boot:run)
 *   - Browser installiert: npm run install-browsers
 *
 * Starten:
 *   npm test             – headless
 *   npm run test:headed  – sichtbares Browser-Fenster
 *   npm run test:ui      – interaktiver Playwright-UI-Modus
 */
export default defineConfig({
  testDir: "./tests",

  // Sequenziell ausführen: Tests greifen auf dieselbe Backend-DB zu.
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,

  reporter: [["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Vite-Dev-Server automatisch starten (oder vorhandenen wiederverwenden).
  // Das Backend muss separat laufen.
  webServer: {
    command: "npm run dev",
    cwd: "../frontend",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})

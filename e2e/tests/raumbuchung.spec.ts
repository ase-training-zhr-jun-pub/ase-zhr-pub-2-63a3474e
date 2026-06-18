import { test, expect, type Page, type APIRequestContext } from "@playwright/test"

const BACKEND_URL = "http://localhost:8081"
const BUCHUNGS_TITEL = "E2E-Test Meeting"

/**
 * Storniert alle bestätigten E2E-Testbuchungen im Backend, damit Räume vor
 * jedem Lauf wieder frei sind. Playwright's request-Kontext umgeht den
 * Vite-Proxy und spricht das Backend direkt an.
 */
async function testbuchungenBereinigen(request: APIRequestContext) {
  const resp = await request.get(
    `${BACKEND_URL}/api/buchungen?nutzer=Alex+Berger`
  )
  if (!resp.ok()) return

  const buchungen: Array<{ id: string; titel: string; status: string }> =
    await resp.json()
  const zuStornieren = buchungen.filter(
    (b) => b.titel === BUCHUNGS_TITEL && b.status === "bestätigt"
  )
  await Promise.all(
    zuStornieren.map((b) =>
      request.post(`${BACKEND_URL}/api/buchungen/${b.id}/stornierung`)
    )
  )
}

test.beforeEach(async ({ request }) => {
  await testbuchungenBereinigen(request)
})

/**
 * Hilfsfunktion zum Bedienen der ShadCN/Radix-Select-Komponenten.
 *
 * ShadCN Select rendert einen <button role="combobox"> als Trigger und öffnet
 * die Optionsliste in einem Portal. Die Funktion findet den Trigger über das
 * zugehörige <label>, klickt ihn und wählt dann die gewünschte Option.
 *
 * @param page        Playwright-Page
 * @param labelText   Sichtbarer Text des Labels (z. B. "Standort", "Datum")
 * @param option      Exakter Text oder RegExp der zu wählenden Option
 */
async function selectOption(
  page: Page,
  labelText: string,
  option: string | RegExp
) {
  // Label-Element finden → Eltern-Div → Combobox-Trigger
  await page
    .locator("label")
    .filter({ hasText: labelText })
    .locator("xpath=..")
    .getByRole("combobox")
    .click()

  await page.getByRole("option", { name: option }).click()
}

test(
  "Raumbuchungsprozess: Buchung anlegen und in der Übersicht verifizieren",
  { tag: "@happy-path" },
  async ({ page }) => {
    // ── Schritt 1: Buchungsübersicht öffnen ─────────────────────────────────
    // Anzahl bevorstehender Buchungen merken (steht im Tab-Label als "(N)")
    const bevorstehendTab = page.getByRole("tab", { name: /Bevorstehend/ })
    let anzahlVorher = 0

    await test.step("Buchungsübersicht öffnen", async () => {
      // Auf die API-Response warten, bevor wir das Tab-Label lesen —
      // der Fetch startet erst nach dem ersten Render (useEffect), daher
      // reicht waitForLoadState('networkidle') allein nicht aus.
      const buchungenResponse = page.waitForResponse(
        (r) => r.url().includes("/api/buchungen") && r.status() === 200
      )
      await page.goto("/buchungen")
      await buchungenResponse

      const tabTextVorher = await bevorstehendTab.textContent()
      anzahlVorher = parseInt(tabTextVorher?.match(/\((\d+)\)/)?.[1] ?? "0")
    })

    // ── Schritt 2: Buchungsformular öffnen ──────────────────────────────────
    await test.step("Buchungsformular öffnen", async () => {
      await page.getByRole("button", { name: "Neue Buchung" }).click()
      await page.waitForURL("**/buchen")
    })

    // ── Schritt 3: Standort und Datum auswählen ──────────────────────────────
    await test.step("Standort und Datum wählen", async () => {
      // Berlin hat für "Morgen" keine Seed-Buchungen → alle Räume frei
      await selectOption(page, "Standort", /^Berlin/)

      // "Morgen" = HEUTE+1 (HEUTE ist im Prototyp fest auf 2026-06-17 gesetzt)
      await selectOption(page, "Datum", /^Morgen/)

      // Von/Bis bleiben auf den Standardwerten 09:00–10:00
    })

    // ── Schritt 4: Zur Raumliste navigieren ─────────────────────────────────
    await test.step("Raumliste öffnen", async () => {
      await page.getByRole("button", { name: "Räume anzeigen" }).click()
      await page.waitForURL("**/buchen/raeume")
    })

    // ── Schritt 5: Raum auswählen ────────────────────────────────────────────
    await test.step("Raum auswählen", async () => {
      // Warten bis die Verfügbarkeitsprüfung gegen das Backend abgeschlossen ist
      await expect(
        page.getByText("Verfügbarkeit wird geprüft")
      ).not.toBeVisible({ timeout: 10_000 })

      // Ersten freien Raum wählen ("Auswählen"-Button existiert nur bei freien Räumen)
      await page.getByRole("button", { name: "Auswählen" }).first().click()

      // Auswahl zur Detailseite weiterleiten
      await page
        .getByRole("button", { name: "Weiter zu den Details" })
        .click()
      await page.waitForURL("**/buchen/details")
    })

    // ── Schritt 6: Buchungsdetails eingeben und absenden ─────────────────────
    await test.step("Buchungsdetails eingeben und absenden", async () => {
      // Input hat id="titel", Label hat htmlFor="titel" → getByLabel funktioniert
      await page.getByLabel("Meetingtitel").fill(BUCHUNGS_TITEL)

      await page
        .getByRole("button", { name: "Verbindlich buchen" })
        .click()

      // Nach erfolgreichem POST navigiert die App zur Bestätigungsseite
      await page.waitForURL("**/buchen/bestaetigung**")
    })

    // ── Schritt 7: Buchungsbestätigung prüfen ────────────────────────────────
    await test.step("Buchungsbestätigung prüfen", async () => {
      await expect(page.getByText("Buchung bestätigt!")).toBeVisible()
      // Titel erscheint in Guillemets: „E2E-Test Meeting"
      await expect(page.getByText(`„${BUCHUNGS_TITEL}"`)).toBeVisible()
    })

    // ── Schritt 8: Buchungsübersicht erneut öffnen ───────────────────────────
    await test.step("Buchungsübersicht erneut öffnen", async () => {
      await page.getByRole("button", { name: "Meine Buchungen" }).click()
      await page.waitForURL("**/buchungen")
    })

    // ── Schritt 9: Neue Buchung in der Übersicht verifizieren ────────────────
    await test.step("Neue Buchung in der Übersicht verifizieren", async () => {
      // Die neu erstellte Buchung ist bereits im React-State (über buchungHinzufuegen),
      // kein erneutes Laden nötig.
      const tabTextNachher = await bevorstehendTab.textContent()
      const anzahlNachher = parseInt(
        tabTextNachher?.match(/\((\d+)\)/)?.[1] ?? "0"
      )

      expect(anzahlNachher).toBe(anzahlVorher + 1)
      // Bei Mehrfachläufen kann der Titel mehrfach auftauchen — mindestens einer reicht.
      await expect(page.getByText(`„${BUCHUNGS_TITEL}"`).first()).toBeVisible()
    })
  }
)

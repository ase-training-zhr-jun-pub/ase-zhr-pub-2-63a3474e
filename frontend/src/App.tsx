import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "@/components/app-layout"
import { BuchungProvider } from "@/lib/buchung-context"
import { BenachrichtigungProvider } from "@/lib/benachrichtigung-context"
import { AnwesenheitProvider } from "@/lib/anwesenheit-context"
import { Toaster } from "@/components/ui/sonner"
import { DashboardPage } from "@/pages/dashboard"
import { BuchenPage } from "@/pages/buchen"
import { MeineBuchungenPage } from "@/pages/meine-buchungen"
import { UebersichtPage } from "@/pages/uebersicht"
import { AnwesenheitPage } from "@/pages/anwesenheit"

// basename für den Betrieb hinter dem Crucible-Proxy zur Laufzeit aus der
// Browser-URL ableiten. Der Proxy-Pfad (…/proxy/<port>) bleibt in der Adresszeile
// sichtbar, auch wenn er für Backend-Requests gestrippt wird — das Routing muss ihn
// also als basename kennen. Lokal (kein /proxy/-Segment) → undefined.
function ermittleBasename(): string | undefined {
  if (typeof window === "undefined") return undefined
  const match = window.location.pathname.match(/^(.*\/proxy\/\d+)(?:\/|$)/)
  return match ? match[1] : undefined
}
const basename = ermittleBasename()

function App() {
  return (
    <BuchungProvider>
      <BenachrichtigungProvider>
        <AnwesenheitProvider>
          <BrowserRouter basename={basename}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/buchen/*" element={<BuchenPage />} />
                <Route path="/buchungen" element={<MeineBuchungenPage />} />
                <Route path="/buchungen/:id" element={<MeineBuchungenPage />} />
                <Route path="/uebersicht" element={<UebersichtPage />} />
                <Route path="/anwesenheit" element={<AnwesenheitPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" richColors />
        </AnwesenheitProvider>
      </BenachrichtigungProvider>
    </BuchungProvider>
  )
}

export default App

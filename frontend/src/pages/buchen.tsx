import { Routes, Route, useLocation } from "react-router-dom"
import { BuchungStepper } from "@/components/buchung-stepper"
import { SchrittZeitraum } from "@/pages/buchen/schritt-zeitraum"
import { SchrittRaeume } from "@/pages/buchen/schritt-raeume"
import { SchrittDetails } from "@/pages/buchen/schritt-details"
import { SchrittBestaetigung } from "@/pages/buchen/schritt-bestaetigung"

function aktiverSchritt(pathname: string): number {
  if (pathname.endsWith("/raeume")) return 2
  if (pathname.endsWith("/details")) return 3
  if (pathname.endsWith("/bestaetigung")) return 4
  return 1
}

export function BuchenPage() {
  const location = useLocation()
  const schritt = aktiverSchritt(location.pathname)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Raum buchen</h1>
        <p className="mt-1 text-muted-foreground">
          In vier Schritten zum passenden Konferenzraum.
        </p>
      </div>

      <div className="py-2">
        <BuchungStepper aktiv={schritt} />
      </div>

      <Routes>
        <Route index element={<SchrittZeitraum />} />
        <Route path="raeume" element={<SchrittRaeume />} />
        <Route path="details" element={<SchrittDetails />} />
        <Route path="bestaetigung" element={<SchrittBestaetigung />} />
      </Routes>
    </div>
  )
}

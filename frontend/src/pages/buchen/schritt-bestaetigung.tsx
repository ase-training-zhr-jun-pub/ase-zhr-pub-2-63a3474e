import { useEffect } from "react"
import { useNavigate, useSearchParams, Navigate } from "react-router-dom"
import {
  CheckCircle2,
  MapPin,
  Clock,
  CalendarDays,
  CalendarPlus,
  LayoutGrid,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getRaum, getStandort, formatDatum } from "@/lib/mock-data"
import { useBuchung } from "@/lib/buchung-context"

export function SchrittBestaetigung() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get("id")
  const { buchungen, entwurfZuruecksetzen } = useBuchung()

  const buchung = buchungen.find((b) => b.id === id)

  useEffect(() => {
    // Entwurf nach erfolgreicher Buchung zurücksetzen
    return () => entwurfZuruecksetzen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!buchung) {
    return <Navigate to="/buchen" replace />
  }

  const raum = getRaum(buchung.raumId)!
  const standort = getStandort(buchung.standortId)!

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent className="space-y-6 py-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Buchung bestätigt!</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Dein Raum ist verbindlich reserviert.
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-5 text-left">
            <div className="text-lg font-semibold">{raum.name}</div>
            <p className="text-sm text-muted-foreground">„{buchung.titel}"</p>
            <Separator className="my-4" />
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {standort.name} · {raum.etage}
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {formatDatum(buchung.datum)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {buchung.zeitfenster.start}–{buchung.zeitfenster.ende} Uhr
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1 gap-2"
              onClick={() => navigate("/buchungen")}
            >
              <LayoutGrid className="h-4 w-4" />
              Meine Buchungen
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => {
                entwurfZuruecksetzen()
                navigate("/buchen")
              }}
            >
              <CalendarPlus className="h-4 w-4" />
              Weitere Buchung
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

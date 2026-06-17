import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { ArrowLeft, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RaumZusammenfassung } from "@/components/raum-zusammenfassung"
import {
  getRaum,
  getStandort,
  type Buchung,
} from "@/lib/mock-data"
import { useBuchung } from "@/lib/buchung-context"

export function SchrittDetails() {
  const navigate = useNavigate()
  const { entwurf, setEntwurf, buchungHinzufuegen } = useBuchung()

  const [titel, setTitel] = useState(entwurf.titel ?? "")
  const [notiz, setNotiz] = useState(entwurf.notiz ?? "")

  if (!entwurf.raumId || !entwurf.standortId || !entwurf.datum) {
    return <Navigate to="/buchen" replace />
  }

  const raum = getRaum(entwurf.raumId)!
  const standort = getStandort(entwurf.standortId)!

  function absenden() {
    const id = `buchung-${entwurf.raumId}-${entwurf.datum}-${entwurf.startzeit}`
    const neueBuchung: Buchung = {
      id,
      raumId: entwurf.raumId!,
      standortId: entwurf.standortId!,
      datum: entwurf.datum!,
      zeitfenster: { start: entwurf.startzeit!, ende: entwurf.endzeit! },
      titel: titel.trim() || "Meeting",
      notiz: notiz.trim() || undefined,
      status: "bestätigt",
      gebuchtVon: "Alex Berger",
    }
    setEntwurf({ titel: neueBuchung.titel, notiz: neueBuchung.notiz })
    buchungHinzufuegen(neueBuchung)
    navigate(`/buchen/bestaetigung?id=${encodeURIComponent(id)}`)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      {/* Formular */}
      <Card>
        <CardHeader>
          <CardTitle>Details zur Buchung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="titel">Meetingtitel</Label>
            <Input
              id="titel"
              placeholder="z. B. Sprint Planning, Kundenworkshop …"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Hilft dir und Kollegen, die Buchung wiederzuerkennen.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notiz">Notiz (optional)</Label>
            <textarea
              id="notiz"
              rows={3}
              placeholder="z. B. Catering bestellt, Whiteboard vorbereiten …"
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/buchen/raeume")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
            <Button onClick={absenden} className="gap-2">
              <Check className="h-4 w-4" />
              Verbindlich buchen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zusammenfassung */}
      <RaumZusammenfassung
        raum={raum}
        standort={standort}
        datum={entwurf.datum}
        startzeit={entwurf.startzeit!}
        endzeit={entwurf.endzeit!}
      />
    </div>
  )
}

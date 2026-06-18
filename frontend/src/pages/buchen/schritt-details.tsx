import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RaumZusammenfassung } from "@/components/raum-zusammenfassung"
import { getRaum, getStandort, aktuellerNutzer } from "@/lib/mock-data"
import { useBuchung } from "@/lib/buchung-context"
import { createBuchung, RaumBereitsBelegtError } from "@/lib/buchungen-api"

export function SchrittDetails() {
  const navigate = useNavigate()
  const { entwurf, setEntwurf, buchungHinzufuegen } = useBuchung()

  const [titel, setTitel] = useState(entwurf.titel ?? "")
  const [notiz, setNotiz] = useState(entwurf.notiz ?? "")
  const [sendetGerade, setSendetGerade] = useState(false)

  if (!entwurf.raumId || !entwurf.standortId || !entwurf.datum) {
    return <Navigate to="/buchen" replace />
  }

  const raum = getRaum(entwurf.raumId)!
  const standort = getStandort(entwurf.standortId)!

  async function absenden() {
    const finalerTitel = titel.trim() || "Meeting"
    const finaleNotiz = notiz.trim() || undefined
    setEntwurf({ titel: finalerTitel, notiz: finaleNotiz })
    setSendetGerade(true)
    try {
      // Backend prüft Verfügbarkeit autoritativ und verhindert Doppelbuchungen (QS-1).
      const buchung = await createBuchung({
        raumId: entwurf.raumId!,
        standortId: entwurf.standortId!,
        datum: entwurf.datum!,
        start: entwurf.startzeit!,
        ende: entwurf.endzeit!,
        titel: finalerTitel,
        notiz: finaleNotiz,
        gebuchtVon: aktuellerNutzer.name,
      })
      buchungHinzufuegen(buchung)
      navigate(`/buchen/bestaetigung?id=${encodeURIComponent(buchung.id)}`)
    } catch (e) {
      if (e instanceof RaumBereitsBelegtError) {
        toast.error(
          e.naechsteFreieZeit
            ? `Der Raum wurde zwischenzeitlich gebucht. Frei ab ${e.naechsteFreieZeit} Uhr.`
            : "Der Raum wurde zwischenzeitlich gebucht. Bitte wähle ein anderes Zeitfenster.",
          { description: "Gehe zurück zur Raumauswahl, um einen freien Raum zu wählen." }
        )
      } else {
        toast.error("Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.")
      }
      setSendetGerade(false)
    }
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
              disabled={sendetGerade}
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
            <Button onClick={absenden} className="gap-2" disabled={sendetGerade}>
              {sendetGerade ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird gebucht …
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Verbindlich buchen
                </>
              )}
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

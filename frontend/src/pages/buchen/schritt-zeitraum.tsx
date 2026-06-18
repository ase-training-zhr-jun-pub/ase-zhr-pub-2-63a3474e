import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, Clock, Calendar, ArrowRight, Repeat } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { standorte, getStandort, ZEIT_SLOTS, HEUTE, addTage } from "@/lib/mock-data"
import {
  useBuchung,
  type Wiederholung,
  type SerienEndeArt,
} from "@/lib/buchung-context"

// Nächste 14 Tage als Datumsoptionen
function naechsteTage(): { iso: string; label: string }[] {
  const [jahr, monat, tag] = HEUTE.split("-").map(Number)
  const wt = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
  const mon = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
  const tage: { iso: string; label: string }[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(jahr, monat - 1, tag + i)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const prefix = i === 0 ? "Heute" : i === 1 ? "Morgen" : wt[d.getDay()]
    tage.push({ iso, label: `${prefix}, ${d.getDate()}. ${mon[d.getMonth()]}` })
  }
  return tage
}

export function SchrittZeitraum() {
  const navigate = useNavigate()
  const { entwurf, setEntwurf } = useBuchung()
  const tage = naechsteTage()

  const [standortId, setStandortId] = useState(entwurf.standortId ?? "koeln")
  const [datum, setDatum] = useState(entwurf.datum ?? HEUTE)
  const [startzeit, setStartzeit] = useState(entwurf.startzeit ?? "09:00")
  const [endzeit, setEndzeit] = useState(entwurf.endzeit ?? "10:00")

  // Serientermin-Einstellungen (CLVN-031)
  const [wiederholung, setWiederholung] = useState<Wiederholung>(
    entwurf.wiederholung ?? "keine"
  )
  const [serienEndeArt, setSerienEndeArt] = useState<SerienEndeArt>(
    entwurf.serienEndeArt ?? "anzahl"
  )
  const [serienAnzahl, setSerienAnzahl] = useState(entwurf.serienAnzahl ?? 8)
  const [serienEnddatum, setSerienEnddatum] = useState(
    entwurf.serienEnddatum ?? addTage(datum, 7 * 7)
  )

  const istSerie = wiederholung !== "keine"
  const anzahlGueltig =
    !istSerie ||
    serienEndeArt !== "anzahl" ||
    (Number.isFinite(serienAnzahl) && serienAnzahl >= 2 && serienAnzahl <= 52)
  const enddatumGueltig =
    !istSerie || serienEndeArt !== "enddatum" || serienEnddatum > datum

  const gueltig = endzeit > startzeit && anzahlGueltig && enddatumGueltig

  function weiter() {
    setEntwurf({
      standortId,
      datum,
      startzeit,
      endzeit,
      wiederholung,
      serienEndeArt: istSerie ? serienEndeArt : undefined,
      serienAnzahl: istSerie && serienEndeArt === "anzahl" ? serienAnzahl : undefined,
      serienEnddatum:
        istSerie && serienEndeArt === "enddatum" ? serienEnddatum : undefined,
    })
    navigate("/buchen/raeume")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wann und wo brauchst du einen Raum?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Standort
          </Label>
          <Select value={standortId} onValueChange={(v) => v && setStandortId(v)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: string) => getStandort(v)?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {standorte.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {s.raeumeAnzahl} Räume
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Datum
          </Label>
          <Select value={datum} onValueChange={(v) => v && setDatum(v)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) => tage.find((t) => t.iso === v)?.label ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tage.map((t) => (
                <SelectItem key={t.iso} value={t.iso}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Von
            </Label>
            <Select value={startzeit} onValueChange={(v) => v && setStartzeit(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZEIT_SLOTS.slice(0, -1).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Bis
            </Label>
            <Select value={endzeit} onValueChange={(v) => v && setEndzeit(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZEIT_SLOTS.filter((t) => t > startzeit).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {endzeit <= startzeit && (
          <p className="text-sm text-destructive">
            Die Endzeit muss nach der Startzeit liegen.
          </p>
        )}

        {/* Serientermin (CLVN-031) */}
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              Wiederholung
            </Label>
            <Select
              value={wiederholung}
              onValueChange={(v) => v && setWiederholung(v as Wiederholung)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v: string) =>
                    v === "woechentlich"
                      ? "Wöchentlich"
                      : v === "zweiwoechentlich"
                        ? "Alle zwei Wochen"
                        : "Keine (Einzeltermin)"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keine">Keine (Einzeltermin)</SelectItem>
                <SelectItem value="woechentlich">Wöchentlich</SelectItem>
                <SelectItem value="zweiwoechentlich">Alle zwei Wochen</SelectItem>
              </SelectContent>
            </Select>
            {!istSerie && (
              <p className="text-xs text-muted-foreground">
                Lege denselben Konferenzraum in einem festen Rhythmus an, z. B. für
                deinen wöchentlichen Bürotag.
              </p>
            )}
          </div>

          {istSerie && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Serie endet</Label>
                <Select
                  value={serienEndeArt}
                  onValueChange={(v) => v && setSerienEndeArt(v as SerienEndeArt)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(v: string) =>
                        v === "enddatum" ? "An einem Enddatum" : "Nach Anzahl Terminen"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anzahl">Nach Anzahl Terminen</SelectItem>
                    <SelectItem value="enddatum">An einem Enddatum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {serienEndeArt === "anzahl" ? (
                <div className="space-y-2">
                  <Label htmlFor="serien-anzahl">Anzahl der Termine</Label>
                  <Input
                    id="serien-anzahl"
                    type="number"
                    min={2}
                    max={52}
                    value={String(serienAnzahl)}
                    onChange={(e) => setSerienAnzahl(Number(e.target.value))}
                    className="w-32"
                  />
                  {!anzahlGueltig && (
                    <p className="text-sm text-destructive">
                      Bitte eine Anzahl zwischen 2 und 52 wählen.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="serien-enddatum">Enddatum</Label>
                  <Input
                    id="serien-enddatum"
                    type="date"
                    min={addTage(datum, 1)}
                    value={serienEnddatum}
                    onChange={(e) => setSerienEnddatum(e.target.value)}
                    className="w-48"
                  />
                  {!enddatumGueltig && (
                    <p className="text-sm text-destructive">
                      Das Enddatum muss nach dem Startdatum liegen.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={weiter} disabled={!gueltig} className="gap-2">
            Räume anzeigen
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

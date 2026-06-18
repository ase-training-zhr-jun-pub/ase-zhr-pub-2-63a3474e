import { useEffect, useMemo, useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  Loader2,
  Repeat,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RaumZusammenfassung } from "@/components/raum-zusammenfassung"
import {
  getRaum,
  getStandort,
  formatDatum,
  aktuellerNutzer,
} from "@/lib/mock-data"
import { useBuchung } from "@/lib/buchung-context"
import {
  createBuchung,
  createSerie,
  pruefeSerienVerfuegbarkeit,
  RaumBereitsBelegtError,
  type SerienTermin,
} from "@/lib/buchungen-api"
import { berechneSerienTermine, wiederholungLabel } from "@/lib/serientermine"
import { cn } from "@/lib/utils"

export function SchrittDetails() {
  const navigate = useNavigate()
  const { entwurf, setEntwurf, buchungHinzufuegen, buchungenHinzufuegen } =
    useBuchung()

  const [titel, setTitel] = useState(entwurf.titel ?? "")
  const [notiz, setNotiz] = useState(entwurf.notiz ?? "")
  const [sendetGerade, setSendetGerade] = useState(false)

  const istSerie = !!entwurf.wiederholung && entwurf.wiederholung !== "keine"

  // Geplante Einzeltermine der Serie (rein aus dem Entwurf berechnet).
  const geplanteTermine = useMemo(
    () => berechneSerienTermine(entwurf),
    [entwurf]
  )

  // Verfügbarkeitsprüfung pro Einzeltermin + welche Termine ausgewählt sind.
  const [geprueft, setGeprueft] = useState<SerienTermin[] | null>(null)
  const [pruefungLaeuft, setPruefungLaeuft] = useState(istSerie)
  const [ausgewaehlt, setAusgewaehlt] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!istSerie || !entwurf.raumId) return
    let abgebrochen = false
    setPruefungLaeuft(true)
    pruefeSerienVerfuegbarkeit(entwurf.raumId, geplanteTermine)
      .then((res) => {
        if (abgebrochen) return
        setGeprueft(res)
        // Konfliktfreie Termine sind standardmäßig ausgewählt, konfliktbehaftete nicht.
        setAusgewaehlt(new Set(res.filter((t) => t.frei).map((t) => t.datum)))
      })
      .catch(() => {
        if (!abgebrochen) setGeprueft([])
      })
      .finally(() => {
        if (!abgebrochen) setPruefungLaeuft(false)
      })
    return () => {
      abgebrochen = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [istSerie, entwurf.raumId])

  if (!entwurf.raumId || !entwurf.standortId || !entwurf.datum) {
    return <Navigate to="/buchen" replace />
  }

  const raum = getRaum(entwurf.raumId)!
  const standort = getStandort(entwurf.standortId)!

  const konflikte = geprueft?.filter((t) => !t.frei).length ?? 0
  const anzahlAusgewaehlt = ausgewaehlt.size

  function terminUmschalten(datum: string) {
    setAusgewaehlt((prev) => {
      const next = new Set(prev)
      if (next.has(datum)) next.delete(datum)
      else next.add(datum)
      return next
    })
  }

  async function absenden() {
    const finalerTitel = titel.trim() || "Meeting"
    const finaleNotiz = notiz.trim() || undefined
    setEntwurf({ titel: finalerTitel, notiz: finaleNotiz })
    setSendetGerade(true)

    // --- Serientermin ---
    if (istSerie) {
      const zuBuchen = (geprueft ?? [])
        .filter((t) => ausgewaehlt.has(t.datum))
        .map((t) => ({ datum: t.datum, start: t.start, ende: t.ende }))

      if (zuBuchen.length === 0) {
        toast.error("Bitte wähle mindestens einen Termin zum Buchen aus.")
        setSendetGerade(false)
        return
      }

      try {
        const ergebnis = await createSerie({
          raumId: entwurf.raumId!,
          standortId: entwurf.standortId!,
          titel: finalerTitel,
          notiz: finaleNotiz,
          gebuchtVon: aktuellerNutzer.name,
          termine: zuBuchen,
        })
        buchungenHinzufuegen(ergebnis.gebucht)
        if (ergebnis.fehlgeschlagen.length > 0) {
          toast.warning(
            `${ergebnis.gebucht.length} Termine gebucht, ${ergebnis.fehlgeschlagen.length} konnten nicht gebucht werden.`
          )
        } else {
          toast.success(`Serie mit ${ergebnis.gebucht.length} Terminen gebucht.`)
        }
        if (ergebnis.gebucht.length === 0) {
          setSendetGerade(false)
          return
        }
        navigate(
          `/buchen/bestaetigung?serie=${encodeURIComponent(ergebnis.serienId)}`
        )
      } catch {
        toast.error("Die Serie konnte nicht gespeichert werden. Bitte versuche es erneut.")
        setSendetGerade(false)
      }
      return
    }

    // --- Einzelbuchung (unveränderter Pfad) ---
    try {
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
      <div className="space-y-5">
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
          </CardContent>
        </Card>

        {/* Serientermine: Liste der Einzeltermine mit Verfügbarkeit (CLVN-031) */}
        {istSerie && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                Serientermine · {wiederholungLabel(entwurf)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pruefungLaeuft ? (
                <div className="flex items-center gap-2 py-6 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verfügbarkeit der Einzeltermine wird geprüft …
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {anzahlAusgewaehlt} von {geprueft?.length ?? 0} Terminen
                      ausgewählt
                    </span>
                    {konflikte > 0 && (
                      <span className="flex items-center gap-1.5 text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        {konflikte} Termin{konflikte === 1 ? "" : "e"} mit Konflikt
                      </span>
                    )}
                  </div>

                  {konflikte > 0 && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      An belegten Terminen ist der Konferenzraum bereits gebucht.
                      Wähle diese ab, um sie zu überspringen – die übrigen Termine
                      werden gebucht.
                    </p>
                  )}

                  <ul className="space-y-2">
                    {geprueft?.map((t) => {
                      const aktiv = ausgewaehlt.has(t.datum)
                      return (
                        <li key={t.datum}>
                          <button
                            type="button"
                            onClick={() => terminUmschalten(t.datum)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                              aktiv
                                ? "border-primary/40 bg-primary/5"
                                : "border-input opacity-70 hover:opacity-100",
                              !t.frei && "border-amber-300"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                                aktiv
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input"
                              )}
                            >
                              {aktiv && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="flex-1 font-medium">
                              {formatDatum(t.datum)}
                            </span>
                            <span className="text-muted-foreground">
                              {t.start}–{t.ende}
                            </span>
                            {t.frei ? (
                              <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                <CheckCircle2 className="h-3 w-3" />
                                Frei
                              </Badge>
                            ) : (
                              <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                                <AlertTriangle className="h-3 w-3" />
                                Belegt
                              </Badge>
                            )}
                          </button>
                          {!t.frei && t.konfliktTitel && (
                            <p className="mt-0.5 pl-11 text-xs text-amber-700">
                              Konflikt mit „{t.konfliktTitel}"
                            </p>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/buchen/raeume")}
            className="gap-2"
            disabled={sendetGerade}
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <Button
            onClick={absenden}
            className="gap-2"
            disabled={sendetGerade || (istSerie && (pruefungLaeuft || anzahlAusgewaehlt === 0))}
          >
            {sendetGerade ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Wird gebucht …
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {istSerie
                  ? `${anzahlAusgewaehlt} Termin${anzahlAusgewaehlt === 1 ? "" : "e"} verbindlich buchen`
                  : "Verbindlich buchen"}
              </>
            )}
          </Button>
        </div>
      </div>

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

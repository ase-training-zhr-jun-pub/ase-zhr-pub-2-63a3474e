import { useState, useMemo, useEffect } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import {
  MapPin,
  Clock,
  Users,
  ArrowRight,
  ArrowLeft,
  Filter,
  Check,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AusstattungListe } from "@/components/ausstattung"
import { RaumZusammenfassung } from "@/components/raum-zusammenfassung"
import {
  getRaeumeByStandort,
  getRaum,
  getStandort,
  istRaumFreiIn,
  naechsteFreieZeitIn,
  formatDatumKurz,
  istHeute,
  type AusstattungsMerkmal,
  type Belegung,
} from "@/lib/mock-data"
import { useBuchung } from "@/lib/buchung-context"
import { ladeBelegungen } from "@/lib/buchungen-api"
import { cn } from "@/lib/utils"

const ALLE_AUSSTATTUNG: AusstattungsMerkmal[] = [
  "Whiteboard",
  "TV",
  "Videokonferenz",
  "Beamer",
  "Telefon",
  "Flipchart",
]

export function SchrittRaeume() {
  const navigate = useNavigate()
  const { entwurf, setEntwurf } = useBuchung()

  const [minKapazitaet, setMinKapazitaet] = useState("alle")
  const [ausstattungFilter, setAusstattungFilter] = useState<AusstattungsMerkmal | "alle">("alle")
  // Vorauswahl bleibt lokal, bis sie bestätigt wird; aus dem Entwurf initialisiert,
  // damit ein zuvor bestätigter Raum bei Rückkehr wieder markiert ist.
  const [vorauswahl, setVorauswahl] = useState<string | null>(() => entwurf.raumId ?? null)
  // Belegungen für den gewählten Standort/Tag aus dem Booking Service (CLVN-010).
  const [belegungen, setBelegungen] = useState<Belegung[]>([])
  const [ladenLaeuft, setLadenLaeuft] = useState(true)

  const { standortId, datum, startzeit, endzeit } = entwurf

  useEffect(() => {
    if (!standortId || !datum) return
    let abgebrochen = false
    setLadenLaeuft(true)
    ladeBelegungen(standortId, datum)
      .then((b) => {
        if (!abgebrochen) setBelegungen(b)
      })
      .catch(() => {
        if (!abgebrochen) setBelegungen([])
      })
      .finally(() => {
        if (!abgebrochen) setLadenLaeuft(false)
      })
    return () => {
      abgebrochen = true
    }
  }, [standortId, datum])

  const gefiltert = useMemo(() => {
    if (!standortId || !datum || !startzeit || !endzeit) return []
    let r = getRaeumeByStandort(standortId)
    if (minKapazitaet !== "alle") {
      r = r.filter((raum) => raum.kapazitaet >= Number(minKapazitaet))
    }
    if (ausstattungFilter !== "alle") {
      r = r.filter((raum) => raum.ausstattung.includes(ausstattungFilter))
    }
    // Freie Räume zuerst
    return r.sort((a, b) => {
      const aFrei = istRaumFreiIn(belegungen, a.id, datum, startzeit, endzeit)
      const bFrei = istRaumFreiIn(belegungen, b.id, datum, startzeit, endzeit)
      if (aFrei === bFrei) return a.kapazitaet - b.kapazitaet
      return aFrei ? -1 : 1
    })
  }, [standortId, datum, startzeit, endzeit, minKapazitaet, ausstattungFilter, belegungen])

  // Ohne Zeitraum zurück zu Schritt 1
  if (!standortId || !datum || !startzeit || !endzeit) {
    return <Navigate to="/buchen" replace />
  }

  const standort = getStandort(standortId)
  const anzahlFrei = gefiltert.filter((r) =>
    istRaumFreiIn(belegungen, r.id, datum, startzeit, endzeit)
  ).length

  const vorausgewaehlterRaum = vorauswahl ? getRaum(vorauswahl) : undefined

  function raumVorwaehlen(raumId: string) {
    setVorauswahl(raumId)
  }

  function auswahlBestaetigen() {
    if (!vorauswahl) return
    setEntwurf({ raumId: vorauswahl })
    navigate("/buchen/details")
  }

  return (
    <div className="space-y-5">
      {/* Kontext-Leiste */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            {standort?.name}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {istHeute(datum) ? "Heute" : formatDatumKurz(datum)} · {startzeit}–{endzeit}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => navigate("/buchen")}
          >
            Ändern
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filter
        </span>
        <Select value={minKapazitaet} onValueChange={(v) => v && setMinKapazitaet(v)}>
          <SelectTrigger size="sm">
            <SelectValue>
              {(v: string) => (v === "alle" ? "Kapazität" : `ab ${v} Pers.`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Kapazitäten</SelectItem>
            <SelectItem value="2">ab 2 Personen</SelectItem>
            <SelectItem value="4">ab 4 Personen</SelectItem>
            <SelectItem value="6">ab 6 Personen</SelectItem>
            <SelectItem value="8">ab 8 Personen</SelectItem>
            <SelectItem value="10">ab 10 Personen</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={ausstattungFilter}
          onValueChange={(v) => v && setAusstattungFilter(v as AusstattungsMerkmal | "alle")}
        >
          <SelectTrigger size="sm">
            <SelectValue>
              {(v: string) => (v === "alle" ? "Ausstattung" : v)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Ausstattungen</SelectItem>
            {ALLE_AUSSTATTUNG.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {ladenLaeuft
            ? "Verfügbarkeit wird geprüft …"
            : `${anzahlFrei} von ${gefiltert.length} Räumen frei`}
        </span>
      </div>

      {/* Raumliste */}
      <div className="space-y-3">
        {ladenLaeuft && (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verfügbarkeit wird geprüft …
            </CardContent>
          </Card>
        )}
        {!ladenLaeuft && gefiltert.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Keine Räume entsprechen den Filtern.
            </CardContent>
          </Card>
        )}
        {!ladenLaeuft &&
          gefiltert.map((raum) => {
            const frei = istRaumFreiIn(belegungen, raum.id, datum, startzeit, endzeit)
            const freiAb = !frei ? naechsteFreieZeitIn(belegungen, raum.id, datum) : null
          const istVorausgewaehlt = vorauswahl === raum.id
          return (
            <Card
              key={raum.id}
              onClick={frei ? () => raumVorwaehlen(raum.id) : undefined}
              className={cn(
                frei ? "cursor-pointer transition-shadow hover:shadow-md" : "opacity-80",
                istVorausgewaehlt && "ring-2 ring-primary"
              )}
            >
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        "h-2.5 w-2.5 rounded-full " +
                        (frei ? "bg-emerald-500" : "bg-red-500")
                      }
                    />
                    <span className="font-semibold">{raum.name}</span>
                    <Badge variant="outline" className="gap-1 font-normal">
                      <Users className="h-3 w-3" />
                      {raum.kapazitaet}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{raum.etage}</span>
                  </div>
                  <AusstattungListe merkmale={raum.ausstattung} />
                  {!frei && (
                    <p className="text-xs text-red-600">
                      Belegt im gewünschten Zeitraum
                      {freiAb && ` · ⚡ frei ab ${freiAb}`}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {frei ? (
                    <Button
                      variant={istVorausgewaehlt ? "secondary" : "default"}
                      onClick={(e) => {
                        e.stopPropagation()
                        raumVorwaehlen(raum.id)
                      }}
                      className="gap-2"
                    >
                      {istVorausgewaehlt ? (
                        <>
                          <Check className="h-4 w-4" />
                          Ausgewählt
                        </>
                      ) : (
                        "Auswählen"
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled={!freiAb}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (freiAb) {
                          setEntwurf({ startzeit: freiAb, endzeit: addStunde(freiAb) })
                          raumVorwaehlen(raum.id)
                        }
                      }}
                    >
                      {freiAb ? `Ab ${freiAb} buchen` : "Nicht verfügbar"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Auswahl-Zusammenfassung + Bestätigung */}
      {vorausgewaehlterRaum && standort && (
        <div className="space-y-3">
          <RaumZusammenfassung
            raum={vorausgewaehlterRaum}
            standort={standort}
            datum={datum}
            startzeit={startzeit}
            endzeit={endzeit}
            titel="Ihre Auswahl"
          />
          <div className="flex justify-end">
            <Button onClick={auswahlBestaetigen} className="gap-2">
              Weiter zu den Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div>
        <Button variant="ghost" onClick={() => navigate("/buchen")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
      </div>
    </div>
  )
}

function addStunde(zeit: string): string {
  const [h, m] = zeit.split(":").map(Number)
  return `${String(Math.min(h + 1, 20)).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

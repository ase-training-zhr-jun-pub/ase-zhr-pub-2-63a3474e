import { useState, useEffect } from "react"
import { MapPin, CalendarDays, Users, UserCheck, CalendarPlus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  standorte,
  getStandort,
  anwesenheitFuer,
  aktuellerNutzer,
  formatDatum,
  istHeute,
  HEUTE,
  type Anwesenheit,
  type Buchung,
} from "@/lib/mock-data"
import { getBuchungen } from "@/lib/buchungen-api"

// Auswählbare Tage: HEUTE und die folgenden 13 Tage.
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

function AnwesenheitsZeile({ eintrag }: { eintrag: Anwesenheit }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3",
        eintrag.istIchSelbst ? "border-primary/40 bg-primary/5" : "bg-card"
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback
            className={cn(
              "text-xs font-semibold",
              eintrag.istIchSelbst
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary"
            )}
          >
            {eintrag.kollege.initialen}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">
          {eintrag.kollege.name}
          {eintrag.istIchSelbst && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">(du)</span>
          )}
        </span>
      </div>
      <Badge variant="secondary" className="gap-1 whitespace-nowrap">
        {eintrag.grund === "signalisiert" ? (
          <>
            <UserCheck className="h-3.5 w-3.5" />
            Angekündigt
          </>
        ) : (
          <>
            <CalendarPlus className="h-3.5 w-3.5" />
            Hat gebucht
          </>
        )}
      </Badge>
    </div>
  )
}

export function AnwesenheitPage() {
  const tage = naechsteTage()

  const [standortId, setStandortId] = useState(aktuellerNutzer.standortId)
  const [datum, setDatum] = useState(HEUTE)

  // Bestehende Raumbuchungen am Standort/Tag laden — daraus wird zusätzlich zur
  // signalisierten Anwesenheit die Präsenz der buchenden Personen abgeleitet (CLVN-037).
  const [buchungen, setBuchungen] = useState<Buchung[]>([])
  useEffect(() => {
    let abgebrochen = false
    getBuchungen({ standortId, datum })
      .then((b) => !abgebrochen && setBuchungen(b))
      .catch(() => !abgebrochen && setBuchungen([]))
    return () => {
      abgebrochen = true
    }
  }, [standortId, datum])

  const anwesende = anwesenheitFuer(standortId, datum, buchungen)
  const standort = getStandort(standortId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kollegen-Anwesenheit</h1>
          <p className="mt-1 text-muted-foreground">
            Wer ist an einem Standort vor Ort? Plane deinen Bürotag für persönliche Treffen.
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={standortId} onValueChange={(v) => v && setStandortId(v)}>
            <SelectTrigger>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue>{(v: string) => getStandort(v)?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {standorte.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={datum} onValueChange={(v) => v && setDatum(v)}>
            <SelectTrigger>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
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
      </div>

      <Card>
        <CardContent className="py-5">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>
              {anwesende.length === 0
                ? "Niemand"
                : `${anwesende.length} ${anwesende.length === 1 ? "Person" : "Personen"}`}{" "}
              {istHeute(datum) ? "heute" : "am " + formatDatum(datum)} in{" "}
              <strong className="text-foreground">{standort?.name}</strong>
            </span>
          </div>

          {anwesende.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Für {standort?.name} hat sich an diesem Tag noch niemand angekündigt.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sobald Kollegen ihre Anwesenheit signalisieren oder einen Raum buchen,
                erscheinen sie hier.
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {anwesende.map((eintrag) => (
                <AnwesenheitsZeile key={eintrag.kollege.id} eintrag={eintrag} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Aus Datenschutzgründen werden nur Name und Anwesenheit angezeigt (QS-4 / DSGVO).
      </p>
    </div>
  )
}

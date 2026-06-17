import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, CalendarDays, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
  getRaeumeByStandort,
  getBelegungen,
  formatDatumKurz,
  istHeute,
  HEUTE,
} from "@/lib/mock-data"
import { useBuchung } from "@/lib/buchung-context"

// Stunden-Spalten für den Kalender (08–18 Uhr)
const STUNDEN = Array.from({ length: 10 }, (_, i) => 8 + i) // 8..17

function naechsteTage(): { iso: string; label: string }[] {
  const [jahr, monat, tag] = HEUTE.split("-").map(Number)
  const wt = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
  const mon = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
  const tage: { iso: string; label: string }[] = []
  for (let i = 0; i < 10; i++) {
    const d = new Date(jahr, monat - 1, tag + i)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const prefix = i === 0 ? "Heute" : i === 1 ? "Morgen" : wt[d.getDay()]
    tage.push({ iso, label: `${prefix}, ${d.getDate()}. ${mon[d.getMonth()]}` })
  }
  return tage
}

export function UebersichtPage() {
  const navigate = useNavigate()
  const { setEntwurf, entwurfZuruecksetzen } = useBuchung()
  const tage = naechsteTage()

  const [standortId, setStandortId] = useState("koeln")
  const [datum, setDatum] = useState(HEUTE)

  const raeume = useMemo(() => getRaeumeByStandort(standortId), [standortId])

  // Für jeden Raum: belegte Stunden als Set
  const belegungsMap = useMemo(() => {
    const map = new Map<string, { belegt: Set<number>; titel: Map<number, string> }>()
    for (const raum of raeume) {
      const belegt = new Set<number>()
      const titel = new Map<number, string>()
      for (const b of getBelegungen(raum.id, datum)) {
        const start = Number(b.zeitfenster.start.split(":")[0])
        const ende = Number(b.zeitfenster.ende.split(":")[0])
        for (let h = start; h < ende; h++) {
          belegt.add(h)
          titel.set(h, b.titel)
        }
      }
      map.set(raum.id, { belegt, titel })
    }
    return map
  }, [raeume, datum])

  function slotBuchen(raumId: string, stunde: number) {
    entwurfZuruecksetzen()
    setEntwurf({
      standortId,
      datum,
      raumId,
      startzeit: `${String(stunde).padStart(2, "0")}:00`,
      endzeit: `${String(stunde + 1).padStart(2, "0")}:00`,
    })
    navigate("/buchen/details")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Buchungsübersicht</h1>
          <p className="mt-1 text-muted-foreground">
            Wer hat wann welchen Raum belegt? Freie Slots direkt buchen.
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
        <CardContent className="overflow-x-auto py-4">
          <div className="min-w-[640px]">
            {/* Kopfzeile mit Stunden */}
            <div className="mb-2 flex">
              <div className="w-32 shrink-0" />
              <div className="flex flex-1">
                {STUNDEN.map((h) => (
                  <div
                    key={h}
                    className="flex-1 text-center text-xs font-medium text-muted-foreground"
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Zeilen pro Raum */}
            <div className="space-y-1.5">
              {raeume.map((raum) => {
                const data = belegungsMap.get(raum.id)!
                return (
                  <div key={raum.id} className="flex items-center">
                    <div className="w-32 shrink-0 pr-3">
                      <div className="truncate text-sm font-medium">{raum.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {raum.kapazitaet} Pers. · {raum.etage}
                      </div>
                    </div>
                    <div className="flex flex-1 gap-0.5">
                      {STUNDEN.map((h) => {
                        const belegt = data.belegt.has(h)
                        const titel = data.titel.get(h)
                        return (
                          <button
                            key={h}
                            disabled={belegt}
                            onClick={() => slotBuchen(raum.id, h)}
                            title={
                              belegt
                                ? `Belegt: ${titel}`
                                : `Frei — ${h}:00 buchen`
                            }
                            className={cn(
                              "h-9 flex-1 rounded transition-colors",
                              belegt
                                ? "cursor-not-allowed bg-red-200/70"
                                : "cursor-pointer bg-emerald-100 hover:bg-emerald-300"
                            )}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legende */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-4 w-6 rounded bg-emerald-100" />
          Frei
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-6 rounded bg-red-200/70" />
          Belegt
        </div>
        <div className="flex items-center gap-1.5">
          <Info className="h-4 w-4" />
          Klicke auf einen freien Slot, um ihn am {istHeute(datum) ? "heutigen Tag" : formatDatumKurz(datum)} zu buchen.
        </div>
      </div>
    </div>
  )
}

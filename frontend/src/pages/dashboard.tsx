import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  CalendarCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  aktuellerNutzer,
  standorte,
  getStandort,
  getRaum,
  kollegenHeute,
  ZEIT_SLOTS,
  HEUTE,
  formatDatum,
  formatDatumKurz,
  istHeute,
} from "@/lib/mock-data"
import { useBuchung } from "@/lib/buchung-context"
import { BackendStatus } from "@/components/backend-status"

function Begruessung() {
  const stunde = 10 // fester Wert für den Prototypen
  const text =
    stunde < 11 ? "Guten Morgen" : stunde < 18 ? "Guten Tag" : "Guten Abend"
  return `${text}, ${aktuellerNutzer.name.split(" ")[0]}!`
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { buchungen, setEntwurf, entwurfZuruecksetzen } = useBuchung()

  const [standortId, setStandortId] = useState(aktuellerNutzer.standortId)
  const [startzeit, setStartzeit] = useState("09:00")
  const [endzeit, setEndzeit] = useState("10:00")

  const bevorstehend = buchungen
    .filter((b) => b.status === "bestätigt" && b.datum >= HEUTE)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .slice(0, 3)

  const kollegen = kollegenHeute[standortId] ?? []

  function schnellBuchung() {
    entwurfZuruecksetzen()
    setEntwurf({ standortId, datum: HEUTE, startzeit, endzeit })
    navigate("/buchen/raeume")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          <Begruessung />
        </h1>
        <p className="mt-1 text-muted-foreground">{formatDatum(HEUTE)}</p>
      </div>

      {/* Verbindungstest Frontend ↔ Booking Service */}
      <BackendStatus />

      {/* Schnellbuchung */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Raum schnell buchen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Standort
              </label>
              <Select value={standortId} onValueChange={(v) => v && setStandortId(v)}>
                <SelectTrigger className="w-full">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue>
                    {(value: string) => getStandort(value)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {standorte.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Von
              </label>
              <Select value={startzeit} onValueChange={(v) => v && setStartzeit(v)}>
                <SelectTrigger className="w-full">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZEIT_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Bis
              </label>
              <Select value={endzeit} onValueChange={(v) => v && setEndzeit(v)}>
                <SelectTrigger className="w-full">
                  <Clock className="h-4 w-4 text-muted-foreground" />
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
            <Button onClick={schnellBuchung} className="gap-2 md:w-auto">
              Verfügbare Räume
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nächste Buchungen */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
            Meine nächsten Buchungen
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/buchungen")}
          >
            Alle ansehen
          </Button>
        </div>
        {bevorstehend.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Keine bevorstehenden Buchungen.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bevorstehend.map((b) => {
              const raum = getRaum(b.raumId)
              const standort = getStandort(b.standortId)
              return (
                <Card
                  key={b.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => navigate(`/buchungen/${b.id}`)}
                >
                  <CardContent className="space-y-2 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                      <Clock className="h-3.5 w-3.5" />
                      {istHeute(b.datum) ? "Heute" : formatDatumKurz(b.datum)} ·{" "}
                      {b.zeitfenster.start}–{b.zeitfenster.ende}
                    </div>
                    <div className="font-semibold">{raum?.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {standort?.name}
                    </div>
                    <div className="truncate text-sm text-muted-foreground">
                      „{b.titel}"
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Wer ist heute im Büro */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5 text-muted-foreground" />
          Wer ist heute in {getStandort(standortId)?.name}?
        </h2>
        <Card>
          <CardContent className="py-5">
            {kollegen.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Heute hat sich niemand für diesen Standort angekündigt.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                {kollegen.map((k) => (
                  <div key={k.id} className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {k.initialen}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{k.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

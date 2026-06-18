import { useEffect, useMemo, useState } from "react"
import {
  MapPin,
  CalendarDays,
  Users,
  UserCheck,
  UserPlus,
  CalendarPlus,
  X,
  Info,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  naechsteTageOptionen,
  istVergangen,
  aktuellerNutzer,
  HEUTE,
  type AnwesenheitsEintrag,
  type Buchung,
} from "@/lib/mock-data"
import { useAnwesenheit } from "@/lib/anwesenheit-context"
import { getBuchungen } from "@/lib/buchungen-api"

function AnwesenheitsZeile({ eintrag }: { eintrag: AnwesenheitsEintrag }) {
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
  const { anwesenheiten, eigeneAnwesenheit, ankuendigen, entfernen } = useAnwesenheit()
  const tage = useMemo(() => naechsteTageOptionen(14), [])

  const [standortId, setStandortId] = useState(aktuellerNutzer.standortId)
  const [datum, setDatum] = useState(HEUTE)

  // Bestehende Raumbuchungen am Standort/Tag laden — daraus wird zusätzlich zur
  // angekündigten Anwesenheit die Präsenz der buchenden Personen abgeleitet (CLVN-037).
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

  const anwesende = anwesenheitFuer(standortId, datum, anwesenheiten, buchungen)
  const eigene = eigeneAnwesenheit(standortId, datum)
  const vergangen = istVergangen(datum)
  const standortName = getStandort(standortId)?.name ?? standortId
  const datumLabel = tage.find((t) => t.iso === datum)?.label ?? datum

  function handleAnkuendigen() {
    if (ankuendigen(standortId, datum)) {
      toast.success(`Anwesenheit angekündigt: ${standortName}, ${datumLabel}`)
    } else if (vergangen) {
      toast.error("Für vergangene Tage kann keine Anwesenheit angekündigt werden.")
    }
  }

  function handleEntfernen() {
    if (!eigene) return
    entfernen(eigene.id)
    toast.success("Anwesenheit entfernt.")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Büroanwesenheit</h1>
          <p className="mt-1 text-muted-foreground">
            Wer ist an einem Standort vor Ort? Kündige deine eigene Anwesenheit an und plane
            deinen Bürotag für persönliche Treffen.
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

      {/* Eigene Anwesenheit ankündigen / entfernen (CLVN-038) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Deine Anwesenheit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {eigene ? (
                <p>
                  Du bist für <strong>{standortName}</strong> am{" "}
                  <strong>{datumLabel}</strong> als anwesend angekündigt.
                </p>
              ) : vergangen ? (
                <p className="text-muted-foreground">
                  Für vergangene Tage kann keine Anwesenheit mehr angekündigt werden.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Du bist für <strong>{standortName}</strong> am{" "}
                  <strong>{datumLabel}</strong> noch nicht angekündigt.
                </p>
              )}
            </div>
            {eigene ? (
              <Button variant="destructive" size="lg" onClick={handleEntfernen}>
                <X className="h-4 w-4" />
                Anwesenheit entfernen
              </Button>
            ) : (
              <Button size="lg" disabled={vergangen} onClick={handleAnkuendigen}>
                <UserPlus className="h-4 w-4" />
                Anwesenheit ankündigen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wer ist da? — kombinierte Ansicht aus Anmeldungen + Buchungen (CLVN-037) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Wer ist da? — {standortName}, {datumLabel}
            <Badge variant="secondary" className="ml-1">
              {anwesende.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {anwesende.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Für {standortName} hat sich an diesem Tag noch niemand angekündigt.
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

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" />
        Du kannst ausschließlich deine eigene Anwesenheit verwalten. Aus Datenschutzgründen
        werden nur Name und Anwesenheit angezeigt (QS-4 / DSGVO).
      </div>
    </div>
  )
}

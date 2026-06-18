import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  MapPin,
  Clock,
  CalendarDays,
  Plus,
  Share2,
  Trash2,
  StickyNote,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AusstattungListe } from "@/components/ausstattung"
import {
  getRaum,
  getStandort,
  formatDatum,
  formatDatumKurz,
  istHeute,
  HEUTE,
  type Buchung,
} from "@/lib/mock-data"
import { useBuchung } from "@/lib/buchung-context"

function StatusBadge({ status }: { status: Buchung["status"] }) {
  if (status === "storniert") {
    return (
      <Badge variant="secondary" className="gap-1 text-muted-foreground">
        <XCircle className="h-3 w-3" />
        Storniert
      </Badge>
    )
  }
  return (
    <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      <CheckCircle2 className="h-3 w-3" />
      Bestätigt
    </Badge>
  )
}

function BuchungsKarte({
  buchung,
  onDetails,
  onStorno,
  vergangen,
}: {
  buchung: Buchung
  onDetails: () => void
  onStorno: () => void
  vergangen?: boolean
}) {
  const raum = getRaum(buchung.raumId)
  const standort = getStandort(buchung.standortId)
  const storniert = buchung.status === "storniert"

  return (
    <Card className={storniert ? "opacity-70" : undefined}>
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <Clock className="h-3.5 w-3.5" />
              {istHeute(buchung.datum) ? "Heute" : formatDatumKurz(buchung.datum)} ·{" "}
              {buchung.zeitfenster.start}–{buchung.zeitfenster.ende}
            </span>
            <StatusBadge status={buchung.status} />
          </div>
          <div className="text-base font-semibold">{raum?.name}</div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {standort?.name}
            </span>
            <span className="truncate">„{buchung.titel}"</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={onDetails}>
            Details
          </Button>
          {!storniert && !vergangen && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onStorno}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function MeineBuchungenPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { buchungen, buchungStornieren } = useBuchung()

  const [detailId, setDetailId] = useState<string | null>(id ?? null)
  const [stornoId, setStornoId] = useState<string | null>(null)

  const bevorstehend = buchungen
    .filter((b) => b.datum >= HEUTE)
    .sort((a, b) => a.datum.localeCompare(b.datum))
  const vergangen = buchungen
    .filter((b) => b.datum < HEUTE)
    .sort((a, b) => b.datum.localeCompare(a.datum))

  const detailBuchung = buchungen.find((b) => b.id === detailId)
  const detailRaum = detailBuchung ? getRaum(detailBuchung.raumId) : undefined
  const detailStandort = detailBuchung ? getStandort(detailBuchung.standortId) : undefined

  function teilen(b: Buchung) {
    const raum = getRaum(b.raumId)
    const text = `${raum?.name} · ${formatDatum(b.datum)} · ${b.zeitfenster.start}–${b.zeitfenster.ende} · „${b.titel}"`
    navigator.clipboard?.writeText(text)
    toast.success("Buchung in die Zwischenablage kopiert")
  }

  async function stornoBestaetigen() {
    if (!stornoId) return
    try {
      await buchungStornieren(stornoId)
      toast.success("Buchung storniert")
      setStornoId(null)
      setDetailId(null)
    } catch {
      toast.error("Die Buchung konnte nicht storniert werden. Bitte versuche es erneut.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meine Buchungen</h1>
          <p className="mt-1 text-muted-foreground">
            Alle deine Raumbuchungen im Überblick.
          </p>
        </div>
        <Button onClick={() => navigate("/buchen")} className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Buchung
        </Button>
      </div>

      <Tabs defaultValue="bevorstehend">
        <TabsList>
          <TabsTrigger value="bevorstehend">
            Bevorstehend ({bevorstehend.length})
          </TabsTrigger>
          <TabsTrigger value="vergangen">
            Vergangen ({vergangen.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bevorstehend" className="mt-4 space-y-3">
          {bevorstehend.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Du hast noch keine bevorstehenden Buchungen.
                </p>
                <Button
                  className="mt-4 gap-2"
                  onClick={() => navigate("/buchen")}
                >
                  <Plus className="h-4 w-4" />
                  Jetzt Raum buchen
                </Button>
              </CardContent>
            </Card>
          ) : (
            bevorstehend.map((b) => (
              <BuchungsKarte
                key={b.id}
                buchung={b}
                onDetails={() => setDetailId(b.id)}
                onStorno={() => setStornoId(b.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="vergangen" className="mt-4 space-y-3">
          {vergangen.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Keine vergangenen Buchungen.
              </CardContent>
            </Card>
          ) : (
            vergangen.map((b) => (
              <BuchungsKarte
                key={b.id}
                buchung={b}
                vergangen
                onDetails={() => setDetailId(b.id)}
                onStorno={() => setStornoId(b.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Detail-Dialog */}
      <Dialog
        open={!!detailBuchung}
        onOpenChange={(o) => {
          if (!o) {
            setDetailId(null)
            if (id) navigate("/buchungen")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {detailBuchung && detailRaum && detailStandort && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detailRaum.name}
                  <StatusBadge status={detailBuchung.status} />
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {detailRaum.beschreibung}
                </p>
                <Separator />
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">„{detailBuchung.titel}"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {detailStandort.name} · {detailRaum.etage}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {formatDatum(detailBuchung.datum)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {detailBuchung.zeitfenster.start}–{detailBuchung.zeitfenster.ende} Uhr
                  </div>
                  {detailBuchung.notiz && (
                    <div className="flex items-start gap-2">
                      <StickyNote className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span>{detailBuchung.notiz}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <AusstattungListe merkmale={detailRaum.ausstattung} />
              </div>
              <DialogFooter className="flex-row justify-between sm:justify-between">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => teilen(detailBuchung)}
                >
                  <Share2 className="h-4 w-4" />
                  Teilen
                </Button>
                {detailBuchung.status === "bestätigt" &&
                  detailBuchung.datum >= HEUTE && (
                    <Button
                      variant="ghost"
                      className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setStornoId(detailBuchung.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Stornieren
                    </Button>
                  )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Storno-Bestätigung */}
      <Dialog open={!!stornoId} onOpenChange={(o) => !o && setStornoId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Buchung stornieren?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Möchtest du diese Buchung wirklich stornieren? Der Raum wird wieder
            für andere freigegeben.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStornoId(null)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={stornoBestaetigen}>
              Ja, stornieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

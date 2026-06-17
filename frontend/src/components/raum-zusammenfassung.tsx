import { MapPin, Clock, Users, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AusstattungListe } from "@/components/ausstattung"
import { formatDatum, istHeute, type Raum, type Standort } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface RaumZusammenfassungProps {
  raum: Raum
  standort: Standort
  datum: string
  startzeit: string
  endzeit: string
  titel?: string
  className?: string
}

/**
 * Zusammenfassung eines Konferenzraums (Name, Standort, Zeitraum, Kapazität, Ausstattung).
 * Wird im Buchungsprozess sowohl bei der Raumauswahl (Schritt 2) als auch bei den
 * Buchungsdetails (Schritt 3) verwendet.
 */
export function RaumZusammenfassung({
  raum,
  standort,
  datum,
  startzeit,
  endzeit,
  titel = "Zusammenfassung",
  className,
}: RaumZusammenfassungProps) {
  return (
    <Card className={cn("h-fit bg-muted/40", className)}>
      <CardHeader>
        <CardTitle className="text-base">{titel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <div className="text-lg font-semibold">{raum.name}</div>
          <div className="text-muted-foreground">{raum.beschreibung}</div>
        </div>
        <Separator />
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {standort.name} · {raum.etage}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {istHeute(datum) ? "Heute" : ""} {formatDatum(datum)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {startzeit}–{endzeit} Uhr
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            bis {raum.kapazitaet} Personen
          </div>
        </div>
        <Separator />
        <AusstattungListe merkmale={raum.ausstattung} />
      </CardContent>
    </Card>
  )
}

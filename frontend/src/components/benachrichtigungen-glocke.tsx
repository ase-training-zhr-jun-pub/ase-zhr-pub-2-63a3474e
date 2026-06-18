import { Bell, BellRing, CalendarDays, Clock, MapPin, CheckCheck, Info, XCircle, CalendarClock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { getRaum, getStandort, formatDatumKurz, istHeute } from "@/lib/mock-data"
import {
  useBenachrichtigung,
  type Benachrichtigung,
  type BenachrichtigungsTyp,
} from "@/lib/benachrichtigung-context"

const typMeta: Record<
  BenachrichtigungsTyp,
  { label: string; icon: React.ComponentType<{ className?: string }>; farbe: string }
> = {
  storniert: { label: "Buchung storniert", icon: XCircle, farbe: "text-destructive" },
  geaendert: { label: "Buchung geändert", icon: CalendarClock, farbe: "text-amber-600" },
  "serie-fehlgeschlagen": {
    label: "Termin nicht buchbar",
    icon: Info,
    farbe: "text-amber-600",
  },
  erinnerung: { label: "Erinnerung", icon: BellRing, farbe: "text-primary" },
}

function zeitLabel(iso: string): string {
  // Zeigt Uhrzeit, wenn ein Zeitanteil vorhanden ist, sonst nur das Datum.
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function BenachrichtigungEintrag({
  eintrag,
  onClick,
}: {
  eintrag: Benachrichtigung
  onClick: () => void
}) {
  const raum = getRaum(eintrag.buchung.raumId)
  const standort = getStandort(eintrag.buchung.standortId)
  const meta = typMeta[eintrag.typ]
  const Icon = meta.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full gap-3 rounded-md p-2.5 text-left transition-colors hover:bg-accent",
        !eintrag.gelesen && "bg-accent/40"
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.farbe)} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{meta.label}</span>
          {!eintrag.gelesen && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          )}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {zeitLabel(eintrag.zeitstempel)}
          </span>
        </div>
        <div className="truncate text-sm font-semibold">{raum?.name}</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {standort?.name}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {istHeute(eintrag.buchung.datum)
              ? "Heute"
              : formatDatumKurz(eintrag.buchung.datum)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {eintrag.buchung.zeitfenster.start}–{eintrag.buchung.zeitfenster.ende}
          </span>
        </div>
        {eintrag.buchung.titel && (
          <div className="truncate text-xs text-muted-foreground">
            „{eintrag.buchung.titel}"
          </div>
        )}
        {eintrag.grund && (
          <div className="text-xs text-muted-foreground">{eintrag.grund}</div>
        )}
      </div>
    </button>
  )
}

export function BenachrichtigungenGlocke() {
  const { benachrichtigungen, ungeleseneAnzahl, alsGelesenMarkieren, einzelnGelesen } =
    useBenachrichtigung()

  return (
    <Popover onOpenChange={(open) => open && alsGelesenMarkieren()}>
      <PopoverTrigger
        aria-label="Benachrichtigungen"
        className="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Bell className="h-5 w-5" />
        {ungeleseneAnzahl > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
            {ungeleseneAnzahl > 9 ? "9+" : ungeleseneAnzahl}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 gap-0 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-semibold">Benachrichtigungen</span>
          {ungeleseneAnzahl > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1.5 px-2 py-1 text-xs text-muted-foreground"
              onClick={alsGelesenMarkieren}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Alle gelesen
            </Button>
          )}
        </div>
        <Separator />
        {benachrichtigungen.length === 0 ? (
          <div className="px-3 py-10 text-center text-sm text-muted-foreground">
            Keine Benachrichtigungen.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto p-1.5">
            {benachrichtigungen.map((b) => (
              <BenachrichtigungEintrag
                key={b.id}
                eintrag={b}
                onClick={() => einzelnGelesen(b.id)}
              />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

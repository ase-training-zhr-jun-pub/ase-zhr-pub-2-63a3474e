import { useMemo, useState } from "react"
import { Bell, MapPin, Clock, CalendarDays, CheckCheck } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useBuchung } from "@/lib/buchung-context"
import { formatDatum, istHeute } from "@/lib/mock-data"
import {
  erinnerungenAusBuchungen,
  STANDARD_VORLAUF_TAGE,
  type Erinnerung,
} from "@/lib/benachrichtigungen"

/**
 * Glocke im Kopfbereich mit Buchungserinnerungen (CLVN-034).
 *
 * Die Erinnerungen werden aus den Buchungen des Nutzers abgeleitet
 * (nur bestätigt + zukünftig, innerhalb des Vorlaufs). Der Gelesen-Status wird
 * lokal in der Komponente gehalten — im Prototyp genügt das, ein Backend
 * persistiert ihn später.
 */
export function Benachrichtigungen() {
  const { buchungen } = useBuchung()
  // IDs der als gelesen markierten Erinnerungen.
  const [gelesen, setGelesen] = useState<Set<string>>(new Set())

  const erinnerungen = useMemo(
    () => erinnerungenAusBuchungen(buchungen, STANDARD_VORLAUF_TAGE),
    [buchungen]
  )

  const ungelesen = erinnerungen.filter((e) => !gelesen.has(e.id))
  const anzahlUngelesen = ungelesen.length

  function alsGelesenMarkieren(id: string) {
    setGelesen((prev) => new Set(prev).add(id))
  }

  function alleAlsGelesenMarkieren() {
    setGelesen(new Set(erinnerungen.map((e) => e.id)))
  }

  return (
    <Popover>
      <PopoverTrigger
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label={
          anzahlUngelesen > 0
            ? `Benachrichtigungen, ${anzahlUngelesen} ungelesen`
            : "Benachrichtigungen"
        }
      >
        <Bell className="h-5 w-5" />
        {anzahlUngelesen > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
            {anzahlUngelesen > 9 ? "9+" : anzahlUngelesen}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 gap-0 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <span className="text-sm font-semibold">Benachrichtigungen</span>
          {anzahlUngelesen > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-2 py-1 text-xs"
              onClick={alleAlsGelesenMarkieren}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Alle gelesen
            </Button>
          )}
        </div>

        {erinnerungen.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Keine anstehenden Erinnerungen.
          </div>
        ) : (
          <ul className="max-h-96 divide-y overflow-y-auto">
            {erinnerungen.map((e) => (
              <ErinnerungZeile
                key={e.id}
                erinnerung={e}
                gelesen={gelesen.has(e.id)}
                onGelesen={() => alsGelesenMarkieren(e.id)}
              />
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}

function ErinnerungZeile({
  erinnerung,
  gelesen,
  onGelesen,
}: {
  erinnerung: Erinnerung
  gelesen: boolean
  onGelesen: () => void
}) {
  return (
    <li
      className={cn(
        "flex gap-2.5 px-3 py-2.5 text-sm",
        !gelesen && "bg-primary/5"
      )}
    >
      <span
        className={cn(
          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
          gelesen ? "bg-transparent" : "bg-primary"
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="font-medium">{erinnerung.raumName}</div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {erinnerung.standortName}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          {istHeute(erinnerung.datum) ? "Heute" : formatDatum(erinnerung.datum)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {erinnerung.zeitfensterStart}–{erinnerung.zeitfensterEnde} Uhr
        </div>
        <div className="truncate text-xs text-muted-foreground">
          „{erinnerung.titel}"
        </div>
        {!gelesen && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mt-0.5 h-auto px-2 py-1 text-xs text-primary"
            onClick={onGelesen}
          >
            Als gelesen markieren
          </Button>
        )}
      </div>
    </li>
  )
}

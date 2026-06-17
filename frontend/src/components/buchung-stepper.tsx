import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const schritte = [
  { nr: 1, label: "Zeitraum" },
  { nr: 2, label: "Raum" },
  { nr: 3, label: "Details" },
  { nr: 4, label: "Bestätigung" },
]

export function BuchungStepper({ aktiv }: { aktiv: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {schritte.map((s, i) => {
        const erledigt = s.nr < aktiv
        const istAktiv = s.nr === aktiv
        return (
          <div key={s.nr} className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  erledigt && "bg-primary text-primary-foreground",
                  istAktiv && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                  !erledigt && !istAktiv && "bg-muted text-muted-foreground"
                )}
              >
                {erledigt ? <Check className="h-4 w-4" /> : s.nr}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  istAktiv ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < schritte.length - 1 && (
              <div
                className={cn(
                  "h-px w-4 sm:w-10",
                  erledigt ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

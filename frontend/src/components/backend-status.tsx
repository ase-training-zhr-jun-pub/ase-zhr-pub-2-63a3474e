import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Loader2, Server } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { apiUrl } from "@/lib/api"

type Status =
  | { state: "loading" }
  | { state: "ok"; message: string }
  | { state: "error"; detail: string }

/**
 * Testet die Verbindung zum Booking Service, indem der Endpunkt /api/hello
 * angefragt und das Ergebnis angezeigt wird.
 */
export function BackendStatus() {
  const [status, setStatus] = useState<Status>({ state: "loading" })

  useEffect(() => {
    let aborted = false
    fetch(apiUrl("/api/hello"))
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        if (!aborted) setStatus({ state: "ok", message: text })
      })
      .catch((e) => {
        if (!aborted) setStatus({ state: "error", detail: String(e?.message ?? e) })
      })
    return () => {
      aborted = true
    }
  }, [])

  return (
    <Card
      className={cn(
        "border-l-4",
        status.state === "ok" && "border-l-emerald-500 bg-emerald-50/50",
        status.state === "error" && "border-l-red-500 bg-red-50/50",
        status.state === "loading" && "border-l-muted-foreground/30"
      )}
    >
      <CardContent className="flex items-center gap-3 py-3">
        <Server className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-sm font-medium">Booking Service</div>
          <div className="text-xs text-muted-foreground">
            <code>GET /api/hello</code>
          </div>
        </div>
        {status.state === "loading" && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verbinde …
          </span>
        )}
        {status.state === "ok" && (
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Verbunden: „{status.message}"
          </span>
        )}
        {status.state === "error" && (
          <span className="flex items-center gap-2 text-sm font-semibold text-red-700">
            <XCircle className="h-4 w-4" />
            Keine Verbindung ({status.detail})
          </span>
        )}
      </CardContent>
    </Card>
  )
}

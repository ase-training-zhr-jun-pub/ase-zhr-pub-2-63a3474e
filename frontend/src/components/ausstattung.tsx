import {
  PenTool,
  Tv,
  Video,
  Projector,
  Phone,
  Presentation,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AusstattungsMerkmal } from "@/lib/mock-data"

const icons: Record<AusstattungsMerkmal, React.ComponentType<{ className?: string }>> = {
  Whiteboard: PenTool,
  TV: Tv,
  Videokonferenz: Video,
  Beamer: Projector,
  Telefon: Phone,
  Flipchart: Presentation,
}

export function AusstattungBadge({ merkmal }: { merkmal: AusstattungsMerkmal }) {
  const Icon = icons[merkmal]
  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <Icon className="h-3 w-3" />
      {merkmal}
    </Badge>
  )
}

export function AusstattungListe({ merkmale }: { merkmale: AusstattungsMerkmal[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {merkmale.map((m) => (
        <AusstattungBadge key={m} merkmal={m} />
      ))}
    </div>
  )
}

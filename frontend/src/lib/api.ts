// API-Helfer für den Aufruf des Booking Service.
//
// Hinter dem Crucible-Proxy ist die App unter …/proxy/<port>/ erreichbar. Damit
// /api-Aufrufe unabhängig von der aktuellen Route funktionieren, wird der Proxy-
// Prefix aus der Browser-URL ermittelt und der API-Pfad als root-absolute URL
// gebaut. Lokal (ohne Proxy) ist der Prefix leer -> "/api/...".
function proxyPrefix(): string {
  if (typeof window === "undefined") return ""
  const match = window.location.pathname.match(/^(.*\/proxy\/\d+)(?:\/|$)/)
  return match ? match[1] : ""
}

/** Baut die URL für einen API-Pfad, z. B. apiUrl("/api/hello"). */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${proxyPrefix()}${p}`
}

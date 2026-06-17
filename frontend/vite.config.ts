import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

// --- Betrieb hinter dem Crucible-Proxy ---
// Der Proxy bedient die App unter …/proxy/5173/ und STRIPPT diesen Prefix beim
// Weiterleiten an den Dev-Server (localhost:5173 sieht also Pfade ab "/").
//
// Vite koppelt `base` an Serve-Root UND Asset-URLs (anders als Next.js, das
// `assetPrefix` und `basePath` trennt). Lösungen mit base="/" (Assets verlieren
// den Prefix -> 404) oder base="./" (Dev injiziert trotzdem absolute /@vite/client)
// scheitern. Deshalb:
//   1. base = voller Proxy-Pfad  -> Browser fragt Assets MIT Prefix an
//      (root-absolut, löst gegen die Proxy-URL auf -> korrekt).
//   2. Middleware re-addiert den vom Proxy gestrippten Prefix an `req.url`,
//      sodass der Dev-Server die Anfragen unter `base` wiederfindet
//      (kein Redirect-Loop, Assets werden gefunden).
const proxyUri = process.env.VSCODE_PROXY_URI
const basePath = proxyUri
  ? new URL(proxyUri.replace("{{port}}", "5173")).pathname // z.B. /t/…/s/…/proxy/5173/
  : "/"

// Macht das Strippen des Proxys rückgängig: fehlt der Prefix an req.url, wird er
// wieder vorangestellt — vor allen Vite-internen Middlewares.
// Ausnahme: /api wird NICHT umgeschrieben, damit der Vite-Proxy (server.proxy)
// die Anfrage unverändert an den Booking Service weiterleiten kann.
function crucibleProxyPrefix(): Plugin {
  const prefix = basePath.replace(/\/$/, "") // ohne abschließenden Slash
  return {
    name: "crucible-proxy-prefix",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (
          prefix &&
          req.url &&
          !req.url.startsWith("/api") &&
          !req.url.startsWith(prefix + "/") &&
          req.url !== prefix
        ) {
          req.url = prefix + req.url
        }
        next()
      })
    },
  }
}

export default defineConfig({
  base: basePath,
  plugins: [
    ...(proxyUri ? [crucibleProxyPrefix()] : []),
    react(),
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    hmr: proxyUri ? { protocol: "wss", clientPort: 443 } : undefined,
    // /api wird an den Booking Service (Spring Boot, Port 8080) weitergeleitet.
    // Das Frontend ruft Endpunkte relativ auf (z. B. "api/hello"), wodurch CORS
    // entfällt und der Betrieb hinter dem Crucible-Proxy funktioniert.
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

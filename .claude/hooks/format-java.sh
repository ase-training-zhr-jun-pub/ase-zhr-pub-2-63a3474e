#!/usr/bin/env bash
#
# PostToolUse-Hook: formatiert den Java-Code des Booking Service mit Spotless
# (google-java-format), sobald eine .java-Datei geschrieben oder editiert wurde.
#
# Liest das Hook-JSON von stdin, prüft den betroffenen Pfad und ruft – nur bei
# Java-Dateien – `mvn spotless:apply` auf das Backend-Modul. Andere Dateien
# (Frontend, Doku) führen zu einem sofortigen No-op.

input="$(cat)"
file="$(printf '%s' "$input" | jq -r '.tool_response.filePath // .tool_input.file_path // empty' 2>/dev/null)"

# Nur auf Java-Dateien reagieren
case "$file" in
  *.java) ;;
  *) exit 0 ;;
esac

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
POM="$ROOT/backend/pom.xml"
[ -f "$POM" ] || exit 0

# Spotless formatiert das Backend-Modul. Fehler dürfen den Tool-Flow nicht blocken.
mvn -q -f "$POM" spotless:apply >/dev/null 2>&1 || true
exit 0

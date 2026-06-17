#!/usr/bin/env bash
#
# install-sdk.sh — Installiert die SDKs für den Calvin Booking Service.
#
# Backend-Technologie laut ADR-001 (Technologie-Stack Booking Service):
#   Java / Spring Boot  ->  benötigt ein JDK (Java 17+) und Maven als Build-Tool.
#
# Installiert ein OpenJDK und Apache Maven über den System-Paketmanager apt.
# Das Skript ist idempotent: bereits installierte Pakete werden übersprungen.
#
# Override per Umgebungsvariable möglich, z. B.:  JAVA_VERSION=17 ./scripts/install-sdk.sh

set -euo pipefail

JAVA_VERSION="${JAVA_VERSION:-21}"   # LTS, kompatibel mit Spring Boot 3.x
JDK_PKG="openjdk-${JAVA_VERSION}-jdk"

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
err() { printf '\033[1;31mFehler:\033[0m %s\n' "$*" >&2; }

# Paketmanager prüfen
if ! command -v apt-get >/dev/null 2>&1; then
  err "apt-get nicht gefunden. Dieses Skript unterstützt Debian/Ubuntu."
  exit 1
fi

# sudo nur verwenden, wenn nicht als root ausgeführt
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

install_pkg() {
  local pkg="$1"
  if dpkg -s "$pkg" >/dev/null 2>&1; then
    log "$pkg ist bereits installiert – überspringe."
  else
    log "Installiere $pkg ..."
    $SUDO apt-get install -y "$pkg"
  fi
}

log "Aktualisiere Paketlisten ..."
$SUDO apt-get update -y

install_pkg "$JDK_PKG"
install_pkg "maven"

log "Verifiziere Installation ..."
java -version
mvn -version

log "Fertig. JDK ($JDK_PKG) und Maven sind installiert."

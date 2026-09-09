#!/usr/bin/env bash
# ---------------------------------------------------------------------
# revisar-servidor.sh — Radiografía del servidor, SIN cambiar nada.
#
# Todo lo que hace es MIRAR: no instala, no modifica, no reinicia nada.
# n8n no se entera de que este script existe.
#
# Cómo usarlo, desde tu Mac:
#   ssh -i ~/ruta/a/tu-llave.pem usuario@tu-servidor 'bash -s' < despliegue/revisar-servidor.sh
# ---------------------------------------------------------------------
set -u

titulo() { printf '\n=== %s ===\n' "$1"; }

titulo "Sistema"
whoami
. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME"

titulo "¿Caddy es un servicio del sistema?"
systemctl is-active caddy 2>&1 || true

titulo "¿Caddy está en Docker?"
docker ps --format '{{.Names}} | {{.Image}} | {{.Ports}}' 2>&1 | head -15 || echo "sin docker"

titulo "Redes de Docker"
docker network ls 2>/dev/null | head -10 || true

titulo "Dónde está el Caddyfile"
for ruta in /etc/caddy/Caddyfile ~/Caddyfile ~/caddy_config/Caddyfile /opt/n8n/Caddyfile; do
  [ -f "$ruta" ] && echo "ENCONTRADO: $ruta"
done
find / -maxdepth 5 -name "Caddyfile" -not -path "*/proc/*" 2>/dev/null | head -5

titulo "Node instalado"
node -v 2>&1 || echo "Node NO instalado"

titulo "Quién usa el puerto 3001"
(ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | grep -E '3001|LISTEN' | head -10

titulo "Espacio libre"
df -h / | tail -1

titulo "Memoria"
free -m 2>/dev/null | head -2

printf '\n--- Fin de la revisión. No se modificó nada. ---\n'

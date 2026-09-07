#!/usr/bin/env bash
# ---------------------------------------------------------------------
# duckdns-actualizar.sh — Mantiene el dominio apuntando al servidor
# ---------------------------------------------------------------------
# ¿Por qué hace falta?
#
# La IP pública de un servidor de AWS CAMBIA cada vez que la instancia se
# apaga y se vuelve a encender (a menos que tenga una IP elástica). Si eso
# pasa, el dominio queda apuntando a la nada y la web "desaparece".
#
# Este script le dice a DuckDNS cuál es la IP de ahora. Corriendo cada
# 5 minutos, el dominio se arregla solo aunque la IP cambie.
#
# El token NO se escribe aquí. Se lee de /etc/clack/duckdns.env, que se
# crea a mano en el servidor y nunca se sube a GitHub:
#
#   sudo mkdir -p /etc/clack
#   sudo nano /etc/clack/duckdns.env
#       DUCKDNS_DOMINIOS=clackperu,kursperu
#       DUCKDNS_TOKEN=tu-token-de-duckdns
#   sudo chmod 600 /etc/clack/duckdns.env
# ---------------------------------------------------------------------
set -euo pipefail

ARCHIVO_SECRETO="/etc/clack/duckdns.env"
REGISTRO="/var/log/duckdns.log"

if [ ! -f "$ARCHIVO_SECRETO" ]; then
  echo "Falta $ARCHIVO_SECRETO (ahí van el dominio y el token)." >&2
  exit 1
fi

# shellcheck source=/dev/null
. "$ARCHIVO_SECRETO"

: "${DUCKDNS_DOMINIOS:?Falta DUCKDNS_DOMINIOS en $ARCHIVO_SECRETO}"
: "${DUCKDNS_TOKEN:?Falta DUCKDNS_TOKEN en $ARCHIVO_SECRETO}"

# Con ip vacío, DuckDNS usa la IP desde la que llega la petición:
# justo la del servidor.
RESPUESTA=$(curl -s --max-time 15 \
  "https://www.duckdns.org/update?domains=${DUCKDNS_DOMINIOS}&token=${DUCKDNS_TOKEN}&ip=")

MOMENTO=$(date '+%Y-%m-%d %H:%M:%S')
if [ "$RESPUESTA" = "OK" ]; then
  echo "$MOMENTO  OK  ($DUCKDNS_DOMINIOS)" >> "$REGISTRO"
else
  echo "$MOMENTO  FALLÓ: $RESPUESTA" >> "$REGISTRO"
  exit 1
fi

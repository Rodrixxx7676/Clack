#!/usr/bin/env bash
# ---------------------------------------------------------------------
# publicar.sh — Sube una versión nueva de Clack a internet
# ---------------------------------------------------------------------
# Se ejecuta EN TU MAC, desde la carpeta del proyecto:
#
#   bash despliegue/publicar.sh
#
# Qué hace:
#   1. Construye la web aquí (el servidor tiene poca memoria y la
#      comparte con n8n: mejor no hacerle trabajar de más)
#   2. Envía solo lo necesario (unos 100 KB)
#   3. Reconstruye la imagen y reinicia el contenedor de Clack
#   4. Comprueba que la web responde
#
# n8n y Caddy NO se tocan en ningún momento.
# ---------------------------------------------------------------------
set -euo pipefail

SERVIDOR="ubuntu@34.229.198.32"
LLAVE="${LLAVE_SSH:-$HOME/Downloads/Ticket.pem}"
DOMINIO="clack.kursperu.duckdns.org"
PAQUETE="$(mktemp -t clack).tgz"

paso() { printf '\n\033[1m▶ %s\033[0m\n' "$*"; }

paso "1/4 Construyendo la web"
npm run build

paso "2/4 Empaquetando y enviando"
tar czf "$PAQUETE" dist servidor despliegue/Dockerfile despliegue/package.produccion.json
du -h "$PAQUETE"
ssh -i "$LLAVE" "$SERVIDOR" 'rm -rf ~/clack && mkdir -p ~/clack && cat > ~/clack/envio.tgz' < "$PAQUETE"
rm -f "$PAQUETE"

paso "3/4 Reconstruyendo el contenedor en el servidor"
ssh -i "$LLAVE" "$SERVIDOR" '
  set -e
  cd ~/clack
  tar xzf envio.tgz && rm envio.tgz
  find . -name "._*" -delete          # basura que añade macOS
  docker build -q -f despliegue/Dockerfile -t clack:latest .
  docker rm -f clack >/dev/null 2>&1 || true

  # Las claves secretas (reCAPTCHA y las que vengan) viven solo en el
  # servidor, en /etc/clack/recaptcha.env, y se le pasan al contenedor.
  SECRETOS=""
  if [ -f /etc/clack/recaptcha.env ]; then
    SECRETOS="--env-file /etc/clack/recaptcha.env"
    echo "   claves de reCAPTCHA encontradas ✓"
  else
    echo "   ⚠️  sin /etc/clack/recaptcha.env: el login quedará sin reCAPTCHA"
  fi

  docker run -d --name clack --restart unless-stopped \
    --network n8n-docker_default --memory 256m \
    --log-opt max-size=10m --log-opt max-file=3 \
    $SECRETOS \
    clack:latest >/dev/null
  docker image prune -f >/dev/null    # borra la imagen vieja: el disco va justo
  sleep 5
  docker ps --filter name=clack --format "   {{.Names}} | {{.Status}}"
  df -h / | tail -1
'

paso "4/4 Comprobando desde internet"
codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://$DOMINIO")
if [ "$codigo" = "200" ]; then
  printf '\n\033[32m✅ Publicado: https://%s\033[0m\n\n' "$DOMINIO"
else
  printf '\n\033[31m✗ La web responde %s\033[0m\n' "$codigo"
  echo "Mira los registros con:"
  echo "  ssh -i $LLAVE $SERVIDOR 'docker logs clack --tail 40'"
  exit 1
fi

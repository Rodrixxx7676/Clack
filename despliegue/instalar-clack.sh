#!/usr/bin/env bash
# ---------------------------------------------------------------------
# instalar-clack.sh — Publica Clack sin rozar a n8n
# ---------------------------------------------------------------------
# Cómo se usa, DENTRO del servidor:
#
#   sudo bash /opt/clack/despliegue/instalar-clack.sh clack.kursperu.duckdns.org
#
# Y si algún día hace falta cambiarle el puerto (por defecto 3001):
#
#   sudo bash /opt/clack/despliegue/instalar-clack.sh clack.kursperu.duckdns.org 3005
#
# Qué hace, en orden:
#   1. Anota cómo responden AHORA los sitios que ya existen (n8n incluido)
#   2. Instala Node si falta y construye la web
#   3. Enciende Clack en el puerto 3001 y comprueba que responde
#   4. Respalda el Caddyfile con la fecha
#   5. Deja la configuración de Clack en un archivo APARTE
#   6. Valida; si algo está mal, deshace y sale sin aplicar nada
#   7. Recarga Caddy (reload, no restart: no corta conexiones)
#   8. Comprueba que los sitios de antes siguen igual. Si alguno cambió,
#      DESHACE automáticamente y avisa.
# ---------------------------------------------------------------------
set -euo pipefail

DOMINIO="${1:-}"
PUERTO="${2:-3001}"
CARPETA_CLACK="${CARPETA_CLACK:-/opt/clack}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
CARPETA_CONF="/etc/caddy/conf.d"
CONFIG_CLACK="$CARPETA_CONF/clack.caddy"
FECHA="$(date +%Y%m%d-%H%M%S)"
RESPALDO="$CADDYFILE.respaldo-$FECHA"

rojo()  { printf '\033[31m%s\033[0m\n' "$*"; }
verde() { printf '\033[32m%s\033[0m\n' "$*"; }
paso()  { printf '\n\033[1m▶ %s\033[0m\n' "$*"; }

if [ -z "$DOMINIO" ]; then
  rojo "Falta el dominio."
  echo "Uso: sudo bash $0 clack.kursperu.duckdns.org [puerto]"
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  rojo "Este script necesita sudo."
  exit 1
fi

# --- 1. Foto de cómo está todo antes de tocar nada --------------------
paso "Anotando cómo responden los sitios que ya existen"
SITIOS_ANTES=""
if [ -f "$CADDYFILE" ]; then
  for sitio in $(grep -oE '^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' "$CADDYFILE" | sort -u); do
    codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "https://$sitio" || echo "000")
    echo "   $sitio → $codigo"
    SITIOS_ANTES="$SITIOS_ANTES $sitio=$codigo"
  done
fi
[ -z "$SITIOS_ANTES" ] && echo "   (ningún sitio previo detectado)"

deshacer() {
  rojo "Deshaciendo los cambios..."
  rm -f "$CONFIG_CLACK"
  [ -f "$RESPALDO" ] && cp "$RESPALDO" "$CADDYFILE"
  systemctl reload caddy 2>/dev/null || true
  rojo "Caddy volvió a la configuración anterior. n8n no debería haberse enterado."
}

# --- 2. Node y construcción de la web ---------------------------------
paso "Preparando Node.js y construyendo la web"
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v
cd "$CARPETA_CLACK"
npm ci
npm run build

# --- 3. Clack en el puerto 3001 ---------------------------------------
paso "Encendiendo Clack en el puerto $PUERTO"
cp "$CARPETA_CLACK/despliegue/clack.service" /etc/systemd/system/clack.service
sed -i "s|WorkingDirectory=.*|WorkingDirectory=$CARPETA_CLACK|" /etc/systemd/system/clack.service
sed -i "s|Environment=PORT=.*|Environment=PORT=$PUERTO|" /etc/systemd/system/clack.service
systemctl daemon-reload
systemctl enable --now clack
systemctl restart clack
sleep 2

if ! curl -sf --max-time 10 "http://127.0.0.1:$PUERTO/salud" > /dev/null; then
  rojo "Clack no responde en el puerto $PUERTO."
  echo "Mira qué pasó con:  journalctl -u clack -n 40"
  exit 1
fi
verde "   Clack responde en el $PUERTO ✓"

# --- 4 y 5. Configuración de Caddy, en un archivo aparte --------------
paso "Configurando Caddy para $DOMINIO"
mkdir -p "$CARPETA_CONF" /var/log/caddy
cp "$CADDYFILE" "$RESPALDO"
echo "   Respaldo guardado en: $RESPALDO"

sed -e "s|DOMINIO_DE_CLACK|$DOMINIO|" -e "s|PUERTO_DE_CLACK|$PUERTO|" \
  "$CARPETA_CLACK/despliegue/Caddyfile.clack" > "$CONFIG_CLACK"

# La línea de import se agrega UNA sola vez, y nunca más se toca el archivo.
if ! grep -q "conf.d/\*.caddy" "$CADDYFILE"; then
  echo "   Agregando la línea de import al Caddyfile (una única vez)"
  printf '\n# Configuraciones adicionales (Clack y futuras apps)\nimport %s/*.caddy\n' "$CARPETA_CONF" >> "$CADDYFILE"
else
  echo "   El Caddyfile ya carga conf.d/: no hace falta tocarlo ✓"
fi

# --- 6. Validar ANTES de aplicar --------------------------------------
paso "Validando la configuración"
if ! caddy validate --config "$CADDYFILE" 2>&1 | tail -3; then
  rojo "La configuración tiene errores. NO se aplicó nada."
  deshacer
  exit 1
fi
verde "   Configuración válida ✓"

# --- 7. Aplicar sin cortar conexiones ---------------------------------
paso "Recargando Caddy (reload, no restart)"
systemctl reload caddy
sleep 8   # Caddy pide el certificado HTTPS la primera vez

# --- 8. ¿Sigue todo como estaba? --------------------------------------
paso "Comprobando que los sitios de antes siguen igual"
FALLO=0
for entrada in $SITIOS_ANTES; do
  sitio="${entrada%%=*}"; antes="${entrada##*=}"
  ahora=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "https://$sitio" || echo "000")
  if [ "$ahora" = "$antes" ]; then
    verde "   $sitio → $ahora (igual que antes) ✓"
  else
    rojo "   $sitio → antes $antes, ahora $ahora ✗"
    FALLO=1
  fi
done

if [ "$FALLO" -eq 1 ]; then
  rojo "Algo cambió en un sitio que ya existía."
  deshacer
  exit 1
fi

paso "Comprobando Clack"
codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$DOMINIO" || echo "000")
if [ "$codigo" = "200" ]; then
  verde "   https://$DOMINIO → 200 ✓"
  printf '\n\033[32m✅ Clack está en internet: https://%s\033[0m\n\n' "$DOMINIO"
else
  rojo "   https://$DOMINIO → $codigo"
  echo "Los sitios anteriores siguen bien, así que no se deshace nada."
  echo "Suele ser el certificado, que tarda. Mira:  journalctl -u caddy -n 30"
fi

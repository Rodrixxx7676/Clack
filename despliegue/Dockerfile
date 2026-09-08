# ---------------------------------------------------------------------
# Imagen de Clack para el servidor
# ---------------------------------------------------------------------
# La web se construye ANTES, en la máquina de desarrollo, y aquí solo se
# copia ya hecha.
#
# ¿Por qué? El servidor tiene poca memoria (menos de 1 GB libre) y la
# comparte con n8n, que está en producción. Construir allá podría dejar
# sin memoria a la máquina y hacer que el sistema mate procesos... como
# n8n. Construyendo aquí, el servidor solo tiene que copiar archivos.
#
# Se construye así, desde la carpeta con dist/ y servidor/ dentro:
#   docker build -f Dockerfile -t clack .
# ---------------------------------------------------------------------

FROM node:22-alpine

WORKDIR /app

# Solo Express: nada de herramientas de desarrollo.
COPY despliegue/package.produccion.json ./package.json
RUN npm install --omit=dev && npm cache clean --force

# La web ya construida, el servidor que la entrega y las reglas que
# comparten los dos (comun/).
COPY dist ./dist
COPY servidor ./servidor
COPY comun ./comun

# Aquí se guardan las cuentas. Es un volumen: sobrevive a los despliegues.
RUN mkdir -p /app/datos
VOLUME ["/app/datos"]

ENV NODE_ENV=production
# Dentro de un contenedor hay que escuchar en 0.0.0.0 para que Caddy,
# que está en otro contenedor, pueda alcanzarlo. El puerto no se publica
# hacia afuera, así que sigue siendo inalcanzable desde internet.
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

# Chequeo de salud: Docker sabrá si Clack dejó de responder.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3001/salud || exit 1

CMD ["node", "servidor/servidor.js"]

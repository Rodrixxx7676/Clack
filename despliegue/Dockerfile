# ---------------------------------------------------------------------
# Imagen de Docker para Clack
# ---------------------------------------------------------------------
# Solo hace falta SI Caddy corre dentro de Docker en el servidor
# (es lo habitual cuando n8n se instaló con docker compose).
#
# Se construye desde la raíz del proyecto:
#   docker build -f despliegue/Dockerfile -t clack .
# ---------------------------------------------------------------------

FROM node:22-alpine

WORKDIR /app

# Primero las dependencias: así Docker reutiliza este paso si no cambian.
COPY package.json package-lock.json ./
RUN npm ci

# Después el código, y se construye la web.
COPY . .
RUN npm run build

# Dentro de un contenedor hay que escuchar en 0.0.0.0 para que Caddy,
# que está en otro contenedor, pueda alcanzarlo.
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

CMD ["node", "servidor/servidor.js"]

/**
 * servidor.js
 * -----------
 * El servidor que entrega Clack a internet.
 *
 * Cómo encaja todo:
 *
 *   Navegador  →  Caddy (puertos 80 y 443, con HTTPS)  →  este servidor (3001)
 *
 * Caddy es el "proxy inverso": recibe las visitas de internet, se encarga
 * del candado HTTPS y le pasa la petición a este servidor, que vive
 * escondido en el puerto 3001 y no se asoma a internet directamente.
 *
 * Hoy solo entrega la web ya construida (la carpeta dist/). Más adelante,
 * aquí mismo irán las rutas del registro de usuarios, OAuth 2.0 y reCAPTCHA.
 */
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CARPETA_DE_ESTE_ARCHIVO = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_WEB = path.join(CARPETA_DE_ESTE_ARCHIVO, "..", "dist");

// El puerto se puede cambiar sin tocar el código: PORT=4000 npm run servidor
const PUERTO = Number(process.env.PORT) || 3001;

const app = express();

// Caddy va delante: así el servidor sabe la IP real de quien visita.
app.set("trust proxy", 1);

// Para saber de un vistazo si el servidor está vivo:
// https://clack.kursperu.duckdns.org/salud
app.get("/salud", (peticion, respuesta) => {
  respuesta.json({
    estado: "ok",
    aplicacion: "Clack",
    momento: new Date().toISOString(),
  });
});

// Los archivos de la web (HTML, CSS, JavaScript, imágenes).
app.use(
  express.static(CARPETA_WEB, {
    // Los archivos con nombre único (index-a1b2c3.js) se pueden guardar
    // en caché mucho tiempo; el index.html nunca, para que los cambios
    // se vean al instante.
    maxAge: "1y",
    index: false,
    setHeaders: (respuesta, rutaDelArchivo) => {
      if (rutaDelArchivo.endsWith("index.html")) {
        respuesta.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

// Cualquier otra dirección devuelve la web: React se encarga del resto.
app.get("*", (peticion, respuesta) => {
  respuesta.sendFile(path.join(CARPETA_WEB, "index.html"));
});

app.listen(PUERTO, "127.0.0.1", () => {
  console.log(`Clack escuchando en http://127.0.0.1:${PUERTO}`);
  console.log(`Sirviendo la carpeta: ${CARPETA_WEB}`);
});

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
 * Entrega la web ya construida (la carpeta dist/) y atiende las rutas de
 * registro e inicio de sesión, que están en usuarios/rutasDeUsuarios.js.
 */
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rutasDeUsuarios } from "./usuarios/rutasDeUsuarios.js";
import { rutasDeFavoritos } from "./favoritos/rutasDeFavoritos.js";
import { almacenDeUsuarios } from "./usuarios/almacenDeUsuarios.js";
import { RECAPTCHA_ACTIVO, verificarFicha } from "./seguridad/recaptcha.js";

const CARPETA_DE_ESTE_ARCHIVO = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_WEB = path.join(CARPETA_DE_ESTE_ARCHIVO, "..", "dist");

// El puerto se puede cambiar sin tocar el código: PORT=4000 npm run servidor
const PUERTO = Number(process.env.PORT) || 3001;

// Dónde escucha:
//   · 127.0.0.1 (por defecto) → solo desde la propia máquina. Es lo seguro
//     cuando Caddy está instalado en el mismo servidor.
//   · 0.0.0.0 → también desde la red interna. Hace falta si Clack corre
//     dentro de un contenedor Docker, para que Caddy pueda alcanzarlo.
const DIRECCION = process.env.HOST || "127.0.0.1";

const app = express();

// Para poder leer el cuerpo JSON de las peticiones.
app.use(express.json({ limit: "10kb" }));

// Caddy va delante: así el servidor sabe la IP real de quien visita.
app.set("trust proxy", 1);

// Para saber de un vistazo si el servidor está vivo, y en qué estado:
// https://clack.kursperu.duckdns.org/salud
app.get("/salud", async (peticion, respuesta) => {
  respuesta.json({
    estado: "ok",
    aplicacion: "Clack",
    recaptcha: RECAPTCHA_ACTIVO ? "activo" : "desactivado",
    cuentasRegistradas: await almacenDeUsuarios.cuantosHay(),
    momento: new Date().toISOString(),
  });
});

// Registro e inicio de sesión.
app.use("/api", rutasDeUsuarios);

// Las ciudades favoritas de cada persona (necesitan sesión).
app.use("/api/favoritos", rutasDeFavoritos);

// Comprobación suelta de reCAPTCHA, por si hace falta en otra pantalla.
app.post("/api/verificar-recaptcha", async (peticion, respuesta) => {
  const resultado = await verificarFicha({
    ficha: peticion.body?.ficha,
    accion: peticion.body?.accion,
    ip: peticion.ip,
  });
  respuesta.json(resultado);
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

// La cuenta de prueba se crea sola la primera vez.
await almacenDeUsuarios.asegurarCuentaDemo().catch((error) => {
  console.error("No se pudo preparar la cuenta de prueba:", error.message);
});

app.listen(PUERTO, DIRECCION, () => {
  console.log(`Clack escuchando en http://${DIRECCION}:${PUERTO}`);
  console.log(`Sirviendo la carpeta: ${CARPETA_WEB}`);
});

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

// --- reCAPTCHA -------------------------------------------------------
// La clave secreta NUNCA se escribe aquí. Se lee de una variable de
// entorno que vive solo dentro del servidor, en /etc/clack/recaptcha.env
const CLAVE_SECRETA_RECAPTCHA = process.env.RECAPTCHA_SECRET || "";
const PUNTUACION_MINIMA = Number(process.env.RECAPTCHA_MINIMO) || 0.5;
const RECAPTCHA_ACTIVO = CLAVE_SECRETA_RECAPTCHA.length > 0;

if (!RECAPTCHA_ACTIVO) {
  console.warn(
    "⚠️  reCAPTCHA DESACTIVADO: falta RECAPTCHA_SECRET.\n" +
      "   El login queda sin protección contra robots. En desarrollo es\n" +
      "   normal; en el servidor de verdad hay que configurarlo."
  );
}

// Para saber de un vistazo si el servidor está vivo:
// https://clack.kursperu.duckdns.org/salud
app.get("/salud", (peticion, respuesta) => {
  respuesta.json({
    estado: "ok",
    aplicacion: "Clack",
    recaptcha: RECAPTCHA_ACTIVO ? "activo" : "desactivado",
    momento: new Date().toISOString(),
  });
});

/**
 * Recibe la ficha del navegador y le pregunta a Google si viene de una
 * persona. Responde con la puntuación (0 = robot, 1 = persona).
 */
app.post("/api/verificar-recaptcha", async (peticion, respuesta) => {
  const { ficha, accion } = peticion.body ?? {};

  // Sin clave configurada no se puede verificar nada: se deja pasar, pero
  // queda dicho en la respuesta para que no pase desapercibido.
  if (!RECAPTCHA_ACTIVO) {
    return respuesta.json({
      aprobado: true,
      puntuacion: null,
      motivo: "reCAPTCHA no está configurado en este servidor",
    });
  }

  if (typeof ficha !== "string" || ficha.length === 0) {
    return respuesta.status(400).json({
      aprobado: false,
      puntuacion: null,
      motivo: "Falta la ficha de reCAPTCHA",
    });
  }

  try {
    const consulta = new URLSearchParams({
      secret: CLAVE_SECRETA_RECAPTCHA,
      response: ficha,
      remoteip: peticion.ip,
    });

    const respuestaDeGoogle = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: consulta,
      }
    );

    const datos = await respuestaDeGoogle.json();

    if (!datos.success) {
      return respuesta.json({
        aprobado: false,
        puntuacion: null,
        motivo: "Google rechazó la ficha",
      });
    }

    // La acción debe coincidir: evita reutilizar una ficha de otra pantalla.
    if (accion && datos.action && datos.action !== accion) {
      return respuesta.json({
        aprobado: false,
        puntuacion: datos.score ?? null,
        motivo: "La ficha no corresponde a esta acción",
      });
    }

    const puntuacion = datos.score ?? 0;
    return respuesta.json({
      aprobado: puntuacion >= PUNTUACION_MINIMA,
      puntuacion,
      motivo: puntuacion >= PUNTUACION_MINIMA ? "ok" : "Puntuación demasiado baja",
    });
  } catch (error) {
    console.error("Error consultando a reCAPTCHA:", error.message);
    return respuesta.status(502).json({
      aprobado: false,
      puntuacion: null,
      motivo: "No pudimos contactar con reCAPTCHA",
    });
  }
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

app.listen(PUERTO, DIRECCION, () => {
  console.log(`Clack escuchando en http://${DIRECCION}:${PUERTO}`);
  console.log(`Sirviendo la carpeta: ${CARPETA_WEB}`);
});

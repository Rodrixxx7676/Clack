/**
 * sesiones.js
 * -----------
 * Quién es quién en cada petición.
 *
 * Al entrar, el servidor entrega una "llave de sesión": un texto largo y
 * aleatorio. El navegador la guarda y la envía en cada petición. El
 * servidor mira su lista y sabe de quién se trata.
 *
 * Es importante que la llave la genere el SERVIDOR: si el navegador
 * dijera "soy el usuario 5", cualquiera podría escribir el número de
 * otro y leer sus datos.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const CARPETA_DE_DATOS = process.env.CARPETA_DATOS || "/app/datos";
const ARCHIVO = path.join(CARPETA_DE_DATOS, "sesiones.json");

// Cuánto dura una sesión sin usarse: 30 días.
const DURACION_MS = 30 * 24 * 60 * 60 * 1000;

async function leer() {
  try {
    return JSON.parse(await fs.readFile(ARCHIVO, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function guardar(sesiones) {
  await fs.mkdir(CARPETA_DE_DATOS, { recursive: true });
  const temporal = `${ARCHIVO}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(sesiones, null, 2), "utf8");
  await fs.rename(temporal, ARCHIVO);
}

/** Quita las sesiones caducadas para que el archivo no crezca sin fin. */
function limpiarCaducadas(sesiones) {
  const ahora = Date.now();
  const vivas = {};
  for (const [llave, sesion] of Object.entries(sesiones)) {
    if (sesion.caducaEn > ahora) vivas[llave] = sesion;
  }
  return vivas;
}

export const sesiones = {
  /** Crea una llave nueva para ese usuario. */
  async crear(idDeUsuario) {
    const todas = limpiarCaducadas(await leer());
    const llave = crypto.randomBytes(32).toString("base64url");
    todas[llave] = { idDeUsuario, caducaEn: Date.now() + DURACION_MS };
    await guardar(todas);
    return llave;
  },

  /** Devuelve el id del usuario dueño de la llave, o null. */
  async duenoDe(llave) {
    if (typeof llave !== "string" || llave.length === 0) return null;
    const todas = await leer();
    const sesion = todas[llave];
    if (!sesion || sesion.caducaEn <= Date.now()) return null;
    return sesion.idDeUsuario;
  },

  async cerrar(llave) {
    const todas = await leer();
    if (todas[llave]) {
      delete todas[llave];
      await guardar(todas);
    }
  },
};

/**
 * Deja pasar solo a quien traiga una llave válida y, de paso, apunta en
 * la petición de quién se trata.
 */
export async function requiereSesion(peticion, respuesta, siguiente) {
  const cabecera = peticion.headers.authorization ?? "";
  const llave = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : "";

  const idDeUsuario = await sesiones.duenoDe(llave);
  if (!idDeUsuario) {
    return respuesta.status(401).json({ error: "Tu sesión caducó. Vuelve a entrar." });
  }

  peticion.idDeUsuario = idDeUsuario;
  siguiente();
}

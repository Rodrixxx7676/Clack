/**
 * almacenDeFavoritos.js
 * ---------------------
 * Las ciudades que cada persona eligió, y en qué orden.
 *
 * Corresponde a la entidad FAVORITO de la planificación:
 *
 *   ID_FAVORITO         →  id
 *   ID_USUARIO          →  idDeUsuario
 *   ID_ZONA             →  ciudad.id
 *   ORDEN_VISUALIZACION →  orden
 *
 * De cada ciudad se guardan también sus datos (nombre, país, zona
 * horaria, coordenadas y foto), porque pueden venir del buscador y no
 * estar en el catálogo que trae la aplicación.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const CARPETA_DE_DATOS = process.env.CARPETA_DATOS || "/app/datos";
const ARCHIVO = path.join(CARPETA_DE_DATOS, "favoritos.json");

// Lo que pide el requisito: hasta 10 ciudades a la vez.
export const MAXIMO_DE_CIUDADES = 10;

async function leerTodos() {
  try {
    return JSON.parse(await fs.readFile(ARCHIVO, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function guardarTodos(favoritos) {
  await fs.mkdir(CARPETA_DE_DATOS, { recursive: true });
  const temporal = `${ARCHIVO}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(favoritos, null, 2), "utf8");
  await fs.rename(temporal, ARCHIVO);
}

const porOrden = (a, b) => a.orden - b.orden;

export const almacenDeFavoritos = {
  /** Las ciudades de una persona, ya ordenadas. */
  async deUsuario(idDeUsuario) {
    const todos = await leerTodos();
    return todos.filter((f) => f.idDeUsuario === idDeUsuario).sort(porOrden);
  },

  /**
   * Reemplaza la lista completa de una persona. Es más simple y seguro
   * que ir añadiendo y quitando de a una: el navegador manda la lista
   * como quedó y el servidor la guarda tal cual, respetando el máximo.
   */
  async reemplazar(idDeUsuario, ciudades) {
    if (!Array.isArray(ciudades)) {
      throw new Error("La lista de ciudades no es válida.");
    }
    if (ciudades.length > MAXIMO_DE_CIUDADES) {
      throw new Error(`Solo puedes tener ${MAXIMO_DE_CIUDADES} ciudades a la vez.`);
    }

    const todos = await leerTodos();
    const deOtros = todos.filter((f) => f.idDeUsuario !== idDeUsuario);

    const nuevos = ciudades.map((ciudad, posicion) => ({
      id: crypto.randomUUID(),
      idDeUsuario,
      orden: posicion,
      ciudad: {
        id: String(ciudad.id),
        nombre: String(ciudad.nombre),
        pais: String(ciudad.pais),
        zonaHoraria: String(ciudad.zonaHoraria),
        latitud: Number(ciudad.latitud),
        longitud: Number(ciudad.longitud),
        foto: ciudad.foto ? String(ciudad.foto) : null,
        descripcion: ciudad.descripcion ? String(ciudad.descripcion) : null,
      },
    }));

    await guardarTodos([...deOtros, ...nuevos]);
    return nuevos.sort(porOrden);
  },
};

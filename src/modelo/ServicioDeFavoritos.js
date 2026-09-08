/**
 * ServicioDeFavoritos.js
 * ----------------------
 * Las ciudades que la persona eligió, guardadas en el servidor.
 *
 * Corresponde a la entidad FAVORITO. Como viven en el servidor y no en
 * el navegador, las mismas ciudades aparecen desde cualquier dispositivo.
 */
import { Ciudad } from "./Ciudad.js";
import { llaveDeSesion } from "./ServicioAutenticacion.js";

export const MAXIMO_DE_CIUDADES = 10;

async function pedir(direccion, opciones = {}) {
  const respuesta = await fetch(direccion, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llaveDeSesion() ?? ""}`,
      ...opciones.headers,
    },
  });

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error ?? "No pudimos guardar tus ciudades.");
  return datos;
}

export class ServicioDeFavoritos {
  /** @returns {Promise<Ciudad[]>} */
  async obtener() {
    const { ciudades } = await pedir("/api/favoritos");
    return ciudades.map((datos) => new Ciudad(datos));
  }

  /** Guarda la lista tal y como quedó. @returns {Promise<Ciudad[]>} */
  async guardar(ciudades) {
    const { ciudades: guardadas } = await pedir("/api/favoritos", {
      method: "PUT",
      body: JSON.stringify({
        ciudades: ciudades.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          pais: c.pais,
          zonaHoraria: c.zonaHoraria,
          latitud: c.latitud,
          longitud: c.longitud,
          foto: c.foto,
          descripcion: c.descripcion,
        })),
      }),
    });
    return guardadas.map((datos) => new Ciudad(datos));
  }
}

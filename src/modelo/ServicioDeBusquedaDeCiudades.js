/**
 * ServicioDeBusquedaDeCiudades.js
 * -------------------------------
 * Busca cualquier ciudad del mundo por su nombre.
 *
 * Usa el buscador de Open-Meteo (gratis, sin clave). Devuelve ya
 * objetos Ciudad, listos para añadir a los favoritos.
 */
import { Ciudad } from "./Ciudad.js";

const DIRECCION = "https://geocoding-api.open-meteo.com/v1/search";

/** Una foto de relleno mientras no haya una real de esa ciudad. */
function fotoDeRelleno(nombre) {
  const semilla = encodeURIComponent(nombre.toLowerCase().replace(/\s+/g, "-"));
  return `https://picsum.photos/seed/clack-${semilla}/960/1200`;
}

export class ServicioDeBusquedaDeCiudades {
  /**
   * @param {string} texto lo que escribió la persona
   * @returns {Promise<Ciudad[]>}
   */
  async buscar(texto, { señal } = {}) {
    const limpio = texto.trim();
    if (limpio.length < 2) return [];

    const consulta = new URLSearchParams({
      name: limpio,
      count: "8",
      language: "es",
      format: "json",
    });

    const respuesta = await fetch(`${DIRECCION}?${consulta}`, { signal: señal });
    if (!respuesta.ok) throw new Error("No pudimos buscar ciudades ahora mismo.");

    const datos = await respuesta.json();
    const resultados = datos.results ?? [];

    return resultados
      .filter((lugar) => lugar.timezone) // sin zona horaria no sirve para Clack
      .map(
        (lugar) =>
          new Ciudad({
            id: `om-${lugar.id}`,
            nombre: lugar.name,
            pais: lugar.country ?? "",
            zonaHoraria: lugar.timezone,
            latitud: lugar.latitude,
            longitud: lugar.longitude,
            foto: fotoDeRelleno(lugar.name),
            descripcion: [lugar.admin1, lugar.country].filter(Boolean).join(", "),
          })
      );
  }
}

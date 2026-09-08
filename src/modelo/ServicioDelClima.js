/**
 * ServicioDelClima.js
 * -------------------
 * Le pregunta a internet qué temperatura hace ahora en cada ciudad.
 *
 * Usa Open-Meteo (https://open-meteo.com): es gratis y no necesita clave.
 * Pide TODAS las ciudades en una sola llamada, para que el panel cargue
 * rápido aunque haya muchas ciudades.
 */
import { Clima } from "./Clima.js";

const DIRECCION_API = "https://api.open-meteo.com/v1/forecast";

export class ServicioDelClima {
  /**
   * @param {Ciudad[]} ciudades
   * @returns {Promise<Map<string, Clima>>} el clima de cada ciudad, por su id.
   */
  async obtenerClimaDe(ciudades) {
    if (ciudades.length === 0) return new Map();

    const consulta = new URLSearchParams({
      latitude: ciudades.map((ciudad) => ciudad.latitud).join(","),
      longitude: ciudades.map((ciudad) => ciudad.longitud).join(","),
      current: "temperature_2m,weather_code,is_day",
      daily: "sunrise,sunset",
      forecast_days: "1",
      timezone: "auto",
    });

    const respuesta = await fetch(`${DIRECCION_API}?${consulta}`);
    if (!respuesta.ok) {
      throw new Error("No pudimos consultar el clima en este momento.");
    }

    const datos = await respuesta.json();
    // Con una sola ciudad la API responde un objeto; con varias, una lista.
    const lugares = Array.isArray(datos) ? datos : [datos];

    const climaPorCiudad = new Map();
    ciudades.forEach((ciudad, posicion) => {
      const lugar = lugares[posicion];
      const actual = lugar?.current;
      if (!actual) return;

      climaPorCiudad.set(
        ciudad.id,
        new Clima({
          temperatura: actual.temperature_2m,
          codigo: actual.weather_code,
          esDeDia: actual.is_day === 1,
          amanecer: horaDecimalDe(lugar.daily?.sunrise?.[0]),
          atardecer: horaDecimalDe(lugar.daily?.sunset?.[0]),
        })
      );
    });

    return climaPorCiudad;
  }
}

/** De "2026-09-08T06:07" saca 6.117 (las 6 horas y 7 minutos). */
function horaDecimalDe(textoIso) {
  if (!textoIso) return null;
  const hora = textoIso.slice(11, 16); // "06:07"
  const [horas, minutos] = hora.split(":").map(Number);
  if (Number.isNaN(horas)) return null;
  return horas + minutos / 60;
}

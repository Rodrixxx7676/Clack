/**
 * PlanificadorDeReuniones.js
 * --------------------------
 * Responde a la pregunta más útil de Clack:
 * **¿a qué hora podemos hablar todos?**
 *
 * Cómo lo hace: recorre las 24 horas de TU día y, para cada una, mira qué
 * hora sería en cada ciudad. Si a todos les cae en una hora razonable,
 * esa franja se marca como buena.
 *
 * Las tres franjas:
 *   · "buena"     → hora de oficina en esa ciudad (9:00 a 18:00)
 *   · "aceptable" → temprano o tarde, pero despierto (7:00 a 22:00)
 *   · "mala"      → de madrugada
 */

export const HORA_LABORAL = { desde: 9, hasta: 18 };
export const HORA_DESPIERTO = { desde: 7, hasta: 22 };

/** Devuelve la hora local de esa ciudad cuando en tu reloj son las `hora`. */
export function horaEnLaCiudad(hora, desfase) {
  const bruta = hora + desfase;
  return ((bruta % 24) + 24) % 24; // siempre entre 0 y 24
}

/** ¿Cuántos días de diferencia? -1 = allá es ayer, +1 = allá es mañana. */
export function saltoDeDia(hora, desfase) {
  const bruta = hora + desfase;
  if (bruta >= 24) return 1;
  if (bruta < 0) return -1;
  return 0;
}

export function calidadDeLaHora(horaLocal) {
  if (horaLocal >= HORA_LABORAL.desde && horaLocal < HORA_LABORAL.hasta) return "buena";
  if (horaLocal >= HORA_DESPIERTO.desde && horaLocal < HORA_DESPIERTO.hasta) return "aceptable";
  return "mala";
}

/**
 * Arma la tabla completa: una fila por ciudad, 24 casillas por fila.
 *
 * @param {Ciudad[]} ciudades
 * @param {Map<string, Clima>} climaPorCiudad  para saber cuándo sale el sol
 * @param {Date} momento
 */
export function armarTabla(ciudades, climaPorCiudad, momento = new Date()) {
  const filas = ciudades.map((ciudad) => {
    const desfase = ciudad.desfaseEnHorasContigo(momento);
    const clima = climaPorCiudad?.get(ciudad.id) ?? null;

    const casillas = Array.from({ length: 24 }, (_, hora) => {
      const horaLocal = horaEnLaCiudad(hora, desfase);
      return {
        hora, // la hora en TU reloj
        horaLocal, // la hora allá
        calidad: calidadDeLaHora(horaLocal),
        esDeDia: hayLuz(horaLocal, clima),
        salto: saltoDeDia(hora, desfase),
      };
    });

    return { ciudad, desfase, clima, casillas };
  });

  return { filas, mejoresHoras: buscarMejoresHoras(filas) };
}

/**
 * Las mejores horas para hablar, ordenadas de mejor a peor.
 *
 * Se puntúa cada hora: 2 puntos por cada ciudad en horario de oficina,
 * 1 si está despierta, 0 si está durmiendo.
 *
 * Se devuelven SIEMPRE las mejores, aunque no todas las ciudades estén
 * despiertas: con muchas ciudades repartidas por el mundo puede que no
 * exista ninguna hora perfecta, y "no hay ninguna" no ayuda a nadie.
 * Cada hora dice cuántas ciudades estarían despiertas.
 */
export function buscarMejoresHoras(filas, cuantas = 6) {
  if (filas.length === 0) return [];

  const puntuaciones = Array.from({ length: 24 }, (_, hora) => {
    let puntos = 0;
    let despiertas = 0;

    for (const fila of filas) {
      const calidad = fila.casillas[hora].calidad;
      if (calidad === "buena") {
        puntos += 2;
        despiertas += 1;
      } else if (calidad === "aceptable") {
        puntos += 1;
        despiertas += 1;
      }
    }

    return { hora, puntos, despiertas, todasDespiertas: despiertas === filas.length };
  });

  // Primero manda cuánta gente estará despierta, y a igualdad de gente,
  // gana la hora que le caiga a más ciudades en horario de oficina.
  return puntuaciones
    .sort((a, b) => b.despiertas - a.despiertas || b.puntos - a.puntos || a.hora - b.hora)
    .slice(0, cuantas);
}

/** ¿Hay luz del sol a esa hora en esa ciudad? */
function hayLuz(horaLocal, clima) {
  // Sin datos del sol, se usa una aproximación razonable.
  if (!clima || clima.amanecer === null || clima.atardecer === null) {
    return horaLocal >= 7 && horaLocal < 19;
  }
  return horaLocal >= clima.amanecer && horaLocal < clima.atardecer;
}

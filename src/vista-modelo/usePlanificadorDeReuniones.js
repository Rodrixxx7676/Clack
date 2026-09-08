/**
 * usePlanificadorDeReuniones.js
 * -----------------------------
 * El "cerebro" de la sección "¿a qué hora hablamos?".
 *
 * Arma la tabla de 24 horas por ciudad y recuerda qué hora está elegida.
 * La tabla no se rehace cada segundo: solo cuando cambia la hora, que es
 * lo único que la altera.
 */
import { useEffect, useMemo, useState } from "react";
import { armarTabla } from "../modelo/PlanificadorDeReuniones.js";
import { useMomentoActual } from "./useMomentoActual.js";

export function usePlanificadorDeReuniones(ciudades, climaPorCiudad) {
  const momento = useMomentoActual();
  const horaDeAhora = momento.getHours();

  const tabla = useMemo(
    () => armarTabla(ciudades, climaPorCiudad, momento),
    // Se rehace al cambiar de hora, no a cada segundo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ciudades, climaPorCiudad, horaDeAhora]
  );

  const [horaElegida, setHoraElegida] = useState(null);

  // Al abrir, se propone la mejor hora posible. Si cambian las ciudades,
  // se vuelve a proponer.
  useEffect(() => {
    setHoraElegida(tabla.mejoresHoras[0]?.hora ?? null);
  }, [tabla.mejoresHoras]);

  const detalleDeLaHora = useMemo(() => {
    if (horaElegida === null) return [];
    return tabla.filas.map((fila) => ({
      ciudad: fila.ciudad.nombre,
      pais: fila.ciudad.pais,
      ...fila.casillas[horaElegida],
    }));
  }, [horaElegida, tabla.filas]);

  return {
    filas: tabla.filas,
    mejoresHoras: tabla.mejoresHoras,
    hayHoraParaTodos: tabla.mejoresHoras[0]?.todasDespiertas ?? false,
    totalDeCiudades: ciudades.length,
    horaDeAhora,
    horaElegida,
    elegirHora: setHoraElegida,
    detalleDeLaHora,
  };
}

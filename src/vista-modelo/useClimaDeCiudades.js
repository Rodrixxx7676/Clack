/**
 * useClimaDeCiudades.js
 * ---------------------
 * Pide la temperatura de todas las ciudades y la mantiene fresca.
 *
 * Importante para el rendimiento: los relojes se ven al instante y la
 * temperatura llega después, sin hacer esperar a nadie. Si internet falla,
 * la app sigue funcionando: simplemente no se muestran los grados.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ServicioDelClima } from "../modelo/ServicioDelClima.js";

// El clima cambia despacio: con refrescarlo cada 10 minutos sobra.
const CADA_DIEZ_MINUTOS = 10 * 60 * 1000;

const servicioPorDefecto = new ServicioDelClima();

export function useClimaDeCiudades(ciudades, servicio = servicioPorDefecto) {
  const [climaPorCiudad, setClimaPorCiudad] = useState(() => new Map());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const consultar = useCallback(
    async (seguirVivo = () => true) => {
      try {
        const resultado = await servicio.obtenerClimaDe(ciudades);
        if (!seguirVivo()) return;
        setClimaPorCiudad(resultado);
        setError(null);
      } catch (fallo) {
        if (!seguirVivo()) return;
        setError(fallo.message);
      } finally {
        if (seguirVivo()) setCargando(false);
      }
    },
    [ciudades, servicio]
  );

  useEffect(() => {
    let montado = true;
    const seguirVivo = () => montado;

    setCargando(true);
    consultar(seguirVivo);
    const temporizador = setInterval(() => consultar(seguirVivo), CADA_DIEZ_MINUTOS);

    return () => {
      montado = false;
      clearInterval(temporizador);
    };
  }, [consultar]);

  return useMemo(
    () => ({
      climaPorCiudad,
      cargando,
      error,
      /** El clima de una ciudad, o null si todavía no llegó. */
      climaDe: (idDeCiudad) => climaPorCiudad.get(idDeCiudad) ?? null,
    }),
    [climaPorCiudad, cargando, error]
  );
}

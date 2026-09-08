/**
 * useCiudadesFavoritas.js
 * -----------------------
 * Las ciudades que la persona eligió: cuáles son, en qué orden, y cómo
 * añadir, quitar o moverlas.
 *
 * Se guardan en el servidor (entidad FAVORITO), así que aparecen igual
 * desde el móvil o desde el computador.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ServicioDeFavoritos, MAXIMO_DE_CIUDADES } from "../modelo/ServicioDeFavoritos.js";
import { CIUDADES } from "../modelo/catalogoDeCiudades.js";

const servicioPorDefecto = new ServicioDeFavoritos();

export function useCiudadesFavoritas(servicio = servicioPorDefecto) {
  const [ciudades, setCiudades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Al entrar por primera vez se cargan las ciudades guardadas. Si la
  // persona todavía no eligió ninguna, se le regalan las del catálogo
  // para que el panel no aparezca vacío.
  useEffect(() => {
    let montado = true;

    (async () => {
      try {
        const guardadas = await servicio.obtener();
        if (!montado) return;

        if (guardadas.length === 0) {
          const iniciales = await servicio.guardar(CIUDADES);
          if (montado) setCiudades(iniciales);
        } else {
          setCiudades(guardadas);
        }
      } catch (fallo) {
        // Si el servidor no responde, al menos se ven las de siempre.
        if (montado) {
          setError(fallo.message);
          setCiudades(CIUDADES);
        }
      } finally {
        if (montado) setCargando(false);
      }
    })();

    return () => {
      montado = false;
    };
  }, [servicio]);

  /** Guarda en el servidor y, si falla, deja la lista como estaba. */
  const guardar = useCallback(
    async (nuevas) => {
      const anteriores = ciudades;
      setCiudades(nuevas); // se ve el cambio al instante
      setError(null);
      try {
        const confirmadas = await servicio.guardar(nuevas);
        setCiudades(confirmadas);
      } catch (fallo) {
        setError(fallo.message);
        setCiudades(anteriores); // se deshace
      }
    },
    [ciudades, servicio]
  );

  const agregar = useCallback(
    (ciudad) => {
      if (ciudades.length >= MAXIMO_DE_CIUDADES) {
        setError(`Solo puedes tener ${MAXIMO_DE_CIUDADES} ciudades a la vez.`);
        return;
      }
      if (ciudades.some((c) => c.id === ciudad.id)) {
        setError(`${ciudad.nombre} ya está en tu lista.`);
        return;
      }
      guardar([...ciudades, ciudad]);
    },
    [ciudades, guardar]
  );

  const quitar = useCallback(
    (id) => {
      if (ciudades.length <= 1) {
        setError("Deja al menos una ciudad en la lista.");
        return;
      }
      guardar(ciudades.filter((c) => c.id !== id));
    },
    [ciudades, guardar]
  );

  /** Sube o baja una ciudad en la lista. paso: -1 sube, +1 baja. */
  const mover = useCallback(
    (id, paso) => {
      const posicion = ciudades.findIndex((c) => c.id === id);
      const destino = posicion + paso;
      if (posicion < 0 || destino < 0 || destino >= ciudades.length) return;

      const nuevas = [...ciudades];
      [nuevas[posicion], nuevas[destino]] = [nuevas[destino], nuevas[posicion]];
      guardar(nuevas);
    },
    [ciudades, guardar]
  );

  return useMemo(
    () => ({
      ciudades,
      cargando,
      error,
      limpiarError: () => setError(null),
      maximo: MAXIMO_DE_CIUDADES,
      estaLlena: ciudades.length >= MAXIMO_DE_CIUDADES,
      agregar,
      quitar,
      mover,
    }),
    [agregar, cargando, ciudades, error, mover, quitar]
  );
}

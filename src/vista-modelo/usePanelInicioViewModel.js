/**
 * usePanelInicioViewModel.js
 * --------------------------
 * El "cerebro" del panel de inicio.
 *
 * Sabe qué ciudades se muestran, cuál está enfocada en el carrusel,
 * qué hora es en ella y qué temperatura hace. La Vista solo pinta
 * lo que este hook devuelve, ya listo para leerse.
 */
import { useCallback, useState } from "react";
import { CIUDADES } from "../modelo/catalogoDeCiudades.js";
import { useMomentoActual } from "./useMomentoActual.js";
import { useClimaDeCiudades } from "./useClimaDeCiudades.js";

export function usePanelInicioViewModel(ciudades = CIUDADES) {
  const momento = useMomentoActual();
  const clima = useClimaDeCiudades(ciudades);
  const [indiceActivo, setIndiceActivo] = useState(0);

  // Mientras cargan las favoritas la lista puede venir vacía.
  const ciudadActiva = ciudades[indiceActivo] ?? ciudades[0] ?? null;
  const climaActual = ciudadActiva ? clima.climaDe(ciudadActiva.id) : null;

  /** El carrusel avisa aquí cada vez que cambia la tarjeta del centro. */
  const enfocarCiudad = useCallback((indice) => setIndiceActivo(indice), []);

  return {
    ciudades,
    indiceActivo,
    enfocarCiudad,

    hayCiudades: Boolean(ciudadActiva),

    // Datos ya listos para mostrar de la ciudad enfocada.
    ciudadActiva: ciudadActiva && {
      nombre: ciudadActiva.nombre,
      pais: ciudadActiva.pais,
      descripcion: ciudadActiva.descripcion,
      zonaHoraria: ciudadActiva.zonaHoraria,
      hora: ciudadActiva.hora(momento),
      fecha: ciudadActiva.fecha(momento),
      esDeDia: ciudadActiva.esDeDia(momento),
      diferenciaContigo: ciudadActiva.diferenciaContigo(momento),

      clima: {
        temperatura: climaActual?.temperaturaEnTexto ?? null,
        descripcion: climaActual?.descripcion ?? null,
        icono: climaActual?.icono ?? null,
        cargando: clima.cargando,
        hayError: Boolean(clima.error),
      },
    },
  };
}

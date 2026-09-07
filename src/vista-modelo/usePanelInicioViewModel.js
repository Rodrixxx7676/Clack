/**
 * usePanelInicioViewModel.js
 * --------------------------
 * El "cerebro" del panel de inicio.
 *
 * Sabe qué ciudades se muestran, cuál está enfocada en el carrusel y
 * qué hora es en cada una. La Vista solo pinta lo que este hook devuelve.
 */
import { useCallback, useState } from "react";
import { CIUDADES } from "../modelo/catalogoDeCiudades.js";
import { useMomentoActual } from "./useMomentoActual.js";

export function usePanelInicioViewModel(ciudades = CIUDADES) {
  const momento = useMomentoActual();
  const [indiceActivo, setIndiceActivo] = useState(0);

  const ciudadActiva = ciudades[indiceActivo] ?? ciudades[0];

  /** El carrusel avisa aquí cada vez que cambia la tarjeta del centro. */
  const enfocarCiudad = useCallback((indice) => setIndiceActivo(indice), []);

  return {
    ciudades,
    indiceActivo,
    enfocarCiudad,

    // Datos ya listos para mostrar de la ciudad enfocada.
    ciudadActiva: {
      nombre: ciudadActiva.nombre,
      pais: ciudadActiva.pais,
      zonaHoraria: ciudadActiva.zonaHoraria,
      hora: ciudadActiva.hora(momento),
      fecha: ciudadActiva.fecha(momento),
      esDeDia: ciudadActiva.esDeDia(momento),
      diferenciaContigo: ciudadActiva.diferenciaContigo(momento),
    },
  };
}

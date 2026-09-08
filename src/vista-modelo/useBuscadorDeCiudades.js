/**
 * useBuscadorDeCiudades.js
 * ------------------------
 * El buscador de ciudades del mundo.
 *
 * No busca en cada tecla: espera a que la persona deje de escribir un
 * momento. Así no se hacen diez búsquedas para escribir "Barcelona".
 */
import { useCallback, useEffect, useState } from "react";
import { ServicioDeBusquedaDeCiudades } from "../modelo/ServicioDeBusquedaDeCiudades.js";

const servicioPorDefecto = new ServicioDeBusquedaDeCiudades();
const ESPERA_MS = 350;

export function useBuscadorDeCiudades(servicio = servicioPorDefecto) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const limpio = texto.trim();
    if (limpio.length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    const control = new AbortController();

    const temporizador = setTimeout(async () => {
      try {
        const encontradas = await servicio.buscar(limpio, { señal: control.signal });
        setResultados(encontradas);
        setError(null);
      } catch (fallo) {
        if (fallo.name !== "AbortError") setError(fallo.message);
      } finally {
        setBuscando(false);
      }
    }, ESPERA_MS);

    return () => {
      clearTimeout(temporizador);
      control.abort(); // se cancela la búsqueda vieja si sigue escribiendo
    };
  }, [servicio, texto]);

  const limpiar = useCallback(() => {
    setTexto("");
    setResultados([]);
    setError(null);
  }, []);

  return { texto, escribir: setTexto, resultados, buscando, error, limpiar };
}

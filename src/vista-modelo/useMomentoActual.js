/**
 * useMomentoActual.js
 * -------------------
 * El "latido" de la aplicación: devuelve la fecha y hora de ahora mismo,
 * y se actualiza sola cada segundo.
 *
 * Todos los relojes de Clack (el local y el de cada ciudad) beben de aquí,
 * así todos marcan exactamente el mismo instante.
 */
import { useEffect, useState } from "react";

const UN_SEGUNDO = 1000;

export function useMomentoActual() {
  const [momento, setMomento] = useState(() => new Date());

  useEffect(() => {
    const temporizador = setInterval(() => setMomento(new Date()), UN_SEGUNDO);
    return () => clearInterval(temporizador); // se limpia al salir de la pantalla
  }, []);

  return momento;
}

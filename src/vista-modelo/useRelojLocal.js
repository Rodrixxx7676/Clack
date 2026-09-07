/**
 * useRelojLocal.js
 * ----------------
 * Mantiene la hora local siempre al día para mostrarla en pantalla.
 * Es el primer ladrillo del reloj mundial que vendrá después.
 */
import { useEffect, useMemo, useState } from "react";
import { Reloj } from "../modelo/Reloj.js";

const UN_SEGUNDO = 1000;

export function useRelojLocal(zonaHoraria = undefined) {
  const reloj = useMemo(() => new Reloj({ zonaHoraria }), [zonaHoraria]);
  const [momento, setMomento] = useState(() => new Date());

  useEffect(() => {
    const temporizador = setInterval(() => setMomento(new Date()), UN_SEGUNDO);
    return () => clearInterval(temporizador); // se limpia al salir de la pantalla
  }, []);

  return {
    hora: reloj.hora(momento),
    fecha: reloj.fecha(momento),
    zonaHoraria: zonaHoraria ?? Reloj.zonaHorariaDelDispositivo(),
  };
}

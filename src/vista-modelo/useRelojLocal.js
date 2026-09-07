/**
 * useRelojLocal.js
 * ----------------
 * La hora del dispositivo, siempre al día, lista para mostrarse.
 */
import { useMemo } from "react";
import { Reloj } from "../modelo/Reloj.js";
import { useMomentoActual } from "./useMomentoActual.js";

export function useRelojLocal(zonaHoraria = undefined) {
  const reloj = useMemo(() => new Reloj({ zonaHoraria }), [zonaHoraria]);
  const momento = useMomentoActual();

  return {
    hora: reloj.hora(momento),
    fecha: reloj.fecha(momento),
    zonaHoraria: zonaHoraria ?? Reloj.zonaHorariaDelDispositivo(),
  };
}

/**
 * Ciudad.js
 * ---------
 * Una ciudad del panel. Sabe decir qué hora es allá, usando el Reloj.
 *
 * Corresponde a la entidad CIUDAD de la planificación del proyecto:
 *
 *   ID_ZONA        →  id
 *   NOMBRE_CIUDAD  →  nombre
 *   PAIS           →  pais
 *   CODIGO_ZONA    →  zonaHoraria   (nombre IANA, ej. "America/Lima")
 *
 * Y además, para que la app funcione:
 *   latitud / longitud →  para consultar la temperatura
 *   foto               →  la imagen que se ve en el carrusel
 *   descripcion        →  una línea sobre la ciudad, para el panel
 */
import { Reloj } from "./Reloj.js";

export class Ciudad {
  constructor({ id, nombre, pais, zonaHoraria, latitud, longitud, foto, descripcion }) {
    this.id = id;
    this.nombre = nombre;
    this.pais = pais;
    this.zonaHoraria = zonaHoraria;
    this.latitud = latitud;
    this.longitud = longitud;
    this.foto = foto;
    this.descripcion = descripcion;
    this.reloj = new Reloj({ zonaHoraria });
  }

  /** Ejemplo: "21:45". */
  hora(momento = new Date()) {
    return this.reloj.hora(momento);
  }

  /** Ejemplo: "domingo, 7 de septiembre". */
  fecha(momento = new Date()) {
    return this.reloj.fecha(momento);
  }

  /** ¿Allá es de día? Se usa para mostrar el sol o la luna. */
  esDeDia(momento = new Date()) {
    const hora = Number(this.hora(momento).slice(0, 2));
    return hora >= 7 && hora < 19;
  }

  /**
   * El desfase con tu hora, en número (puede tener media hora: 5.5).
   * Es lo que usan los cálculos; diferenciaContigo() es para mostrar.
   */
  desfaseEnHorasContigo(momento = new Date()) {
    const minutos =
      minutosDesdeUTC(this.zonaHoraria, momento) -
      minutosDesdeUTC(Reloj.zonaHorariaDelDispositivo(), momento);
    return minutos / 60;
  }

  /**
   * Cuántas horas de diferencia hay con la hora de tu dispositivo.
   * Ejemplos: "+7 h", "-5:30 h", "Tu misma hora".
   */
  diferenciaContigo(momento = new Date()) {
    const minutos =
      minutosDesdeUTC(this.zonaHoraria, momento) -
      minutosDesdeUTC(Reloj.zonaHorariaDelDispositivo(), momento);

    if (minutos === 0) return "Tu misma hora";

    const signo = minutos > 0 ? "+" : "−";
    const horas = Math.floor(Math.abs(minutos) / 60);
    const restoDeMinutos = Math.abs(minutos) % 60;
    const texto = restoDeMinutos === 0 ? `${horas}` : `${horas}:${String(restoDeMinutos).padStart(2, "0")}`;
    return `${signo}${texto} h`;
  }
}

/** Cuántos minutos de diferencia tiene una zona horaria respecto a UTC. */
function minutosDesdeUTC(zonaHoraria, momento) {
  const enLaZona = new Date(momento.toLocaleString("en-US", { timeZone: zonaHoraria }));
  const enUTC = new Date(momento.toLocaleString("en-US", { timeZone: "UTC" }));
  return Math.round((enLaZona - enUTC) / 60000);
}

/**
 * Ciudad.js
 * ---------
 * Una ciudad del panel: su nombre, su país, su zona horaria y su foto.
 * Sabe decir qué hora es allá, usando el Reloj que ya teníamos.
 */
import { Reloj } from "./Reloj.js";

export class Ciudad {
  constructor({ id, nombre, pais, zonaHoraria, foto }) {
    this.id = id;
    this.nombre = nombre;
    this.pais = pais;
    this.zonaHoraria = zonaHoraria;
    this.foto = foto;
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

/**
 * RelojLocalViewModel.js
 * ----------------------
 * Mantiene la hora local siempre al día para mostrarla en pantalla.
 * Es el primer ladrillo del reloj mundial que vendrá después.
 */
import { Observable } from "../nucleo/Observable.js";
import { Reloj } from "../modelo/Reloj.js";

const UN_SEGUNDO = 1000;

export class RelojLocalViewModel {
  constructor(reloj = new Reloj()) {
    this.reloj = reloj;
    this.hora = new Observable(reloj.hora());
    this.fecha = new Observable(reloj.fecha());
    this.zonaHoraria = new Observable(Reloj.zonaHorariaDelDispositivo());
    this.temporizador = null;
  }

  /** Empieza a actualizar la hora cada segundo. */
  comenzar() {
    if (this.temporizador !== null) return;
    this.temporizador = setInterval(() => this.#actualizar(), UN_SEGUNDO);
    this.#actualizar();
  }

  /** Detiene la actualización (por ejemplo, al salir de la pantalla). */
  detener() {
    if (this.temporizador === null) return;
    clearInterval(this.temporizador);
    this.temporizador = null;
  }

  #actualizar() {
    const ahora = new Date();
    this.hora.valor = this.reloj.hora(ahora);
    this.fecha.valor = this.reloj.fecha(ahora);
  }
}

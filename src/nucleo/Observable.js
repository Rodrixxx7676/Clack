/**
 * Observable.js
 * -------------
 * Una "caja" que guarda un valor y avisa a quien esté escuchando
 * cada vez que ese valor cambia.
 *
 * Es la pieza que conecta el ViewModel con la Vista:
 *   - El ViewModel cambia el valor.
 *   - La Vista se entera sola y se actualiza en pantalla.
 */
export class Observable {
  #valor;
  #suscriptores = new Set();

  constructor(valorInicial) {
    this.#valor = valorInicial;
  }

  /** Lee el valor actual. */
  get valor() {
    return this.#valor;
  }

  /** Cambia el valor y avisa a todos los suscriptores. */
  set valor(nuevoValor) {
    if (Object.is(this.#valor, nuevoValor)) return;
    this.#valor = nuevoValor;
    this.#notificar();
  }

  /**
   * Escucha los cambios del valor.
   * Se llama de inmediato con el valor actual.
   * Devuelve una función para dejar de escuchar.
   */
  suscribir(alCambiar) {
    this.#suscriptores.add(alCambiar);
    alCambiar(this.#valor);
    return () => this.#suscriptores.delete(alCambiar);
  }

  #notificar() {
    for (const alCambiar of this.#suscriptores) {
      alCambiar(this.#valor);
    }
  }
}

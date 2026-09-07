/**
 * Clima.js
 * --------
 * El tiempo que hace ahora mismo en una ciudad: cuántos grados y
 * si está despejado, nublado, lloviendo...
 *
 * El "código" es un número estándar de la Organización Meteorológica
 * Mundial (WMO). Aquí lo traducimos a algo que una persona entienda.
 */
export class Clima {
  constructor({ temperatura, codigo, esDeDia = true }) {
    this.temperatura = temperatura;
    this.codigo = codigo;
    this.esDeDia = esDeDia;
  }

  /** Ejemplo: "22°". */
  get temperaturaEnTexto() {
    return `${Math.round(this.temperatura)}°`;
  }

  /** Ejemplo: "Parcialmente nublado". */
  get descripcion() {
    return DESCRIPCIONES[this.codigo] ?? "Sin datos";
  }

  /**
   * Qué dibujo le corresponde: "sol", "sol-nube", "nube", "niebla",
   * "lluvia", "nieve" o "tormenta". Lo usa el componente IconoClima.
   */
  get icono() {
    const codigo = this.codigo;
    if (codigo === 0) return this.esDeDia ? "sol" : "luna";
    if (codigo <= 2) return this.esDeDia ? "sol-nube" : "luna-nube";
    if (codigo === 3) return "nube";
    if (codigo <= 48) return "niebla";
    if (codigo <= 67) return "lluvia";
    if (codigo <= 77) return "nieve";
    if (codigo <= 82) return "lluvia";
    if (codigo <= 86) return "nieve";
    return "tormenta";
  }
}

/** Los códigos WMO, traducidos. */
const DESCRIPCIONES = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Neblina",
  48: "Neblina con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna",
  55: "Llovizna intensa",
  56: "Llovizna helada",
  57: "Llovizna helada intensa",
  61: "Lluvia ligera",
  63: "Lluvia",
  65: "Lluvia intensa",
  66: "Lluvia helada",
  67: "Lluvia helada intensa",
  71: "Nevada ligera",
  73: "Nevada",
  75: "Nevada intensa",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos",
  82: "Chubascos fuertes",
  85: "Chubascos de nieve",
  86: "Chubascos de nieve fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta fuerte con granizo",
};

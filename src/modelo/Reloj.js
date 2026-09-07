/**
 * Reloj.js
 * --------
 * Da la hora con el formato que se muestra en pantalla.
 * Más adelante, esta misma pieza servirá para las horas de otros países.
 */
export class Reloj {
  constructor({ zonaHoraria = undefined, idioma = "es-ES" } = {}) {
    this.zonaHoraria = zonaHoraria; // undefined = zona horaria del dispositivo
    this.idioma = idioma;
  }

  /** Ejemplo: "21:45". */
  hora(momento = new Date()) {
    return new Intl.DateTimeFormat(this.idioma, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: this.zonaHoraria,
    }).format(momento);
  }

  /** Ejemplo: "sábado, 6 de septiembre". */
  fecha(momento = new Date()) {
    return new Intl.DateTimeFormat(this.idioma, {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: this.zonaHoraria,
    }).format(momento);
  }

  /** Nombre de la zona horaria del dispositivo, ej: "America/Santiago". */
  static zonaHorariaDelDispositivo() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

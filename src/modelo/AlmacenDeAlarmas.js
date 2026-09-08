/**
 * AlmacenDeAlarmas.js
 * -------------------
 * Los avisos del tipo "avísame cuando en Tokio sean las 9:00".
 *
 * Se guardan en el propio dispositivo y no en el servidor, a propósito:
 * un aviso lo tiene que dar el aparato que tienes delante. Si los
 * guardáramos en el servidor, sonarían en el computador de la oficina
 * mientras estás en la calle.
 */
const LLAVE = "clack.alarmas";

export class Alarma {
  constructor({ id, ciudadId, ciudadNombre, zonaHoraria, hora, minuto, activa = true, avisadaEn = null }) {
    this.id = id ?? crypto.randomUUID();
    this.ciudadId = ciudadId;
    this.ciudadNombre = ciudadNombre;
    this.zonaHoraria = zonaHoraria;
    this.hora = hora;
    this.minuto = minuto;
    this.activa = activa;
    // El día en que ya sonó, para no repetirla cada segundo.
    this.avisadaEn = avisadaEn;
  }

  /** "09:00" */
  get horaEnTexto() {
    return `${String(this.hora).padStart(2, "0")}:${String(this.minuto).padStart(2, "0")}`;
  }

  /** ¿Le toca sonar ahora mismo? */
  debeSonar(momento = new Date()) {
    if (!this.activa) return false;

    const alla = new Intl.DateTimeFormat("es", {
      timeZone: this.zonaHoraria,
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      hour12: false,
    }).formatToParts(momento);

    const valor = (tipo) => alla.find((p) => p.type === tipo)?.value;
    const diaDeAlla = `${valor("day")}/${valor("month")}`;

    if (this.avisadaEn === diaDeAlla) return false; // hoy ya sonó
    return Number(valor("hour")) === this.hora && Number(valor("minute")) === this.minuto;
  }

  /** El día de allá, para anotar que ya sonó. */
  diaDeAlla(momento = new Date()) {
    return new Intl.DateTimeFormat("es", {
      timeZone: this.zonaHoraria,
      day: "2-digit",
      month: "2-digit",
    }).format(momento);
  }
}

export const almacenDeAlarmas = {
  leer() {
    try {
      const guardadas = JSON.parse(window.localStorage.getItem(LLAVE) ?? "[]");
      return guardadas.map((datos) => new Alarma(datos));
    } catch {
      return [];
    }
  },

  guardar(alarmas) {
    try {
      window.localStorage.setItem(LLAVE, JSON.stringify(alarmas.map((a) => ({ ...a }))));
    } catch {
      // Modo privado: las alarmas duran mientras la página esté abierta.
    }
  },
};

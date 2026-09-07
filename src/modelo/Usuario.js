/**
 * Usuario.js
 * ----------
 * Representa a la persona que entra a Clack.
 * Es un dato puro: no sabe nada de pantallas ni de botones.
 */
export class Usuario {
  constructor({ correo, nombre }) {
    this.correo = correo;
    this.nombre = nombre ?? Usuario.nombreDesdeCorreo(correo);
  }

  /** De "ana.perez@correo.com" saca "Ana Perez". */
  static nombreDesdeCorreo(correo) {
    const parteInicial = String(correo).split("@")[0] ?? "";
    return parteInicial
      .split(/[._-]+/)
      .filter(Boolean)
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  }
}

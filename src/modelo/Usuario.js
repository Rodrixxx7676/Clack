/**
 * Usuario.js
 * ----------
 * La persona que usa Clack.
 *
 * Corresponde a la entidad USUARIO de la planificación:
 *
 *   ID_USUARIO       →  id
 *   NOMBRE           →  nombre
 *   APELLIDO         →  apellido
 *   CORREO           →  correo
 *   CONTRASEÑA       →  (no está aquí a propósito: vive cifrada en el
 *                        servidor y nunca viaja al navegador)
 *   FECHA_NACIMIENTO →  fechaDeNacimiento
 *   PAIS_ORIGEN      →  paisDeOrigen
 *   FECHA_REGISTRO   →  fechaDeRegistro
 */
export class Usuario {
  constructor({ id, nombre, apellido, correo, fechaDeNacimiento, paisDeOrigen, fechaDeRegistro }) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.correo = correo;
    this.fechaDeNacimiento = fechaDeNacimiento;
    this.paisDeOrigen = paisDeOrigen;
    this.fechaDeRegistro = fechaDeRegistro;
  }

  /** "Ana Pérez", para saludar. */
  get nombreCompleto() {
    return [this.nombre, this.apellido].filter(Boolean).join(" ");
  }
}

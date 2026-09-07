/**
 * LoginViewModel.js
 * -----------------
 * El "cerebro" de la pantalla de Login.
 *
 * Guarda lo que el usuario escribe, decide si los datos son válidos y
 * le pide al Modelo que inicie sesión. No toca el HTML nunca:
 * solo publica su estado en Observables para que la Vista los muestre.
 */
import { Observable } from "../nucleo/Observable.js";
import { ServicioAutenticacion } from "../modelo/ServicioAutenticacion.js";
import { revisarCorreo, revisarContrasena } from "../modelo/ValidadorCredenciales.js";

export class LoginViewModel {
  constructor(servicioAutenticacion = new ServicioAutenticacion()) {
    this.servicioAutenticacion = servicioAutenticacion;

    // Lo que el usuario escribe.
    this.correo = new Observable("");
    this.contrasena = new Observable("");
    this.recordarme = new Observable(false);

    // Cómo se ve la pantalla.
    this.errorCorreo = new Observable(null);
    this.errorContrasena = new Observable(null);
    this.errorGeneral = new Observable(null);
    this.cargando = new Observable(false);
    this.puedeEnviar = new Observable(false);

    // Resultado: el usuario que entró (null mientras nadie ha entrado).
    this.usuarioConectado = new Observable(null);
  }

  escribirCorreo(texto) {
    this.correo.valor = texto;
    this.errorCorreo.valor = null; // no regañamos mientras escribe
    this.errorGeneral.valor = null;
    this.#revisarSiPuedeEnviar();
  }

  escribirContrasena(texto) {
    this.contrasena.valor = texto;
    this.errorContrasena.valor = null;
    this.errorGeneral.valor = null;
    this.#revisarSiPuedeEnviar();
  }

  cambiarRecordarme(activo) {
    this.recordarme.valor = Boolean(activo);
  }

  /** Muestra el error del correo recién cuando el usuario sale del campo. */
  validarCorreoAlSalir() {
    if (this.correo.valor.length === 0) return;
    this.errorCorreo.valor = revisarCorreo(this.correo.valor);
  }

  validarContrasenaAlSalir() {
    if (this.contrasena.valor.length === 0) return;
    this.errorContrasena.valor = revisarContrasena(this.contrasena.valor);
  }

  /** Rellena el formulario con la cuenta de prueba. */
  usarCuentaDemo() {
    const { correo, contrasena } = ServicioAutenticacion.cuentaDemo;
    this.escribirCorreo(correo);
    this.escribirContrasena(contrasena);
  }

  /** Se llama al enviar el formulario. */
  async iniciarSesion() {
    if (this.cargando.valor) return;

    this.errorCorreo.valor = revisarCorreo(this.correo.valor);
    this.errorContrasena.valor = revisarContrasena(this.contrasena.valor);
    if (this.errorCorreo.valor || this.errorContrasena.valor) return;

    this.cargando.valor = true;
    this.errorGeneral.valor = null;
    try {
      const usuario = await this.servicioAutenticacion.iniciarSesion({
        correo: this.correo.valor,
        contrasena: this.contrasena.valor,
        recordarme: this.recordarme.valor,
      });
      this.usuarioConectado.valor = usuario;
    } catch (error) {
      this.errorGeneral.valor = error.message;
    } finally {
      this.cargando.valor = false;
    }
  }

  /** Recupera una sesión previa (si el usuario marcó "Recordarme"). */
  retomarSesionGuardada() {
    const usuario = this.servicioAutenticacion.recuperarSesion();
    if (usuario) this.usuarioConectado.valor = usuario;
    return usuario;
  }

  /** Cierra la sesión y deja el formulario limpio. */
  cerrarSesion() {
    this.servicioAutenticacion.cerrarSesion();
    this.usuarioConectado.valor = null;
    this.escribirCorreo("");
    this.escribirContrasena("");
    this.errorCorreo.valor = null;
    this.errorContrasena.valor = null;
    this.errorGeneral.valor = null;
  }

  #revisarSiPuedeEnviar() {
    this.puedeEnviar.valor =
      this.correo.valor.trim().length > 0 && this.contrasena.valor.length > 0;
  }
}

/**
 * ServicioAutenticacion.js
 * ------------------------
 * Se encarga de "entrar" y "salir" de la aplicación.
 *
 * IMPORTANTE (versión de demostración):
 * Todavía no hay servidor, así que la cuenta de prueba está escrita aquí
 * y la sesión se guarda en el navegador. Cuando exista un backend real,
 * solo se cambia este archivo: ni la Vista ni el ViewModel se tocan.
 */
import { Usuario } from "./Usuario.js";

const CUENTA_DEMO = {
  correo: "demo@clack.app",
  contrasena: "clack1234",
  nombre: "Invitada Demo",
};

const LLAVE_SESION = "clack.sesion";
const DEMORA_SIMULADA_MS = 700;

export class ServicioAutenticacion {
  /**
   * Intenta iniciar sesión.
   * @returns {Promise<Usuario>} el usuario cuando las credenciales son correctas.
   * @throws {Error} con un mensaje listo para mostrar cuando no lo son.
   */
  async iniciarSesion({ correo, contrasena, recordarme = false }) {
    await esperar(DEMORA_SIMULADA_MS); // simula el viaje al servidor

    const correoLimpio = String(correo).trim().toLowerCase();
    const credencialesCorrectas =
      correoLimpio === CUENTA_DEMO.correo && contrasena === CUENTA_DEMO.contrasena;

    if (!credencialesCorrectas) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    const usuario = new Usuario({ correo: CUENTA_DEMO.correo, nombre: CUENTA_DEMO.nombre });
    this.#guardarSesion(usuario, recordarme);
    return usuario;
  }

  /** Devuelve el usuario de la sesión guardada, o null si nadie entró. */
  recuperarSesion() {
    const almacenes = [window.localStorage, window.sessionStorage];
    for (const almacen of almacenes) {
      try {
        const guardado = almacen.getItem(LLAVE_SESION);
        if (guardado) return new Usuario(JSON.parse(guardado));
      } catch {
        // Si el navegador bloquea el almacenamiento, seguimos sin sesión.
      }
    }
    return null;
  }

  /** Cierra la sesión en todos lados. */
  cerrarSesion() {
    for (const almacen of [window.localStorage, window.sessionStorage]) {
      try {
        almacen.removeItem(LLAVE_SESION);
      } catch {
        // Sin almacenamiento no hay nada que borrar.
      }
    }
  }

  /** Datos de la cuenta de prueba, para mostrarlos como ayuda en pantalla. */
  static get cuentaDemo() {
    return { correo: CUENTA_DEMO.correo, contrasena: CUENTA_DEMO.contrasena };
  }

  #guardarSesion(usuario, recordarme) {
    // "Recordarme" = queda guardada aunque cierres el navegador.
    const almacen = recordarme ? window.localStorage : window.sessionStorage;
    try {
      almacen.setItem(LLAVE_SESION, JSON.stringify({ correo: usuario.correo, nombre: usuario.nombre }));
    } catch {
      // Modo privado: la sesión solo dura mientras la página esté abierta.
    }
  }
}

function esperar(milisegundos) {
  return new Promise((resolver) => setTimeout(resolver, milisegundos));
}

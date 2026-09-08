/**
 * ServicioAutenticacion.js
 * ------------------------
 * Crear cuenta, entrar y salir de Clack.
 *
 * Habla con NUESTRO servidor (las rutas /api/registro y /api/inicio-sesion).
 * Allí es donde se guardan las cuentas y donde se comprueban las
 * contraseñas, que están cifradas. Aquí no hay ninguna contraseña
 * guardada ni ninguna decisión de seguridad: solo se piden y se muestran
 * los resultados.
 *
 * Antes de cada petición se pide la ficha de reCAPTCHA y se envía junto
 * con los datos; el servidor la verifica antes de hacer nada.
 */
import { Usuario } from "./Usuario.js";
import { ServicioRecaptcha } from "./ServicioRecaptcha.js";

const LLAVE_SESION = "clack.sesion";

// La llave de sesión que entrega el servidor. Se guarda junto al usuario
// y se envía en cada petición que necesite saber quién eres.
let llaveDeSesionEnMemoria = null;

/** La llave de la sesión actual, para las peticiones al servidor. */
export function llaveDeSesion() {
  return llaveDeSesionEnMemoria;
}

/** Lee la respuesta del servidor y lanza un error legible si algo falló. */
async function leerRespuesta(respuesta) {
  let datos = {};
  try {
    datos = await respuesta.json();
  } catch {
    // El servidor no devolvió JSON: nos quedamos con el error genérico.
  }

  if (!respuesta.ok) {
    const error = new Error(datos.error ?? "No pudimos completar la operación.");
    error.errores = datos.errores ?? null; // errores por campo, si los hay
    throw error;
  }

  return datos;
}

export class ServicioAutenticacion {
  constructor(recaptcha = new ServicioRecaptcha()) {
    this.recaptcha = recaptcha;
  }

  /** Crea una cuenta nueva y deja la sesión iniciada. */
  async registrar(datos) {
    const fichaRecaptcha = await this.recaptcha.obtenerFicha("registro");

    const respuesta = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...datos, fichaRecaptcha }),
    });

    const { usuario, llaveDeSesion: llave } = await leerRespuesta(respuesta);
    const nuevoUsuario = new Usuario(usuario);
    this.#guardarSesion(nuevoUsuario, llave, datos.recordarme ?? true);
    return nuevoUsuario;
  }

  /** Entra con una cuenta que ya existe. */
  async iniciarSesion({ correo, contrasena, recordarme = false }) {
    const fichaRecaptcha = await this.recaptcha.obtenerFicha("iniciar_sesion");

    const respuesta = await fetch("/api/inicio-sesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena, fichaRecaptcha }),
    });

    const { usuario, llaveDeSesion: llave } = await leerRespuesta(respuesta);
    const usuarioConectado = new Usuario(usuario);
    this.#guardarSesion(usuarioConectado, llave, recordarme);
    return usuarioConectado;
  }

  /** Devuelve el usuario de la sesión guardada, o null si nadie entró. */
  recuperarSesion() {
    for (const almacen of [window.localStorage, window.sessionStorage]) {
      try {
        const guardado = almacen.getItem(LLAVE_SESION);
        if (!guardado) continue;
        const { usuario, llave } = JSON.parse(guardado);
        llaveDeSesionEnMemoria = llave ?? null;
        return new Usuario(usuario);
      } catch {
        // Si el navegador bloquea el almacenamiento, seguimos sin sesión.
      }
    }
    return null;
  }

  cerrarSesion() {
    // Se le avisa al servidor para que olvide la llave. Si falla, da
    // igual: la llave caduca sola y aquí se borra de todas formas.
    if (llaveDeSesionEnMemoria) {
      fetch("/api/cerrar-sesion", {
        method: "POST",
        headers: { Authorization: `Bearer ${llaveDeSesionEnMemoria}` },
      }).catch(() => {});
    }
    llaveDeSesionEnMemoria = null;

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
    return { correo: "demo@clack.app", contrasena: "clack1234" };
  }

  #guardarSesion(usuario, llave, recordarme) {
    llaveDeSesionEnMemoria = llave ?? null;
    // "Recordarme" = queda guardada aunque cierres el navegador.
    const almacen = recordarme ? window.localStorage : window.sessionStorage;
    try {
      almacen.setItem(LLAVE_SESION, JSON.stringify({ usuario: { ...usuario }, llave }));
    } catch {
      // Modo privado: la sesión solo dura mientras la página esté abierta.
    }
  }
}

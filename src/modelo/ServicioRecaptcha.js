/**
 * ServicioRecaptcha.js
 * --------------------
 * Comprueba que quien entra es una persona y no un programa automático.
 *
 * Cómo funciona reCAPTCHA v3, en tres pasos:
 *
 *   1. Google observa cómo se comporta quien usa la página y, al enviar el
 *      formulario, entrega una "ficha" (un texto largo, válido 2 minutos).
 *   2. Esa ficha viaja a NUESTRO servidor.
 *   3. El servidor se la enseña a Google, que responde con una puntuación
 *      del 0 al 1: cerca de 1 es una persona, cerca de 0 es un robot.
 *
 * El paso 3 es el importante: si la comprobación se hiciera en el
 * navegador, un robot simplemente se la saltaría. Por eso la clave secreta
 * vive en el servidor y NUNCA en este código.
 *
 * La clave de sitio de abajo sí es pública: va dentro de la página y
 * cualquiera puede verla. Es así por diseño.
 */

export const CLAVE_DE_SITIO = "6LfrebAtAAAAAFqsHcEiG2Zk_wBfOdlnoI35i6Cs";

const DIRECCION_DEL_SCRIPT = `https://www.google.com/recaptcha/api.js?render=${CLAVE_DE_SITIO}`;

let cargaDelScript = null;

/** Descarga el script de Google una sola vez, aunque se pida varias veces. */
function cargarRecaptcha() {
  if (cargaDelScript) return cargaDelScript;

  cargaDelScript = new Promise((resolver, rechazar) => {
    if (window.grecaptcha) return resolver(window.grecaptcha);

    const script = document.createElement("script");
    script.src = DIRECCION_DEL_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => window.grecaptcha.ready(() => resolver(window.grecaptcha));
    script.onerror = () => rechazar(new Error("No se pudo cargar reCAPTCHA."));
    document.head.appendChild(script);
  });

  return cargaDelScript;
}

export class ServicioRecaptcha {
  /**
   * Pide la ficha a Google y deja que el servidor la revise.
   * @param {string} accion nombre de lo que se está haciendo, ej. "iniciar_sesion"
   * @returns {Promise<{aprobado: boolean, puntuacion: number|null, motivo: string}>}
   */
  async comprobar(accion) {
    // Si Google no responde o el dominio no está registrado (típico al
    // desarrollar en localhost), se envía sin ficha. NO se decide aquí:
    // el servidor es siempre quien manda. Si tiene la clave secreta
    // configurada, rechazará la petición sin ficha; si no la tiene,
    // dejará pasar. Así el navegador nunca puede saltarse el control.
    let ficha = null;
    try {
      const recaptcha = await cargarRecaptcha();
      ficha = await recaptcha.execute(CLAVE_DE_SITIO, { action: accion });
    } catch {
      ficha = null;
    }

    const respuesta = await fetch("/api/verificar-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ficha, accion }),
    });

    if (!respuesta.ok) {
      // 400 = el servidor pide ficha y no llegó; 502 = Google no responde.
      return {
        aprobado: false,
        puntuacion: null,
        motivo: "El servidor no pudo verificar la ficha",
      };
    }

    return respuesta.json();
  }
}

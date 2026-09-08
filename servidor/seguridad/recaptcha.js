/**
 * recaptcha.js
 * ------------
 * Le pregunta a Google si quien envía un formulario es una persona.
 *
 * La clave secreta se lee de una variable de entorno que vive solo dentro
 * del servidor (/etc/clack/recaptcha.env). Nunca está en el código.
 */
const CLAVE_SECRETA = process.env.RECAPTCHA_SECRET || "";
const PUNTUACION_MINIMA = Number(process.env.RECAPTCHA_MINIMO) || 0.5;

export const RECAPTCHA_ACTIVO = CLAVE_SECRETA.length > 0;

/**
 * @returns {Promise<{aprobado: boolean, puntuacion: number|null, motivo: string}>}
 */
export async function verificarFicha({ ficha, accion, ip }) {
  // Sin clave configurada no se puede verificar nada. Se deja pasar, pero
  // queda dicho para que no pase desapercibido.
  if (!RECAPTCHA_ACTIVO) {
    return {
      aprobado: true,
      puntuacion: null,
      motivo: "reCAPTCHA no está configurado en este servidor",
    };
  }

  if (typeof ficha !== "string" || ficha.length === 0) {
    return { aprobado: false, puntuacion: null, motivo: "Falta la ficha de reCAPTCHA" };
  }

  try {
    const consulta = new URLSearchParams({
      secret: CLAVE_SECRETA,
      response: ficha,
      remoteip: ip ?? "",
    });

    const respuesta = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: consulta,
    });

    const datos = await respuesta.json();

    if (!datos.success) {
      return { aprobado: false, puntuacion: null, motivo: "Google rechazó la ficha" };
    }

    // La acción debe coincidir: evita reutilizar la ficha de otra pantalla.
    if (accion && datos.action && datos.action !== accion) {
      return {
        aprobado: false,
        puntuacion: datos.score ?? null,
        motivo: "La ficha no corresponde a esta acción",
      };
    }

    const puntuacion = datos.score ?? 0;
    return {
      aprobado: puntuacion >= PUNTUACION_MINIMA,
      puntuacion,
      motivo: puntuacion >= PUNTUACION_MINIMA ? "ok" : "Puntuación demasiado baja",
    };
  } catch (error) {
    console.error("Error consultando a reCAPTCHA:", error.message);
    return { aprobado: false, puntuacion: null, motivo: "No pudimos contactar con reCAPTCHA" };
  }
}

if (!RECAPTCHA_ACTIVO) {
  console.warn(
    "⚠️  reCAPTCHA DESACTIVADO: falta RECAPTCHA_SECRET.\n" +
      "   El registro y el login quedan sin protección contra robots.\n" +
      "   En desarrollo es normal; en el servidor de verdad hay que configurarlo."
  );
}

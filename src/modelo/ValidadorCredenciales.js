/**
 * ValidadorCredenciales.js
 * ------------------------
 * Las reglas de "qué es un correo válido" y "qué es una contraseña válida".
 * Están aquí, en el Modelo, para que cualquier pantalla pueda reutilizarlas.
 */

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const LARGO_MINIMO_CONTRASENA = 8;

/** Devuelve el mensaje de error, o null si el correo está bien. */
export function revisarCorreo(correo) {
  const limpio = String(correo).trim();
  if (limpio.length === 0) return "Escribe tu correo.";
  if (!FORMATO_CORREO.test(limpio)) return "Ese correo no tiene un formato válido.";
  return null;
}

/** Devuelve el mensaje de error, o null si la contraseña está bien. */
export function revisarContrasena(contrasena) {
  const valor = String(contrasena);
  if (valor.length === 0) return "Escribe tu contraseña.";
  if (valor.length < LARGO_MINIMO_CONTRASENA) {
    return `La contraseña necesita al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  }
  return null;
}

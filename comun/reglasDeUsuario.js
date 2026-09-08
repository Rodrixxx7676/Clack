/**
 * reglasDeUsuario.js
 * ------------------
 * Las reglas de qué datos son válidos para una cuenta de Clack.
 *
 * Este archivo lo usan LOS DOS LADOS:
 *   · la aplicación web, para avisar al usuario mientras escribe
 *   · el servidor, para no fiarse de lo que llega del navegador
 *
 * Están juntas a propósito: si estuvieran duplicadas, tarde o temprano
 * una se cambiaría y la otra no.
 *
 * Cada función devuelve el mensaje de error, o null si el dato está bien.
 */

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOLO_LETRAS = /^[\p{L}\p{M}'\s-]+$/u;

export const LARGO_MINIMO_CONTRASENA = 8;
export const EDAD_MINIMA = 13;
export const EDAD_MAXIMA = 120;

export function revisarNombre(nombre, etiqueta = "nombre") {
  const limpio = String(nombre ?? "").trim();
  if (limpio.length === 0) return `Escribe tu ${etiqueta}.`;
  if (limpio.length < 2) return `Ese ${etiqueta} es muy corto.`;
  if (limpio.length > 40) return `Ese ${etiqueta} es demasiado largo.`;
  if (!SOLO_LETRAS.test(limpio)) return `El ${etiqueta} solo puede llevar letras.`;
  return null;
}

export function revisarApellido(apellido) {
  return revisarNombre(apellido, "apellido");
}

export function revisarCorreo(correo) {
  const limpio = String(correo ?? "").trim();
  if (limpio.length === 0) return "Escribe tu correo.";
  if (limpio.length > 120) return "Ese correo es demasiado largo.";
  if (!FORMATO_CORREO.test(limpio)) return "Ese correo no tiene un formato válido.";
  return null;
}

export function revisarContrasena(contrasena) {
  const valor = String(contrasena ?? "");
  if (valor.length === 0) return "Escribe tu contraseña.";
  if (valor.length < LARGO_MINIMO_CONTRASENA) {
    return `La contraseña necesita al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  }
  if (valor.length > 100) return "Esa contraseña es demasiado larga.";
  if (!/[a-zA-Z]/.test(valor)) return "La contraseña necesita al menos una letra.";
  if (!/[0-9]/.test(valor)) return "La contraseña necesita al menos un número.";
  return null;
}

export function revisarRepeticionDeContrasena(contrasena, repeticion) {
  if (String(repeticion ?? "").length === 0) return "Repite la contraseña.";
  if (contrasena !== repeticion) return "Las dos contraseñas no coinciden.";
  return null;
}

export function revisarFechaDeNacimiento(fecha) {
  if (!fecha) return "Escribe tu fecha de nacimiento.";

  const nacimiento = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return "Esa fecha no es válida.";

  const hoy = new Date();
  if (nacimiento > hoy) return "Esa fecha todavía no ha llegado.";

  const edad = calcularEdad(nacimiento, hoy);
  if (edad < EDAD_MINIMA) return `Hay que tener al menos ${EDAD_MINIMA} años para registrarse.`;
  if (edad > EDAD_MAXIMA) return "Revisa el año: parece equivocado.";
  return null;
}

export function revisarPais(pais) {
  const limpio = String(pais ?? "").trim();
  if (limpio.length === 0) return "Elige tu país.";
  if (limpio.length > 60) return "Ese país no parece válido.";
  return null;
}

/** Cuántos años cumplidos tiene alguien nacido en esa fecha. */
export function calcularEdad(nacimiento, hoy = new Date()) {
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const cumpleEsteAno =
    hoy.getMonth() > nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
  if (!cumpleEsteAno) edad -= 1;
  return edad;
}

/**
 * Revisa un formulario de registro completo.
 * @returns {{}} un objeto con los errores encontrados. Vacío = todo bien.
 */
export function revisarRegistro(datos) {
  const errores = {};
  const anotar = (campo, error) => {
    if (error) errores[campo] = error;
  };

  anotar("nombre", revisarNombre(datos.nombre));
  anotar("apellido", revisarApellido(datos.apellido));
  anotar("correo", revisarCorreo(datos.correo));
  anotar("contrasena", revisarContrasena(datos.contrasena));
  anotar("repeticion", revisarRepeticionDeContrasena(datos.contrasena, datos.repeticion));
  anotar("fechaDeNacimiento", revisarFechaDeNacimiento(datos.fechaDeNacimiento));
  anotar("paisDeOrigen", revisarPais(datos.paisDeOrigen));

  return errores;
}

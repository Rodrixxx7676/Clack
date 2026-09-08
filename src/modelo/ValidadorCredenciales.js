/**
 * ValidadorCredenciales.js
 * ------------------------
 * Las reglas de qué datos son válidos.
 *
 * No viven aquí: están en comun/reglasDeUsuario.js, porque el servidor
 * usa exactamente las mismas. Este archivo solo las pone a mano de la
 * aplicación web con el nombre de siempre.
 */
export {
  revisarNombre,
  revisarApellido,
  revisarCorreo,
  revisarContrasena,
  revisarRepeticionDeContrasena,
  revisarFechaDeNacimiento,
  revisarPais,
  revisarRegistro,
  calcularEdad,
  LARGO_MINIMO_CONTRASENA,
  EDAD_MINIMA,
} from "../../comun/reglasDeUsuario.js";

/**
 * almacenDeUsuarios.js
 * --------------------
 * Guarda y busca las cuentas de Clack.
 *
 * Corresponde a la entidad USUARIO de la planificación:
 *
 *   ID_USUARIO       →  id
 *   NOMBRE           →  nombre
 *   APELLIDO         →  apellido
 *   CORREO           →  correo
 *   CONTRASEÑA       →  contrasenaCifrada   (nunca la original)
 *   FECHA_NACIMIENTO →  fechaDeNacimiento
 *   PAIS_ORIGEN      →  paisDeOrigen
 *   FECHA_REGISTRO   →  fechaDeRegistro
 *
 * Hoy los datos viven en un archivo JSON dentro del servidor. Cuando
 * llegue la base de datos de verdad, solo cambia ESTE archivo: ni las
 * rutas ni la aplicación web se enteran.
 *
 * Las contraseñas se guardan cifradas con bcrypt, que es de un solo
 * sentido: ni siquiera nosotros podemos leerlas. Se comprueban volviendo
 * a cifrar lo que escribe el usuario y comparando el resultado.
 */
import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const CARPETA_DE_DATOS = process.env.CARPETA_DATOS || "/app/datos";
const ARCHIVO = path.join(CARPETA_DE_DATOS, "usuarios.json");

// Cuántas vueltas le da bcrypt al cifrado: más vueltas, más lento de
// romper (y de calcular). 10 es el equilibrio habitual.
const VUELTAS_DE_CIFRADO = 10;

async function leerTodos() {
  try {
    const contenido = await fs.readFile(ARCHIVO, "utf8");
    return JSON.parse(contenido);
  } catch (error) {
    if (error.code === "ENOENT") return []; // todavía no hay nadie registrado
    throw error;
  }
}

async function guardarTodos(usuarios) {
  await fs.mkdir(CARPETA_DE_DATOS, { recursive: true });
  // Se escribe primero en un archivo temporal y luego se renombra: si se
  // corta la luz a mitad, el archivo bueno no se corrompe.
  const temporal = `${ARCHIVO}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(usuarios, null, 2), "utf8");
  await fs.rename(temporal, ARCHIVO);
}

const normalizarCorreo = (correo) => String(correo).trim().toLowerCase();

/** Lo que se le puede contar a la aplicación web: nunca la contraseña. */
function versionPublica(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correo: usuario.correo,
    fechaDeNacimiento: usuario.fechaDeNacimiento,
    paisDeOrigen: usuario.paisDeOrigen,
    fechaDeRegistro: usuario.fechaDeRegistro,
  };
}

export const almacenDeUsuarios = {
  async existeCorreo(correo) {
    const usuarios = await leerTodos();
    return usuarios.some((u) => u.correo === normalizarCorreo(correo));
  },

  /** Crea la cuenta. Devuelve el usuario sin la contraseña. */
  async registrar({ nombre, apellido, correo, contrasena, fechaDeNacimiento, paisDeOrigen }) {
    const usuarios = await leerTodos();
    const correoLimpio = normalizarCorreo(correo);

    if (usuarios.some((u) => u.correo === correoLimpio)) {
      throw new Error("Ya existe una cuenta con ese correo.");
    }

    const nuevo = {
      id: crypto.randomUUID(),
      nombre: String(nombre).trim(),
      apellido: String(apellido).trim(),
      correo: correoLimpio,
      contrasenaCifrada: await bcrypt.hash(contrasena, VUELTAS_DE_CIFRADO),
      fechaDeNacimiento,
      paisDeOrigen,
      fechaDeRegistro: new Date().toISOString(),
    };

    usuarios.push(nuevo);
    await guardarTodos(usuarios);
    return versionPublica(nuevo);
  },

  /** Comprueba correo y contraseña. Devuelve el usuario o null. */
  async comprobarCredenciales({ correo, contrasena }) {
    const usuarios = await leerTodos();
    const usuario = usuarios.find((u) => u.correo === normalizarCorreo(correo));

    // Aunque no exista el correo, se hace igual una comparación falsa:
    // así el servidor tarda lo mismo y no delata qué correos existen.
    const cifradaAComparar = usuario?.contrasenaCifrada ?? "$2a$10$invalidoinvalidoinvalidoinvalidoinvalidoinvalidoinvalido";
    const coincide = await bcrypt.compare(contrasena, cifradaAComparar);

    if (!usuario || !coincide) return null;
    return versionPublica(usuario);
  },

  async cuantosHay() {
    return (await leerTodos()).length;
  },

  /**
   * Crea la cuenta de prueba si todavía no existe, para que el botón
   * "cuenta demo" funcione desde el primer arranque.
   */
  async asegurarCuentaDemo() {
    if (await this.existeCorreo("demo@clack.app")) return;

    await this.registrar({
      nombre: "Invitada",
      apellido: "Demo",
      correo: "demo@clack.app",
      contrasena: "clack1234",
      fechaDeNacimiento: "2000-01-01",
      paisDeOrigen: "Perú",
    });
    console.log("Cuenta de prueba creada: demo@clack.app");
  },
};

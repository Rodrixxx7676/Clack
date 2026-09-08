/**
 * rutasDeUsuarios.js
 * ------------------
 * Las dos puertas de entrada a Clack:
 *
 *   POST /api/registro        crear una cuenta
 *   POST /api/inicio-sesion   entrar con una cuenta existente
 *
 * Las dos pasan primero por reCAPTCHA y luego revisan los datos con las
 * MISMAS reglas que usa la web. Nunca se confía en lo que llega del
 * navegador: cualquiera puede enviar lo que quiera desde una terminal.
 */
import express from "express";
import { verificarFicha } from "../seguridad/recaptcha.js";
import { almacenDeUsuarios } from "./almacenDeUsuarios.js";
import { revisarRegistro, revisarCorreo, revisarContrasena } from "../../comun/reglasDeUsuario.js";

export const rutasDeUsuarios = express.Router();

/** Comprueba el reCAPTCHA y corta la petición si no lo aprueba. */
async function pasaElRecaptcha(peticion, respuesta, accion) {
  const comprobacion = await verificarFicha({
    ficha: peticion.body?.fichaRecaptcha,
    accion,
    ip: peticion.ip,
  });

  if (!comprobacion.aprobado) {
    respuesta.status(403).json({
      error: "No pudimos confirmar que eres una persona. Recarga la página e inténtalo de nuevo.",
      detalle: comprobacion.motivo,
    });
    return false;
  }
  return true;
}

// --- Crear una cuenta -------------------------------------------------
rutasDeUsuarios.post("/registro", async (peticion, respuesta) => {
  if (!(await pasaElRecaptcha(peticion, respuesta, "registro"))) return;

  const datos = peticion.body ?? {};

  // Las mismas reglas que en la web, otra vez aquí.
  const errores = revisarRegistro(datos);
  if (Object.keys(errores).length > 0) {
    return respuesta.status(400).json({ error: "Revisa los datos del formulario.", errores });
  }

  try {
    const usuario = await almacenDeUsuarios.registrar({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      contrasena: datos.contrasena,
      fechaDeNacimiento: datos.fechaDeNacimiento,
      paisDeOrigen: datos.paisDeOrigen,
    });
    return respuesta.status(201).json({ usuario });
  } catch (error) {
    // Correo repetido: se avisa en el campo, no como error general.
    if (error.message.includes("Ya existe")) {
      return respuesta.status(409).json({
        error: error.message,
        errores: { correo: "Ya hay una cuenta con ese correo." },
      });
    }
    console.error("Error registrando usuario:", error);
    return respuesta.status(500).json({ error: "No pudimos crear la cuenta. Inténtalo más tarde." });
  }
});

// --- Entrar -----------------------------------------------------------
rutasDeUsuarios.post("/inicio-sesion", async (peticion, respuesta) => {
  if (!(await pasaElRecaptcha(peticion, respuesta, "iniciar_sesion"))) return;

  const { correo, contrasena } = peticion.body ?? {};

  if (revisarCorreo(correo) || revisarContrasena(contrasena)) {
    // Sin detalles: no se le dice a un atacante qué parte falló.
    return respuesta.status(401).json({ error: "Correo o contraseña incorrectos." });
  }

  try {
    const usuario = await almacenDeUsuarios.comprobarCredenciales({ correo, contrasena });
    if (!usuario) {
      return respuesta.status(401).json({ error: "Correo o contraseña incorrectos." });
    }
    return respuesta.json({ usuario });
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    return respuesta.status(500).json({ error: "No pudimos entrar. Inténtalo más tarde." });
  }
});

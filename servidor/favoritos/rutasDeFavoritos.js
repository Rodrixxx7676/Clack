/**
 * rutasDeFavoritos.js
 * -------------------
 * Las ciudades elegidas por cada persona.
 *
 *   GET  /api/favoritos   las mías
 *   PUT  /api/favoritos   guardar la lista como quedó
 *
 * Las dos exigen llave de sesión: el servidor sabe de quién son por la
 * llave, nunca porque el navegador diga a quién pertenecen.
 */
import express from "express";
import { requiereSesion } from "../usuarios/sesiones.js";
import { almacenDeFavoritos, MAXIMO_DE_CIUDADES } from "./almacenDeFavoritos.js";

export const rutasDeFavoritos = express.Router();

rutasDeFavoritos.use(requiereSesion);

rutasDeFavoritos.get("/", async (peticion, respuesta) => {
  try {
    const favoritos = await almacenDeFavoritos.deUsuario(peticion.idDeUsuario);
    respuesta.json({ ciudades: favoritos.map((f) => f.ciudad), maximo: MAXIMO_DE_CIUDADES });
  } catch (error) {
    console.error("Error leyendo favoritos:", error);
    respuesta.status(500).json({ error: "No pudimos leer tus ciudades." });
  }
});

rutasDeFavoritos.put("/", async (peticion, respuesta) => {
  try {
    const favoritos = await almacenDeFavoritos.reemplazar(
      peticion.idDeUsuario,
      peticion.body?.ciudades ?? []
    );
    respuesta.json({ ciudades: favoritos.map((f) => f.ciudad), maximo: MAXIMO_DE_CIUDADES });
  } catch (error) {
    respuesta.status(400).json({ error: error.message });
  }
});

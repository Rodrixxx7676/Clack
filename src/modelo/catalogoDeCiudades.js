/**
 * catalogoDeCiudades.js
 * ---------------------
 * La lista de ciudades que se ven en el panel de inicio.
 *
 * Para agregar una ciudad, copia un bloque y cambia los datos.
 * La zona horaria debe escribirse como en la lista oficial IANA
 * ("Europe/Madrid", "America/Bogota", "Asia/Tokyo"...).
 *
 * Las fotos vienen de Wikimedia Commons (uso libre). Para cambiar una,
 * busca la ciudad en commons.wikimedia.org y pega aquí el enlace de la imagen.
 */
import { Ciudad } from "./Ciudad.js";

export const CIUDADES = [
  new Ciudad({
    id: "lima",
    nombre: "Lima",
    pais: "Perú",
    zonaHoraria: "America/Lima",
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Bas%C3%ADlica_Catedral_Metropolitana_de_Lima_%28cropped%29.jpg/960px-Bas%C3%ADlica_Catedral_Metropolitana_de_Lima_%28cropped%29.jpg",
  }),
  new Ciudad({
    id: "nueva-york",
    nombre: "Nueva York",
    pais: "Estados Unidos",
    zonaHoraria: "America/New_York",
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu.jpg/960px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu.jpg",
  }),
  new Ciudad({
    id: "londres",
    nombre: "Londres",
    pais: "Reino Unido",
    zonaHoraria: "Europe/London",
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/960px-London_Skyline_%28125508655%29.jpeg",
  }),
  new Ciudad({
    id: "paris",
    nombre: "París",
    pais: "Francia",
    zonaHoraria: "Europe/Paris",
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/960px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg",
  }),
  new Ciudad({
    id: "tokio",
    nombre: "Tokio",
    pais: "Japón",
    zonaHoraria: "Asia/Tokyo",
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Shinjuku_central_park_southwest.jpg/960px-Shinjuku_central_park_southwest.jpg",
  }),
  new Ciudad({
    id: "sidney",
    nombre: "Sídney",
    pais: "Australia",
    zonaHoraria: "Australia/Sydney",
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/960px-Sydney_Australia._%2821339175489%29.jpg",
  }),
];

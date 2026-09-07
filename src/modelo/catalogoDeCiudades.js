/**
 * catalogoDeCiudades.js
 * ---------------------
 * La lista de ciudades que se ven en el panel de inicio.
 *
 * Para agregar una ciudad, copia un bloque y cambia los datos.
 * La zona horaria debe escribirse como en la lista oficial IANA
 * ("Europe/Madrid", "America/Bogota", "Asia/Tokyo"...) y la latitud y
 * longitud se sacan de cualquier mapa (sirven para pedir la temperatura).
 *
 * Más adelante esta lista vendrá de la base de datos (entidad CIUDAD) y
 * cada usuario elegirá las suyas (entidad FAVORITO).
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
    latitud: -12.0464,
    longitud: -77.0428,
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Bas%C3%ADlica_Catedral_Metropolitana_de_Lima_%28cropped%29.jpg/960px-Bas%C3%ADlica_Catedral_Metropolitana_de_Lima_%28cropped%29.jpg",
  }),
  new Ciudad({
    id: "nueva-york",
    nombre: "Nueva York",
    pais: "Estados Unidos",
    zonaHoraria: "America/New_York",
    latitud: 40.7128,
    longitud: -74.006,
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu.jpg/960px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu.jpg",
  }),
  new Ciudad({
    id: "londres",
    nombre: "Londres",
    pais: "Reino Unido",
    zonaHoraria: "Europe/London",
    latitud: 51.5072,
    longitud: -0.1276,
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/960px-London_Skyline_%28125508655%29.jpeg",
  }),
  new Ciudad({
    id: "paris",
    nombre: "París",
    pais: "Francia",
    zonaHoraria: "Europe/Paris",
    latitud: 48.8566,
    longitud: 2.3522,
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/960px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg",
  }),
  new Ciudad({
    id: "tokio",
    nombre: "Tokio",
    pais: "Japón",
    zonaHoraria: "Asia/Tokyo",
    latitud: 35.6762,
    longitud: 139.6503,
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Shinjuku_central_park_southwest.jpg/960px-Shinjuku_central_park_southwest.jpg",
  }),
  new Ciudad({
    id: "sidney",
    nombre: "Sídney",
    pais: "Australia",
    zonaHoraria: "Australia/Sydney",
    latitud: -33.8688,
    longitud: 151.2093,
    foto:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/960px-Sydney_Australia._%2821339175489%29.jpg",
  }),
];

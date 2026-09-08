/**
 * EnlaceDeReunion.js
 * ------------------
 * Convierte una reunión en un enlace que se puede mandar por WhatsApp,
 * y al revés.
 *
 * El enlace lleva las zonas horarias dentro, así que quien lo recibe ve
 * la reunión **sin necesidad de tener cuenta en Clack**:
 *
 *   https://clack.../?reunion=America/Lima,Europe/Madrid&hora=15
 *
 * Se guardan las zonas horarias y no los nombres porque la zona ya lleva
 * el nombre de la ciudad dentro ("Europe/Madrid") y así el enlace es
 * corto y no se puede manipular para inventar ciudades falsas.
 */

/** Arma el enlace para compartir. */
export function construirEnlaceDeReunion(ciudades, hora) {
  const zonas = ciudades.map((ciudad) => ciudad.zonaHoraria).join(",");
  const direccion = new URL(window.location.origin);
  direccion.searchParams.set("reunion", zonas);
  direccion.searchParams.set("hora", String(hora));
  return direccion.toString();
}

/**
 * Lee el enlace actual. Devuelve null si no es un enlace de reunión.
 * @returns {{zonas: string[], hora: number}|null}
 */
export function leerEnlaceDeReunion(direccion = window.location.href) {
  const parametros = new URL(direccion).searchParams;
  const reunion = parametros.get("reunion");
  if (!reunion) return null;

  const zonas = reunion
    .split(",")
    .map((zona) => zona.trim())
    .filter((zona) => esZonaHorariaValida(zona))
    .slice(0, 10);

  if (zonas.length === 0) return null;

  const hora = Number(parametros.get("hora"));
  return {
    zonas,
    hora: Number.isInteger(hora) && hora >= 0 && hora <= 23 ? hora : null,
  };
}

/** Le pregunta al navegador si esa zona horaria existe de verdad. */
export function esZonaHorariaValida(zona) {
  try {
    new Intl.DateTimeFormat("es", { timeZone: zona });
    return true;
  } catch {
    return false;
  }
}

/**
 * De "Europe/Madrid" saca "Madrid".
 *
 * Las zonas horarias están en inglés, así que las ciudades más habituales
 * se traducen a mano. Para el resto se usa el nombre tal cual, que casi
 * siempre coincide (Madrid, Bogotá, Santiago…).
 */
const EN_ESPANOL = {
  Tokyo: "Tokio",
  London: "Londres",
  New_York: "Nueva York",
  Mexico_City: "Ciudad de México",
  Sao_Paulo: "São Paulo",
  Moscow: "Moscú",
  Rome: "Roma",
  Athens: "Atenas",
  Vienna: "Viena",
  Brussels: "Bruselas",
  Copenhagen: "Copenhague",
  Warsaw: "Varsovia",
  Prague: "Praga",
  Zurich: "Zúrich",
  Lisbon: "Lisboa",
  Dublin: "Dublín",
  Stockholm: "Estocolmo",
  Beijing: "Pekín",
  Shanghai: "Shanghái",
  Seoul: "Seúl",
  Singapore: "Singapur",
  Bangkok: "Bangkok",
  Cairo: "El Cairo",
  Istanbul: "Estambul",
  Jerusalem: "Jerusalén",
  Sydney: "Sídney",
  Auckland: "Auckland",
  Toronto: "Toronto",
  Vancouver: "Vancouver",
  Havana: "La Habana",
};

export function nombreDesdeZonaHoraria(zona) {
  const ultimo = zona.split("/").pop() ?? zona;
  return EN_ESPANOL[ultimo] ?? ultimo.replace(/_/g, " ");
}

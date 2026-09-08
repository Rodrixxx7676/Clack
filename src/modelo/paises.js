/**
 * paises.js
 * ---------
 * La lista de países para el registro.
 *
 * No se escriben los nombres a mano: se guardan los códigos oficiales
 * (ISO 3166) y el propio navegador los traduce al español. Así siempre
 * están bien escritos y no hay que mantener una lista de 200 nombres.
 */

// Se ponen primero los de habla hispana, que son los más probables.
const CODIGOS_CERCANOS = [
  "PE", "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "SV",
  "GQ", "GT", "HN", "MX", "NI", "PA", "PY", "PR", "ES", "UY", "VE",
];

const OTROS_CODIGOS = [
  "DE", "AU", "AT", "BE", "BR", "CA", "CN", "KR", "DK", "US",
  "FI", "FR", "GR", "IN", "IE", "IL", "IT", "JP", "MA", "NO",
  "NZ", "NL", "PL", "PT", "GB", "RU", "SE", "CH", "TR", "UA",
];

const nombreDe = (codigo) => {
  try {
    return new Intl.DisplayNames(["es"], { type: "region" }).of(codigo) ?? codigo;
  } catch {
    return codigo;
  }
};

const ordenarPorNombre = (a, b) => a.nombre.localeCompare(b.nombre, "es");

/** [{ codigo: "PE", nombre: "Perú" }, ...] */
export const PAISES = [
  ...CODIGOS_CERCANOS.map((codigo) => ({ codigo, nombre: nombreDe(codigo) })).sort(ordenarPorNombre),
  ...OTROS_CODIGOS.map((codigo) => ({ codigo, nombre: nombreDe(codigo) })).sort(ordenarPorNombre),
];

/** El país donde parece estar la persona, según su navegador. */
export function paisProbable() {
  const zona = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const porZonaHoraria = { "America/Lima": "Perú", "America/Santiago": "Chile", "America/Bogota": "Colombia" };
  return porZonaHoraria[zona] ?? "";
}

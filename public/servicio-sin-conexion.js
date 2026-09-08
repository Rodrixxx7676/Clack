/**
 * servicio-sin-conexion.js
 * ------------------------
 * El "trabajador de servicio" (service worker) de Clack.
 *
 * Es un ayudante que el navegador deja instalado y que se pone en medio
 * de las peticiones. Gracias a él, Clack:
 *   · se puede instalar como una aplicación en el móvil
 *   · abre al instante la segunda vez
 *   · muestra algo aunque no haya internet
 *
 * Reglas, en orden:
 *   1. Las peticiones a /api NUNCA se guardan: son datos que cambian y
 *      además llevan la sesión.
 *   2. Al abrir la página se intenta primero por internet; si falla, se
 *      usa la copia guardada. Así los cambios se ven siempre.
 *   3. El resto de archivos (imágenes, estilos, código) salen de la copia
 *      guardada y se actualizan por detrás.
 */

const CACHE = "clack-v1";
const ESENCIALES = ["/", "/iconos/icono-192.png", "/iconos/icono-512.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ESENCIALES)).then(() => self.skipWaiting())
  );
});

// Al activarse, se borran las copias de versiones anteriores.
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  const direccion = new URL(peticion.url);

  // Solo se toca lo nuestro, y solo las lecturas.
  if (peticion.method !== "GET" || direccion.origin !== self.location.origin) return;

  // 1. Nada de guardar el ir y venir de datos.
  if (direccion.pathname.startsWith("/api")) return;

  // 2. Abrir la página: primero internet, luego la copia.
  if (peticion.mode === "navigate") {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put("/", copia));
          return respuesta;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  // 3. Lo demás: la copia primero, y se refresca por detrás.
  evento.respondWith(
    caches.match(peticion).then((guardada) => {
      const desdeInternet = fetch(peticion)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(CACHE).then((cache) => cache.put(peticion, copia));
          }
          return respuesta;
        })
        .catch(() => guardada);

      return guardada || desdeInternet;
    })
  );
});

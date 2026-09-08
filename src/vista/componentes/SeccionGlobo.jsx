/**
 * SeccionGlobo.jsx
 * ----------------
 * El segundo "piso" del panel: un video del globo terráqueo de fondo,
 * a pantalla completa, con un mensaje encima.
 *
 * El video está en public/video/. Es solo decoración, así que:
 *   · va sin sonido y en bucle
 *   · no se descarga hasta que hace falta (preload="none")
 *   · mientras carga se ve una imagen de portada, no un rectángulo negro
 *   · si el usuario pidió menos movimiento, no se reproduce
 */
import { useEffect, useRef } from "react";

const VIDEO = "/video/globo-terraqueo.mp4";
const PORTADA = "/video/globo-terraqueo-portada.jpg";

export default function SeccionGlobo({ totalDeCiudades }) {
  const video = useRef(null);

  useEffect(() => {
    const elemento = video.current;
    if (!elemento) return;

    // Respeta a quien prefiere menos movimiento en pantalla.
    const prefiereQuietud = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefiereQuietud) return;

    // El video solo se descarga y se reproduce cuando la sección se asoma.
    const observador = new IntersectionObserver(
      ([seccion]) => {
        if (seccion.isIntersecting) {
          elemento.play().catch(() => {}); // si el navegador lo bloquea, se queda la portada
        } else {
          elemento.pause();
        }
      },
      { threshold: 0.25 }
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <section className="seccion-globo" aria-labelledby="tituloGlobo">
      <video
        ref={video}
        className="seccion-globo__video"
        src={VIDEO}
        poster={PORTADA}
        preload="none"
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="seccion-globo__velo" aria-hidden="true" />

      <div className="seccion-globo__contenido">
        <p className="seccion-globo__antetitulo">Un solo planeta, muchas horas</p>
        <h2 className="seccion-globo__titulo" id="tituloGlobo">
          Coordínate con quien quieras,
          <br />
          esté donde esté
        </h2>
        <p className="seccion-globo__texto">
          Mientras aquí amanece, en otras {totalDeCiudades - 1} ciudades ya es de noche.
          Clack te muestra la hora y el clima de todas de un vistazo, para que no vuelvas
          a escribirle a nadie a las tres de la mañana.
        </p>
      </div>
    </section>
  );
}

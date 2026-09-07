/**
 * CarruselCiudades.jsx
 * --------------------
 * El carrusel del panel de inicio: una tarjeta por ciudad, en profundidad.
 *
 * Aquí solo se elige la configuración (tamaño, inclinación, colores) y se
 * traduce la lista de ciudades al formato que espera el carrusel.
 * El motor está en DepthCarousel.jsx, que viene tal cual de React Bits
 * (https://reactbits.dev/components/depth-carousel) y que conviene NO tocar,
 * para poder actualizarlo cuando salga una versión nueva.
 */
import { useEffect, useMemo, useRef } from "react";
import DepthCarousel from "./DepthCarousel";

// Turquesa oscuro: es el tono que oscurece las tarjetas del fondo.
const TINTE_PROFUNDIDAD = "#0d5e57";

export default function CarruselCiudades({ ciudades, alEnfocarCiudad }) {
  const contenedor = useRef(null);

  // El carrusel solo entiende de imágenes: le pasamos la foto de cada ciudad.
  const tarjetas = useMemo(
    () => ciudades.map((ciudad) => ({ image: ciudad.foto, alt: `${ciudad.nombre}, ${ciudad.pais}` })),
    [ciudades]
  );

  // El carrusel original trae sus textos de accesibilidad en inglés.
  // Aquí se traducen sin tocar DepthCarousel.jsx, para poder actualizarlo.
  useEffect(() => {
    const raiz = contenedor.current;
    if (!raiz) return;

    const traducir = (selector, texto) =>
      raiz.querySelector(selector)?.setAttribute("aria-label", texto);

    traducir(".depth-carousel", "Carrusel de ciudades");
    traducir(".depth-carousel__arrow--prev", "Ciudad anterior");
    traducir(".depth-carousel__arrow--next", "Ciudad siguiente");

    raiz.querySelectorAll(".depth-carousel__dot").forEach((punto, indice) => {
      punto.setAttribute("aria-label", `Ir a ${ciudades[indice]?.nombre ?? "la ciudad " + (indice + 1)}`);
    });
  }, [ciudades]);

  return (
    <div className="carrusel-ciudades" ref={contenedor}>
      <DepthCarousel
        items={tarjetas}
        onChange={alEnfocarCiudad}
        cardWidth={300}
        cardHeight={340}
        radius={18}
        tint={TINTE_PROFUNDIDAD}
        depth={220}
        spread={90}
        tilt={22}
        tiltDirection="right"
        perspective={1400}
        visibleCards={4}
        falloff={0.2}
        blur={6}
        autoplay
        loop
      />
    </div>
  );
}

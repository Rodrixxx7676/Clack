/**
 * FondoWebThreads.jsx
 * -------------------
 * El fondo animado del login: hilos de luz turquesa sobre blanco.
 *
 * Aquí solo se elige la configuración (colores, velocidad, forma).
 * El motor gráfico está en WebThreads.jsx, que viene tal cual de
 * React Bits (https://reactbits.dev/backgrounds/web-threads) y que
 * conviene NO tocar, para poder actualizarlo cuando salga una versión nueva.
 */
import WebThreads from "./WebThreads";

// La paleta de la marca: turquesa sobre blanco.
const TURQUESA_PROFUNDO = "#0D9488";
const TURQUESA_CLARO = "#22D3EE";
const TURQUESA_BRILLO = "#5EEAD4";
const BLANCO = "#FFFFFF";

export default function FondoWebThreads() {
  return (
    <div className="fondo-login" aria-hidden="true">
      <WebThreads
        color1={TURQUESA_PROFUNDO}
        color2={TURQUESA_CLARO}
        color3={TURQUESA_BRILLO}
        backgroundColor={BLANCO}
        lightMode
        speed={0.2}
        threadCount={6}
        frequency={5.0}
        spread={0.18}
        taper={1.0}
        position={0.5}
        fanMode="center"
        glow={0.02}
        falloff={0.6}
        thickness={1.1}
        brightness={0.85}
        opacity={1.0}
        mirror
        shimmer={false}
        grain
        grainIntensity={0.05}
        mouseInteraction
        mouseStrength={0.3}
      />
    </div>
  );
}

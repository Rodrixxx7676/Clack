/**
 * CajaVidrio.jsx
 * --------------
 * La caja de vidrio de Clack: superficie translúcida con un resplandor
 * turquesa que se enciende en el borde cuando acercas el cursor.
 *
 * Todas las cajas de la app usan este componente, así todas se ven y se
 * comportan igual. Si algún día hay que cambiar el efecto, se cambia aquí
 * una sola vez.
 *
 * El motor del resplandor es BorderGlow.jsx, que viene tal cual de
 * React Bits (https://reactbits.dev/components/border-glow) y conviene
 * NO tocar, para poder actualizarlo cuando salga una versión nueva.
 */
import BorderGlow from "../efectos/BorderGlow";

// La paleta del resplandor: turquesa sobre blanco.
const CONFIGURACION = {
  edgeSensitivity: 22, // qué tan cerca del borde hay que estar
  glowColor: "174 84 38", // turquesa, en tono/saturación/luz
  backgroundColor: "#ffffff", // le dice al efecto que la caja es clara
  glowRadius: 40, // cuánto se derrama la luz hacia afuera
  glowIntensity: 1.6, // sobre blanco hay que subirlo para que se note
  coneSpread: 25, // qué trozo del borde se ilumina
  animated: false, // en true, hace un barrido de luz al aparecer
  colors: ["#0d9488", "#14b8a6", "#22d3ee"],
  fillOpacity: 0.35, // el relleno de color del interior, discreto
};

export default function CajaVidrio({
  children,
  className = "",
  radio = 20,
  como: Elemento = "div",
  ...restoDeAtributos
}) {
  return (
    <BorderGlow {...CONFIGURACION} borderRadius={radio} className={`caja-vidrio ${className}`.trim()}>
      <Elemento className="caja-vidrio__cuerpo" {...restoDeAtributos}>
        {children}
      </Elemento>
    </BorderGlow>
  );
}

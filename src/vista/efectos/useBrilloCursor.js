/**
 * useBrilloCursor.js
 * ------------------
 * El detalle que hace que el vidrio se sienta "líquido":
 * un brillo suave que sigue al cursor por encima de la tarjeta.
 *
 * Es puro adorno visual, por eso vive en la Vista.
 * Se usa así:  const { ref, ...manejadores } = useBrilloCursor();
 */
import { useCallback, useRef } from "react";

export function useBrilloCursor() {
  const ref = useRef(null);

  const moverBrillo = useCallback((evento) => {
    const elemento = ref.current;
    if (!elemento) return;
    const area = elemento.getBoundingClientRect();
    const x = ((evento.clientX - area.left) / area.width) * 100;
    const y = ((evento.clientY - area.top) / area.height) * 100;
    elemento.style.setProperty("--brillo-x", `${x}%`);
    elemento.style.setProperty("--brillo-y", `${y}%`);
  }, []);

  const centrarBrillo = useCallback(() => {
    const elemento = ref.current;
    if (!elemento) return;
    elemento.style.setProperty("--brillo-x", "50%");
    elemento.style.setProperty("--brillo-y", "0%");
  }, []);

  return { ref, onPointerMove: moverBrillo, onPointerLeave: centrarBrillo };
}

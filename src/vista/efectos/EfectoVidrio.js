/**
 * EfectoVidrio.js
 * ---------------
 * El detalle que hace que el vidrio se sienta "líquido":
 * un brillo suave que sigue al cursor por encima de la tarjeta.
 *
 * Es puro adorno visual, por eso vive en la Vista.
 */
export function seguirBrilloDelCursor(elemento) {
  const moverBrillo = (evento) => {
    const area = elemento.getBoundingClientRect();
    const x = ((evento.clientX - area.left) / area.width) * 100;
    const y = ((evento.clientY - area.top) / area.height) * 100;
    elemento.style.setProperty("--brillo-x", `${x}%`);
    elemento.style.setProperty("--brillo-y", `${y}%`);
  };

  const centrarBrillo = () => {
    elemento.style.setProperty("--brillo-x", "50%");
    elemento.style.setProperty("--brillo-y", "0%");
  };

  centrarBrillo();
  elemento.addEventListener("pointermove", moverBrillo);
  elemento.addEventListener("pointerleave", centrarBrillo);

  return () => {
    elemento.removeEventListener("pointermove", moverBrillo);
    elemento.removeEventListener("pointerleave", centrarBrillo);
  };
}

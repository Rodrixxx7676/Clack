/**
 * BotonCompartir.jsx
 * ------------------
 * Comparte un enlace. En el móvil abre el menú de compartir del sistema
 * (WhatsApp, correo…); en el computador copia el enlace al portapapeles.
 */
import { useState } from "react";

export default function BotonCompartir({ enlace, titulo }) {
  const [copiado, setCopiado] = useState(false);

  const compartir = async () => {
    // El móvil trae su propio menú de compartir.
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: titulo, url: enlace });
        return;
      } catch {
        // Si lo cancela, se sigue al plan B.
      }
    }

    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copia este enlace:", enlace);
    }
  };

  return (
    <button className="boton-vidrio boton-compartir" type="button" onClick={compartir}>
      {copiado ? "✓ Enlace copiado" : "Compartir esta hora"}
    </button>
  );
}

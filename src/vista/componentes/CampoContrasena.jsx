/**
 * CampoContrasena.jsx — Campo de contraseña con el botón de "mostrar / ocultar".
 * Que la contraseña se vea o no es cosa de la Vista, por eso el estado vive aquí.
 */
import { useState } from "react";
import CampoTexto from "./CampoTexto";

export default function CampoContrasena(props) {
  const [visible, setVisible] = useState(false);

  return (
    <CampoTexto {...props} tipo={visible ? "text" : "password"}>
      <button
        type="button"
        className="campo__boton"
        onClick={() => setVisible((estaba) => !estaba)}
        aria-pressed={visible}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <path
            d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.6" />
          {visible && (
            <path d="M4.5 19.5 19.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </svg>
      </button>
    </CampoTexto>
  );
}

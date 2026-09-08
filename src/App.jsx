/**
 * App.jsx — La raíz de la aplicación.
 *
 * Decide qué pantalla se ve:
 *   · sin usuario  → el Login, o el registro si lo pide
 *   · con usuario  → el panel de inicio
 */
import { useState } from "react";
import { useSesion } from "./vista-modelo/useSesion.js";
import PantallaLogin from "./vista/PantallaLogin.jsx";
import PantallaRegistro from "./vista/PantallaRegistro.jsx";
import PanelInicio from "./vista/PanelInicio.jsx";

export default function App() {
  const sesion = useSesion();
  const [quiereRegistrarse, setQuiereRegistrarse] = useState(false);

  if (sesion.usuario) {
    return <PanelInicio usuario={sesion.usuario} alCerrarSesion={sesion.salir} />;
  }

  if (quiereRegistrarse) {
    return (
      <PantallaRegistro
        alRegistrar={sesion.registrar}
        alVolverAlLogin={() => setQuiereRegistrarse(false)}
      />
    );
  }

  return (
    <PantallaLogin alEntrar={sesion.entrar} alQuererRegistrarse={() => setQuiereRegistrarse(true)} />
  );
}

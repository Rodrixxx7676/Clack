/**
 * App.jsx — La raíz de la aplicación.
 *
 * Decide qué pantalla se ve:
 *   · sin usuario  → la pantalla de Login
 *   · con usuario  → el panel de inicio
 */
import { useSesion } from "./vista-modelo/useSesion.js";
import PantallaLogin from "./vista/PantallaLogin.jsx";
import PanelInicio from "./vista/PanelInicio.jsx";

export default function App() {
  const sesion = useSesion();

  if (!sesion.usuario) {
    return <PantallaLogin alEntrar={sesion.entrar} />;
  }

  return <PanelInicio usuario={sesion.usuario} alCerrarSesion={sesion.salir} />;
}

/**
 * App.jsx — La raíz de la aplicación.
 *
 * Decide qué pantalla se ve:
 *   · enlace de reunión compartida → esa reunión, sin pedir cuenta
 *   · sin usuario  → el Login, o el registro si lo pide
 *   · con usuario  → el panel de inicio
 */
import { useState } from "react";
import { useSesion } from "./vista-modelo/useSesion.js";
import { leerEnlaceDeReunion } from "./modelo/EnlaceDeReunion.js";
import PantallaLogin from "./vista/PantallaLogin.jsx";
import PantallaRegistro from "./vista/PantallaRegistro.jsx";
import PanelInicio from "./vista/PanelInicio.jsx";
import PantallaReunionCompartida from "./vista/PantallaReunionCompartida.jsx";

export default function App() {
  const sesion = useSesion();
  const [quiereRegistrarse, setQuiereRegistrarse] = useState(false);

  // Si llegó por un enlace compartido, se lee una sola vez al abrir.
  const [reunionCompartida, setReunionCompartida] = useState(() => leerEnlaceDeReunion());

  const salirDeLaReunion = () => {
    // Se limpia la dirección para que al recargar no vuelva a la reunión.
    window.history.replaceState({}, "", window.location.origin);
    setReunionCompartida(null);
  };

  if (reunionCompartida) {
    return <PantallaReunionCompartida reunion={reunionCompartida} alEntrarAClack={salirDeLaReunion} />;
  }

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

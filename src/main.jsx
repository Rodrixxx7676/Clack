/**
 * main.jsx
 * --------
 * Punto de arranque de Clack: aquí se enciende React y se cargan los estilos.
 *
 *   Modelo      →  los datos y las reglas    (src/modelo)
 *   ViewModel   →  el estado de la pantalla  (src/vista-modelo)
 *   Vista       →  lo que se ve y se toca    (src/vista)
 */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "./estilos/base.css";
import "./estilos/liquid-glass.css";
import "./estilos/login.css";
import "./estilos/panel-inicio.css";

createRoot(document.getElementById("raiz")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- Instalable como aplicación ---------------------------------------
// El "trabajador de servicio" hace que Clack se pueda instalar en el
// móvil y que abra rápido la segunda vez. Solo se registra en la web ya
// publicada: durante el desarrollo estorbaría (guardaría versiones viejas).
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/servicio-sin-conexion.js").catch((error) => {
      console.warn("No se pudo instalar el modo aplicación:", error.message);
    });
  });
}

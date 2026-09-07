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

createRoot(document.getElementById("raiz")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

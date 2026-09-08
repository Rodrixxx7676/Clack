/**
 * PanelInicio.jsx
 * ---------------
 * La pantalla principal de Clack, en "pisos" que se recorren bajando:
 *
 *   1. El carrusel de ciudades con su hora y su clima
 *   2. El globo terráqueo en video, con el mensaje de la marca
 *
 * Para agregar otro piso, se añade una <section> más aquí abajo.
 *
 * Regla de oro de MVVM: aquí NO se decide nada.
 * Los datos vienen de usePanelInicioViewModel y aquí solo se pintan.
 */
import { usePanelInicioViewModel } from "../vista-modelo/usePanelInicioViewModel.js";
import { useRelojLocal } from "../vista-modelo/useRelojLocal.js";
import FondoWebThreads from "./fondos/FondoWebThreads.jsx";
import CarruselCiudades from "./carruseles/CarruselCiudades.jsx";
import EncabezadoPanel from "./componentes/EncabezadoPanel.jsx";
import DetalleCiudad from "./componentes/DetalleCiudad.jsx";
import SeccionGlobo from "./componentes/SeccionGlobo.jsx";

export default function PanelInicio({ usuario, alCerrarSesion }) {
  const vm = usePanelInicioViewModel();
  const relojLocal = useRelojLocal();

  return (
    <div className="panel-inicio">
      <FondoWebThreads />

      <div className="panel-inicio__contenido">
        <EncabezadoPanel
          nombreDeUsuario={usuario.nombre}
          horaLocal={relojLocal.hora}
          alCerrarSesion={alCerrarSesion}
        />

        <main className="panel-inicio__centro" id="ciudades">
          <p className="panel-inicio__introduccion">
            Desliza para viajar entre ciudades y mira qué hora es allá ahora mismo.
          </p>

          <CarruselCiudades ciudades={vm.ciudades} alEnfocarCiudad={vm.enfocarCiudad} />

          <DetalleCiudad {...vm.ciudadActiva} />

          <a className="panel-inicio__bajar" href="#globo" aria-label="Ver la siguiente sección">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </main>
      </div>

      <div id="globo">
        <SeccionGlobo totalDeCiudades={vm.ciudades.length} />
      </div>
    </div>
  );
}

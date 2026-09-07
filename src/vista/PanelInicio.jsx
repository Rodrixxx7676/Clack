/**
 * PanelInicio.jsx
 * ---------------
 * La pantalla principal de Clack: el carrusel de ciudades en el centro y,
 * debajo, la hora que es ahora mismo en la ciudad enfocada.
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

        <main className="panel-inicio__centro">
          <p className="panel-inicio__introduccion">
            Desliza para viajar entre ciudades y mira qué hora es allá ahora mismo.
          </p>

          <CarruselCiudades ciudades={vm.ciudades} alEnfocarCiudad={vm.enfocarCiudad} />

          <DetalleCiudad {...vm.ciudadActiva} />
        </main>
      </div>
    </div>
  );
}

/**
 * PanelInicio.jsx
 * ---------------
 * La pantalla principal de Clack, en "pisos" que se recorren bajando:
 *
 *   1. El carrusel de ciudades con su hora y su clima
 *   2. ¿A qué hora hablamos? La tabla de 24 horas de cada ciudad
 *   3. El globo terráqueo en video, con el mensaje de la marca
 *
 * Para agregar otro piso, se añade una <section> más aquí abajo.
 *
 * Regla de oro de MVVM: aquí NO se decide nada.
 * Los datos vienen de usePanelInicioViewModel y aquí solo se pintan.
 */
import { useState } from "react";
import { usePanelInicioViewModel } from "../vista-modelo/usePanelInicioViewModel.js";
import { useCiudadesFavoritas } from "../vista-modelo/useCiudadesFavoritas.js";
import { useAlarmas } from "../vista-modelo/useAlarmas.js";
import { useRelojLocal } from "../vista-modelo/useRelojLocal.js";
import FondoWebThreads from "./fondos/FondoWebThreads.jsx";
import CarruselCiudades from "./carruseles/CarruselCiudades.jsx";
import EncabezadoPanel from "./componentes/EncabezadoPanel.jsx";
import DetalleCiudad from "./componentes/DetalleCiudad.jsx";
import SeccionGlobo from "./componentes/SeccionGlobo.jsx";
import GestorDeCiudades from "./componentes/GestorDeCiudades.jsx";
import SeccionReuniones from "./componentes/SeccionReuniones.jsx";
import GestorDeAlarmas from "./componentes/GestorDeAlarmas.jsx";
import AvisoDeAlarma from "./componentes/AvisoDeAlarma.jsx";

export default function PanelInicio({ usuario, alCerrarSesion }) {
  const favoritos = useCiudadesFavoritas();
  const vm = usePanelInicioViewModel(favoritos.ciudades);
  const relojLocal = useRelojLocal();
  const alarmas = useAlarmas();
  const [gestorAbierto, setGestorAbierto] = useState(false);
  const [alarmasAbiertas, setAlarmasAbiertas] = useState(false);

  return (
    <div className="panel-inicio">
      <FondoWebThreads />

      <div className="panel-inicio__contenido">
        <EncabezadoPanel
          nombreDeUsuario={usuario.nombre}
          horaLocal={relojLocal.hora}
          alCerrarSesion={alCerrarSesion}
          alAbrirCiudades={() => setGestorAbierto(true)}
          alAbrirAlarmas={() => setAlarmasAbiertas(true)}
        />

        <main className="panel-inicio__centro" id="ciudades">
          <p className="panel-inicio__introduccion">
            Desliza para viajar entre ciudades y mira qué hora es allá ahora mismo.
          </p>

          {vm.hayCiudades ? (
            <>
              <CarruselCiudades ciudades={vm.ciudades} alEnfocarCiudad={vm.enfocarCiudad} />
              <DetalleCiudad {...vm.ciudadActiva} />
            </>
          ) : (
            <p className="panel-inicio__cargando">
              {favoritos.cargando ? "Cargando tus ciudades…" : "Añade tu primera ciudad."}
            </p>
          )}

          <a className="panel-inicio__bajar" href="#reuniones" aria-label="Ver la siguiente sección">
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

      <div id="reuniones">
        <SeccionReuniones ciudades={vm.ciudades} climaPorCiudad={vm.climaPorCiudad} />
      </div>

      <div id="globo">
        <SeccionGlobo totalDeCiudades={vm.ciudades.length} />
      </div>

      <GestorDeCiudades
        abierto={gestorAbierto}
        alCerrar={() => setGestorAbierto(false)}
        favoritos={favoritos}
      />

      <GestorDeAlarmas
        abierto={alarmasAbiertas}
        alCerrar={() => setAlarmasAbiertas(false)}
        alarmas={alarmas}
        ciudades={vm.ciudades}
      />

      <AvisoDeAlarma texto={alarmas.ultimoAviso} alCerrar={alarmas.descartarAviso} />
    </div>
  );
}

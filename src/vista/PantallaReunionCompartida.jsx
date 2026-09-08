/**
 * PantallaReunionCompartida.jsx
 * -----------------------------
 * Lo que ve quien recibe un enlace de reunión por WhatsApp o correo.
 *
 * No hace falta tener cuenta: las ciudades vienen dentro del enlace.
 * Es la puerta de entrada a Clack para gente que todavía no lo conoce,
 * así que al final se le invita a crear la suya.
 */
import { useMemo } from "react";
import { Ciudad } from "../modelo/Ciudad.js";
import { nombreDesdeZonaHoraria } from "../modelo/EnlaceDeReunion.js";
import { usePlanificadorDeReuniones } from "../vista-modelo/usePlanificadorDeReuniones.js";
import FondoWebThreads from "./fondos/FondoWebThreads.jsx";
import CajaVidrio from "./componentes/CajaVidrio.jsx";
import MarcaClack from "./componentes/MarcaClack.jsx";
import LineaDe24Horas from "./componentes/LineaDe24Horas.jsx";

export default function PantallaReunionCompartida({ reunion, alEntrarAClack }) {
  // Las ciudades se reconstruyen desde las zonas horarias del enlace.
  // No traen coordenadas, así que no hay temperatura ni hora del sol:
  // la franja de día y noche usa una aproximación (de 7 a 19).
  const ciudades = useMemo(
    () =>
      reunion.zonas.map(
        (zona) =>
          new Ciudad({
            id: zona,
            nombre: nombreDesdeZonaHoraria(zona),
            pais: "",
            zonaHoraria: zona,
          })
      ),
    [reunion.zonas]
  );

  const vm = usePlanificadorDeReuniones(ciudades, null);
  const horaMostrada = reunion.hora ?? vm.horaElegida;
  const dosDigitos = (n) => String(Math.floor(n)).padStart(2, "0");

  return (
    <div className="pantalla-login">
      <FondoWebThreads />

      <main className="pantalla-login__contenido pantalla-login__contenido--ancho">
        <CajaVidrio className="tarjeta" radio={32} como="section" aria-labelledby="tituloCompartida">
          <header className="tarjeta__encabezado">
            <MarcaClack />
          </header>

          <div>
            <h1 className="titulo" id="tituloCompartida">
              Te proponen las {dosDigitos(horaMostrada ?? 0)}:00
            </h1>
            <p className="subtitulo">
              Esta es la hora que sería en cada ciudad, según tu reloj.
            </p>
          </div>

          <ul className="resumen-reunion__lista">
            {ciudades.map((ciudad) => {
              const fila = vm.filas.find((f) => f.ciudad.id === ciudad.id);
              const casilla = fila?.casillas[horaMostrada ?? 0];
              if (!casilla) return null;
              return (
                <li key={ciudad.id} className={`resumen-reunion__item calidad-${casilla.calidad}`}>
                  <span className="resumen-reunion__lugar">{ciudad.nombre}</span>
                  <span className="resumen-reunion__hora">
                    {dosDigitos(casilla.horaLocal)}:00
                    {casilla.salto === 1 && <em> del día siguiente</em>}
                    {casilla.salto === -1 && <em> del día anterior</em>}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="tabla-horas tabla-horas--compacta">
            {vm.filas.map((fila) => (
              <LineaDe24Horas
                key={fila.ciudad.id}
                fila={fila}
                horaElegida={horaMostrada}
                horaDeAhora={vm.horaDeAhora}
                alElegirHora={vm.elegirHora}
              />
            ))}
          </div>

          <footer className="tarjeta__pie">
            <p>
              ¿Coordinas seguido con otros países?
              <br />
              Clack te guarda tus ciudades.
            </p>
            <button className="boton-vidrio" type="button" onClick={alEntrarAClack}>
              Probar Clack
            </button>
          </footer>
        </CajaVidrio>
      </main>
    </div>
  );
}

/**
 * SeccionReuniones.jsx
 * --------------------
 * El tercer piso del panel: "¿a qué hora hablamos?".
 *
 * Muestra un día entero de cada ciudad, marca las horas en las que todos
 * están despiertos y deja compartir la que se elija con un enlace.
 */
import { usePlanificadorDeReuniones } from "../../vista-modelo/usePlanificadorDeReuniones.js";
import { construirEnlaceDeReunion } from "../../modelo/EnlaceDeReunion.js";
import CajaVidrio from "./CajaVidrio.jsx";
import LineaDe24Horas from "./LineaDe24Horas.jsx";
import BotonCompartir from "./BotonCompartir.jsx";

export default function SeccionReuniones({ ciudades, climaPorCiudad }) {
  const vm = usePlanificadorDeReuniones(ciudades, climaPorCiudad);

  if (ciudades.length === 0) return null;

  const dosDigitos = (n) => String(Math.floor(n)).padStart(2, "0");

  return (
    <section className="seccion-reuniones" aria-labelledby="tituloReuniones">
      <div className="seccion-reuniones__contenido">
        <header className="seccion-reuniones__encabezado">
          <h2 className="seccion-reuniones__titulo" id="tituloReuniones">
            ¿A qué hora hablamos?
          </h2>
          <p className="seccion-reuniones__texto">
            Un día entero de cada ciudad. Las casillas claras son de día, las oscuras de
            noche, y la barra verde marca las horas de oficina. Pulsa cualquier hora.
          </p>
        </header>

        {/* Las mejores horas, como atajos */}
        <div className="seccion-reuniones__sugerencias">
          <span className="seccion-reuniones__etiqueta">
            {vm.hayHoraParaTodos ? "Mejores horas para todos:" : "Las mejores horas posibles:"}
          </span>
          {vm.mejoresHoras.slice(0, 5).map(({ hora, despiertas }) => (
            <button
              key={hora}
              type="button"
              className={"chip-hora" + (hora === vm.horaElegida ? " chip-hora--activa" : "")}
              onClick={() => vm.elegirHora(hora)}
              title={`${despiertas} de ${vm.totalDeCiudades} ciudades despiertas`}
            >
              {dosDigitos(hora)}:00
              <small>
                {despiertas}/{vm.totalDeCiudades}
              </small>
            </button>
          ))}
        </div>

        {!vm.hayHoraParaTodos && (
          <p className="seccion-reuniones__aviso">
            Con estas {vm.totalDeCiudades} ciudades no hay ninguna hora en la que todas estén
            despiertas: el mundo no da para tanto. Estas son las que más gente alcanzan.
          </p>
        )}

        {/* La tabla */}
        <CajaVidrio className="seccion-reuniones__tabla" radio={20}>
          <div className="tabla-horas">
            <div className="tabla-horas__regla" aria-hidden="true">
              <span className="tabla-horas__regla-titulo">Tu hora</span>
              <div className="tabla-horas__regla-numeros">
                {Array.from({ length: 24 }, (_, hora) => (
                  <span key={hora} className={hora % 3 === 0 ? "es-visible" : ""}>
                    {hora % 3 === 0 ? dosDigitos(hora) : ""}
                  </span>
                ))}
              </div>
            </div>

            {vm.filas.map((fila) => (
              <LineaDe24Horas
                key={fila.ciudad.id}
                fila={fila}
                horaElegida={vm.horaElegida}
                horaDeAhora={vm.horaDeAhora}
                alElegirHora={vm.elegirHora}
              />
            ))}
          </div>
        </CajaVidrio>

        {/* Qué pasa a la hora elegida */}
        {vm.horaElegida !== null && (
          <CajaVidrio className="resumen-reunion" radio={20}>
            <h3 className="resumen-reunion__titulo">
              Si quedan a las <strong>{dosDigitos(vm.horaElegida)}:00</strong> de tu hora…
            </h3>

            <ul className="resumen-reunion__lista">
              {vm.detalleDeLaHora.map((detalle) => (
                <li key={detalle.ciudad} className={`resumen-reunion__item calidad-${detalle.calidad}`}>
                  <span className="resumen-reunion__lugar">{detalle.ciudad}</span>
                  <span className="resumen-reunion__hora">
                    {dosDigitos(detalle.horaLocal)}:00
                    {detalle.salto === 1 && <em> del día siguiente</em>}
                    {detalle.salto === -1 && <em> del día anterior</em>}
                  </span>
                  <span className="resumen-reunion__estado">{textoDeCalidad(detalle.calidad)}</span>
                </li>
              ))}
            </ul>

            <BotonCompartir
              enlace={construirEnlaceDeReunion(ciudades, vm.horaElegida)}
              titulo={`Reunión a las ${dosDigitos(vm.horaElegida)}:00`}
            />
          </CajaVidrio>
        )}
      </div>
    </section>
  );
}

function textoDeCalidad(calidad) {
  if (calidad === "buena") return "hora de oficina";
  if (calidad === "aceptable") return "despierto";
  return "durmiendo";
}

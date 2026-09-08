/**
 * GestorDeAlarmas.jsx
 * -------------------
 * La ventana de avisos: "avísame cuando en Tokio sean las 9:00".
 */
import { useState } from "react";
import CampoSeleccion from "./CampoSeleccion.jsx";

export default function GestorDeAlarmas({ abierto, alCerrar, alarmas, ciudades }) {
  const [ciudadElegida, setCiudadElegida] = useState("");
  const [horaElegida, setHoraElegida] = useState("09:00");
  const [aviso, setAviso] = useState(null);

  if (!abierto) return null;

  const crear = async (evento) => {
    evento.preventDefault();
    const ciudad = ciudades.find((c) => c.nombre === ciudadElegida);
    if (!ciudad) {
      setAviso("Elige una ciudad.");
      return;
    }
    const [hora, minuto] = horaElegida.split(":").map(Number);
    await alarmas.agregar({ ciudad, hora, minuto });
    setAviso(null);
  };

  return (
    <div className="capa-modal" role="presentation" onClick={alCerrar}>
      <div
        className="gestor gestor--suelto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tituloAlarmas"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="gestor__cuerpo">
          <header className="gestor__encabezado">
            <div>
              <h2 className="gestor__titulo" id="tituloAlarmas">
                Mis avisos
              </h2>
              <p className="gestor__contador">
                {alarmas.alarmas.length === 0
                  ? "Todavía no tienes ninguno"
                  : `${alarmas.alarmas.length} aviso${alarmas.alarmas.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <button className="gestor__cerrar" type="button" onClick={alCerrar} aria-label="Cerrar">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <form className="formulario" onSubmit={crear}>
            <div className="formulario__pareja">
              <CampoSeleccion
                id="alarmaCiudad"
                etiqueta="Cuando en…"
                valor={ciudadElegida}
                alElegir={setCiudadElegida}
                marcador="Elige una ciudad"
                opciones={ciudades.map((c) => ({ codigo: c.id, nombre: c.nombre }))}
              />

              <div className="campo">
                <label className="campo__etiqueta" htmlFor="alarmaHora">
                  …sean las
                </label>
                <div className="campo__caja">
                  <input
                    id="alarmaHora"
                    className="campo__entrada"
                    type="time"
                    value={horaElegida}
                    onChange={(evento) => setHoraElegida(evento.target.value)}
                  />
                </div>
              </div>
            </div>

            {aviso && <p className="campo__error">{aviso}</p>}

            {alarmas.permiso === "denied" && (
              <p className="gestor__aviso">
                Bloqueaste las notificaciones, así que el aviso solo se verá si tienes Clack
                abierto. Puedes permitirlas desde el candado de la barra de direcciones.
              </p>
            )}

            <button className="boton-principal" type="submit">
              Crear aviso
            </button>
          </form>

          {alarmas.alarmas.length > 0 && (
            <ul className="gestor__lista">
              {alarmas.alarmas.map((alarma) => (
                <li className="gestor__ciudad" key={alarma.id}>
                  <span className="gestor__orden" aria-hidden="true">
                    ⏰
                  </span>
                  <span className="gestor__datos">
                    <strong>
                      {alarma.horaEnTexto} en {alarma.ciudadNombre}
                    </strong>
                    <small>{alarma.activa ? "Activo, todos los días" : "Pausado"}</small>
                  </span>
                  <span className="gestor__acciones">
                    <button
                      type="button"
                      onClick={() => alarmas.alternar(alarma.id)}
                      aria-label={alarma.activa ? "Pausar aviso" : "Activar aviso"}
                      title={alarma.activa ? "Pausar" : "Activar"}
                    >
                      {alarma.activa ? "⏸" : "▶"}
                    </button>
                    <button
                      type="button"
                      className="gestor__quitar"
                      onClick={() => alarmas.quitar(alarma.id)}
                      aria-label="Borrar aviso"
                      title="Borrar"
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

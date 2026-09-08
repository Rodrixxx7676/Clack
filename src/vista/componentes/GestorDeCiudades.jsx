/**
 * GestorDeCiudades.jsx
 * --------------------
 * La ventana para elegir tus ciudades: buscar cualquiera del mundo,
 * añadirla, quitarla o cambiarle el orden.
 *
 * Usa <dialog>, que es la ventana emergente del propio navegador: trae
 * gratis el fondo oscurecido, cerrar con Escape y el foco atrapado dentro.
 */
import { useEffect, useRef } from "react";
import { useBuscadorDeCiudades } from "../../vista-modelo/useBuscadorDeCiudades.js";

export default function GestorDeCiudades({ abierto, alCerrar, favoritos }) {
  const ventana = useRef(null);
  const buscador = useBuscadorDeCiudades();

  useEffect(() => {
    const elemento = ventana.current;
    if (!elemento) return;
    if (abierto && !elemento.open) elemento.showModal();
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  const cerrar = () => {
    buscador.limpiar();
    favoritos.limpiarError();
    alCerrar();
  };

  return (
    <dialog className="gestor" ref={ventana} onClose={cerrar} aria-labelledby="tituloGestor">
      <div className="gestor__cuerpo">
        <header className="gestor__encabezado">
          <div>
            <h2 className="gestor__titulo" id="tituloGestor">
              Mis ciudades
            </h2>
            <p className="gestor__contador">
              {favoritos.ciudades.length} de {favoritos.maximo}
            </p>
          </div>
          <button className="gestor__cerrar" type="button" onClick={cerrar} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {/* --- Buscar y añadir --- */}
        <div className="campo">
          <label className="campo__etiqueta" htmlFor="buscadorCiudades">
            Añadir una ciudad
          </label>
          <div className="campo__caja">
            <input
              id="buscadorCiudades"
              className="campo__entrada"
              type="search"
              placeholder="Escribe: Madrid, Bogotá, Tokio…"
              value={buscador.texto}
              onChange={(evento) => buscador.escribir(evento.target.value)}
              disabled={favoritos.estaLlena}
              autoComplete="off"
            />
          </div>
          {favoritos.estaLlena && (
            <small className="campo__error">
              Ya tienes {favoritos.maximo} ciudades. Quita una para añadir otra.
            </small>
          )}
        </div>

        {buscador.buscando && <p className="gestor__aviso">Buscando…</p>}

        {buscador.resultados.length > 0 && (
          <ul className="gestor__resultados">
            {buscador.resultados.map((ciudad) => (
              <li key={ciudad.id}>
                <button
                  type="button"
                  className="gestor__resultado"
                  onClick={() => {
                    favoritos.agregar(ciudad);
                    buscador.limpiar();
                  }}
                  disabled={favoritos.estaLlena}
                >
                  <span className="gestor__resultado-nombre">{ciudad.nombre}</span>
                  <span className="gestor__resultado-lugar">{ciudad.descripcion}</span>
                  <span className="gestor__resultado-mas" aria-hidden="true">
                    +
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {favoritos.error && (
          <p className="alerta" role="alert">
            {favoritos.error}
          </p>
        )}

        {/* --- Las que ya están --- */}
        <ol className="gestor__lista">
          {favoritos.ciudades.map((ciudad, posicion) => (
            <li className="gestor__ciudad" key={ciudad.id}>
              <span className="gestor__orden">{posicion + 1}</span>

              <span className="gestor__datos">
                <strong>{ciudad.nombre}</strong>
                <small>{ciudad.pais}</small>
              </span>

              <span className="gestor__acciones">
                <button
                  type="button"
                  onClick={() => favoritos.mover(ciudad.id, -1)}
                  disabled={posicion === 0}
                  aria-label={`Subir ${ciudad.nombre}`}
                  title="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => favoritos.mover(ciudad.id, 1)}
                  disabled={posicion === favoritos.ciudades.length - 1}
                  aria-label={`Bajar ${ciudad.nombre}`}
                  title="Bajar"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="gestor__quitar"
                  onClick={() => favoritos.quitar(ciudad.id)}
                  disabled={favoritos.ciudades.length <= 1}
                  aria-label={`Quitar ${ciudad.nombre}`}
                  title="Quitar"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </dialog>
  );
}

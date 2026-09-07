/**
 * EncabezadoPanel.jsx
 * -------------------
 * La barra de arriba del panel: la marca, el saludo y el botón de salir.
 */
import CajaVidrio from "./CajaVidrio.jsx";
import MarcaClack from "./MarcaClack.jsx";

export default function EncabezadoPanel({ nombreDeUsuario, horaLocal, alCerrarSesion }) {
  return (
    <CajaVidrio className="encabezado-panel" como="header">
      <MarcaClack />

      <div className="encabezado-panel__usuario">
        <p className="encabezado-panel__saludo">
          Hola, <strong>{nombreDeUsuario}</strong>
        </p>
        <p className="encabezado-panel__hora">Son las {horaLocal} donde estás</p>
      </div>

      <button className="boton-vidrio" type="button" onClick={alCerrarSesion}>
        Cerrar sesión
      </button>
    </CajaVidrio>
  );
}

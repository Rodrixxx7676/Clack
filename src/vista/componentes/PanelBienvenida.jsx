/**
 * PanelBienvenida.jsx — Lo que se ve justo después de entrar.
 * Más adelante, este panel dará paso al mapa de horas y temperaturas.
 */
export default function PanelBienvenida({ nombre, alCerrarSesion }) {
  return (
    <section className="bienvenida vidrio" aria-live="polite">
      <svg className="bienvenida__icono" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 12.4 10.9 15 16 9.5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h2>Bienvenida, {nombre}</h2>
      <p>
        Tu sesión está lista. El mapa de horas y temperaturas del mundo llega en el
        siguiente paso.
      </p>
      <button className="boton-vidrio" type="button" onClick={alCerrarSesion}>
        Cerrar sesión
      </button>
    </section>
  );
}

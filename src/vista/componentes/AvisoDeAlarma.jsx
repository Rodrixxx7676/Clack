/**
 * AvisoDeAlarma.jsx — El cartel que aparece cuando suena un aviso.
 * Sirve de respaldo por si la persona no dio permiso a las
 * notificaciones del sistema, o si tiene Clack delante.
 */
export default function AvisoDeAlarma({ texto, alCerrar }) {
  if (!texto) return null;

  return (
    <div className="aviso-alarma" role="status">
      <span className="aviso-alarma__icono" aria-hidden="true">
        ⏰
      </span>
      <p>{texto}</p>
      <button type="button" onClick={alCerrar} aria-label="Cerrar aviso">
        ×
      </button>
    </div>
  );
}

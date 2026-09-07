/**
 * RelojLocal.jsx — Muestra la hora, la fecha y la zona horaria del dispositivo.
 * Los datos vienen del hook useRelojLocal: aquí solo se pintan.
 */
export default function RelojLocal({ hora, fecha, zonaHoraria }) {
  return (
    <div className="reloj-local">
      <p className="reloj-local__hora">{hora}</p>
      <p className="reloj-local__fecha">{fecha}</p>
      <p className="reloj-local__zona">{zonaHoraria}</p>
    </div>
  );
}

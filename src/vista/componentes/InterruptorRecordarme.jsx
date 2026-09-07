/**
 * InterruptorRecordarme.jsx — El interruptor de "Recordarme".
 */
export default function InterruptorRecordarme({ activo, alCambiar }) {
  return (
    <label className="interruptor">
      <input
        type="checkbox"
        checked={activo}
        onChange={(evento) => alCambiar(evento.target.checked)}
      />
      <span className="interruptor__marca" aria-hidden="true" />
      <span>Recordarme</span>
    </label>
  );
}

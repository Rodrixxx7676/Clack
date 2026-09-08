/**
 * CampoSeleccion.jsx — Un desplegable del formulario, con su etiqueta y su error.
 * Mismo aspecto que CampoTexto, para que el formulario se vea parejo.
 */
export default function CampoSeleccion({
  id,
  etiqueta,
  valor,
  alElegir,
  alSalir,
  error = null,
  marcador = "Elige una opción",
  opciones = [],
}) {
  const idError = `${id}-error`;

  return (
    <div className="campo">
      <label className="campo__etiqueta" htmlFor={id}>
        {etiqueta}
      </label>

      <div className="campo__caja">
        <select
          id={id}
          className={"campo__entrada campo__seleccion" + (error ? " campo__entrada--con-error" : "")}
          value={valor}
          onChange={(evento) => alElegir(evento.target.value)}
          onBlur={alSalir}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? idError : undefined}
        >
          <option value="">{marcador}</option>
          {opciones.map((opcion) => (
            <option key={opcion.codigo ?? opcion} value={opcion.nombre ?? opcion}>
              {opcion.nombre ?? opcion}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <small className="campo__error" id={idError}>
          {error}
        </small>
      )}
    </div>
  );
}

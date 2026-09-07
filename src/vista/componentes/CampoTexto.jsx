/**
 * CampoTexto.jsx — Un campo del formulario: etiqueta, caja y mensaje de error.
 *
 * Sirve para cualquier pantalla. No decide nada: recibe el valor y avisa
 * hacia arriba cuando el usuario escribe.
 */
export default function CampoTexto({
  id,
  etiqueta,
  valor,
  alEscribir,
  alSalir,
  error = null,
  tipo = "text",
  children, // botón opcional dentro del campo (por ejemplo, el ojo)
  ...restoDeAtributos
}) {
  const idError = `${id}-error`;

  return (
    <div className="campo">
      <label className="campo__etiqueta" htmlFor={id}>
        {etiqueta}
      </label>

      <div className="campo__caja">
        <input
          id={id}
          type={tipo}
          className={
            "campo__entrada" +
            (children ? " campo__entrada--con-boton" : "") +
            (error ? " campo__entrada--con-error" : "")
          }
          value={valor}
          onChange={(evento) => alEscribir(evento.target.value)}
          onBlur={alSalir}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? idError : undefined}
          {...restoDeAtributos}
        />
        {children}
      </div>

      {error && (
        <small className="campo__error" id={idError}>
          {error}
        </small>
      )}
    </div>
  );
}

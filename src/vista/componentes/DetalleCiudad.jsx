/**
 * DetalleCiudad.jsx
 * -----------------
 * La ficha de la ciudad que está en el centro del carrusel:
 * su nombre, la hora que es allá ahora mismo y cuánto se diferencia de la tuya.
 */
export default function DetalleCiudad({
  nombre,
  pais,
  hora,
  fecha,
  esDeDia,
  diferenciaContigo,
}) {
  return (
    <section className="detalle-ciudad vidrio" aria-live="polite">
      <div className="detalle-ciudad__lugar">
        <h2 className="detalle-ciudad__nombre">{nombre}</h2>
        <p className="detalle-ciudad__pais">{pais}</p>
      </div>

      <div className="detalle-ciudad__reloj">
        <p className="detalle-ciudad__hora">
          <IconoDelCielo esDeDia={esDeDia} />
          {hora}
        </p>
        <p className="detalle-ciudad__fecha">{fecha}</p>
      </div>

      <div className="detalle-ciudad__datos">
        <span className="etiqueta-dato">{diferenciaContigo}</span>
        <span className="etiqueta-dato etiqueta-dato--pendiente" title="Llega en el siguiente paso">
          Temperatura pronto
        </span>
      </div>
    </section>
  );
}

/** Un sol si allá es de día, una luna si es de noche. */
function IconoDelCielo({ esDeDia }) {
  return (
    <svg
      className="detalle-ciudad__icono"
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label={esDeDia ? "Es de día" : "Es de noche"}
    >
      {esDeDia ? (
        <>
          <circle cx="12" cy="12" r="4.4" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </>
      ) : (
        <path
          d="M20 13.4A8.2 8.2 0 0 1 10.6 4a8.4 8.4 0 1 0 9.4 9.4Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

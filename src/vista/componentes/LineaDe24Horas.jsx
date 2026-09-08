/**
 * LineaDe24Horas.jsx
 * ------------------
 * La franja de un día entero de una ciudad: 24 casillas.
 *
 * Cada casilla dice dos cosas a la vez:
 *   · el color de fondo → si allá es de día o de noche
 *   · la barra de abajo → si es buena hora para hablar
 */
export default function LineaDe24Horas({ fila, horaElegida, horaDeAhora, alElegirHora }) {
  const { ciudad, casillas, clima } = fila;

  return (
    <div className="linea-horas">
      <div className="linea-horas__ciudad">
        <strong>{ciudad.nombre}</strong>
        <small>{fila.desfase === 0 ? "tu hora" : formatearDesfase(fila.desfase)}</small>
      </div>

      <div className="linea-horas__casillas" role="group" aria-label={`Horas en ${ciudad.nombre}`}>
        {casillas.map((casilla) => (
          <button
            key={casilla.hora}
            type="button"
            className={
              "casilla" +
              (casilla.esDeDia ? " casilla--dia" : " casilla--noche") +
              ` casilla--${casilla.calidad}` +
              (casilla.hora === horaElegida ? " casilla--elegida" : "") +
              (casilla.hora === horaDeAhora ? " casilla--ahora" : "")
            }
            onClick={() => alElegirHora(casilla.hora)}
            title={`${dosDigitos(casilla.hora)}:00 aquí = ${dosDigitos(casilla.horaLocal)}:00 en ${ciudad.nombre}`}
            aria-label={`${dosDigitos(casilla.hora)}:00 aquí, ${dosDigitos(casilla.horaLocal)}:00 en ${ciudad.nombre}`}
            aria-pressed={casilla.hora === horaElegida}
          >
            <span className="casilla__hora">{dosDigitos(casilla.horaLocal)}</span>
          </button>
        ))}
      </div>

      {clima?.amanecer !== null && clima?.amanecer !== undefined && (
        <div className="linea-horas__sol" aria-hidden="true">
          ☀ {formatearHora(clima.amanecer)} · ☾ {formatearHora(clima.atardecer)}
        </div>
      )}
    </div>
  );
}

const dosDigitos = (numero) => String(Math.floor(numero)).padStart(2, "0");

function formatearHora(horaDecimal) {
  const horas = Math.floor(horaDecimal);
  const minutos = Math.round((horaDecimal - horas) * 60);
  return `${dosDigitos(horas)}:${String(minutos).padStart(2, "0")}`;
}

function formatearDesfase(desfase) {
  const signo = desfase > 0 ? "+" : "−";
  const absoluto = Math.abs(desfase);
  const horas = Math.floor(absoluto);
  const minutos = Math.round((absoluto - horas) * 60);
  return minutos === 0 ? `${signo}${horas} h` : `${signo}${horas}:${String(minutos).padStart(2, "0")} h`;
}

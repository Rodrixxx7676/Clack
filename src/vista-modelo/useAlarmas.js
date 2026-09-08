/**
 * useAlarmas.js
 * -------------
 * Los avisos por hora de otra ciudad: crearlos, borrarlos y hacerlos
 * sonar cuando toca.
 *
 * El aviso llega como notificación del sistema. Hace falta que la
 * persona dé permiso la primera vez; si no lo da, el aviso se muestra
 * igualmente dentro de la página.
 */
import { useCallback, useEffect, useState } from "react";
import { Alarma, almacenDeAlarmas } from "../modelo/AlmacenDeAlarmas.js";
import { useMomentoActual } from "./useMomentoActual.js";

export function useAlarmas() {
  const momento = useMomentoActual();
  const [alarmas, setAlarmas] = useState(() => almacenDeAlarmas.leer());
  const [ultimoAviso, setUltimoAviso] = useState(null);
  const [permiso, setPermiso] = useState(
    () => (typeof Notification !== "undefined" ? Notification.permission : "no disponible")
  );

  const guardar = useCallback((nuevas) => {
    setAlarmas(nuevas);
    almacenDeAlarmas.guardar(nuevas);
  }, []);

  /** Revisa cada segundo si a alguna alarma le toca sonar. */
  useEffect(() => {
    const queSuenan = alarmas.filter((alarma) => alarma.debeSonar(momento));
    if (queSuenan.length === 0) return;

    for (const alarma of queSuenan) {
      const texto = `Son las ${alarma.horaEnTexto} en ${alarma.ciudadNombre}`;
      setUltimoAviso(texto);

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Clack", { body: texto, icon: "/iconos/icono-192.png", tag: alarma.id });
      }
    }

    // Se anota el día para que no vuelva a sonar hasta mañana.
    guardar(
      alarmas.map((alarma) =>
        queSuenan.includes(alarma)
          ? new Alarma({ ...alarma, avisadaEn: alarma.diaDeAlla(momento) })
          : alarma
      )
    );
  }, [alarmas, guardar, momento]);

  const pedirPermiso = useCallback(async () => {
    if (typeof Notification === "undefined") return "no disponible";
    const resultado = await Notification.requestPermission();
    setPermiso(resultado);
    return resultado;
  }, []);

  const agregar = useCallback(
    async ({ ciudad, hora, minuto }) => {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        await pedirPermiso();
      }
      guardar([
        ...alarmas,
        new Alarma({
          ciudadId: ciudad.id,
          ciudadNombre: ciudad.nombre,
          zonaHoraria: ciudad.zonaHoraria,
          hora,
          minuto,
        }),
      ]);
    },
    [alarmas, guardar, pedirPermiso]
  );

  const quitar = useCallback(
    (id) => guardar(alarmas.filter((a) => a.id !== id)),
    [alarmas, guardar]
  );

  const alternar = useCallback(
    (id) =>
      guardar(
        alarmas.map((a) => (a.id === id ? new Alarma({ ...a, activa: !a.activa, avisadaEn: null }) : a))
      ),
    [alarmas, guardar]
  );

  return {
    alarmas,
    permiso,
    ultimoAviso,
    descartarAviso: () => setUltimoAviso(null),
    pedirPermiso,
    agregar,
    quitar,
    alternar,
  };
}

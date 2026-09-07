/**
 * useSesion.js
 * ------------
 * Quién está usando Clack en este momento.
 *
 * Vive en la raíz de la app (App.jsx) porque manda sobre qué pantalla se ve:
 * sin usuario se muestra el Login, con usuario se muestra el panel de inicio.
 */
import { useCallback, useState } from "react";
import { ServicioAutenticacion } from "../modelo/ServicioAutenticacion.js";

const servicioPorDefecto = new ServicioAutenticacion();

export function useSesion(servicio = servicioPorDefecto) {
  // Si el usuario había marcado "Recordarme", entra directo.
  const [usuario, setUsuario] = useState(() => servicio.recuperarSesion());

  /** Entra a la app. Si las credenciales fallan, lanza un error con el mensaje. */
  const entrar = useCallback(
    async (credenciales) => {
      const usuarioQueEntro = await servicio.iniciarSesion(credenciales);
      setUsuario(usuarioQueEntro);
      return usuarioQueEntro;
    },
    [servicio]
  );

  const salir = useCallback(() => {
    servicio.cerrarSesion();
    setUsuario(null);
  }, [servicio]);

  return { usuario, entrar, salir };
}

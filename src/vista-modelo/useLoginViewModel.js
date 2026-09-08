/**
 * useLoginViewModel.js
 * --------------------
 * El "cerebro" de la pantalla de Login.
 *
 * En React, el ViewModel de MVVM se escribe como un hook: guarda el estado
 * de la pantalla y las acciones que se pueden hacer en ella.
 * No sabe nada de HTML ni de estilos: solo devuelve datos y funciones.
 *
 * Quién queda conectado NO se decide aquí, sino en useSesion (App.jsx).
 * Este hook solo recibe la función `entrar` y avisa si algo salió mal.
 */
import { useCallback, useState } from "react";
import { ServicioAutenticacion } from "../modelo/ServicioAutenticacion.js";
import { ServicioRecaptcha } from "../modelo/ServicioRecaptcha.js";
import { revisarCorreo, revisarContrasena } from "../modelo/ValidadorCredenciales.js";

// Una sola instancia para toda la pantalla.
const recaptchaPorDefecto = new ServicioRecaptcha();

export function useLoginViewModel({ entrar, recaptcha = recaptchaPorDefecto }) {
  // Lo que el usuario escribe.
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [recordarme, setRecordarme] = useState(false);

  // Cómo se ve la pantalla.
  const [errorCorreo, setErrorCorreo] = useState(null);
  const [errorContrasena, setErrorContrasena] = useState(null);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [cargando, setCargando] = useState(false);

  const escribirCorreo = useCallback((texto) => {
    setCorreo(texto);
    setErrorCorreo(null); // no regañamos mientras escribe
    setErrorGeneral(null);
  }, []);

  const escribirContrasena = useCallback((texto) => {
    setContrasena(texto);
    setErrorContrasena(null);
    setErrorGeneral(null);
  }, []);

  /** El error aparece recién cuando el usuario sale del campo. */
  const validarCorreoAlSalir = useCallback(() => {
    if (correo.length === 0) return;
    setErrorCorreo(revisarCorreo(correo));
  }, [correo]);

  const validarContrasenaAlSalir = useCallback(() => {
    if (contrasena.length === 0) return;
    setErrorContrasena(revisarContrasena(contrasena));
  }, [contrasena]);

  /** Rellena el formulario con la cuenta de prueba. */
  const usarCuentaDemo = useCallback(() => {
    const cuenta = ServicioAutenticacion.cuentaDemo;
    escribirCorreo(cuenta.correo);
    escribirContrasena(cuenta.contrasena);
  }, [escribirCorreo, escribirContrasena]);

  const iniciarSesion = useCallback(async () => {
    if (cargando) return;

    const fallaCorreo = revisarCorreo(correo);
    const fallaContrasena = revisarContrasena(contrasena);
    setErrorCorreo(fallaCorreo);
    setErrorContrasena(fallaContrasena);
    if (fallaCorreo || fallaContrasena) return;

    setCargando(true);
    setErrorGeneral(null);
    try {
      // Primero: comprobar que quien entra es una persona.
      const comprobacion = await recaptcha.comprobar("iniciar_sesion");
      if (!comprobacion.aprobado) {
        setErrorGeneral(
          "No pudimos confirmar que eres una persona. Recarga la página e inténtalo otra vez."
        );
        setCargando(false);
        return;
      }

      await entrar({ correo, contrasena, recordarme });
      // Si todo salió bien, App.jsx cambia solo a la pantalla del panel.
    } catch (error) {
      setErrorGeneral(error.message);
      setCargando(false);
    }
  }, [cargando, contrasena, correo, entrar, recaptcha, recordarme]);

  const mostrarAyudaContrasena = useCallback((correoSoporte) => {
    setErrorGeneral(`Escríbenos a ${correoSoporte} y te ayudamos a recuperarla.`);
  }, []);

  return {
    // Estado
    correo,
    contrasena,
    recordarme,
    errorCorreo,
    errorContrasena,
    errorGeneral,
    cargando,
    puedeEnviar: correo.trim().length > 0 && contrasena.length > 0,
    // Acciones
    escribirCorreo,
    escribirContrasena,
    cambiarRecordarme: setRecordarme,
    validarCorreoAlSalir,
    validarContrasenaAlSalir,
    usarCuentaDemo,
    iniciarSesion,
    mostrarAyudaContrasena,
  };
}

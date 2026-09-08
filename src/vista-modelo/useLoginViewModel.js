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
 * La comprobación de la contraseña y el reCAPTCHA ocurren en el servidor.
 */
import { useCallback, useState } from "react";
import { ServicioAutenticacion } from "../modelo/ServicioAutenticacion.js";
import { revisarCorreo, revisarContrasena } from "../modelo/ValidadorCredenciales.js";

export function useLoginViewModel({ entrar }) {
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
      // El servicio pide la ficha de reCAPTCHA y la envía junto con los
      // datos; el servidor la verifica antes de comprobar la contraseña.
      await entrar({ correo, contrasena, recordarme });
      // Si todo salió bien, App.jsx cambia solo a la pantalla del panel.
    } catch (error) {
      setErrorGeneral(error.message);
      setCargando(false);
    }
  }, [cargando, contrasena, correo, entrar, recordarme]);

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

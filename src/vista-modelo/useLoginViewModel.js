/**
 * useLoginViewModel.js
 * --------------------
 * El "cerebro" de la pantalla de Login.
 *
 * En React, el ViewModel de MVVM se escribe como un hook: guarda el estado
 * de la pantalla y las acciones que se pueden hacer en ella.
 * No sabe nada de HTML ni de estilos: solo devuelve datos y funciones.
 */
import { useCallback, useState } from "react";
import { ServicioAutenticacion } from "../modelo/ServicioAutenticacion.js";
import { revisarCorreo, revisarContrasena } from "../modelo/ValidadorCredenciales.js";

// Una sola instancia para toda la app.
const servicioPorDefecto = new ServicioAutenticacion();

export function useLoginViewModel(servicio = servicioPorDefecto) {
  // Lo que el usuario escribe.
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [recordarme, setRecordarme] = useState(false);

  // Cómo se ve la pantalla.
  const [errorCorreo, setErrorCorreo] = useState(null);
  const [errorContrasena, setErrorContrasena] = useState(null);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Quién entró (null mientras nadie ha entrado).
  const [usuarioConectado, setUsuarioConectado] = useState(() => servicio.recuperarSesion());

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
      const usuario = await servicio.iniciarSesion({ correo, contrasena, recordarme });
      setUsuarioConectado(usuario);
    } catch (error) {
      setErrorGeneral(error.message);
    } finally {
      setCargando(false);
    }
  }, [cargando, contrasena, correo, recordarme, servicio]);

  const cerrarSesion = useCallback(() => {
    servicio.cerrarSesion();
    setUsuarioConectado(null);
    setCorreo("");
    setContrasena("");
    setErrorCorreo(null);
    setErrorContrasena(null);
    setErrorGeneral(null);
  }, [servicio]);

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
    usuarioConectado,
    puedeEnviar: correo.trim().length > 0 && contrasena.length > 0,
    // Acciones
    escribirCorreo,
    escribirContrasena,
    cambiarRecordarme: setRecordarme,
    validarCorreoAlSalir,
    validarContrasenaAlSalir,
    usarCuentaDemo,
    iniciarSesion,
    cerrarSesion,
    mostrarAyudaContrasena,
  };
}

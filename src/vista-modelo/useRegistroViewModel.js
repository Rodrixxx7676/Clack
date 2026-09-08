/**
 * useRegistroViewModel.js
 * -----------------------
 * El "cerebro" de la pantalla de crear cuenta.
 *
 * Guarda lo que el usuario escribe, avisa de los errores campo por campo
 * y le pide al servidor que cree la cuenta. Las reglas de qué es válido
 * están en comun/reglasDeUsuario.js, las mismas que usa el servidor.
 */
import { useCallback, useMemo, useState } from "react";
import {
  revisarNombre,
  revisarApellido,
  revisarCorreo,
  revisarContrasena,
  revisarRepeticionDeContrasena,
  revisarFechaDeNacimiento,
  revisarPais,
  revisarRegistro,
} from "../modelo/ValidadorCredenciales.js";
import { paisProbable } from "../modelo/paises.js";

const CAMPOS_VACIOS = {
  nombre: "",
  apellido: "",
  correo: "",
  contrasena: "",
  repeticion: "",
  fechaDeNacimiento: "",
  paisDeOrigen: "",
};

// Qué función revisa cada campo cuando el usuario sale de él.
const REVISORES = {
  nombre: revisarNombre,
  apellido: revisarApellido,
  correo: revisarCorreo,
  contrasena: revisarContrasena,
  fechaDeNacimiento: revisarFechaDeNacimiento,
  paisDeOrigen: revisarPais,
};

export function useRegistroViewModel({ registrar }) {
  const [campos, setCampos] = useState(() => ({
    ...CAMPOS_VACIOS,
    paisDeOrigen: paisProbable(), // se adivina por la zona horaria
  }));
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [cargando, setCargando] = useState(false);

  /** Un solo manejador para todos los campos. */
  const escribir = useCallback((campo, valor) => {
    setCampos((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: null }));
    setErrorGeneral(null);
  }, []);

  /** El error aparece recién cuando el usuario sale del campo. */
  const revisarAlSalir = useCallback(
    (campo) => {
      const valor = campos[campo];
      if (campo !== "paisDeOrigen" && String(valor).length === 0) return;

      const revisor = REVISORES[campo];
      const error =
        campo === "repeticion"
          ? revisarRepeticionDeContrasena(campos.contrasena, campos.repeticion)
          : revisor?.(valor);

      setErrores((anteriores) => ({ ...anteriores, [campo]: error ?? null }));
    },
    [campos]
  );

  const crearCuenta = useCallback(async () => {
    if (cargando) return;

    const encontrados = revisarRegistro(campos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      setErrorGeneral(null);
      return;
    }

    setCargando(true);
    setErrorGeneral(null);
    try {
      await registrar({
        nombre: campos.nombre.trim(),
        apellido: campos.apellido.trim(),
        correo: campos.correo.trim(),
        contrasena: campos.contrasena,
        repeticion: campos.repeticion,
        fechaDeNacimiento: campos.fechaDeNacimiento,
        paisDeOrigen: campos.paisDeOrigen,
      });
      // Si sale bien, App.jsx cambia solo al panel de inicio.
    } catch (error) {
      // El servidor puede devolver errores campo por campo (por ejemplo,
      // que el correo ya está registrado). Si los hay, se muestran junto
      // al campo y no se repite el aviso de arriba.
      if (error.errores && Object.keys(error.errores).length > 0) {
        setErrores(error.errores);
        setErrorGeneral(null);
      } else {
        setErrorGeneral(error.message);
      }
      setCargando(false);
    }
  }, [campos, cargando, registrar]);

  const puedeEnviar = useMemo(
    () => Object.values(campos).every((valor) => String(valor).trim().length > 0),
    [campos]
  );

  return { campos, errores, errorGeneral, cargando, puedeEnviar, escribir, revisarAlSalir, crearCuenta };
}

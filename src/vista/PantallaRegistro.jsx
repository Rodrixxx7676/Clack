/**
 * PantallaRegistro.jsx
 * --------------------
 * La Vista de "crear cuenta".
 *
 * Regla de oro de MVVM: aquí NO se decide nada. Se pide el estado al
 * ViewModel (useRegistroViewModel) y se pinta.
 *
 * Los campos son los de la entidad USUARIO de la planificación. El
 * identificador y la fecha de registro los pone el servidor.
 */
import { useRegistroViewModel } from "../vista-modelo/useRegistroViewModel.js";
import { PAISES } from "../modelo/paises.js";
import FondoWebThreads from "./fondos/FondoWebThreads.jsx";
import CajaVidrio from "./componentes/CajaVidrio.jsx";
import MarcaClack from "./componentes/MarcaClack.jsx";
import CampoTexto from "./componentes/CampoTexto.jsx";
import CampoContrasena from "./componentes/CampoContrasena.jsx";
import CampoSeleccion from "./componentes/CampoSeleccion.jsx";

export default function PantallaRegistro({ alRegistrar, alVolverAlLogin }) {
  const vm = useRegistroViewModel({ registrar: alRegistrar });

  const enviarFormulario = (evento) => {
    evento.preventDefault();
    vm.crearCuenta();
  };

  // Un campo de texto normal, ya enlazado al ViewModel.
  const campo = (nombre, etiqueta, extras = {}) => (
    <CampoTexto
      id={`campo-${nombre}`}
      etiqueta={etiqueta}
      valor={vm.campos[nombre]}
      alEscribir={(texto) => vm.escribir(nombre, texto)}
      alSalir={() => vm.revisarAlSalir(nombre)}
      error={vm.errores[nombre]}
      {...extras}
    />
  );

  return (
    <div className="pantalla-login">
      <FondoWebThreads />

      <main className="pantalla-login__contenido pantalla-login__contenido--ancho">
        <CajaVidrio
          className={"tarjeta" + (vm.cargando ? " tarjeta--ocupada" : "")}
          radio={32}
          como="section"
          aria-labelledby="tituloRegistro"
        >
          <header className="tarjeta__encabezado">
            <MarcaClack />
          </header>

          <div>
            <h1 className="titulo" id="tituloRegistro">
              Crea tu cuenta
            </h1>
            <p className="subtitulo">
              Guarda tus ciudades favoritas y llévalas contigo a cualquier dispositivo.
            </p>
          </div>

          <form className="formulario" onSubmit={enviarFormulario} noValidate>
            <div className="formulario__pareja">
              {campo("nombre", "Nombre", { autoComplete: "given-name", placeholder: "Ana" })}
              {campo("apellido", "Apellido", { autoComplete: "family-name", placeholder: "Pérez" })}
            </div>

            {campo("correo", "Correo electrónico", {
              tipo: "email",
              inputMode: "email",
              autoComplete: "email",
              placeholder: "tu@correo.com",
            })}

            <div className="formulario__pareja">
              {campo("fechaDeNacimiento", "Fecha de nacimiento", {
                tipo: "date",
                autoComplete: "bday",
                max: new Date().toISOString().slice(0, 10),
              })}

              <CampoSeleccion
                id="campo-paisDeOrigen"
                etiqueta="País de origen"
                valor={vm.campos.paisDeOrigen}
                alElegir={(valor) => vm.escribir("paisDeOrigen", valor)}
                alSalir={() => vm.revisarAlSalir("paisDeOrigen")}
                error={vm.errores.paisDeOrigen}
                marcador="Elige tu país"
                opciones={PAISES}
              />
            </div>

            <CampoContrasena
              id="campo-contrasena"
              etiqueta="Contraseña"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres, con letras y números"
              valor={vm.campos.contrasena}
              alEscribir={(texto) => vm.escribir("contrasena", texto)}
              alSalir={() => vm.revisarAlSalir("contrasena")}
              error={vm.errores.contrasena}
            />

            <CampoContrasena
              id="campo-repeticion"
              etiqueta="Repite la contraseña"
              autoComplete="new-password"
              placeholder="La misma de arriba"
              valor={vm.campos.repeticion}
              alEscribir={(texto) => vm.escribir("repeticion", texto)}
              alSalir={() => vm.revisarAlSalir("repeticion")}
              error={vm.errores.repeticion}
            />

            {vm.errorGeneral && (
              <p className="alerta" role="alert">
                {vm.errorGeneral}
              </p>
            )}

            <button
              className={"boton-principal" + (vm.cargando ? " boton-principal--cargando" : "")}
              type="submit"
              disabled={vm.cargando}
            >
              {vm.cargando ? "Creando tu cuenta…" : "Crear cuenta"}
            </button>

            <p className="formulario__aviso">
              Protegido por reCAPTCHA de Google. Se aplican su{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
                Política de Privacidad
              </a>{" "}
              y sus{" "}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">
                Términos del Servicio
              </a>
              .
            </p>
          </form>

          <footer className="tarjeta__pie">
            <p>¿Ya tienes cuenta?</p>
            <button className="boton-vidrio" type="button" onClick={alVolverAlLogin}>
              Iniciar sesión
            </button>
          </footer>
        </CajaVidrio>
      </main>
    </div>
  );
}

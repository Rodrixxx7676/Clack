/**
 * PantallaLogin.jsx
 * -----------------
 * La Vista de la pantalla de inicio de sesión.
 *
 * Regla de oro de MVVM: aquí NO se decide nada.
 * Se pide el estado al ViewModel (useLoginViewModel) y se pinta.
 *
 * Cuando el usuario entra bien, App.jsx cambia solo al panel de inicio.
 */
import { useLoginViewModel } from "../vista-modelo/useLoginViewModel.js";
import { useRelojLocal } from "../vista-modelo/useRelojLocal.js";
import FondoWebThreads from "./fondos/FondoWebThreads.jsx";
import CajaVidrio from "./componentes/CajaVidrio.jsx";
import MarcaClack from "./componentes/MarcaClack.jsx";
import RelojLocal from "./componentes/RelojLocal.jsx";
import CampoTexto from "./componentes/CampoTexto.jsx";
import CampoContrasena from "./componentes/CampoContrasena.jsx";
import InterruptorRecordarme from "./componentes/InterruptorRecordarme.jsx";

const CORREO_SOPORTE = "hola@clack.app";

export default function PantallaLogin({ alEntrar, alQuererRegistrarse }) {
  const vm = useLoginViewModel({ entrar: alEntrar });
  const reloj = useRelojLocal();

  const enviarFormulario = (evento) => {
    evento.preventDefault();
    vm.iniciarSesion();
  };

  return (
    <div className="pantalla-login">
      <FondoWebThreads />

      <main className="pantalla-login__contenido">
        <CajaVidrio
          className={"tarjeta" + (vm.cargando ? " tarjeta--ocupada" : "")}
          radio={32}
          como="section"
          aria-labelledby="tituloLogin"
        >
          <header className="tarjeta__encabezado">
            <MarcaClack />
            <RelojLocal {...reloj} />
          </header>

          <div>
            <h1 className="titulo" id="tituloLogin">
              Hola de nuevo
            </h1>
            <p className="subtitulo">
              Entra para ver la hora y la temperatura de tus ciudades favoritas.
            </p>
          </div>

          <form className="formulario" onSubmit={enviarFormulario} noValidate>
            <CampoTexto
              id="campoCorreo"
              etiqueta="Correo electrónico"
              tipo="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              valor={vm.correo}
              alEscribir={vm.escribirCorreo}
              alSalir={vm.validarCorreoAlSalir}
              error={vm.errorCorreo}
            />

            <CampoContrasena
              id="campoContrasena"
              etiqueta="Contraseña"
              autoComplete="current-password"
              placeholder="Mínimo 8 caracteres"
              valor={vm.contrasena}
              alEscribir={vm.escribirContrasena}
              alSalir={vm.validarContrasenaAlSalir}
              error={vm.errorContrasena}
            />

            <div className="formulario__opciones">
              <InterruptorRecordarme
                activo={vm.recordarme}
                alCambiar={vm.cambiarRecordarme}
              />
              <button
                className="enlace"
                type="button"
                onClick={() => vm.mostrarAyudaContrasena(CORREO_SOPORTE)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

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
              {vm.cargando ? "Entrando…" : "Entrar"}
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

          <footer className="tarjeta__pie tarjeta__pie--doble">
            <div className="tarjeta__pie-fila">
              <p>
                ¿Todavía no tienes cuenta?
                <br />
                Se crea en un minuto.
              </p>
              <button className="boton-vidrio" type="button" onClick={alQuererRegistrarse}>
                Crear cuenta
              </button>
            </div>

            <div className="tarjeta__pie-fila">
              <p>¿Solo quieres mirar? Usa la cuenta de prueba.</p>
              <button className="enlace" type="button" onClick={vm.usarCuentaDemo}>
                Usar cuenta demo
              </button>
            </div>
          </footer>
        </CajaVidrio>
      </main>
    </div>
  );
}

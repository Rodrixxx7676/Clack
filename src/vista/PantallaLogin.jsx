/**
 * PantallaLogin.jsx
 * -----------------
 * La Vista de la pantalla de inicio de sesión.
 *
 * Regla de oro de MVVM: aquí NO se decide nada.
 * Se pide el estado al ViewModel (useLoginViewModel) y se pinta.
 */
import { useLoginViewModel } from "../vista-modelo/useLoginViewModel.js";
import { useRelojLocal } from "../vista-modelo/useRelojLocal.js";
import { useBrilloCursor } from "./efectos/useBrilloCursor.js";
import FondoWebThreads from "./fondos/FondoWebThreads.jsx";
import MarcaClack from "./componentes/MarcaClack.jsx";
import RelojLocal from "./componentes/RelojLocal.jsx";
import CampoTexto from "./componentes/CampoTexto.jsx";
import CampoContrasena from "./componentes/CampoContrasena.jsx";
import InterruptorRecordarme from "./componentes/InterruptorRecordarme.jsx";
import PanelBienvenida from "./componentes/PanelBienvenida.jsx";

const CORREO_SOPORTE = "hola@clack.app";

export default function PantallaLogin() {
  const vm = useLoginViewModel();
  const reloj = useRelojLocal();
  const brillo = useBrilloCursor();

  const enviarFormulario = (evento) => {
    evento.preventDefault();
    vm.iniciarSesion();
  };

  return (
    <div className="pantalla-login">
      <FondoWebThreads />

      <main className="pantalla-login__contenido">
        {vm.usuarioConectado ? (
          <PanelBienvenida
            nombre={vm.usuarioConectado.nombre}
            alCerrarSesion={vm.cerrarSesion}
          />
        ) : (
          <section
            className={"tarjeta vidrio" + (vm.cargando ? " tarjeta--ocupada" : "")}
            aria-labelledby="tituloLogin"
            {...brillo}
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
            </form>

            <footer className="tarjeta__pie">
              <p>
                ¿Solo quieres mirar?
                <br />
                Usa la cuenta de prueba.
              </p>
              <button className="boton-vidrio" type="button" onClick={vm.usarCuentaDemo}>
                Cuenta demo
              </button>
            </footer>
          </section>
        )}
      </main>
    </div>
  );
}

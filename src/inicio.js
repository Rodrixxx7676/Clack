/**
 * inicio.js
 * ---------
 * Punto de arranque de Clack: aquí se juntan las tres capas de MVVM.
 *
 *   Modelo        →  los datos y las reglas   (src/modelo)
 *   ViewModel     →  el estado de la pantalla (src/vista-modelo)
 *   Vista         →  el HTML y los estilos    (src/vista, index.html)
 */
import { ServicioAutenticacion } from "./modelo/ServicioAutenticacion.js";
import { LoginViewModel } from "./vista-modelo/LoginViewModel.js";
import { RelojLocalViewModel } from "./vista-modelo/RelojLocalViewModel.js";
import { VistaLogin } from "./vista/VistaLogin.js";

function arrancar() {
  const loginViewModel = new LoginViewModel(new ServicioAutenticacion());
  const relojViewModel = new RelojLocalViewModel();

  const vistaLogin = new VistaLogin({ loginViewModel, relojViewModel });
  vistaLogin.montar();

  // Si el usuario ya había entrado con "Recordarme", no se le pide todo de nuevo.
  loginViewModel.retomarSesionGuardada();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", arrancar, { once: true });
} else {
  arrancar();
}

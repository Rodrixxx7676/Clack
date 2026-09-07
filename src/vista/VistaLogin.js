/**
 * VistaLogin.js
 * -------------
 * La Vista: conecta el HTML con el LoginViewModel.
 *
 * Regla de oro de MVVM: aquí NO se decide nada.
 * Solo se enlazan cajas de texto, botones y mensajes.
 */
import {
  enlazarTexto,
  enlazarVisibilidad,
  enlazarClase,
  enlazarAtributo,
  escucharEscritura,
} from "../nucleo/EnlaceDatos.js";
import { seguirBrilloDelCursor } from "./efectos/EfectoVidrio.js";

export class VistaLogin {
  constructor({ loginViewModel, relojViewModel, documento = document }) {
    this.loginViewModel = loginViewModel;
    this.relojViewModel = relojViewModel;
    this.doc = documento;
    this.limpiadores = [];
  }

  /** Deja la pantalla lista y funcionando. */
  montar() {
    this.#buscarElementos();
    this.#enlazarReloj();
    this.#enlazarCampos();
    this.#enlazarMensajes();
    this.#enlazarAcciones();
    this.#enlazarEntradaExitosa();

    this.limpiadores.push(seguirBrilloDelCursor(this.elementos.tarjeta));
    this.relojViewModel.comenzar();
    this.elementos.campoCorreo.focus();
  }

  /** Suelta todo lo que quedó escuchando. */
  desmontar() {
    this.relojViewModel.detener();
    this.limpiadores.forEach((limpiar) => limpiar());
    this.limpiadores = [];
  }

  #buscarElementos() {
    const buscar = (id) => this.doc.getElementById(id);
    this.elementos = {
      tarjeta: buscar("tarjetaLogin"),
      formulario: buscar("formularioLogin"),
      campoCorreo: buscar("campoCorreo"),
      campoContrasena: buscar("campoContrasena"),
      campoRecordarme: buscar("campoRecordarme"),
      botonVerContrasena: buscar("botonVerContrasena"),
      botonEntrar: buscar("botonEntrar"),
      textoBotonEntrar: buscar("textoBotonEntrar"),
      botonCuentaDemo: buscar("botonCuentaDemo"),
      botonOlvide: buscar("botonOlvide"),
      errorCorreo: buscar("errorCorreo"),
      errorContrasena: buscar("errorContrasena"),
      errorGeneral: buscar("errorGeneral"),
      relojHora: buscar("relojHora"),
      relojFecha: buscar("relojFecha"),
      relojZona: buscar("relojZona"),
      bienvenida: buscar("panelBienvenida"),
      bienvenidaNombre: buscar("bienvenidaNombre"),
      botonSalir: buscar("botonSalir"),
    };
  }

  #enlazarReloj() {
    const { relojHora, relojFecha, relojZona } = this.elementos;
    this.limpiadores.push(
      enlazarTexto(relojHora, this.relojViewModel.hora),
      enlazarTexto(relojFecha, this.relojViewModel.fecha),
      enlazarTexto(relojZona, this.relojViewModel.zonaHoraria),
    );
  }

  #enlazarCampos() {
    const vm = this.loginViewModel;
    const { campoCorreo, campoContrasena, campoRecordarme } = this.elementos;

    // Del HTML hacia el ViewModel.
    this.limpiadores.push(
      escucharEscritura(campoCorreo, (texto) => vm.escribirCorreo(texto)),
      escucharEscritura(campoContrasena, (texto) => vm.escribirContrasena(texto)),
    );

    campoCorreo.addEventListener("blur", () => vm.validarCorreoAlSalir());
    campoContrasena.addEventListener("blur", () => vm.validarContrasenaAlSalir());
    campoRecordarme.addEventListener("change", (evento) =>
      vm.cambiarRecordarme(evento.target.checked),
    );

    // Del ViewModel hacia el HTML (por si el ViewModel rellena los campos solo).
    this.limpiadores.push(
      vm.correo.suscribir((texto) => {
        if (campoCorreo.value !== texto) campoCorreo.value = texto;
      }),
      vm.contrasena.suscribir((texto) => {
        if (campoContrasena.value !== texto) campoContrasena.value = texto;
      }),
    );
  }

  #enlazarMensajes() {
    const vm = this.loginViewModel;
    const { errorCorreo, errorContrasena, errorGeneral, campoCorreo, campoContrasena } =
      this.elementos;

    this.limpiadores.push(
      ...this.#enlazarError(errorCorreo, campoCorreo, vm.errorCorreo),
      ...this.#enlazarError(errorContrasena, campoContrasena, vm.errorContrasena),
      enlazarTexto(errorGeneral, vm.errorGeneral),
      enlazarVisibilidad(errorGeneral, mapear(vm.errorGeneral, Boolean)),
    );
  }

  #enlazarError(elementoError, campo, observableError) {
    return [
      enlazarTexto(elementoError, observableError),
      enlazarVisibilidad(elementoError, mapear(observableError, Boolean)),
      enlazarClase(campo, "campo__entrada--con-error", mapear(observableError, Boolean)),
      observableError.suscribir((mensaje) => {
        campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
      }),
    ];
  }

  #enlazarAcciones() {
    const vm = this.loginViewModel;
    const {
      formulario,
      botonEntrar,
      textoBotonEntrar,
      botonCuentaDemo,
      botonVerContrasena,
      campoContrasena,
      botonOlvide,
      tarjeta,
    } = this.elementos;

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      vm.iniciarSesion();
    });

    botonCuentaDemo.addEventListener("click", () => vm.usarCuentaDemo());

    botonOlvide.addEventListener("click", () => {
      vm.errorGeneral.valor = `Escríbenos a ${botonOlvide.dataset.correoSoporte} y te ayudamos a recuperarla.`;
    });

    botonVerContrasena.addEventListener("click", () => {
      const oculta = campoContrasena.type === "password";
      campoContrasena.type = oculta ? "text" : "password";
      botonVerContrasena.setAttribute("aria-pressed", String(oculta));
      botonVerContrasena.setAttribute(
        "aria-label",
        oculta ? "Ocultar contraseña" : "Mostrar contraseña",
      );
    });

    this.limpiadores.push(
      enlazarAtributo(botonEntrar, "disabled", mapear(vm.cargando, (cargando) => cargando)),
      enlazarClase(botonEntrar, "boton-principal--cargando", vm.cargando),
      enlazarClase(tarjeta, "tarjeta--ocupada", vm.cargando),
      vm.cargando.suscribir((cargando) => {
        textoBotonEntrar.textContent = cargando ? "Entrando…" : "Entrar";
      }),
    );
  }

  #enlazarEntradaExitosa() {
    const { bienvenida, bienvenidaNombre, tarjeta, botonSalir } = this.elementos;

    botonSalir.addEventListener("click", () => {
      this.loginViewModel.cerrarSesion();
      this.elementos.campoCorreo.focus();
    });

    this.limpiadores.push(
      this.loginViewModel.usuarioConectado.suscribir((usuario) => {
        const haEntrado = Boolean(usuario);
        bienvenidaNombre.textContent = usuario ? usuario.nombre : "";
        bienvenida.hidden = !haEntrado;
        tarjeta.classList.toggle("tarjeta--fuera", haEntrado);
      }),
    );
  }
}

/** Crea un observable "de solo lectura" a partir de otro, transformando su valor. */
function mapear(observable, transformar) {
  return {
    suscribir: (alCambiar) => observable.suscribir((valor) => alCambiar(transformar(valor))),
  };
}

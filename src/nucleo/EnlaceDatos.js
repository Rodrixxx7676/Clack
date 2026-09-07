/**
 * EnlaceDatos.js  (data binding)
 * ------------------------------
 * Funciones cortas para "amarrar" un Observable del ViewModel
 * con un elemento del HTML. Así la Vista no necesita lógica.
 */

/** El texto del elemento muestra siempre el valor del observable. */
export function enlazarTexto(elemento, observable) {
  return observable.suscribir((valor) => {
    elemento.textContent = valor ?? "";
  });
}

/** El elemento se muestra u oculta según el observable (true / false). */
export function enlazarVisibilidad(elemento, observable) {
  return observable.suscribir((visible) => {
    elemento.hidden = !visible;
  });
}

/** Agrega o quita una clase CSS según el observable (true / false). */
export function enlazarClase(elemento, nombreClase, observable) {
  return observable.suscribir((activo) => {
    elemento.classList.toggle(nombreClase, Boolean(activo));
  });
}

/** El atributo se pone o se quita según el observable (true / false). */
export function enlazarAtributo(elemento, nombreAtributo, observable) {
  return observable.suscribir((activo) => {
    if (activo) elemento.setAttribute(nombreAtributo, "");
    else elemento.removeAttribute(nombreAtributo);
  });
}

/** Lo que el usuario escribe en el campo viaja hacia el ViewModel. */
export function escucharEscritura(campo, alEscribir) {
  const manejador = (evento) => alEscribir(evento.target.value);
  campo.addEventListener("input", manejador);
  return () => campo.removeEventListener("input", manejador);
}

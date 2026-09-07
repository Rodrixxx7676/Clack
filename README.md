# 🕒 Clack

Una página web para ver **la hora y la temperatura de las ciudades del mundo**,
hecha en **React**, con diseño *Liquid Glass* en **blanco y turquesa**.

> **Estado actual: Paso 1 — Pantalla de inicio de sesión (Login).**
> Las pantallas del reloj mundial y del clima llegan en los siguientes pasos.

---

## ▶️ Cómo verla en tu computador

Necesitas [Node.js](https://nodejs.org) instalado. Luego, dentro de la carpeta `Clack`:

```bash
npm install
```

```bash
npm run dev
```

Abre la dirección que aparece en la terminal (normalmente <http://localhost:5173>).

**Cuenta de prueba:**

| Correo            | Contraseña  |
| ----------------- | ----------- |
| `demo@clack.app`  | `clack1234` |

También puedes pulsar el botón **“Cuenta demo”** y se rellena sola.

Para generar la versión final (la que se sube a internet): `npm run build`.

---

## 🗂️ Dónde está cada cosa

La app usa **MVVM** (Model – View – ViewModel), la arquitectura que recomienda
Google. La idea es simple: **cada carpeta tiene un solo trabajo.**

```
Clack/
├── index.html                  ← El cascarón donde React dibuja todo
├── package.json                ← Lista de herramientas que usa el proyecto
├── vite.config.js              ← Configuración del servidor de desarrollo
└── src/
    ├── main.jsx                ← Enciende React y carga los estilos
    ├── App.jsx                 ← La raíz: decide qué pantalla se ve
    │
    ├── modelo/                 ← 1. MODELO: los datos y las reglas
    │   ├── Usuario.js               Quién es la persona que entra
    │   ├── ValidadorCredenciales.js Qué correo y contraseña son válidos
    │   ├── ServicioAutenticacion.js Entrar y salir de la app
    │   └── Reloj.js                 Dar la hora con formato bonito
    │
    ├── vista-modelo/           ← 2. VIEWMODEL: el cerebro de cada pantalla
    │   ├── useLoginViewModel.js     Estado del formulario de login
    │   └── useRelojLocal.js         La hora local, siempre al día
    │
    ├── vista/                  ← 3. VISTA: lo que se ve y se toca
    │   ├── PantallaLogin.jsx        Arma la pantalla completa
    │   ├── componentes/             Piezas sueltas y reutilizables
    │   │   ├── MarcaClack.jsx           Logo y nombre
    │   │   ├── RelojLocal.jsx           Hora, fecha y zona horaria
    │   │   ├── CampoTexto.jsx           Un campo del formulario
    │   │   ├── CampoContrasena.jsx      Campo con el ojo de "mostrar"
    │   │   ├── InterruptorRecordarme.jsx
    │   │   └── PanelBienvenida.jsx      Lo que se ve al entrar
    │   ├── fondos/
    │   │   ├── FondoWebThreads.jsx      Configura el fondo (colores, forma)
    │   │   ├── WebThreads.jsx           Motor gráfico de React Bits ⚠️ no tocar
    │   │   └── WebThreads.css
    │   └── efectos/
    │       └── useBrilloCursor.js       El brillo que sigue al cursor
    │
    └── estilos/                ← El aspecto visual
        ├── base.css                 Colores de la marca y tipografía
        ├── liquid-glass.css         Las piezas de vidrio reutilizables
        └── login.css                Solo la pantalla de login
```

### Cómo se hablan las capas

```
        escribe / pulsa                 pide datos
Usuario ───────────────▶ VISTA ◀──────▶ VIEWMODEL ◀──────▶ MODELO
                          ▲                                 │
                          └──── avisa que algo cambió ◀──────┘
```

* La **Vista** (`.jsx`) nunca decide nada: solo muestra y avisa.
* El **ViewModel** (los hooks `use...`) decide, pero no sabe que existe el HTML.
* El **Modelo** solo se preocupa de los datos y las reglas.

Gracias a eso, cuando conectemos un servidor real solo cambia
`ServicioAutenticacion.js`: ni la Vista ni el ViewModel se tocan.

> 💡 En React, el ViewModel de MVVM se escribe como un **hook**
> (una función que empieza con `use`). Por eso los archivos se llaman
> `useLoginViewModel.js` y `useRelojLocal.js`.

---

## 🎨 Sobre el diseño

**Paleta:** blanco de fondo, turquesa para todo lo importante.
Todos los colores viven en variables CSS dentro de `src/estilos/base.css`:
cambiando ahí, cambia toda la app.

**Fondo animado:** el componente [`WebThreads`](https://reactbits.dev/backgrounds/web-threads)
de React Bits, en su modo claro (`lightMode`), pintando hilos turquesa sobre
blanco con WebGL. Los hilos reaccionan al movimiento del mouse.
La configuración (colores, velocidad, grosor) está en `FondoWebThreads.jsx`;
el motor `WebThreads.jsx` se deja tal cual para poder actualizarlo cuando
salga una versión nueva.

**Liquid Glass:** superficies translúcidas con desenfoque (`backdrop-filter`),
bordes finos con luz interior, un brillo especular que sigue al cursor y
sombras suaves en turquesa. Respeta `prefers-reduced-motion`.

---

## 🛣️ Próximos pasos

- [x] **Paso 1 —** Login en React, Liquid Glass blanco + turquesa, fondo WebThreads.
- [ ] **Paso 2 —** Panel principal con el reloj de varias ciudades.
- [ ] **Paso 3 —** Temperatura actual de cada ciudad.
- [ ] **Paso 4 —** Buscar y guardar ciudades favoritas.

---

## ⚠️ Nota importante

La autenticación de este paso es **de demostración**: la cuenta está escrita
dentro de `ServicioAutenticacion.js` y la sesión se guarda en el navegador.
No sirve para proteger información real todavía.

---

## 🙏 Créditos

Fondo animado: [WebThreads](https://reactbits.dev/backgrounds/web-threads) de
[React Bits](https://reactbits.dev), que usa la librería
[`ogl`](https://github.com/oframe/ogl) para dibujar con WebGL.

# 🕒 Clack

Una página web para ver **la hora y la temperatura de las ciudades del mundo**,
hecha en **React**, con diseño *Liquid Glass* en **blanco y turquesa**.

> **Misión:** ayudar a las personas a mantenerse conectadas y coordinadas
> sin importar en qué parte del mundo se encuentren.

> **Estado actual: Paso 3 — Login + panel con el carrusel de ciudades,
> su hora en vivo y su temperatura.**

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
    ├── App.jsx                 ← La raíz: sin sesión muestra el Login,
    │                             con sesión muestra el panel de inicio
    │
    ├── modelo/                 ← 1. MODELO: los datos y las reglas
    │   ├── Usuario.js               Quién es la persona que entra
    │   ├── ValidadorCredenciales.js Qué correo y contraseña son válidos
    │   ├── ServicioAutenticacion.js Entrar y salir de la app
    │   ├── Reloj.js                 Dar la hora con formato bonito
    │   ├── Ciudad.js                Una ciudad y qué hora es allá
    │   ├── catalogoDeCiudades.js    👈 La lista de ciudades del panel
    │   ├── Clima.js                 Los grados y el estado del cielo
    │   └── ServicioDelClima.js      Le pregunta la temperatura a internet
    │
    ├── vista-modelo/           ← 2. VIEWMODEL: el cerebro de cada pantalla
    │   ├── useSesion.js             Quién está conectado ahora
    │   ├── useLoginViewModel.js     Estado del formulario de login
    │   ├── usePanelInicioViewModel.js  Ciudades y cuál está enfocada
    │   ├── useClimaDeCiudades.js     Trae y refresca las temperaturas
    │   ├── useMomentoActual.js      El "latido": la hora, cada segundo
    │   └── useRelojLocal.js         La hora de tu dispositivo
    │
    ├── vista/                  ← 3. VISTA: lo que se ve y se toca
    │   ├── PantallaLogin.jsx        La pantalla de inicio de sesión
    │   ├── PanelInicio.jsx          La pantalla principal
    │   ├── componentes/             Piezas sueltas y reutilizables
    │   │   ├── MarcaClack.jsx           Logo y nombre
    │   │   ├── RelojLocal.jsx           Hora, fecha y zona horaria
    │   │   ├── CampoTexto.jsx           Un campo del formulario
    │   │   ├── CampoContrasena.jsx      Campo con el ojo de "mostrar"
    │   │   ├── InterruptorRecordarme.jsx
    │   │   ├── EncabezadoPanel.jsx      Barra de arriba del panel
    │   │   ├── DetalleCiudad.jsx        Ficha de la ciudad enfocada
    │   │   └── IconoClima.jsx           Sol, nube, lluvia, nieve...
    │   ├── carruseles/
    │   │   ├── CarruselCiudades.jsx     Configura el carrusel
    │   │   ├── DepthCarousel.jsx        Motor de React Bits ⚠️ no tocar
    │   │   └── DepthCarousel.css
    │   ├── fondos/
    │   │   ├── FondoWebThreads.jsx      Configura el fondo animado
    │   │   ├── WebThreads.jsx           Motor de React Bits ⚠️ no tocar
    │   │   └── WebThreads.css
    │   └── efectos/
    │       └── useBrilloCursor.js       El brillo que sigue al cursor
    │
    └── estilos/                ← El aspecto visual
        ├── base.css                 Colores de la marca y tipografía
        ├── liquid-glass.css         Las piezas de vidrio reutilizables
        ├── login.css                Solo la pantalla de login
        └── panel-inicio.css         Solo el panel de inicio
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
> `useLoginViewModel.js`, `useSesion.js` o `useRelojLocal.js`.

### ➕ Cómo agregar una ciudad

Abre `src/modelo/catalogoDeCiudades.js`, copia uno de los bloques y cambia
el nombre, el país, la zona horaria y la foto. Nada más: el carrusel y la
ficha de la hora se actualizan solos.

```js
new Ciudad({
  id: "madrid",
  nombre: "Madrid",
  pais: "España",
  zonaHoraria: "Europe/Madrid",   // nombre oficial IANA
  foto: "https://...",
}),
```

---

## 🎨 Sobre el diseño

**Paleta:** blanco de fondo, turquesa para todo lo importante.
Todos los colores viven en variables CSS dentro de `src/estilos/base.css`:
cambiando ahí, cambia toda la app.

**Temperatura:** se pide a [Open-Meteo](https://open-meteo.com), un servicio
gratuito que no necesita clave. Las seis ciudades se consultan **en una sola
llamada** y se refrescan cada 10 minutos. Los relojes se ven al instante y la
temperatura llega después: si internet falla, la app sigue funcionando.

**Carrusel de ciudades:** el componente
[`DepthCarousel`](https://reactbits.dev/components/depth-carousel) de React Bits,
que apila las tarjetas en profundidad. Se puede arrastrar, girar con la rueda
del mouse, con las flechas del teclado o dejarlo andar solo. Cuando cambia la
tarjeta del centro avisa al ViewModel, y la ficha de abajo muestra la hora de
esa ciudad. Las fotos son de Wikimedia Commons.

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

## 📋 Requisitos del proyecto

Lo que pide la planificación y en qué va cada cosa:

| Requisito | Estado |
| --------- | ------ |
| Ver la hora de varias ciudades a la vez (hasta 10) | 🟡 Se ven 6 ciudades fijas; falta que cada usuario elija las suyas |
| Registrarse e iniciar sesión con correo y contraseña | 🟡 El login funciona (cuenta de prueba); falta el registro y un servidor real |
| Inicio de sesión con Google o Microsoft (OAuth 2.0) | 🔴 Pendiente — necesita servidor |
| Seguridad: reCAPTCHA en registro y login | 🔴 Pendiente — necesita servidor que valide el token |
| Rendimiento: los relojes en menos de 2 segundos | 🟢 Los relojes salen al instante y la temperatura tarda ~0,3 s |
| Interfaz 100% responsive (Android e iOS) | 🟢 Probado en móvil, tablet y escritorio |

> ⚠️ OAuth 2.0 y reCAPTCHA **no pueden hacerse solo con React**: las claves
> secretas tienen que vivir en un servidor. Son el siguiente gran paso.

### Las entidades de la planificación, en el código

| Entidad | Dónde está |
| ------- | ---------- |
| `CIUDAD` | `src/modelo/Ciudad.js` (`ID_ZONA` → `id`, `NOMBRE_CIUDAD` → `nombre`, `CODIGO_ZONA` → `zonaHoraria`) |
| `USUARIO` | `src/modelo/Usuario.js` — por ahora solo correo y nombre |
| `FAVORITO` | Todavía no existe: hoy la lista de ciudades es fija para todos |

---

## 🛣️ Próximos pasos

- [x] **Paso 1 —** Login en React, Liquid Glass blanco + turquesa, fondo WebThreads.
- [x] **Paso 2 —** Panel de inicio con el carrusel de ciudades y su hora en vivo.
- [x] **Paso 3 —** Temperatura actual de cada ciudad.
- [ ] **Paso 4 —** Registro de usuarios y ciudades favoritas (hasta 10).
- [ ] **Paso 5 —** Servidor real: cuentas, OAuth 2.0 (Google/Microsoft) y reCAPTCHA.

---

## ⚠️ Nota importante

La autenticación de este paso es **de demostración**: la cuenta está escrita
dentro de `ServicioAutenticacion.js` y la sesión se guarda en el navegador.
No sirve para proteger información real todavía.

---

## 🙏 Créditos

Componentes de [React Bits](https://reactbits.dev):

* [WebThreads](https://reactbits.dev/backgrounds/web-threads) — el fondo animado,
  dibujado con WebGL gracias a [`ogl`](https://github.com/oframe/ogl).
* [DepthCarousel](https://reactbits.dev/components/depth-carousel) — el carrusel
  de ciudades, animado con [`gsap`](https://gsap.com).

Datos del clima: [Open-Meteo](https://open-meteo.com).
Fotos de las ciudades: [Wikimedia Commons](https://commons.wikimedia.org).

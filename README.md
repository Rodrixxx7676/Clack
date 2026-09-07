# 🕒 Clack

Una página web para ver **la hora y la temperatura de las ciudades del mundo**,
con un diseño *Liquid Glass* (vidrio líquido).

> **Estado actual: Paso 1 — Pantalla de inicio de sesión (Login).**
> Las pantallas del reloj mundial y del clima llegan en los siguientes pasos.

---

## ▶️ Cómo ver la página

La app no necesita instalar nada: es HTML, CSS y JavaScript puro.

1. Abre una terminal dentro de la carpeta `Clack`.
2. Levanta un servidor local (hace falta porque usamos módulos de JavaScript):

   ```bash
   python3 -m http.server 8000
   ```

3. Entra a <http://localhost:8000> en tu navegador.

**Cuenta de prueba:**

| Correo            | Contraseña  |
| ----------------- | ----------- |
| `demo@clack.app`  | `clack1234` |

También puedes pulsar el botón **“Cuenta demo”** y se rellena sola.

---

## 🗂️ Dónde está cada cosa

La app usa **MVVM** (Model – View – ViewModel), la arquitectura que recomienda
Google. La idea es simple: **cada carpeta tiene un solo trabajo.**

```
Clack/
├── index.html                  ← La página que abre el navegador
├── README.md                   ← Este archivo
└── src/
    ├── inicio.js               ← Enciende la app y une las tres capas
    │
    ├── modelo/                 ← 1. MODELO: los datos y las reglas
    │   ├── Usuario.js               Quién es la persona que entra
    │   ├── ValidadorCredenciales.js Qué correo y contraseña son válidos
    │   ├── ServicioAutenticacion.js Entrar y salir de la app
    │   └── Reloj.js                 Dar la hora con formato bonito
    │
    ├── vista-modelo/           ← 2. VIEWMODEL: el cerebro de cada pantalla
    │   ├── LoginViewModel.js        Estado del formulario de login
    │   └── RelojLocalViewModel.js   La hora local, siempre al día
    │
    ├── vista/                  ← 3. VISTA: lo que se ve y se toca
    │   ├── VistaLogin.js            Conecta el HTML con el LoginViewModel
    │   └── efectos/
    │       └── EfectoVidrio.js      El brillo que sigue al cursor
    │
    ├── nucleo/                 ← Piezas compartidas por toda la app
    │   ├── Observable.js            Avisa cuando un dato cambia
    │   └── EnlaceDatos.js           Amarra los datos con el HTML
    │
    └── estilos/                ← El aspecto visual
        ├── base.css                 Colores, tipografía y fondo animado
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

* La **Vista** nunca decide nada: solo muestra y avisa.
* El **ViewModel** decide, pero no sabe que existe el HTML.
* El **Modelo** solo se preocupa de los datos y las reglas.

Gracias a eso, cuando conectemos un servidor real de verdad solo cambia
`ServicioAutenticacion.js`: ni la Vista ni el ViewModel se tocan.

---

## 🧊 Sobre el diseño Liquid Glass

* Superficies translúcidas con desenfoque (`backdrop-filter`) y saturación.
* Bordes finos y luces internas que imitan el canto del vidrio.
* Un brillo especular que **sigue al cursor** sobre la tarjeta.
* Burbujas de color que flotan detrás del vidrio.
* Respeta `prefers-reduced-motion` para quien prefiere menos movimiento.

Todos los colores viven en variables CSS dentro de `src/estilos/base.css`:
cambiando ahí, cambia toda la app.

---

## 🛣️ Próximos pasos

- [x] **Paso 1 —** Pantalla de Login con estilo Liquid Glass.
- [ ] **Paso 2 —** Panel principal con el reloj de varias ciudades.
- [ ] **Paso 3 —** Temperatura actual de cada ciudad.
- [ ] **Paso 4 —** Buscar y guardar ciudades favoritas.

---

## ⚠️ Nota importante

La autenticación de este paso es **de demostración**: la cuenta está escrita
dentro de `ServicioAutenticacion.js` y la sesión se guarda en el navegador.
No sirve para proteger información real todavía.

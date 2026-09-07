# 🚀 Poner Clack en internet

Guía para publicar Clack en **https://clack.kursperu.duckdns.org**

---

## 🗺️ Cómo va a funcionar

```
                    Internet
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Servidor AWS 34.229.198.32 │
        │                              │
        │   Caddy  (puertos 80 y 443)  │  ← el proxy inverso, pone el HTTPS
        │      │                       │
        │      ├── kursperu...          →  n8n        (lo que ya tenías)
        │      └── clack.kursperu...    →  puerto 3001 (Clack) 👈 lo nuevo
        │                              │
        └──────────────────────────────┘
```

**El proxy inverso** es Caddy: es el único que se asoma a internet. Recibe
las visitas, se encarga del candado 🔒 y se las pasa al servidor de Clack,
que vive escondido en el puerto 3001.

Por eso el puerto 3001 **no** se abre en el firewall de AWS: solo Caddy,
que está en la misma máquina, puede hablar con él.

---

## ✅ Lo que ya está listo

| | |
|---|---|
| Servidor AWS encendido | ✅ |
| Caddy instalado y con HTTPS funcionando | ✅ |
| Puertos 80 y 443 abiertos | ✅ |
| Puerto 3001 cerrado hacia afuera | ✅ (así debe estar) |
| `clack.kursperu.duckdns.org` apunta al servidor | ✅ (DuckDNS lo resuelve solo) |
| Servidor de Clack para el puerto 3001 | ✅ `servidor/servidor.js` |
| Configuración de Caddy | ✅ `despliegue/Caddyfile.clack` |
| Arranque automático | ✅ `despliegue/clack.service` |

---

## 📋 Pasos en el servidor

> Todos los comandos se ejecutan **dentro del servidor**, conectándote con
> `ssh -i tu-llave.pem usuario@34.229.198.32`

### 1. Instalar Node.js (si no está)

```bash
node -v || curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
```

### 2. Traer el proyecto

```bash
sudo git clone https://github.com/Rodrixxx7676/Clack.git /opt/clack
```

Como el repositorio es privado, Git pedirá usuario y contraseña. Lo cómodo
es crear un *token* en GitHub (Settings → Developer settings → Tokens) y
usarlo como contraseña.

### 3. Construir la web

```bash
cd /opt/clack && sudo npm install && sudo npm run build
```

### 4. Encender el servidor de Clack

```bash
sudo cp /opt/clack/despliegue/clack.service /etc/systemd/system/clack.service
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now clack && sudo systemctl status clack --no-pager
```

Comprobación rápida, desde el propio servidor:

```bash
curl http://127.0.0.1:3001/salud
```

Debe responder algo como `{"estado":"ok","aplicacion":"Clack",...}`.

### 5. Decirle a Caddy que lo publique

```bash
sudo tee -a /etc/caddy/Caddyfile < /opt/clack/despliegue/Caddyfile.clack
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy
```

Caddy pedirá el certificado HTTPS solo. Tarda unos segundos la primera vez.

### 6. Probar

Abre <https://clack.kursperu.duckdns.org> — debe salir el login de Clack
con el candado de seguridad.

---

## 🔄 Cómo subir cambios más adelante

Cada vez que quieras publicar una versión nueva:

```bash
cd /opt/clack && sudo git pull && sudo npm install && sudo npm run build && sudo systemctl restart clack
```

---

## 🛟 Si algo falla

| Síntoma | Qué mirar |
|---|---|
| La página no carga | `sudo systemctl status clack` y `sudo journalctl -u clack -n 50` |
| Sale error 502 | El servidor de Clack está caído: `curl http://127.0.0.1:3001/salud` |
| No sale el candado HTTPS | `sudo journalctl -u caddy -n 50` (puede ser el límite de Let's Encrypt) |
| n8n dejó de funcionar | Revisa que el bloque nuevo se haya **agregado** al Caddyfile, no reemplazado |

---

## ⚠️ Antes de meter datos reales

Hoy Clack no guarda información de nadie: las cuentas son de prueba y viven
en el navegador. **Antes de tener usuarios de verdad** hacen falta:

* Un servidor de cuentas con las contraseñas cifradas (nunca en el código).
* OAuth 2.0 (Google / Microsoft) — la clave secreta va en el servidor.
* reCAPTCHA — la clave secreta también va en el servidor.

Nada de eso debe subirse nunca a GitHub. Cuando llegue el momento, las
claves van en un archivo `.env` que se queda solo dentro del servidor.

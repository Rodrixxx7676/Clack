# 🚀 Poner Clack en internet

Guía para publicar Clack en **https://clack.kursperu.duckdns.org**
sin tocar n8n, que ya está en producción.

---

## 🗺️ Cómo va a funcionar

```
                    Internet
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │      Servidor AWS 34.229.198.32      │
        │                                      │
        │      Caddy  (puertos 80 y 443)       │  ← el proxy inverso
        │         │                            │
        │         ├── kursperu...        → n8n        (INTACTO)
        │         └── clack.kursperu...  → :3001      👈 lo nuevo
        │                                      │
        └──────────────────────────────────────┘
```

**El proxy inverso** es Caddy: el único que se asoma a internet. Recibe las
visitas, se encarga del candado 🔒 y se las pasa al servidor de Clack, que
vive escondido en el puerto 3001.

El puerto 3001 **no se abre en el firewall de AWS**. No hace falta y no debe
hacerse: solo Caddy, desde dentro de la misma máquina, habla con él.

---

## 🛡️ Regla número uno: n8n no se toca

Clack se **agrega**, no reemplaza nada. Las cinco reglas:

1. **Subdominio propio.** Clack vive en `clack.kursperu.duckdns.org`.
   El dominio de n8n no se menciona en ninguna configuración nueva.
2. **Copia de seguridad antes de editar.** El Caddyfile se respalda con la
   fecha en el nombre, siempre, antes de tocarlo.
3. **Se agrega al final del archivo**, con `>>`. Nunca con `>`, que borraría
   todo lo que hay.
4. **Se valida antes de aplicar.** Si la configuración tiene un error, Caddy
   lo dice y **sigue funcionando con la configuración anterior**.
5. **`reload`, nunca `restart`.** `reload` cambia la configuración sin cortar
   ni una sola conexión. n8n ni se entera.

> Y antes de empezar, se guarda cómo responde n8n, para poder comparar
> después y comprobar que sigue exactamente igual.

---

## 0️⃣ Primero: la radiografía

Esto cambia todo lo demás, así que hay que saberlo antes: **¿Caddy está
instalado en el servidor, o corre dentro de Docker?** (Cuando n8n se instala
con `docker compose`, suele traer Caddy en un contenedor.)

Desde tu Mac, en la carpeta del proyecto:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'bash -s' < despliegue/revisar-servidor.sh
```

Ese script **solo mira**: no instala, no modifica, no reinicia nada.
Según lo que responda, sigue el **camino A** o el **camino B**.

---

## 📸 Antes de nada: la foto de n8n

Guarda cómo responde n8n ahora, para comparar al final:

```bash
curl -s -o /dev/null -w "n8n antes: %{http_code}\n" https://kursperu.duckdns.org
```

Apunta ese número (debería ser `200`).

---

# Camino A — Caddy instalado en el servidor (systemd)

*Si la radiografía dijo `active` en "¿Caddy es un servicio del sistema?".*

### A1. Instalar Node.js (si falta)

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'node -v || (curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs)'
```

### A2. Traer el proyecto y construirlo

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo git clone https://github.com/Rodrixxx7676/Clack.git /opt/clack && cd /opt/clack && sudo npm ci && sudo npm run build'
```

> Si el repositorio sigue privado, Git pedirá credenciales. Lo más simple es
> hacerlo público, o crear un token en GitHub y usarlo como contraseña.

### A3. Encender Clack en el puerto 3001

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo cp /opt/clack/despliegue/clack.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now clack'
```

Comprobar que está vivo (desde dentro del servidor, porque el 3001 no sale a internet):

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'curl -s http://127.0.0.1:3001/salud'
```

Debe responder `{"estado":"ok","aplicacion":"Clack",...}`.

### A4. Respaldar el Caddyfile

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.respaldo-$(date +%Y%m%d-%H%M%S) && ls -l /etc/caddy/'
```

### A5. Agregar el bloque de Clack

Fíjate en el `>>` doble: **agrega** al final, no reemplaza.

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'cat /opt/clack/despliegue/Caddyfile.clack | sudo tee -a /etc/caddy/Caddyfile > /dev/null'
```

### A6. Validar y aplicar

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy'
```

Si la validación falla, **no se aplica nada** y n8n sigue funcionando igual.

---

# Camino B — Caddy dentro de Docker

*Si la radiografía mostró un contenedor de Caddy.*

### B1. Traer el proyecto

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'git clone https://github.com/Rodrixxx7676/Clack.git ~/clack'
```

### B2. Averiguar la red de n8n y ponerla en el compose

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'docker network ls'
```

Edita `~/clack/despliegue/docker-compose.clack.yml` y cambia
`nombre_de_la_red_de_n8n` por la red real (la que usa el contenedor de Caddy).

### B3. Levantar Clack como contenedor

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'cd ~/clack && docker compose -f despliegue/docker-compose.clack.yml up -d --build'
```

### B4. Ajustar y agregar el bloque de Caddy

En `~/clack/despliegue/Caddyfile.clack`, usa la línea `reverse_proxy clack:3001`
(por el nombre del contenedor) en vez de `127.0.0.1:3001`.

Respaldar, agregar y recargar — la ruta del Caddyfile te la dijo la radiografía:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'cp RUTA_DEL_CADDYFILE RUTA_DEL_CADDYFILE.respaldo-$(date +%Y%m%d-%H%M%S) && cat ~/clack/despliegue/Caddyfile.clack >> RUTA_DEL_CADDYFILE && docker exec NOMBRE_CONTENEDOR_CADDY caddy reload --config /etc/caddy/Caddyfile'
```

---

## ✅ Comprobación final (los dos caminos)

```bash
echo "n8n:   $(curl -s -o /dev/null -w '%{http_code}' https://kursperu.duckdns.org)"; echo "Clack: $(curl -s -o /dev/null -w '%{http_code}' https://clack.kursperu.duckdns.org)"
```

Lo que debe salir:

* **n8n: 200** — igual que en la foto del principio. Si cambió, algo se tocó
  que no se debía: restaura el respaldo (ver abajo).
* **Clack: 200** — ya está en internet. Puede tardar unos segundos la primera
  vez, mientras Caddy pide el certificado HTTPS.

Y abre <https://clack.kursperu.duckdns.org> en el navegador: debe salir el
login con el candado 🔒.

---

## ↩️ Si algo sale mal: volver atrás

Restaurar el Caddyfile anterior deja todo exactamente como estaba:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'ls -t /etc/caddy/Caddyfile.respaldo-* | head -1'
```

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo cp $(ls -t /etc/caddy/Caddyfile.respaldo-* | head -1) /etc/caddy/Caddyfile && sudo systemctl reload caddy'
```

Y para apagar Clack sin tocar nada más:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo systemctl stop clack && sudo systemctl disable clack'
```

---

## 🔄 Publicar una versión nueva

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'cd /opt/clack && sudo git pull && sudo npm ci && sudo npm run build && sudo systemctl restart clack'
```

Esto reinicia **solo Clack**. n8n y Caddy siguen andando.

---

## 🛟 Si algo falla

| Síntoma | Qué mirar |
|---|---|
| Clack no carga | `sudo systemctl status clack` y `sudo journalctl -u clack -n 50` |
| Error 502 | Clack está caído: `curl http://127.0.0.1:3001/salud` |
| No sale el candado | `sudo journalctl -u caddy -n 50` — puede ser el límite de Let's Encrypt (5 intentos por hora) |
| **n8n dejó de responder** | Restaura el respaldo del Caddyfile (sección "volver atrás") |

---

## ⚠️ Antes de meter datos reales

Hoy Clack no guarda información de nadie: las cuentas son de prueba y viven
en el navegador. **Antes de tener usuarios de verdad** hacen falta:

* Un servidor de cuentas con las contraseñas cifradas (nunca en el código).
* OAuth 2.0 (Google / Microsoft) — la clave secreta va en el servidor.
* reCAPTCHA — la clave secreta también va en el servidor.

Nada de eso se sube nunca a GitHub: esas claves van en un archivo `.env`
que se queda solo dentro del servidor.

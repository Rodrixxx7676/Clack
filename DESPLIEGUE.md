# 🚀 Poner Clack en internet

Guía para publicar Clack en **https://clack.kursperu.duckdns.org**, dejando
el servidor listo para alojar varias aplicaciones con un solo proxy inverso
y sin rozar a n8n, que ya está en producción.

---

## 🗺️ Cómo va a funcionar

Un solo servidor y un solo proxy inverso para **todas** tus aplicaciones.
Cada una vive en su propio subdominio y su propio puerto:

```
                         Internet
                            │
                            ▼
        ┌───────────────────────────────────────────────┐
        │         Servidor AWS 34.229.198.32            │
        │                                               │
        │         Caddy  (puertos 80 y 443)             │  ← el único que sale a internet
        │            │                                  │
        │            ├── kursperu.duckdns.org       → n8n    :5678  (INTACTO)
        │            ├── clack.kursperu.duckdns.org → Clack  :3001  👈
        │            └── otra.kursperu.duckdns.org  → app #3 :3002  (mañana)
        │                                               │
        └───────────────────────────────────────────────┘
```

**No hace falta crear dominios nuevos.** DuckDNS acepta cualquier
sub-subdominio automáticamente: `loquesea.kursperu.duckdns.org` ya apunta a
tu servidor sin que tengas que registrarlo. Caddy le pide un certificado
HTTPS propio a cada uno, solo.

### ¿Por qué un subdominio por app y no una carpeta?

Se podría hacer `kursperu.duckdns.org/clack`, pero un subdominio es mejor:

| | Subdominio (`clack.kursperu...`) | Carpeta (`.../clack`) |
|---|---|---|
| Configurar la app | Nada que tocar | Hay que decirle a React y a Vite que vive en `/clack` |
| Sesiones y cookies | Aisladas por app | **Compartidas**: un fallo en una app expone a las otras |
| OAuth 2.0 (Google) | Dirección de retorno limpia | Se complica |
| Certificado HTTPS | Uno por app, automático | Uno solo |

La única ventaja de la carpeta es el certificado único, y como Caddy los
gestiona solo, no es ninguna ventaja.

### Registro de aplicaciones

Cada app nueva toma el siguiente puerto libre. Anótalas aquí para no
repetir ninguno:

| Aplicación | Subdominio | Puerto | Estado |
|---|---|---|---|
| n8n | `kursperu.duckdns.org` | 5678 *(por confirmar)* | 🟢 En producción |
| **Clack** | `clack.kursperu.duckdns.org` | **3001** | 🟡 Por instalar |
| *(libre)* | | 3002 | |
| *(libre)* | | 3003 | |

Ningún puerto de estos se abre en el firewall de AWS: solo el 80 y el 443,
que ya están abiertos. Las aplicaciones escuchan en `127.0.0.1`, así que
únicamente Caddy, desde dentro de la máquina, puede hablarles.

## 🛡️ Cómo se protege a n8n

Esta vez Clack no se mete en la configuración de n8n **en absoluto**:

| | |
|---|---|
| **Dominio propio** | Clack tiene su dominio de DuckDNS. El de n8n no aparece en ninguna configuración nueva. |
| **Archivo propio** | La configuración de Clack vive en `/etc/caddy/conf.d/clack.caddy`. El Caddyfile de n8n se toca **una sola vez**, para agregarle una línea de `import`, y nunca más. |
| **Respaldo con fecha** | Antes de esa única línea, el Caddyfile se copia a `Caddyfile.respaldo-AAAAMMDD-HHMMSS`. |
| **Validar antes de aplicar** | Si la configuración tuviera un error, Caddy lo dice y **sigue con la anterior**. |
| **`reload`, no `restart`** | La configuración se cambia sin cortar ni una conexión. |
| **Comprobación automática** | El instalador anota cómo responde n8n **antes**, y lo vuelve a mirar **después**. Si algo cambió, **deshace solo**. |

Si algún día quieres quitar Clack: se borra `/etc/caddy/conf.d/clack.caddy`,
se recarga Caddy y listo. Nada más se toca.

---

## 1️⃣ El dominio: no hay que hacer nada

`clack.kursperu.duckdns.org` **ya funciona**. Compruébalo:

```bash
dig +short clack.kursperu.duckdns.org
```

Debe responder `34.229.198.32`. DuckDNS resuelve cualquier sub-subdominio
al mismo sitio que el dominio padre, sin registrarlo.

> **¿Prefieres un nombre paraguas más neutro?** Se puede crear un dominio
> nuevo en <https://www.duckdns.org> (la cuenta gratis permite 5) y usar
> `clack.kursapps.duckdns.org`. Revisé la disponibilidad:
> `aplicaciones`, `apps`, `plataforma` y `servicios` **ya están tomados**;
> `kursapps` y `appsperu` estaban libres.
> Si lo creas, ponle la IP `34.229.198.32` y cambia el dominio en el
> comando del paso 3. Todo lo demás es idéntico.

## 2️⃣ La radiografía del servidor

Antes de instalar nada, hay que saber **si Caddy está instalado en el
servidor o corre dentro de Docker**. Cambia toda la configuración.

Desde tu Mac, en la carpeta del proyecto:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'bash -s' < despliegue/revisar-servidor.sh
```

Este script **solo mira**: no instala, no modifica, no reinicia nada.

* Si dice **`active`** en "¿Caddy es un servicio del sistema?" → sigue al paso 3.
* Si aparece un **contenedor de Caddy** en Docker → avísame, la configuración
  cambia (hay que usar `reverse_proxy clack:3001` y la red de Docker).

---

## 3️⃣ Instalar Clack

Traer el proyecto al servidor:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo git clone https://github.com/Rodrixxx7676/Clack.git /opt/clack'
```

Y ejecutar el instalador con **tu** dominio:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo bash /opt/clack/despliegue/instalar-clack.sh clack.kursperu.duckdns.org'
```

El instalador acepta un segundo dato opcional, el puerto, por si algún día
el 3001 se ocupa: `... instalar-clack.sh clack.kursperu.duckdns.org 3005`

El instalador hace todo con red de seguridad: anota cómo está n8n, instala
Node, construye la web, enciende Clack en el 3001, respalda el Caddyfile,
valida, recarga y comprueba que n8n siga igual. **Si algo cambió, deshace
solo y te avisa.**

---

## 4️⃣ Que el dominio no se rompa nunca

⚠️ **Esto también protege a n8n.** La IP pública de una instancia de AWS
**cambia** cada vez que se apaga y enciende, salvo que tenga una *IP elástica*.
Si eso pasa, **todas** tus aplicaciones desaparecen de internet a la vez
—n8n incluido— y no es culpa de la configuración.

Hay dos formas de resolverlo, y lo ideal es tener las dos:

**a) IP elástica en AWS** (recomendado): en la consola de EC2 → *Elastic IPs*
→ asignar una y asociarla a la instancia. Así la IP nunca cambia. Es gratis
mientras esté asociada a una instancia encendida.

**b) Actualizador automático de DuckDNS** (red de seguridad): un programita
que cada 5 minutos le dice a DuckDNS cuál es la IP actual.

Para instalarlo, primero el archivo con tu token (**este archivo nunca se
sube a GitHub**):

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo mkdir -p /etc/clack && sudo nano /etc/clack/duckdns.env'
```

Dentro escribe esto, con **tus** datos. Va solo `kursperu`, sin
`.duckdns.org` y sin los sub-subdominios: al actualizar el dominio padre,
todos sus hijos (Clack incluido) se actualizan con él.

```
DUCKDNS_DOMINIOS=kursperu
DUCKDNS_TOKEN=aqui-va-tu-token
```

Y luego:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo chmod 600 /etc/clack/duckdns.env && sudo cp /opt/clack/despliegue/duckdns.{service,timer} /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now duckdns.timer && sudo systemctl start duckdns.service && cat /var/log/duckdns.log'
```

Debe salir una línea con `OK`.

---

## ✅ Comprobación final

```bash
echo "n8n:   $(curl -s -o /dev/null -w '%{http_code}' https://kursperu.duckdns.org)"; echo "Clack: $(curl -s -o /dev/null -w '%{http_code}' https://clack.kursperu.duckdns.org)"
```

Los dos deben responder **200**. Y abre tu dominio en el navegador: debe
salir el login de Clack con el candado 🔒.

---

## ↩️ Si algo sale mal: volver atrás

El instalador ya deshace solo si detecta problemas, pero si quieres hacerlo
a mano:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo rm -f /etc/caddy/conf.d/clack.caddy && sudo systemctl reload caddy && sudo systemctl stop clack'
```

Eso quita Clack de internet y deja n8n exactamente como estaba.

Para restaurar el Caddyfile completo desde el respaldo:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo cp $(ls -t /etc/caddy/Caddyfile.respaldo-* | head -1) /etc/caddy/Caddyfile && sudo systemctl reload caddy'
```

---

## 🔄 Publicar una versión nueva

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'cd /opt/clack && sudo git pull && sudo npm ci && sudo npm run build && sudo systemctl restart clack'
```

Reinicia **solo Clack**. n8n y Caddy siguen andando.

---

## 🛟 Si algo falla

| Síntoma | Qué mirar |
|---|---|
| Clack no carga | `sudo systemctl status clack` y `sudo journalctl -u clack -n 50` |
| Error 502 | Clack está caído: `curl http://127.0.0.1:3001/salud` |
| No sale el candado | `sudo journalctl -u caddy -n 50` — puede ser el límite de Let's Encrypt (5 intentos por hora) |
| El dominio no resuelve | `dig +short clack.kursperu.duckdns.org` y `cat /var/log/duckdns.log` |
| **n8n dejó de responder** | Sección "volver atrás" — se arregla en un comando |

---

## ➕ Cómo agregar la siguiente aplicación

Cuando tengas otra app lista, el patrón se repite y **Clack no se entera**:

1. Elige subdominio y puerto libres, y anótalos en el registro de arriba.
2. Que la app escuche en `127.0.0.1` en su puerto (nunca en `0.0.0.0`, para
   que no se asome a internet).
3. Crea su servicio en `/etc/systemd/system/<app>.service`, igual que
   `clack.service`.
4. Crea `/etc/caddy/conf.d/<app>.caddy` copiando `clack.caddy` y cambiando
   el dominio y el puerto.
5. `sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy`

El Caddyfile principal **ya no se toca nunca más**: la línea de `import`
carga sola cada archivo nuevo de `conf.d/`.

---

## ⚠️ Antes de meter datos reales

Hoy Clack no guarda información de nadie: las cuentas son de prueba y viven
en el navegador. **Antes de tener usuarios de verdad** hacen falta:

* Un servidor de cuentas con las contraseñas cifradas (nunca en el código).
* OAuth 2.0 (Google / Microsoft) — la clave secreta va en el servidor.
* reCAPTCHA — la clave secreta también va en el servidor.

Esas claves van en archivos como `/etc/clack/duckdns.env`: dentro del
servidor, con permisos `600`, y **nunca** en GitHub.

# 🚀 Poner Clack en internet

Guía para publicar Clack en su **propio dominio de DuckDNS**,
sin rozar a n8n, que ya está en producción.

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
        │         ├── kursperu.duckdns.org  → n8n      (INTACTO)
        │         └── TU_DOMINIO.duckdns.org → :3001   👈 Clack
        │                                      │
        └──────────────────────────────────────┘
```

**El proxy inverso** es Caddy: el único que se asoma a internet. Recibe las
visitas, se encarga del candado 🔒 y se las pasa al servidor de Clack, que
vive escondido en el puerto 3001.

El puerto 3001 **no se abre en el firewall de AWS**. No hace falta y no debe
hacerse: solo Caddy, desde dentro de la misma máquina, habla con él.

---

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

## 1️⃣ Crear el dominio en DuckDNS

Entra a <https://www.duckdns.org> con tu cuenta y crea un dominio nuevo.
La cuenta gratis permite hasta **5 dominios**.

Nombres que revisé y estaban libres:

| Nombre | Estado |
|---|---|
| `clack.duckdns.org` | 🔴 ya lo tiene otra persona |
| `clackperu.duckdns.org` | 🟢 libre |
| `clackapp.duckdns.org` | 🟢 libre |
| `clackhora.duckdns.org` | 🟢 libre |
| `clackweb.duckdns.org` | 🟢 libre |
| `clackpe.duckdns.org` | 🟢 libre |

> La comprobación definitiva es el panel de DuckDNS: si al crearlo te lo
> acepta, era libre.

**Al crearlo, ponle la IP del servidor: `34.229.198.32`**
Y guarda tu **token** (sale arriba del panel) — lo vas a necesitar en el paso 4.

---

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
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo bash /opt/clack/despliegue/instalar-clack.sh clackperu.duckdns.org'
```

El instalador hace todo con red de seguridad: anota cómo está n8n, instala
Node, construye la web, enciende Clack en el 3001, respalda el Caddyfile,
valida, recarga y comprueba que n8n siga igual. **Si algo cambió, deshace
solo y te avisa.**

---

## 4️⃣ Que el dominio no se rompa nunca

⚠️ **Esto también protege a n8n.** La IP pública de una instancia de AWS
**cambia** cada vez que se apaga y enciende, salvo que tenga una *IP elástica*.
Si eso pasa, `kursperu.duckdns.org` y el dominio de Clack dejan de funcionar
los dos, y no es culpa de la configuración.

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

Dentro escribe esto, con **tus** datos (los dominios van sin `.duckdns.org`):

```
DUCKDNS_DOMINIOS=clackperu,kursperu
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
echo "n8n:   $(curl -s -o /dev/null -w '%{http_code}' https://kursperu.duckdns.org)"; echo "Clack: $(curl -s -o /dev/null -w '%{http_code}' https://clackperu.duckdns.org)"
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
| El dominio no resuelve | `dig +short TU_DOMINIO.duckdns.org` y `cat /var/log/duckdns.log` |
| **n8n dejó de responder** | Sección "volver atrás" — se arregla en un comando |

---

## ⚠️ Antes de meter datos reales

Hoy Clack no guarda información de nadie: las cuentas son de prueba y viven
en el navegador. **Antes de tener usuarios de verdad** hacen falta:

* Un servidor de cuentas con las contraseñas cifradas (nunca en el código).
* OAuth 2.0 (Google / Microsoft) — la clave secreta va en el servidor.
* reCAPTCHA — la clave secreta también va en el servidor.

Esas claves van en archivos como `/etc/clack/duckdns.env`: dentro del
servidor, con permisos `600`, y **nunca** en GitHub.

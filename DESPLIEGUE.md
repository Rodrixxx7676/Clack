# 🚀 Clack en internet

**Clack está publicado en https://clack.kursperu.duckdns.org** 🎉

Este documento explica cómo está montado, cómo subir cambios y cómo
agregar más aplicaciones al mismo servidor.

---

## 🗺️ Cómo está montado

Un solo servidor y un solo proxy inverso para todas las aplicaciones.
Cada una en su subdominio y su puerto:

```
                         Internet
                            │
                  puertos 80 y 443
                            ▼
        ┌───────────────────────────────────────────────┐
        │         Servidor AWS 34.229.198.32            │
        │                                               │
        │   ┌─────────────────────────────────────┐     │
        │   │  contenedor: n8n-docker-caddy-1     │     │  ← el único que sale a internet
        │   │  Caddy — reparte según el dominio   │     │
        │   └──────────┬──────────────┬───────────┘     │
        │              │              │                 │
        │   kursperu…  │              │  clack.kursperu…│
        │              ▼              ▼                 │
        │   ┌──────────────────┐  ┌──────────────────┐  │
        │   │ n8n-docker-n8n-1 │  │    clack         │  │
        │   │      :5678       │  │     :3001        │  │
        │   └──────────────────┘  └──────────────────┘  │
        │                                               │
        │        red de Docker: n8n-docker_default      │
        └───────────────────────────────────────────────┘
```

**El proxy inverso es Caddy**, dentro de un contenedor. Es el único que
escucha en internet. Mira el dominio de cada visita y se la pasa al
contenedor que corresponde, por la red interna de Docker.

Los puertos 5678 y 3001 **no están publicados en el servidor**: solo
existen dentro de la red de Docker. Desde internet son inalcanzables.
En el firewall de AWS solo están abiertos el 80, el 443 y el 22 (SSH).

### Registro de aplicaciones

| Aplicación | Dominio | Contenedor | Puerto |
|---|---|---|---|
| n8n | `kursperu.duckdns.org` | `n8n-docker-n8n-1` | 5678 |
| **Clack** | `clack.kursperu.duckdns.org` | `clack` | **3001** |
| *(libre)* | `___.kursperu.duckdns.org` | | 3002 |

> **No hace falta registrar dominios nuevos en DuckDNS.** Cualquier
> `loquesea.kursperu.duckdns.org` ya apunta al servidor, y Caddy le pide
> su certificado HTTPS solo.

### Dónde está cada cosa en el servidor

| Ruta | Qué es |
|---|---|
| `/home/ubuntu/n8n-docker/docker-compose.yml` | Los contenedores de n8n y Caddy |
| `/home/ubuntu/n8n-docker/Caddyfile` | **Quién atiende cada dominio** |
| `/home/ubuntu/n8n-docker/docker-compose.respaldo-*.yml` | Respaldos con fecha |
| `/home/ubuntu/clack/` | La web construida y el servidor de Clack |

---

## 🔄 Subir una versión nueva

Desde tu Mac, en la carpeta del proyecto, **un solo comando**:

```bash
bash despliegue/publicar.sh
```

Construye la web aquí, envía unos 100 KB al servidor, reconstruye el
contenedor de Clack y comprueba que la web responde.
**n8n y Caddy no se tocan.**

> ¿Por qué se construye en la Mac y no en el servidor? Porque el servidor
> tiene menos de 1 GB de memoria libre y la comparte con n8n. Un `npm
> build` allá podría dejar sin memoria a la máquina, y cuando eso pasa el
> sistema mata procesos… como n8n.

---

## ➕ Agregar otra aplicación

El patrón se repite y Clack no se entera:

1. **Elige** subdominio y puerto libres, y anótalos en la tabla de arriba.
2. **Levanta el contenedor** en la misma red, sin publicar puertos:
   ```bash
   docker run -d --name miapp --restart unless-stopped \
     --network n8n-docker_default --memory 256m miapp:latest
   ```
3. **Agrega su bloque** al final de `/home/ubuntu/n8n-docker/Caddyfile`:
   ```
   miapp.kursperu.duckdns.org {
       reverse_proxy miapp:3002
   }
   ```
4. **Recarga Caddy sin reiniciarlo** (esto no corta ninguna conexión):
   ```bash
   docker exec n8n-docker-caddy-1 caddy reload --config /etc/caddy/Caddyfile
   ```

Desde que existe el Caddyfile, agregar aplicaciones ya **no** obliga a
recrear el contenedor de Caddy: basta con `caddy reload`.

---

## ↩️ Volver atrás

**Quitar Clack de internet** (n8n sigue igual): borra su bloque del
Caddyfile y recarga.

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'docker exec n8n-docker-caddy-1 caddy reload --config /etc/caddy/Caddyfile && docker stop clack'
```

**Volver a la configuración anterior de Caddy** (la de una sola línea,
antes de que existiera Clack):

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'cd ~/n8n-docker && cp $(ls -t docker-compose.respaldo-*.yml | head -1) docker-compose.yml && docker compose up -d caddy'
```

---

## ⏳ Pendientes recomendados

### 1. Que la IP no se rompa nunca

⚠️ **Esto afecta también a n8n.** La IP pública de una instancia de AWS
**cambia** cada vez que se apaga y enciende, salvo que tenga una *IP
elástica*. Si eso pasa, n8n y Clack desaparecen los dos a la vez.

* **IP elástica** (consola de EC2 → *Elastic IPs*): la IP deja de cambiar.
  Es gratis mientras esté asociada a una instancia encendida.
* **Actualizador de DuckDNS** (red de seguridad): cada 5 minutos le dice a
  DuckDNS cuál es la IP real.

Para instalar el actualizador, primero el archivo con tu token
(**nunca se sube a GitHub**):

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo mkdir -p /etc/clack && sudo nano /etc/clack/duckdns.env'
```

Dentro, con **tus** datos. Va solo `kursperu`, sin `.duckdns.org`: al
actualizar el dominio padre, todos sus subdominios lo siguen.

```
DUCKDNS_DOMINIOS=kursperu
DUCKDNS_TOKEN=aqui-va-tu-token
```

Y luego:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo chmod 600 /etc/clack/duckdns.env && sudo mkdir -p /opt/clack/despliegue && sudo cp ~/clack/despliegue/duckdns-actualizar.sh /opt/clack/despliegue/ 2>/dev/null; sudo cp ~/clack/despliegue/duckdns.{service,timer} /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now duckdns.timer'
```

### 2. Vigilar el disco

El servidor está al **88%** (unos 800 MB libres). Si se llena, n8n deja de
funcionar. Para hacer sitio:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'docker system df && docker image prune -af && df -h /'
```

---

## 🛟 Si algo falla

| Síntoma | Qué mirar |
|---|---|
| Clack no carga | `docker logs clack --tail 40` |
| Error 502 | Clack está caído: `docker ps -a --filter name=clack` |
| No sale el candado | `docker logs n8n-docker-caddy-1 --tail 40` |
| El dominio no resuelve | `dig +short clack.kursperu.duckdns.org` (debe dar `34.229.198.32`) |
| **n8n dejó de responder** | Sección "volver atrás" |

Comprobación rápida de que todo está en pie:

```bash
echo "n8n:   $(curl -s -o /dev/null -w '%{http_code}' https://kursperu.duckdns.org)"; echo "Clack: $(curl -s -o /dev/null -w '%{http_code}' https://clack.kursperu.duckdns.org)"
```

---

## ⚠️ Antes de meter datos reales

Clack ya está en internet, pero **todavía no guarda información de nadie**:
las cuentas son de prueba y viven en el navegador de cada visitante.
Antes de tener usuarios de verdad hacen falta:

* Cuentas reales con las contraseñas cifradas (nunca en el código).
* OAuth 2.0 (Google / Microsoft) — la clave secreta va en el servidor.
* reCAPTCHA — la clave secreta también va en el servidor.

Esas claves van en archivos como `/etc/clack/duckdns.env`: dentro del
servidor, con permisos `600`, y **nunca** en GitHub.

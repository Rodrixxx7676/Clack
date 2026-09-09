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

### 2. El disco está justo: 86% ocupado, ~980 MB libres

Ya se limpió todo lo que se podía (171 MB entre caché de paquetes,
revisiones viejas de snap e imágenes sin usar) y el disco está **entero
particionado**: no queda nada más que rascar.

Ojo con un número que engaña: `docker system df` dice que hay 2,8 GB
"recuperables", pero es mentira. Casi todas esas capas están compartidas
entre imágenes que sí se usan. Borrar imágenes sueltas libera **menos de
1 MB**. El desglose real se ve con:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'docker system df -v | head -12'
```

**La solución de verdad es ampliar el volumen EBS de 8 GB a 16 GB**, desde
la consola de AWS (EC2 → Volúmenes → Modificar). Se hace con la instancia
encendida y cuesta unos 0,64 USD al mes más. Después, dentro del servidor y
sin cortar nada:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo growpart /dev/nvme0n1 1 && sudo resize2fs /dev/nvme0n1p1 && df -h /'
```

### 3. Swap: pendiente hasta que haya disco

⚠️ **El servidor no tiene swap.** Si un proceso pide un pico de memoria, el
sistema mata al que más consume: n8n, con sus 584 MB. Un archivo de swap lo
evitaría, pero **no cabe**: con 980 MB libres, crearlo dejaría el disco al
borde, y un disco lleno es peor que un pico de memoria.

En cuanto el volumen esté ampliado:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile && echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab && echo "vm.swappiness=10" | sudo tee /etc/sysctl.d/99-clack-swap.conf && sudo sysctl -q vm.swappiness=10 && free -m'
```

### 4. Consumo real de cada aplicación

| | RAM | Disco (único) |
|---|---|---|
| n8n | 584 MB | 2,47 GB |
| Caddy | 13 MB | 88 MB |
| Clack | 16 MB | 67 MB |

Clack pesa 16 MB de memoria: en el servidor caben **muchas más**
aplicaciones como esta. El límite no es la memoria, es el disco.

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

## 🔐 Configurar reCAPTCHA en el servidor

El login ya está preparado, pero **la protección solo se activa cuando el
servidor tiene la clave secreta**. Mientras no la tenga, deja pasar a todos
y lo avisa por consola y en `/salud`.

Comprobar en qué estado está:

```bash
curl -s https://clack.kursperu.duckdns.org/salud
```

Si dice `"recaptcha":"desactivado"`, falta configurarlo. Se hace así:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo mkdir -p /etc/clack && sudo nano /etc/clack/recaptcha.env'
```

Dentro, una sola línea con **tu** clave secreta (la que Google llama
"clave secreta", no la de sitio):

```
RECAPTCHA_SECRET=aqui-va-tu-clave-secreta
```

Se puede añadir el umbral, si quieres ser más o menos estricto. Por
defecto es 0.5, donde 1 es "seguro que es una persona" y 0 "seguro que es
un robot":

```
RECAPTCHA_MINIMO=0.5
```

Y luego, permisos y aplicar:

```bash
ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'sudo chmod 600 /etc/clack/recaptcha.env && docker restart clack && sleep 3 && curl -s http://127.0.0.1:3001/salud'
```

Debe responder `"recaptcha":"activo"`.

> ⚠️ **Copia y pega las claves, no las transcribas de una captura.** Las
> claves de reCAPTCHA tienen 40 caracteres y mezclan `I` mayúscula, `l`
> minúscula, `1`, `O` y `0`, que en pantalla se ven casi igual. Un solo
> carácter equivocado y el login deja de funcionar con un mensaje que no
> explica nada. Para comprobar que quedó bien:
>
> ```bash
> ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'S=$(sudo grep RECAPTCHA_SECRET /etc/clack/recaptcha.env | cut -d= -f2); echo "${#S} caracteres (deben ser 40)"'
> ```
>
> Y si algo falla, el servidor ahora dice el motivo exacto de Google:
>
> ```bash
> ssh -i ~/Downloads/Ticket.pem ubuntu@34.229.198.32 'docker logs clack --tail 30 | grep -i recaptcha'
> ```

> ⚠️ **La clave secreta no se sube nunca a GitHub.** Vive solo en ese
> archivo del servidor, con permisos `600` (solo la puede leer root).
> `publicar.sh` se encarga de pasársela al contenedor en cada despliegue.

### Cómo funciona la protección

```
Navegador                    Servidor (3001)              Google
    │                              │                        │
    │ 1. pide ficha ───────────────┼───────────────────────▶ │
    │ ◀──────────────── ficha ─────┼─────────────────────────│
    │ 2. envía ficha ─────────────▶│                        │
    │                              │ 3. ¿es válida? ───────▶ │
    │                              │ ◀──── puntuación 0..1 ──│
    │ ◀──── aprobado sí/no ────────│                        │
```

El paso 3 es el que importa: **la clave secreta y la decisión están en el
servidor**. Si la comprobación se hiciera en el navegador, un robot
simplemente no ejecutaría ese código y entraría igual.

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

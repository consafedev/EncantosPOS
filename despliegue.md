# Guía de Despliegue en Servidor Debian

Esta guía está diseñada para desplegar la plataforma SaaS en tu servidor Debian, asegurando que no haya conflictos con otros servicios existentes (evitando colisiones de puertos).

## 1. Requisitos Previos en el Servidor
Asegúrate de tener instalado lo siguiente en tu servidor Debian:
- **Node.js** (v18 o superior)
- **Git**
- **PM2** (Process Manager para Node.js): `npm install -g pm2`
- **PostgreSQL** (Base de datos principal en producción)
- **Redis** (Para el sistema de colas de n8n/Playwright): `sudo apt install redis-server`
- **Nginx** (como Proxy Inverso)
- **Docker** (Opcional, pero recomendado para n8n y Playwright)
- **NFS Client**: `sudo apt install nfs-common`

## 2. Montaje del NAS vía NFS
El sistema guardará las imágenes directamente en el NAS. Debemos montar la carpeta del NAS en el servidor Debian.

```bash
sudo mkdir -p /mnt/saas_uploads
# IP del NAS: 10.18.170.236
# Ruta del NAS: /saas_uploads
sudo mount -t nfs 10.18.170.236:/saas_uploads /mnt/saas_uploads
```
*Nota:* Para que el montaje sea persistente tras reinicios, debes agregarlo a `/etc/fstab`.

## 3. Clonación del Repositorio
```bash
cd /var/www/
git clone <URL_DE_TU_REPOSITORIO> saas-platform
cd saas-platform
```

## 4. Configuración de Variables de Entorno
Crea el archivo `.env` basado en el `.env.example`. 
**CRÍTICO:** Para evitar chocar con otros servicios, definiremos un puerto específico para esta app (ej. `3005`).

```bash
cp .env.example .env
nano .env
```

Añade/Modifica las siguientes variables:
```env
PORT=3005
DATABASE_URL="postgresql://usuario:password@localhost:5432/saas_db?schema=public"
NEXT_PUBLIC_APP_URL="https://tudominio.com"
UPLOAD_DIR="/mnt/saas_uploads"
REDIS_URL="redis://localhost:6379"
# ... otras variables (Stripe, etc.)
```

## 5. Instalación y Construcción (Build)
```bash
npm install
npx prisma generate
npx prisma migrate deploy # Aplica los cambios a la base de datos
npm run build
```

## 6. Iniciar el Servicio con PM2
Usaremos PM2 para mantener la aplicación viva y reiniciarla si el servidor se reinicia.

```bash
pm2 start npm --name "saas-platform" -- start -- -p 3005
# Iniciar el worker de Marketplace (requiere Redis y Chrome instalado)
pm2 start tsx --name "marketplace-worker" -- scripts/marketplace-worker.ts
pm2 save
pm2 startup
```

## 7. Requisitos para Automatización (Playwright)
El worker de Marketplace requiere que el servidor tenga instalado un navegador. En Debian:
```bash
sudo npx playwright install-deps chromium
npx playwright install chromium
```
Asegúrate de configurar `FB_EMAIL` y `FB_PASSWORD` en el `.env`.

## 8. Configuración del Proxy Inverso (Nginx)
Para exponer la aplicación al exterior (o a Cloudflared) sin exponer el puerto 3005 directamente, configuramos Nginx.

```bash
sudo nano /etc/nginx/sites-available/saas-platform
```

Contenido del archivo:
```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilitar el sitio y reiniciar Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/saas-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. Actualizaciones Continuas (CI/CD Manual)
Cuando hagamos cambios en el código y quieras actualizar el servidor:
```bash
cd /var/www/saas-platform
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart saas-platform
```

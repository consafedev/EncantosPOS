# Release Notes & PRD Tracking

## 🎯 Estado Actual del PRD (Versión 1.0)

### ✅ Completado / En Progreso (Sprint 1)
- [x] Análisis de requerimientos y arquitectura base.
- [x] Creación de documentación de despliegue (`despliegue.md`).
- [x] Configuración inicial de ORM (Prisma) con esquema Multi-tenant (Inquilinos, Usuarios, Roles). Adaptado a SQLite para desarrollo.
- [x] Configuración de autenticación (NextAuth/Auth.js).
- [x] Conexión con NAS local vía NFS (File System local).

### ✅ Completado / En Progreso (Sprint 2)
- [x] CRUD de Inventario (API y UI).
- [x] Generación de códigos de barras y UI de impresión térmica.
- [x] Personalización de temas (CSS variables) y Logo.

### ✅ Completado / En Progreso (Sprint 3)
- [x] Integración de Stripe Connect (Lazy initialization).
- [x] E-commerce (Landing pública, Catálogo).
- [x] Carrito de compras (Context API + LocalStorage).
- [x] Checkout con Stripe y Webhooks base.

### ⏳ Pendiente (Sprints 4 al 6)
- **Sprint 4:** POS Offline-First (IndexedDB), event listener global para escáner, arqueo de caja.
- **Sprint 5:** API para n8n, scripts de Playwright/Puppeteer-stealth para FB Marketplace.
- **Sprint 6:** QA, pruebas offline/online, despliegue final.

---

## 💡 Propuestas de Mejora y Amplitud (Aprobadas)

Todas las propuestas han sido **ACEPTADAS** por el Delivery Manager y se integran al roadmap:

1. **PWA (Progressive Web App) para el POS:** Se implementará para asegurar persistencia offline robusta.
2. **Sistema de Colas (Redis/BullMQ) para FB Marketplace:** Se añadirá Redis al stack de despliegue para encolar publicaciones de n8n/Playwright.
3. **Middleware de RLS (Row Level Security) a nivel de Prisma:** Se creará una extensión de Prisma para inyectar y validar el `tenant_id` automáticamente.
4. **Webhooks para Sincronización POS <-> E-commerce:** Se desarrollará un sistema de resolución de conflictos para ventas concurrentes offline/online.

*Nota de Arquitectura:* La conexión al NAS se realizará mediante **NFS** montado directamente en el sistema de archivos del servidor Debian, por lo que la app de Next.js leerá y escribirá archivos usando el módulo `fs` nativo de Node.js apuntando a la ruta de montaje (ej. `/mnt/nas/uploads`).

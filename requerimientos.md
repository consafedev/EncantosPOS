# Requerimientos y Credenciales Necesarias

Para asegurar un flujo continuo en los próximos Sprints, he listado los elementos que necesitaremos de tu parte. Por ahora **podemos continuar con el Sprint 2 (Inventario) sin bloqueos**, pero necesitaremos esto para los Sprints 3 y 5.

## 1. Pasarela de Pagos (Stripe) - *Requerido para Sprint 3*
Necesitamos las llaves de API de Stripe para procesar pagos en el E-commerce.
* **¿De dónde se obtienen?**
  1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com/).
  2. Activa el "Modo de prueba" (Test mode) en la esquina superior derecha.
  3. Ve a "Desarrolladores" > "Claves de API".
* **¿Qué necesito que me des?**
  * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Empieza con `pk_test_...`): pk_test_51TEivjBHaONOEJHWtpIf31pPbHRxRLoofZBawwAWG7px25WtaCz8KxIxT1yfeGsU1gd2cdrxDzUsqndg4nDDdoy100MpNyNzOh

  * `STRIPE_SECRET_KEY` (Empieza con `sk_test_...`): sk_test_51TEivjBHaONOEJHWSk1xXrmxbCXkKjEIqOZlpmRbt7d61yqDfSNkCY39ljAnlO9ccQg84uU3dAIngBseVxHxkwCE00bc25b9Cz

## 2. Automatización de Facebook - *Requerido para Sprint 5*
Para evitar que Facebook bloquee tu cuenta personal o la de la empresa durante las pruebas de desarrollo del bot (Playwright/n8n).
* **¿Qué necesito que me des?**
  * Un **correo electrónico y contraseña** de una cuenta de Facebook "Dummy" (de prueba) que tenga acceso a Marketplace.
  * *Nota:* No uses una cuenta real importante hasta que el bot esté 100% probado y estabilizado, ya que FB es muy estricto con la automatización.

  Mail (en este caso inicio con telefono): 3337793600 
  Contraseña: R3n4t42017#

## 3. Branding y Assets (Opcional pero recomendado) - *Para Sprint 2 y 3*
* Logo de la empresa en formato PNG/SVG (versión clara y oscura).
* Código de color hexadecimal principal de la marca (para inyectarlo en el tema del Tenant).

-genera un apartado para que el administrador pueda seleccioonar el logo y se ponga tambien en el favicon, y el color permitele elegir libremente entre colores que sean previamente estudiados e implementados para seguir preservando potencia y atraccion de UX y UI.

---
*Nota del Arquitecto:* En este entorno de desarrollo (AI Studio), simularemos la subida de archivos (NFS) guardándolos en la carpeta local `/public/uploads`. Cuando despleguemos en tu servidor Debian, simplemente apuntaremos esa ruta al punto de montaje del NAS. ¡Todo está bajo control!

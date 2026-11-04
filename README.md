# Manu Sánchez Fotografía Cofrade

Web de fotografía de Semana Santa, hermandades y cofradías. Estática, rápida y publicada con GitHub Pages.
Las fotografías se alojan en Supabase Storage y los mensajes del formulario de contacto se guardan en Supabase.
Todo el contenido se edita en `src/data/`, sin tocar el diseño.

## Tecnologías

Vite + JavaScript sin framework, CSS propio, Supabase (Storage, base de datos y Edge Functions), Resend (correo) y GitHub Actions para el despliegue. Navegación con rutas `#/` (`#/galerias`, `#/galeria/mi-id`, `#/sobre-mi`, `#/contacto`).

## Archivos principales

| Archivo | Para qué sirve |
|---|---|
| `src/data/galleries.js` | Galerías y sus fotografías. **El archivo que más vas a usar.** |
| `src/data/site.js` | Contacto visible, "Sobre mí", redes sociales y fotos destacadas. |
| `src/media.js` | Lógica de imágenes: Supabase, fotos de demostración e imagen de sustitución. |
| `src/main.js` | Páginas, filtros, masonry, visor ampliado y formulario de contacto. |
| `src/style.css` | Todo el diseño. |
| `index.html` | Metadatos SEO, Open Graph, datos estructurados y verificación de Google. |
| `public/robots.txt`, `public/sitemap.xml` | Rastreo de buscadores (se publican en la raíz de la web). |
| `supabase/setup.sql` | Bucket público de fotografías y sus políticas. |
| `supabase/migrations/…contact_messages.sql` | Tabla de mensajes de contacto y sus políticas RLS. |
| `supabase/functions/contact-form/index.ts` | Función de servidor del formulario (valida, guarda y envía el correo). |
| `.github/workflows/deploy.yml` | Despliegue automático en cada cambio en `main`. |

## Publicar la web

Con **Settings → Pages → Source: GitHub Actions**, cada cambio en `main` se compila y publica solo en `https://manusanchezfotografiacofrade.github.io/`.

## Fotografías (Supabase Storage)

El bucket `fotografias` es público para ver y solo el usuario propietario puede subir, modificar o borrar. Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se definen en **Settings → Secrets and variables → Actions → Variables** (son públicas; nunca uses la `service_role`).

Sube las fotos desde **Storage → fotografias** y, en `src/data/galleries.js`, usa `folder: '2026/semana_santa'` (el nombre debe coincidir exactamente con la carpeta) o lista cada foto en `images` como `'sb:2026/semana_santa/foto-01.jpg'`.

## Formulario de contacto

Cada mensaje hace dos cosas: se **guarda** en la tabla `contact_messages` de Supabase y, si lo configuras, te llega un **correo**. El navegador solo habla con la Edge Function `contact-form`; la tabla no es accesible para los visitantes y la clave `service_role` solo existe en el servidor de Supabase.

Protección: validación de todos los campos (navegador y servidor), campo trampa invisible, tiempo mínimo de relleno, límite de 3 envíos cada 10 minutos por IP (anonimizada con SHA-256, no se guarda la IP) y 60 por hora en total, límite de tamaño y de enlaces, y solo acepta peticiones desde esta web.

### Configurar el aviso por correo (sin comprar dominio)

Resend, sin dominio propio, solo permite enviar desde `onboarding@resend.dev` **a la dirección con la que te registras en Resend**. Si te registras con tu Gmail, recibes los avisos en tu Gmail y no necesitas nada más.

1. Crea una cuenta en [resend.com](https://resend.com) **con tu Gmail** (ese será el correo receptor).
2. En Resend: **API Keys → Create API Key** (permiso de envío). Copia la clave (empieza por `re_`). Solo se muestra una vez.
3. En Supabase: **Edge Functions → Secrets** y añade:
   - `RESEND_API_KEY` = la clave `re_…`
   - `CONTACT_TO_EMAIL` = tu Gmail (el mismo con el que te registraste en Resend)
   - Opcional: `IP_HASH_SALT` = un texto aleatorio largo.
4. Envía un mensaje de prueba desde el formulario. El primer correo puede llegar a Spam: márcalo como "No es spam".

Mientras no existan esos secretos, el mensaje **se guarda igualmente** en Supabase, pero no se envía correo. La columna `notified_at` indica si el aviso salió. Al responder desde Gmail, la respuesta va directa al visitante (`reply_to`).

Limitación: con `onboarding@resend.dev` solo puedes recibir en esa dirección. Si algún día quieres otro remitente o varios destinatarios, hace falta verificar un dominio en Resend.

### Consultar los mensajes

Hasta que exista el panel privado: **Supabase → Table Editor → contact_messages**. Estados: `nuevo`, `leido`, `respondido`. Las políticas RLS ya permiten que **solo tu usuario** (el administrador) lea y cambie el estado desde un futuro panel con Supabase Auth: ver mensajes, leer cada consulta, marcar como leído o respondido y consultar la fecha de recepción.

## SEO y Google Search Console

La etiqueta de verificación de Google está en el `<head>` de `index.html`. Incluye título y descripción por sección (dinámicos), Open Graph, URL canónica, datos estructurados `Photographer` (schema.org), `robots.txt`, `sitemap.xml` y textos ALT descriptivos.

En Search Console: añade la propiedad **Prefijo de URL** `https://manusanchezfotografiacofrade.github.io/`, pulsa **Verificar** y, en **Sitemaps**, envía `sitemap.xml`.

Para mejorar los ALT: en `src/data/site.js`, el campo `caption` de cada foto destacada es su texto alternativo; descríbela con claridad.

## Cómo crear una galería

En `src/data/galleries.js` copia un bloque `{ ... }`, cambia `id` (único, sin espacios), `title`, `event`, `brotherhood`, `location`, `date` (AAAA-MM-DD), `description`, `cover` e `images` o `folder`. Los comentarios del archivo explican cada campo.

## Pendiente y limitaciones

- **Panel de administración: no implementado.** La base de seguridad está lista (RLS y usuario propietario). Falta la interfaz con login.
- **Rutas con `#`:** Google trata las URL con `#` como la misma página, así que las secciones y galerías no se indexan por separado y el sitemap solo incluye la portada. Para indexarlas hace falta pasar a URL reales (`/galerias/`, `/galeria/mi-id/`) generando páginas HTML en la compilación.
- **Imagen Open Graph:** falta una imagen de previsualización para compartir en redes (`og:image`, JPG o PNG, 1200×630, con URL absoluta).
- **Datos de contacto visibles y textos "Sobre mí":** son de ejemplo hasta que los sustituyas.

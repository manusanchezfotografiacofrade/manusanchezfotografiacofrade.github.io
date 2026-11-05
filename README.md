# Manu Sánchez Fotografía Cofrade

Web de fotografía de Semana Santa, hermandades y cofradías. Estática, rápida y publicada con GitHub Pages.
Las fotografías se alojan en Supabase Storage y los mensajes del formulario de contacto se guardan en Supabase.
El contenido se edita en `src/data/`, sin tocar el diseño.

## Tecnologías

Vite + JavaScript sin framework, CSS propio, Supabase (Storage, base de datos, Auth y Edge Functions), Resend (correo) y GitHub Actions para el despliegue. Navegación con rutas `#/` (`#/galerias`, `#/galeria/mi-id`, `#/sobre-mi`, `#/contacto`, `#/admin`).

## Archivos principales

| Archivo | Para qué sirve |
|---|---|
| `src/data/galleries.js` | Galerías y sus fotografías. **El archivo que más vas a usar.** |
| `src/data/site.js` | Contacto visible, "Sobre mí", redes sociales y fotos destacadas. |
| `src/media.js` | Lógica de imágenes: Supabase, fotos de demostración e imagen de sustitución. |
| `src/main.js` | Páginas, filtros, masonry, visor ampliado y formulario de contacto. |
| `src/admin.js` | Panel privado (`#/admin`): mensajes y fotografías. |
| `src/style.css` | Todo el diseño. |
| `index.html` | Metadatos SEO, Open Graph, datos estructurados y verificación de Google. |
| `public/robots.txt`, `public/sitemap.xml` | Rastreo de buscadores (se publican en la raíz de la web). |
| `supabase/setup.sql` | Bucket público de fotografías y sus políticas. |
| `supabase/migrations/…contact_messages.sql` | Tabla de mensajes de contacto y sus políticas RLS. |
| `supabase/functions/contact-form/index.ts` | Función de servidor del formulario (valida, guarda y envía el correo). |
| `.github/workflows/deploy.yml` | Despliegue automático en cada cambio en `main`. |

## Publicar la web

Con **Settings → Pages → Source: GitHub Actions**, cada cambio en `main` se compila y publica solo en `https://manusanchezfotografiacofrade.github.io/`.

## Panel privado

Dirección: `https://manusanchezfotografiacofrade.github.io/#/admin` (no aparece en ningún menú y se marca como no indexable). Se entra con el correo y la contraseña del usuario administrador creado en Supabase (**Authentication → Users**).

**Mensajes:** lista de consultas con filtro por estado, lectura de cada una (nombre, correo, asunto, mensaje y fecha de recepción), botones para marcarla como **leído**, **respondido** o **nuevo**, y enlace para responder por correo.

**Fotografías:** subir fotos a la carpeta que elijas (por ejemplo `2026/besamanos/mi-galeria`), con optimización automática opcional (máx. 2000 px, calidad 82 %, se eliminan los datos EXIF como la ubicación GPS), explorar las carpetas del bucket, ver una foto, copiar su ruta (`sb:...`, lista para usar en `galleries.js`) y eliminarla.

**Seguridad:** la protección real la imponen las políticas de Supabase, no la página. Solo el usuario administrador puede leer los mensajes, cambiar su estado y subir o borrar fotos; cualquier otra persona solo ve el formulario de acceso y el servidor le deniega los datos. El panel usa únicamente la clave pública `anon`; la clave `service_role` no se usa en la web. Recomendado en Supabase: **Authentication → Sign In / Providers → desactiva "Allow new users to sign up"** para que nadie más pueda crear cuentas, y usa una contraseña larga y única.

**Qué no hace todavía:** los títulos, descripciones, fechas, hermandades y portadas de las galerías siguen editándose en `src/data/galleries.js`. Una galería nueva se crea ahí (copiando un bloque) y se rellena subiendo las fotos a su carpeta desde el panel.

## Fotografías (Supabase Storage)

El bucket `fotografias` es público para ver y solo el usuario administrador puede subir, modificar o borrar. Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se definen en **Settings → Secrets and variables → Actions → Variables** (son públicas; nunca uses la `service_role`).

Sube las fotos desde el panel o desde **Storage → fotografias** y, en `src/data/galleries.js`, usa `folder: '2026/besamanos/mi-galeria'` (el nombre debe coincidir exactamente con la carpeta) o lista cada foto en `images` como `'sb:2026/besamanos/mi-galeria/foto-01.jpg'`.

Importante: sube las fotos **optimizadas** (unos 2000 px de lado largo, menos de 500 KB). Las originales de cámara (5 MB o más) hacen la web muy lenta, sobre todo en el móvil. La opción de optimizar del panel lo hace por ti.

## Formulario de contacto

Cada mensaje hace dos cosas: se **guarda** en la tabla `contact_messages` de Supabase y, si lo configuras, te llega un **correo**. El navegador solo habla con la Edge Function `contact-form`; la tabla no es accesible para los visitantes y la clave `service_role` solo existe en el servidor de Supabase.

Protección: validación de todos los campos (navegador y servidor), campo trampa invisible, tiempo mínimo de relleno, límite de 3 envíos cada 10 minutos por IP (anonimizada con SHA-256, no se guarda la IP) y 60 por hora en total, límite de tamaño y de enlaces, y solo acepta peticiones desde esta web.

### Configurar el aviso por correo (sin comprar dominio)

Resend, sin dominio propio, solo permite enviar desde `onboarding@resend.dev` **a la dirección con la que te registras en Resend**. Si te registras con tu Gmail, recibes los avisos en tu Gmail y no necesitas nada más.

1. Crea una cuenta en [resend.com](https://resend.com) **con el Gmail donde quieras recibir los avisos**.
2. En Resend: **API Keys → Create API Key** (permiso de envío). Copia la clave (empieza por `re_`). Solo se muestra una vez.
3. En Supabase: **Edge Functions → Secrets** y añade:
   - `RESEND_API_KEY` = la clave `re_…`
   - `CONTACT_TO_EMAIL` = ese mismo Gmail
   - Opcional: `IP_HASH_SALT` = un texto aleatorio largo.
4. Envía un mensaje de prueba desde el formulario.

Mientras no existan esos secretos, el mensaje **se guarda igualmente** en Supabase, pero no se envía correo. La columna `notified_at` indica si el aviso salió. Al responder desde Gmail, la respuesta va directa al visitante (`reply_to`).

Limitación: con `onboarding@resend.dev` solo puedes recibir en esa dirección. Si algún día quieres otro remitente o varios destinatarios, hace falta verificar un dominio en Resend.

El correo que se muestra en la página de Contacto (`email` en `src/data/site.js`) es solo texto visible y es independiente del correo donde recibes los avisos (`CONTACT_TO_EMAIL`).

## SEO y Google Search Console

La etiqueta de verificación de Google está en el `<head>` de `index.html`. Incluye título y descripción por sección (dinámicos), Open Graph, URL canónica, datos estructurados `Photographer` (schema.org), `robots.txt`, `sitemap.xml` y textos ALT descriptivos.

En Search Console: añade la propiedad **Prefijo de URL** `https://manusanchezfotografiacofrade.github.io/`, pulsa **Verificar** y, en **Sitemaps**, envía `sitemap.xml` (Google no lee `sitemap.yml`).

## Cómo crear una galería

En `src/data/galleries.js` copia un bloque `{ ... }`, cambia `id` (único, sin espacios), `title`, `event`, `brotherhood`, `location`, `date` (AAAA-MM-DD, o solo AAAA), `description`, `cover` y `folder`. Los comentarios del archivo explican cada campo.

## Pendiente y limitaciones

- **Rutas con `#`:** Google trata las URL con `#` como la misma página, así que las secciones y galerías no se indexan por separado y el sitemap solo incluye la portada. Para indexarlas hace falta pasar a URL reales (`/galerias/`, `/galeria/mi-id/`) generando páginas HTML en la compilación.
- **Imagen Open Graph:** falta una imagen de previsualización para compartir en redes (`og:image`, JPG o PNG, 1200×630, con URL absoluta).
- **Textos "Sobre mí":** la presentación y la trayectoria son de ejemplo hasta que los sustituyas.
- **Panel:** no edita aún los datos de las galerías (títulos, descripciones, portadas); eso requeriría guardarlas en la base de datos en lugar de en `galleries.js`.

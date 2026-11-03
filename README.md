# Manu Sánchez Fotografía Cofrade

Web de fotografía de Semana Santa, hermandades y cofradías. Estática, rápida y publicada con GitHub Pages.
Las fotografías pueden alojarse en Supabase Storage. Todo el contenido se edita en `src/data/`, sin tocar el diseño.

## Tecnologías

Vite + JavaScript sin framework (sin dependencias en el navegador), CSS propio, Supabase Storage (opcional) y GitHub Actions para el despliegue. Navegación con rutas `#/` (`#/galerias`, `#/galeria/mi-id`, `#/sobre-mi`, `#/contacto`), que funcionan en GitHub Pages sin configuración extra.

## Archivos principales

| Archivo | Para qué sirve |
|---|---|
| `src/data/galleries.js` | Galerías y sus fotografías. **El archivo que más vas a usar.** |
| `src/data/site.js` | Contacto, "Sobre mí", redes sociales y fotos destacadas. |
| `src/media.js` | Lógica de imágenes: Supabase, fotos de demostración e imagen de sustitución. |
| `src/main.js` | Páginas, filtros, masonry y visor ampliado (lightbox). |
| `src/style.css` | Todo el diseño. |
| `supabase/setup.sql` | Bucket público y políticas de seguridad. |
| `.github/workflows/deploy.yml` | Despliegue automático en cada cambio en `main`. |

## Qué incluye

Inicio con portada a pantalla completa, destacadas y últimas galerías. Galerías filtrables por año, hermandad, evento y localidad. Cada galería tiene masonry y visor con flechas, teclado, deslizamiento en móvil y cierre fácil. Incluye Sobre mí, Contacto, redes sociales, carga diferida de imágenes, imagen de sustitución si una foto falla, SEO básico, Open Graph, favicon y accesibilidad básica (foco, etiquetas, `prefers-reduced-motion`).

Las imágenes de ejemplo se generan en el propio código (marcadas "DEMO") y no son fotografías de nadie.

## Publicar la web (una sola vez)

1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Haz cualquier cambio en `main` (o en **Actions → Deploy a GitHub Pages → Run workflow**).
3. La web queda en `https://manusanchezfotografiacofrade.github.io/`.

## Configurar Supabase (opcional; la web funciona sin ello)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **Authentication → Users → Add user** crea tu usuario propietario y copia su UUID.
3. Abre `supabase/setup.sql`, sustituye `TU_USER_UUID` (3 veces) por ese UUID y ejecútalo en **SQL Editor**. Así el bucket `fotografias` es público para leer y solo tú puedes escribir.
4. En **Project Settings → API** copia la *Project URL* y la clave `anon` (pública). **Nunca uses la `service_role`.**
5. En GitHub: **Settings → Secrets and variables → Actions → pestaña Variables** crea `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Opcionalmente `VITE_SUPABASE_BUCKET` (por defecto `fotografias`).
6. Para desarrollo local, copia `.env.example` a `.env` (está ignorado por Git).

## Cómo añadir fotografías

Sube las fotos desde el panel de Supabase (**Storage → fotografias**) con esta estructura: `2026/semana-santa/hermandad-01.jpg`, `2026/besamanos/...`, `2025/cultos/...`. Después tienes dos opciones en `src/data/galleries.js`:

- **Automática:** añade `folder: '2026/semana-santa'` a la galería y sus fotos se leerán solas de esa carpeta.
- **Manual:** lista cada foto en `images` como `'sb:2026/semana-santa/hermandad-01.jpg'`. También vale una URL completa.

Recomendación de rendimiento: sube JPG o WebP de unos 2000 px de lado largo y menos de 500 KB. Si tu plan de Supabase incluye transformación de imágenes, pon `VITE_SUPABASE_TRANSFORM=true` para servir WebP redimensionado.

## Cómo crear una galería

En `src/data/galleries.js` copia un bloque `{ ... }`, cambia `id` (único, sin espacios), `title`, `event`, `brotherhood`, `location`, `date` (AAAA-MM-DD), `description`, `cover` e `images` o `folder`. Guarda y listo. Los comentarios del archivo explican cada campo.

## Cómo modificar textos e información

- **Nombre, frase, contacto, portada:** `src/data/site.js` → `site`.
- **Sobre mí y trayectoria:** `src/data/site.js` → `photographer`. Los textos `[EJEMPLO]` son provisionales.
- **Redes sociales:** `src/data/site.js` → `social`.
- **Fotos destacadas de inicio:** `src/data/site.js` → `featured`.

Puedes editar los archivos directamente desde GitHub (icono del lápiz) y confirmar el cambio en `main`; la web se actualiza sola en 1 o 2 minutos.

## Formulario de contacto

No envía nada hasta que conectes un servicio real. Crea un formulario en [Formspree](https://formspree.io) (u otro equivalente) y pega su URL en `contactEndpoint` de `src/data/site.js`. Mientras esté vacío, el formulario lo indica con claridad.

## Pendiente y limitaciones

- **Panel de administración: no implementado.** Para que fuera seguro haría falta una página de login con Supabase Auth (ya preparada a nivel de base de datos: solo tu UUID puede escribir en el bucket) y una interfaz de subida. Se puede añadir como siguiente paso sin cambiar nada de lo existente. Mientras tanto, sube las fotos desde el panel de Supabase.
- **Imagen Open Graph:** falta una imagen de previsualización para compartir en redes. Hay que añadir una etiqueta `og:image` con la URL absoluta de una imagen (JPG o PNG, 1200×630) cuando tengas la definitiva.
- **URLs:** usan `#/` porque GitHub Pages no admite rutas limpias en una web de una sola página sin trucos adicionales.
- **Fotografías y textos:** todo lo marcado como DEMO o EJEMPLO es provisional.

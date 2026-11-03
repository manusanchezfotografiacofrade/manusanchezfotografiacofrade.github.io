// ============================================================
// IMÁGENES: demostración + integración con Supabase Storage
// ============================================================
// En los archivos de datos una fotografía puede ser:
//   1) Una URL completa:            'https://.../foto.jpg'
//   2) Una ruta de Supabase:        'sb:2026/semana-santa/foto-01.jpg'  (bucket "fotografias")
//   3) Una imagen de demostración:  ph(1)  (se genera sola, no es una foto real)

const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; // clave PÚBLICA anon (nunca service_role)
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'fotografias';
const TRANSFORM = import.meta.env.VITE_SUPABASE_TRANSFORM === 'true';

export const supabaseOn = Boolean(URL_ && KEY);

// Imagen de demostración generada (SVG). Sirve también como imagen de sustitución.
export const ph = (n = 0, w = 1200, h = 800, label = `FOTO DEMO ${n}`) => {
  const hue = 34 + ((n * 9) % 16);
  const light = 24 + (n % 3) * 5;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">` +
    `<defs><radialGradient id="g" cx="50%" cy="38%" r="75%">` +
    `<stop offset="0" stop-color="hsl(${hue},45%,${light}%)"/><stop offset="1" stop-color="#0c0b0a"/>` +
    `</radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>` +
    `<text x="50%" y="50%" fill="#b8964f" fill-opacity=".75" font-family="Georgia,serif" ` +
    `font-size="${Math.round(w / 24)}" text-anchor="middle">${label}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

// Varias imágenes de demostración con distintas proporciones (para ver el masonry).
const SIZES = [[1200, 800], [800, 1200], [1000, 1000], [1200, 900], [900, 1200]];
export const demo = (start, count) =>
  Array.from({ length: count }, (_, i) => {
    const [w, h] = SIZES[(start + i) % SIZES.length];
    return ph(start + i, w, h);
  });

// Convierte lo que haya en los datos en una URL usable por <img>.
export const img = (src, width) => {
  if (!src) return ph(0, 1200, 800, 'Fotografía no disponible');
  if (!src.startsWith('sb:')) return src;
  if (!supabaseOn) {
    const n = [...src].reduce((a, c) => a + c.charCodeAt(0), 0);
    return ph(n, 1200, 800, 'Supabase sin conectar');
  }
  const path = `${URL_}/storage/v1/object/public/${BUCKET}/${src.slice(3)}`;
  return TRANSFORM && width
    ? path.replace('/object/public/', '/render/image/public/') + `?width=${width}&format=webp`
    : path;
};

// Lista las fotografías de una carpeta del bucket (p. ej. '2026/semana-santa').
// Requiere la política de lectura pública de supabase/setup.sql. Si falla, devuelve [].
export async function listFolder(folder) {
  if (!supabaseOn) return [];
  try {
    const r = await fetch(`${URL_}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ prefix: folder, limit: 500, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!r.ok) return [];
    return (await r.json())
      .filter((o) => o.id && /\.(jpe?g|png|webp|avif)$/i.test(o.name))
      .map((o) => `sb:${folder}/${o.name}`);
  } catch {
    return [];
  }
}

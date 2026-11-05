// ============================================================
// GALERÍAS  —  AQUÍ AÑADES Y EDITAS TUS REPORTAJES
// ============================================================
// Para añadir una galería: copia el bloque { ... }, cambia los datos y pégalo en la lista.
//
// Campos:
//   id           Identificador único, sin espacios ni tildes (aparece en la URL: #/galeria/mi-id)
//   title        Nombre del reportaje
//   event        Tipo: 'Semana Santa', 'Besamanos', 'Cultos', 'Procesión'... (sirve de filtro)
//   brotherhood  Hermandad o cofradía
//   location     Localidad
//   date         Fecha 'AAAA-MM-DD'. Si no sabes el día, pon solo el año: 'AAAA' (se mostrará solo el año)
//   description  Texto breve del reportaje
//   cover        Portada: ruta de Supabase ('sb:ruta/en/supabase.jpg') o URL completa
//   images       Lista de fotografías (mismos formatos que cover). Déjala vacía si usas "folder"
//   folder       OPCIONAL. Carpeta de Supabase, p. ej. '2026/besamanos/mi-galeria'. Si Supabase está
//                conectado, las fotos se leen automáticamente de esa carpeta y ya no hace
//                falta listarlas en "images". El nombre debe coincidir EXACTAMENTE con la carpeta del bucket.

export const galleries = [
  {
    id: 'besamanos-candelaria-jerez-2026',
    title: 'Besamanos María Santísima de la Candelaria',
    event: 'Besamanos',
    brotherhood: 'Hermandad de la Candelaria',
    location: 'Jerez de la Frontera',
    date: '2026', // Pon 'AAAA-MM-DD' cuando quieras mostrar el día exacto
    description: 'Reportaje fotográfico del besamanos de la Hermandad de la Candelaria en Jerez de la Frontera, 2026.',
    cover: 'sb:2026/besamanos/besamanos-candelaria-jerez/IMG_1685.jpg', // Cambia por la foto que prefieras como portada
    folder: '2026/besamanos/besamanos-candelaria-jerez', // Las fotos se leen solas de esta carpeta de Supabase
    images: [],
  },
];

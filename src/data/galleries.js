// ============================================================
// GALERÍAS  —  AQUÍ AÑADES Y EDITAS TUS REPORTAJES
// ============================================================
// Para añadir una galería: copia un bloque { ... }, cambia los datos y pégalo en la lista.
//
// Campos:
//   id           Identificador único, sin espacios ni tildes (aparece en la URL: #/galeria/mi-id)
//   title        Nombre del reportaje
//   event        Tipo: 'Semana Santa', 'Besamanos', 'Cultos', 'Procesión'... (sirve de filtro)
//   brotherhood  Hermandad o cofradía. Si no es de una en concreto, déjalo vacío: ''
//   location     Localidad (también puede ir vacío: '')
//   date         Fecha 'AAAA-MM-DD'. Si no sabes el día, pon solo el año: 'AAAA' (se mostrará solo el año).
//                Las galerías se ordenan de la más reciente a la más antigua según esta fecha.
//   description  Texto breve del reportaje
//   cover        Portada: ruta de Supabase ('sb:ruta/en/supabase.jpg') o URL completa
//   images       Lista de fotografías (mismos formatos que cover). Déjala vacía si usas "folder"
//   folder       OPCIONAL. Carpeta de Supabase, p. ej. '2026/besamanos/mi-galeria'. Si Supabase está
//                conectado, las fotos se leen automáticamente de esa carpeta y ya no hace
//                falta listarlas en "images". El nombre debe coincidir EXACTAMENTE con la carpeta del bucket.
//   soon         OPCIONAL. true = la galería se muestra como "Próximamente" (sin fotos). En cuanto
//                subas fotos a su carpeta, deja de estar "próximamente" sola; no hace falta cambiar nada.
//
// Las fechas de los días de Semana Santa 2026 siguen el calendario litúrgico (Domingo de Resurrección: 5 de abril).

export const galleries = [
  {
    id: 'domingo-resurreccion-2026',
    title: 'Domingo de Resurrección',
    event: 'Semana Santa',
    brotherhood: '',
    location: 'Jerez de la Frontera', // Confirma o cambia la localidad (puedes dejarla vacía: '')
    date: '2026-04-05',
    description: 'Reportaje fotográfico del Domingo de Resurrección, Semana Santa 2026.',
    cover: 'sb:2026/semana_santa/domingo-resurreccion/IMG_7307.jpg', // Cambia por la foto que prefieras como portada
    folder: '2026/semana_santa/domingo-resurreccion',
    images: [],
  },
  {
    id: 'sabado-santo-2026',
    title: 'Sábado Santo',
    event: 'Semana Santa',
    brotherhood: '',
    location: 'Jerez de la Frontera',
    date: '2026-04-04',
    description: 'Reportaje fotográfico del Sábado Santo, Semana Santa 2026.',
    cover: 'sb:2026/semana_santa/sabado-santo/IMG_6997.jpg',
    folder: '2026/semana_santa/sabado-santo',
    images: [],
  },
  {
    id: 'viernes-santo-2026',
    title: 'Viernes Santo',
    event: 'Semana Santa',
    brotherhood: '',
    location: 'Jerez de la Frontera',
    date: '2026-04-03',
    description: 'Reportaje fotográfico del Viernes Santo, Semana Santa 2026.',
    cover: 'sb:2026/semana_santa/viernes-santo/IMG_6697.jpg',
    folder: '2026/semana_santa/viernes-santo',
    images: [],
  },
  {
    id: 'jueves-santo-2026',
    title: 'Jueves Santo',
    event: 'Semana Santa',
    brotherhood: '',
    location: 'Jerez de la Frontera',
    date: '2026-04-02',
    description: 'Reportaje fotográfico del Jueves Santo, Semana Santa 2026.',
    cover: 'sb:2026/semana_santa/jueves-santo/IMG_6222.jpg',
    folder: '2026/semana_santa/jueves-santo',
    images: [],
  },
  {
    id: 'miercoles-santo-2026',
    title: 'Miércoles Santo',
    event: 'Semana Santa',
    brotherhood: '',
    location: 'Jerez de la Frontera',
    date: '2026-04-01',
    description: 'Reportaje fotográfico del Miércoles Santo, Semana Santa 2026.',
    cover: 'sb:2026/semana_santa/miercoles-santo/IMG_5868.jpg',
    folder: '2026/semana_santa/miercoles-santo',
    images: [],
  },
  {
    id: 'martes-santo-2026',
    title: 'Martes Santo',
    event: 'Semana Santa',
    brotherhood: '',
    location: 'Jerez de la Frontera',
    date: '2026-03-31',
    description: 'Reportaje fotográfico del Martes Santo, Semana Santa 2026.',
    cover: 'sb:2026/semana_santa/martes-santo/IMG_5477.jpg',
    folder: '2026/semana_santa/martes-santo',
    images: [],
  },
  {
    id: 'domingo-ramos-2026',
    title: 'Domingo de Ramos',
    event: 'Semana Santa',
    brotherhood: '',
    location: 'Jerez de la Frontera',
    date: '2026-03-29',
    description: 'Reportaje fotográfico del Domingo de Ramos, Semana Santa 2026.',
    cover: 'sb:2026/semana_santa/domingo-ramos/IMG_5062.jpg',
    folder: '2026/semana_santa/domingo-ramos',
    images: [],
  },
  {
    id: 'sabado-de-pasion-2026',
    title: 'Sábado de Pasión',
    event: 'Semana Santa',
    brotherhood: '', // No es una hermandad en concreto
    location: 'Jerez de la Frontera',
    date: '2026-03-28',
    description: 'Reportaje fotográfico del Sábado de Pasión, Semana Santa 2026.',
    cover: 'sb:2026/semana_santa/sabado-pasion/IMG_4925.jpg',
    folder: '2026/semana_santa/sabado-pasion',
    images: [],
  },
  {
    id: 'noche-de-jesus-2026',
    title: 'Noche de Jesús',
    event: 'Semana Santa',
    brotherhood: '',
    location: 'Jerez de la Frontera',
    date: '2026', // Pon 'AAAA-MM-DD' cuando quieras mostrar el día exacto
    description: 'Galería de la Noche de Jesús, Semana Santa 2026. Próximamente.',
    cover: '', // Sin portada mientras sea "próximamente"; al subir fotos se usa la primera
    folder: '2026/semana_santa/noche-jesus',
    soon: true, // Se muestra como "Próximamente" hasta que haya fotos en su carpeta
    images: [],
  },
  {
    id: 'veneracion-viacrucis-2026',
    title: 'Veneración Nuestro Padre Jesús de la Via-Crucis',
    event: 'Besamanos',
    brotherhood: 'Hermandad de las Cinco Llagas',
    location: 'Jerez de la Frontera', // Confirma o cambia la localidad
    date: '2026', // Pon 'AAAA-MM-DD' cuando quieras mostrar el día exacto
    description: 'Reportaje fotográfico de la veneración de Nuestro Padre Jesús de la Via-Crucis, de la Hermandad de las Cinco Llagas, 2026.',
    cover: 'sb:2026/besamanos/veneracion-viacrucis/IMG_1632.jpg', // Cambia por la foto que prefieras como portada
    folder: '2026/besamanos/veneracion-viacrucis', // Las fotos se leen solas de esta carpeta de Supabase
    images: [],
  },
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

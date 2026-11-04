// ============================================================
// GALERÍAS  —  AQUÍ AÑADES Y EDITAS TUS REPORTAJES
// ============================================================
// Para añadir una galería: copia un bloque { ... }, cambia los datos y pégalo en la lista.
// Todo lo marcado como (DEMO) es de ejemplo y debes sustituirlo.
//
// Campos:
//   id           Identificador único, sin espacios ni tildes (aparece en la URL: #/galeria/mi-id)
//   title        Nombre del reportaje
//   event        Tipo: 'Semana Santa', 'Besamanos', 'Cultos', 'Procesión'... (sirve de filtro)
//   brotherhood  Hermandad o cofradía
//   location     Localidad
//   date         Fecha en formato AAAA-MM-DD (el año se calcula solo)
//   description  Texto breve del reportaje
//   cover        Portada (URL completa, 'sb:ruta/en/supabase.jpg' o ph(n) de demostración)
//   images       Lista de fotografías (mismos formatos que cover)
//   folder       OPCIONAL. Carpeta de Supabase, p. ej. '2026/semana_santa'. Si Supabase está
//                conectado, las fotos se leen automáticamente de esa carpeta y ya no hace
//                falta listarlas en "images" (si la carpeta está vacía se usa "images").
//                El nombre debe coincidir EXACTAMENTE con la carpeta del bucket.
import { ph, demo } from '../media.js';

export const galleries = [
  {
    id: 'semana-santa-2026',
    title: 'Semana Santa 2026 (DEMO)',
    event: 'Semana Santa',
    brotherhood: 'Hermandad de ejemplo (DEMO)',
    location: 'Jerez de la Frontera',
    date: '2026-04-01',
    description: '[DEMO] Descripción de ejemplo del reportaje. Sustitúyela por tu texto.',
    cover: 'sb:2026/semana_santa/tu-foto.jpg', // Foto de Supabase Storage
    folder: '2026/semana_santa', // Carpeta real creada en Supabase Storage
    images: demo(1, 12),
  },
  {
    id: 'besamanos-2026',
    title: 'Besamanos 2026 (DEMO)',
    event: 'Besamanos',
    brotherhood: 'Cofradía de ejemplo (DEMO)',
    location: 'Sevilla',
    date: '2026-03-14',
    description: '[DEMO] Descripción de ejemplo del besamanos. Sustitúyela por tu texto.',
    cover: ph(21),
    // folder: '2026/besamanos',
    images: demo(21, 9),
  },
  {
    id: 'cultos-2025',
    title: 'Cultos 2025 (DEMO)',
    event: 'Cultos',
    brotherhood: 'Hermandad de ejemplo (DEMO)',
    location: 'Cádiz',
    date: '2025-11-08',
    description: '[DEMO] Descripción de ejemplo de los cultos. Sustitúyela por tu texto.',
    cover: ph(41),
    // folder: '2025/cultos',
    images: demo(41, 8),
  },
];

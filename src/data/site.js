// ============================================================
// DATOS DEL SITIO: contacto, fotógrafo, redes y destacadas
// ============================================================
// Todo lo marcado como [EJEMPLO] o (DEMO) es provisional: sustitúyelo por tus datos reales.
import { ph } from '../media.js';

export const site = {
  name: 'Manu Sánchez Fotografía Cofrade',
  tagline: 'Capturando la fe, el sentimiento y la tradición',
  hero: ph(900, 1920, 1080), // Portada de inicio. Cambia por una URL o 'sb:portada/inicio.jpg'

  // Datos de contacto [EJEMPLO]
  contactIntro: '[EJEMPLO] ¿Quieres consultar un reportaje, encargar una cobertura o colaborar con tu hermandad? Escríbeme.',
  email: 'correo@ejemplo.com',
  phone: '+34 000 000 000',
  location: 'Andalucía',

  // Para que el formulario envíe mensajes de verdad, pega aquí la URL de un servicio
  // como Formspree (https://formspree.io): 'https://formspree.io/f/xxxxxxx'
  // Mientras esté vacío, el formulario avisa de que NO envía nada.
  contactEndpoint: '',
};

export const photographer = {
  name: 'Manu Sánchez',
  photo: ph(300, 800, 1000, 'FOTO DE PERFIL (DEMO)'),
  intro: '[EJEMPLO] Presentación breve del fotógrafo. Sustitúyela por tu propio texto: quién eres y qué te mueve a fotografiar el mundo cofrade.',
  passion: '[EJEMPLO] Aquí cuentas tu pasión por la Semana Santa: cómo la vives, qué te emociona y por qué la fotografías.',
  vision: '[EJEMPLO] Aquí explicas tu forma de entender la fotografía cofrade: qué buscas en una imagen, la luz, los gestos, el silencio.',
  // Trayectoria: añade o quita líneas libremente. [EJEMPLO]
  journey: [
    { year: 'Año', text: '[EJEMPLO] Hito de tu trayectoria fotográfica.' },
    { year: 'Año', text: '[EJEMPLO] Otro hito: una exposición, una colaboración, una publicación...' },
    { year: 'Año', text: '[EJEMPLO] Actualidad.' },
  ],
};

// Redes sociales. Añade las que quieras copiando una línea. [ENLACES DE EJEMPLO]
export const social = [
  { name: 'Instagram', url: 'https://www.instagram.com/usuario-ejemplo' },
  { name: 'Facebook', url: 'https://www.facebook.com/usuario-ejemplo' },
  // { name: 'YouTube', url: 'https://www.youtube.com/@usuario-ejemplo' },
];

// Fotografías destacadas de la portada. 'gallery' es el id de la galería a la que enlaza.
export const featured = [
  { src: ph(101, 800, 1100), gallery: 'semana-santa-2026', caption: 'Destacada 1 (DEMO)' },
  { src: ph(102, 800, 1100), gallery: 'semana-santa-2026', caption: 'Destacada 2 (DEMO)' },
  { src: ph(103, 800, 1100), gallery: 'besamanos-2026', caption: 'Destacada 3 (DEMO)' },
  { src: ph(104, 800, 1100), gallery: 'cultos-2025', caption: 'Destacada 4 (DEMO)' },
];

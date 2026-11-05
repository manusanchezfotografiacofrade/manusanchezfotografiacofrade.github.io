// ============================================================
// DATOS DEL SITIO: contacto, fotógrafo, redes y destacadas
// ============================================================
// Todo lo marcado como [EJEMPLO] es provisional: sustitúyelo por tus datos reales.
import { ph } from '../media.js';

export const site = {
  name: 'Manu Sánchez Fotografía Cofrade',
  tagline: 'Capturando la fe, el sentimiento y la tradición',
  // Imagen de la portada de inicio. Ahora es un fondo oscuro liso. Para poner una fotografía tuya
  // pon una ruta de Supabase, p. ej. 'sb:portada/inicio.jpg' (recomendado: unos 2000 px de ancho y menos de 500 KB).
  hero: ph(900, 1920, 1080, ''),

  // Datos que se muestran en la página de Contacto. Son solo texto visible: el correo donde RECIBES
  // los avisos del formulario se configura en Supabase (secreto CONTACT_TO_EMAIL, ver README), no aquí.
  // El enlace de Instagram se toma de la lista "social" de más abajo.
  contactIntro: 'Si quieres consultar un reportaje, encargar una cobertura o colaborar con tu hermandad, escríbeme con el formulario, por correo electrónico o a través de Instagram.',
  email: 'fotografiamanu515@gmail.com',
  location: 'Jerez de la Frontera',
};

export const photographer = {
  name: 'Manu Sánchez',
  photo: 'sb:2026/semana_santa/tu-foto.jpg', // Foto de perfil (Supabase Storage)
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

// Redes sociales. Cada línea es un botón: copia una línea para añadir otra red.
export const social = [
  { name: 'Instagram', url: 'https://www.instagram.com/fotografiamanu_/' },
  // { name: 'Facebook', url: 'https://www.facebook.com/tu-usuario' },
  // { name: 'YouTube', url: 'https://www.youtube.com/@tu-usuario' },
];

// Fotografías destacadas de la portada. Mientras la lista esté vacía, la sección NO se muestra.
// Para añadir una, quita las // y cambia los datos:
//   src      Ruta de Supabase ('sb:...') o URL de la foto (recomendado: unos 2000 px y menos de 500 KB)
//   gallery  Id de la galería a la que enlaza (p. ej. 'besamanos-candelaria-jerez-2026')
//   caption  TEXTO ALTERNATIVO de la imagen (lo leen Google y los lectores de pantalla): descríbela con claridad
export const featured = [
  // { src: 'sb:2026/besamanos/besamanos-candelaria-jerez/IMG_1685.jpg', gallery: 'besamanos-candelaria-jerez-2026', caption: 'Descripción de la fotografía' },
];

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
  // Presentación (sale en el inicio y en "Sobre mí"). Edítala cuando quieras.
  intro: 'Soy Manu Sánchez y fotografío la Semana Santa y la vida de las hermandades de Jerez de la Frontera. Me interesa tanto el recogimiento de un besamanos o una veneración como el ambiente de la calle en días como el Sábado de Pasión. Con mi cámara intento conservar lo que hace especial a este mundo: la fe, el sentimiento y la tradición.',
  // Sección "Mi pasión por la Semana Santa"
  passion: 'La Semana Santa se vive con todos los sentidos: el olor a cera y a incienso, el sonido de una marcha que se acerca, el silencio de una iglesia antes de que se abran sus puertas. Me apasiona estar cerca de todo eso, tanto en la calle como en el recogimiento de un besamanos, y fijarme en lo que cuentan un rostro, unas manos o un pequeño gesto de devoción de quienes hacen posible cada hermandad.',
  vision: '[EJEMPLO] Aquí explicas tu forma de entender la fotografía cofrade: qué buscas en una imagen, la luz, los gestos, el silencio.',
  // Trayectoria: mientras la lista esté vacía, la sección NO se muestra en "Sobre mí".
  // Para añadirla, quita las // y cambia los datos (puedes poner todas las líneas que quieras):
  journey: [
    // { year: '2026', text: 'Descripción del hito de tu trayectoria.' },
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

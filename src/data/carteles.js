// ============================================================
// CARTELES  —  AQUÍ AÑADES Y EDITAS LOS CARTELES DE LA PÁGINA "Carteles"
// ============================================================
// Para añadir un cartel: sube la imagen a la carpeta "carteles" de Supabase (desde el panel #/admin >
// Fotografías) y copia un bloque { ... } de abajo:
//   title   Título que se muestra bajo el cartel (y que leen Google y los lectores de pantalla)
//   image   Ruta en Supabase, p. ej. 'sb:carteles/mi-cartel.jpg'
// Se muestran en el orden en que están escritos: el PRIMERO de la lista es el que sale arriba
// (pon el más reciente el primero y el más antiguo el último).

export const carteles = [
  {
    title: 'Cartel Rosario Vespertino de Nuestra Señora de la Esperanza Coronada - Hermandad de la Yedra (Jerez de la Frontera)',
    image: 'sb:carteles/cartel-rosario-esperanzadelayedra.jpg',
  },
  {
    title:
      'Diseño Papeleta de Sitio Agrupación Parroquial Nuestro Padre Señor del Amor y Nuestra Madre y Señora de la Consolación de Estella del Marqués, para la Semana Santa de 2027',
    image: 'sb:carteles/papeleta-amoryconsolacion-2027.jpg',
  },
  {
    title: 'Cartel Oficial Pasión Jerezana - Fotografía y Diseño por Manu Sánchez',
    image: 'sb:carteles/cartel-pasionjerezana.jpg',
  },
  {
    title:
      'Cartel Agrupación Parroquial de Nuestro Padre Señor del Amor y Nuestra Madre y Señora de la Consolación - Semana Santa 2025',
    image: 'sb:carteles/cartel-semanasantaestella2025.jpg',
  },
];

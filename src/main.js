import './style.css';
import { site, photographer, social, featured } from './data/site.js';
import { galleries } from './data/galleries.js';
import { img, ph, listFolder, supabaseOn } from './media.js';

// ---------- Utilidades ----------
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const year = (g) => String(g.date).slice(0, 4);
const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
const byDate = [...galleries].sort((a, b) => b.date.localeCompare(a.date));
const app = $('#app');

// Imagen con carga diferida. Si falla, el listener global muestra una imagen de sustitución.
const pic = (src, alt, w = 900) =>
  `<img src="${esc(img(src, w))}" alt="${esc(alt)}" loading="lazy" decoding="async">`;

const socials = () =>
  `<div class="soc">${social
    .map((s) => `<a class="btn" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a>`)
    .join('')}</div>`;

const card = (g) => `
  <a class="card rv" href="#/galeria/${esc(g.id)}">
    <div class="im">${pic(g.cover, g.title, 700)}</div>
    <div class="tx">
      <p class="eyebrow">${esc(g.event)} · ${year(g)}</p>
      <h3>${esc(g.title)}</h3>
      <p class="meta">${esc(g.brotherhood)} · ${esc(g.location)} · ${g.images.length} fotografías</p>
    </div>
  </a>`;

// ---------- Páginas ----------
const homeView = () => ({
  title: site.name,
  desc: `${site.tagline}. Reportajes de Semana Santa, hermandades y cofradías.`,
  html: `
  <section class="hero">
    <img src="${esc(img(site.hero, 1920))}" alt="" fetchpriority="high">
    <div class="wrap">
      <p class="eyebrow">Fotografía de Semana Santa</p>
      <h1>${esc(site.name)}</h1>
      <p class="lead">${esc(site.tagline)}</p>
      <a class="btn" href="#/galerias">Descubrir las galerías</a>
    </div>
  </section>
  <section class="sec"><div class="wrap two">
    <div class="rv"><p class="eyebrow">El fotógrafo</p><h2 class="h2">${esc(photographer.name)}</h2>
      <p>${esc(photographer.intro)}</p><p style="margin-top:1.8rem"><a class="btn" href="#/sobre-mi">Conocer más</a></p></div>
    <div class="portrait rv">${pic(photographer.photo, photographer.name, 800)}</div>
  </div></section>
  <section class="sec alt"><div class="wrap"><p class="eyebrow">Selección</p><h2 class="h2">Fotografías destacadas</h2>
    <div class="feat">${featured.map((f) => `<a class="rv" href="#/galeria/${esc(f.gallery)}">${pic(f.src, f.caption, 700)}</a>`).join('')}</div>
  </div></section>
  <section class="sec"><div class="wrap"><p class="eyebrow">Reportajes</p><h2 class="h2">Últimas galerías</h2>
    <div class="grid">${byDate.slice(0, 3).map(card).join('')}</div>
  </div></section>
  <section class="sec alt"><div class="wrap center rv"><p class="eyebrow">Sígueme</p><h2 class="h2">Redes sociales</h2>${socials()}</div></section>`,
});

// Filtros de la página de galerías: año, hermandad, evento/procesión y localidad.
const FIELDS = {
  year: ['Año', year],
  brotherhood: ['Hermandad', (g) => g.brotherhood],
  event: ['Evento', (g) => g.event],
  location: ['Localidad', (g) => g.location],
};

const galleriesView = () => ({
  title: 'Galerías',
  desc: 'Reportajes fotográficos de Semana Santa, hermandades, cultos y procesiones, organizados por año, hermandad, evento y localidad.',
  html: `
  <section class="pg"><div class="wrap">
    <p class="eyebrow">Reportajes</p><h1 class="h2">Galerías</h1>
    <div class="filters">${Object.entries(FIELDS)
      .map(
        ([k, [label, f]]) =>
          `<select data-k="${k}" aria-label="Filtrar por ${label.toLowerCase()}"><option value="">${label}: todos</option>${[
            ...new Set(galleries.map(f)),
          ]
            .sort()
            .map((v) => `<option>${esc(v)}</option>`)
            .join('')}</select>`
      )
      .join('')}</div>
    <div class="grid" id="list">${byDate.map(card).join('')}</div>
  </div></section>`,
  init() {
    const sels = [...document.querySelectorAll('.filters select')];
    const list = $('#list');
    const apply = () => {
      const r = byDate.filter((g) => sels.every((s) => !s.value || FIELDS[s.dataset.k][1](g) === s.value));
      list.innerHTML = r.length ? r.map(card).join('') : '<p class="meta">No hay galerías con esos filtros.</p>';
      reveal();
    };
    sels.forEach((s) => s.addEventListener('change', apply));
  },
});

const galleryView = (id) => {
  const g = galleries.find((x) => x.id === id);
  if (!g) {
    return {
      title: 'Galería no encontrada',
      desc: '',
      html: '<section class="pg"><div class="wrap"><h1 class="h2">Galería no encontrada</h1><a class="btn" href="#/galerias">Ver todas las galerías</a></div></section>',
    };
  }
  return {
    title: g.title,
    desc: g.description,
    html: `
    <section class="pg"><div class="wrap">
      <a class="meta" href="#/galerias">← Todas las galerías</a>
      <p class="eyebrow" style="margin-top:1.6rem">${esc(g.event)} · ${fmt(g.date)}</p>
      <h1 class="h2">${esc(g.title)}</h1>
      <p class="meta">${esc(g.brotherhood)} · ${esc(g.location)} · ${g.images.length} fotografías</p>
      <p class="desc">${esc(g.description)}</p>
      ${
        g.images.length
          ? `<div class="masonry">${g.images
              .map(
                (s, i) =>
                  `<button class="rv" data-i="${i}" aria-label="Ampliar fotografía ${i + 1} de ${g.images.length}">${pic(s, `${g.title}, fotografía ${i + 1}`, 700)}</button>`
              )
              .join('')}</div>`
          : '<p class="meta">Esta galería todavía no tiene fotografías.</p>'
      }
    </div></section>`,
    init() {
      $('.masonry')?.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (b) openLb(g, Number(b.dataset.i));
      });
    },
  };
};

const aboutView = () => ({
  title: 'Sobre mí',
  desc: 'Conoce al fotógrafo: su pasión por la Semana Santa y su forma de entender la fotografía cofrade.',
  html: `
  <section class="pg"><div class="wrap">
    <div class="two">
      <div class="rv"><p class="eyebrow">Sobre mí</p><h1 class="h2">${esc(photographer.name)}</h1><p>${esc(photographer.intro)}</p></div>
      <div class="portrait rv">${pic(photographer.photo, photographer.name, 900)}</div>
    </div>
    <div class="blk rv"><h2>Mi pasión por la Semana Santa</h2><p class="desc">${esc(photographer.passion)}</p></div>
    <div class="blk rv"><h2>Mi forma de entender la fotografía cofrade</h2><p class="desc">${esc(photographer.vision)}</p></div>
    <div class="blk rv"><h2>Trayectoria</h2>${photographer.journey
      .map((j) => `<div class="line"><b>${esc(j.year)}</b>${esc(j.text)}</div>`)
      .join('')}</div>
  </div></section>`,
});

const contactView = () => ({
  title: 'Contacto',
  desc: 'Contacta con Manu Sánchez Fotografía Cofrade para reportajes, coberturas y colaboraciones.',
  html: `
  <section class="pg"><div class="wrap two top">
    <div class="rv"><p class="eyebrow">Contacto</p><h1 class="h2">Hablemos</h1><p>${esc(site.contactIntro)}</p>
      <ul class="info"><li>${esc(site.email)}</li><li>${esc(site.phone)}</li><li>${esc(site.location)}</li></ul>${socials()}</div>
    <form id="f" class="form rv" novalidate>
      <label>Nombre<input name="nombre" required autocomplete="name"></label>
      <label>Correo electrónico<input name="email" type="email" required autocomplete="email"></label>
      <label>Asunto<input name="asunto" required></label>
      <label>Mensaje<textarea name="mensaje" rows="6" required></textarea></label>
      <button class="btn" type="submit">Enviar mensaje</button>
      <p id="st" class="meta" role="status"></p>
    </form>
  </div></section>`,
  init() {
    const f = $('#f');
    const st = $('#st');
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!f.checkValidity()) { st.textContent = 'Revisa los campos obligatorios.'; return; }
      if (!site.contactEndpoint) {
        st.textContent = 'Este formulario aún no tiene un servicio de envío conectado: no se ha enviado nada.';
        return;
      }
      try {
        const r = await fetch(site.contactEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(f))),
        });
        if (!r.ok) throw new Error('envío fallido');
        f.reset();
        st.textContent = 'Mensaje enviado. ¡Gracias!';
      } catch {
        st.textContent = 'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.';
      }
    });
  },
});

// ---------- Visor de fotografías (lightbox) ----------
let lb;
let cur = { g: null, i: 0 };
let opener;

function buildLb() {
  lb = document.createElement('div');
  lb.id = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Visor de fotografías');
  lb.innerHTML =
    '<button class="x" aria-label="Cerrar">×</button><button class="pv" aria-label="Fotografía anterior">‹</button><img alt=""><p class="cap"></p><button class="nx" aria-label="Fotografía siguiente">›</button>';
  document.body.append(lb);
  lb.addEventListener('click', (e) => {
    const c = e.target.classList;
    if (c.contains('x') || e.target === lb) closeLb();
    else if (c.contains('pv')) step(-1);
    else if (c.contains('nx')) step(1);
  });
  let x0 = 0;
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const d = e.changedTouches[0].clientX - x0;
    if (Math.abs(d) > 50) step(d < 0 ? 1 : -1);
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

function show() {
  const { g, i } = cur;
  const im = $('img', lb);
  im.src = img(g.images[i], 1800);
  im.alt = `${g.title}, fotografía ${i + 1}`;
  $('.cap', lb).textContent = `${g.title} · ${i + 1} / ${g.images.length}`;
  [i - 1, i + 1].forEach((n) => { if (g.images[n]) new Image().src = img(g.images[n], 1800); });
}
const step = (d) => { cur.i = (cur.i + d + cur.g.images.length) % cur.g.images.length; show(); };
function openLb(g, i) {
  if (!lb) buildLb();
  cur = { g, i };
  opener = document.activeElement;
  show();
  lb.classList.add('on');
  document.body.style.overflow = 'hidden';
  $('.x', lb).focus();
}
function closeLb() {
  lb.classList.remove('on');
  document.body.style.overflow = '';
  opener?.focus();
}

// ---------- Animación de entrada ----------
let io;
function reveal() {
  io ??= new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -6% 0px' }
  );
  document.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el));
}

// ---------- Estructura común y rutas (#/galerias, #/galeria/id, #/sobre-mi, #/contacto) ----------
const NAV = [['', 'Inicio'], ['galerias', 'Galerías'], ['sobre-mi', 'Sobre mí'], ['contacto', 'Contacto']];

function layout() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<a class="skip" href="#app">Saltar al contenido</a>
    <header id="hd"><div class="wrap bar">
      <a class="brand" href="#/" aria-label="Inicio">Manu Sánchez <b>Fotografía Cofrade</b></a>
      <button class="burger" aria-label="Abrir menú" aria-expanded="false">☰</button>
      <nav id="nav" aria-label="Principal">${NAV.map(([r, t]) => `<a href="#/${r}" data-r="${r}">${t}</a>`).join('')}</nav>
    </div></header>`
  );
  app.insertAdjacentHTML(
    'afterend',
    `<footer><div class="wrap"><p class="brand">${esc(site.name)}</p>${socials()}
    <p>© ${new Date().getFullYear()} ${esc(photographer.name)}. Todas las fotografías están protegidas por derechos de autor.</p></div></footer>`
  );
  const hd = $('#hd');
  const burger = $('.burger');
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', hd.classList.toggle('open')));
  $('.skip').addEventListener('click', (e) => { e.preventDefault(); app.focus(); });
  addEventListener('scroll', () => hd.classList.toggle('solid', scrollY > 40), { passive: true });
}

const ROUTES = { __proto__: null, galerias: galleriesView, 'sobre-mi': aboutView, contacto: contactView };

function route() {
  if (lb?.classList.contains('on')) closeLb();
  const [name = '', arg = ''] = location.hash.slice(2).split('/');
  const v = (name === 'galeria' ? () => galleryView(arg) : ROUTES[name] || homeView)();
  app.innerHTML = v.html;
  v.init?.();
  document.title = v.title === site.name ? site.name : `${v.title} · ${site.name}`;
  ['meta[name=description]', 'meta[property="og:description"]'].forEach((s) => { $(s).content = v.desc; });
  $('meta[property="og:title"]').content = document.title;
  document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.r === (name === 'galeria' ? 'galerias' : name)));
  $('#hd').classList.remove('open');
  $('.burger').setAttribute('aria-expanded', 'false');
  window.scrollTo(0, 0);
  reveal();
}

// Si Supabase está conectado, las galerías con "folder" leen sus fotos de esa carpeta.
async function hydrate() {
  if (!supabaseOn) return;
  await Promise.all(
    galleries.filter((g) => g.folder).map(async (g) => {
      const found = await listFolder(g.folder);
      if (found.length) { g.images = found; g.cover = g.cover || found[0]; }
    })
  );
}

// Imagen de sustitución elegante si alguna fotografía no carga (nunca una imagen rota).
document.addEventListener('error', (e) => {
  const t = e.target;
  if (t.tagName === 'IMG' && !t.dataset.fb) {
    t.dataset.fb = '1';
    t.src = ph(0, 1200, 800, 'Fotografía no disponible');
  }
}, true);

layout();
route();
addEventListener('hashchange', route);
hydrate().then(() => supabaseOn && route());

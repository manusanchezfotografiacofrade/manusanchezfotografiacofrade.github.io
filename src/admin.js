// ============================================================
// PANEL PRIVADO  (#/admin)
// ============================================================
// Acceso con Supabase Auth (correo + contraseña). La seguridad real NO depende de esta página:
// la imponen las políticas RLS de Supabase, que solo permiten al usuario administrador leer los
// mensajes y subir/borrar fotografías. Cualquier otra persona verá solo el formulario de acceso
// y, aunque lo intentara, el servidor le denegaría los datos.
// Solo usa la URL y la clave pública "anon" (nunca claves privadas).
import { galleries } from './data/galleries.js';

const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'fotografias';
const SKEY = 'ms_admin_session';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const LABEL = { nuevo: 'Nuevo', leido: 'Leído', respondido: 'Respondido' };
const fdate = (iso, long) =>
  new Date(iso).toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: long ? 'full' : 'short', timeStyle: 'short' });
const kb = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

const CSS = `
.adm .box{background:var(--bg2);border:1px solid var(--line);padding:1.4rem;margin-top:1.2rem}
.adm .top{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap}
.adm .tabs{display:flex;gap:.6rem;flex-wrap:wrap;margin:1.5rem 0 1rem}
.adm .tab{background:none;border:1px solid var(--line);color:var(--mute);padding:.7rem 1.4rem;font:inherit;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;transition:.3s}
.adm .tab.on{border-color:var(--gold);color:var(--ink)}
.adm .bar2{display:flex;gap:.8rem;flex-wrap:wrap;margin-bottom:1rem}
.adm .mrow{display:grid;grid-template-columns:1fr auto;gap:.2rem 1rem;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);color:var(--ink);font:inherit;padding:1rem .5rem;cursor:pointer}
.adm .mrow:hover{background:var(--bg2)}
.adm .mname{font-weight:500;overflow-wrap:anywhere}
.adm .msub,.adm .mdate{color:var(--mute);font-size:.85rem;overflow-wrap:anywhere}
.adm .mdate{text-align:right}
.adm .badge{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;padding:.15rem .6rem;border:1px solid var(--line);color:var(--mute);justify-self:end;white-space:nowrap}
.adm .s-nuevo{border-color:var(--gold);color:var(--gold)}
.adm .s-respondido{color:#8fbf8f;border-color:#8fbf8f}
.adm .mbody{white-space:pre-wrap;border-left:3px solid var(--gold);padding:.8rem 1.1rem;margin:1.2rem 0;background:var(--bg);overflow-wrap:anywhere}
.adm .acts{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1rem}
.adm .btn.sm{padding:.55rem 1.05rem;font-size:.66rem}
.adm .frow{display:flex;justify-content:space-between;align-items:center;gap:.8rem;flex-wrap:wrap;padding:.7rem 0;border-bottom:1px solid var(--line)}
.adm .frow>span{overflow-wrap:anywhere}
.adm .frow .acts{margin:0}
.adm .chk{display:flex;align-items:center;gap:.6rem;text-transform:none;letter-spacing:0;font-size:.9rem}
.adm .chk input{width:auto}
.adm a{color:var(--gold)}
.adm .err{color:#e0907e}
`;

// ---------- Sesión (Supabase Auth, sin librerías) ----------
let session = null;
try { session = JSON.parse(sessionStorage.getItem(SKEY) || 'null'); } catch { /* sin almacenamiento */ }
const saveSession = (s) => {
  session = s;
  try { s ? sessionStorage.setItem(SKEY, JSON.stringify(s)) : sessionStorage.removeItem(SKEY); } catch { /* sin almacenamiento */ }
};

async function authRequest(grant, body) {
  const r = await fetch(`${URL_}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error_description || d.msg || 'No se pudo iniciar sesión.');
  return { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + (d.expires_in - 60) * 1000, email: d.user?.email };
}

async function api(path, opts = {}) {
  if (!session) throw new Error('Sesión no iniciada.');
  if (Date.now() > session.expires_at) {
    try { saveSession(await authRequest('refresh_token', { refresh_token: session.refresh_token })); }
    catch { saveSession(null); throw new Error('La sesión ha caducado. Vuelve a entrar.'); }
  }
  const r = await fetch(`${URL_}${path}`, { ...opts, headers: { apikey: KEY, Authorization: `Bearer ${session.access_token}`, ...(opts.headers || {}) } });
  if (r.status === 401) { saveSession(null); throw new Error('La sesión ha caducado. Vuelve a entrar.'); }
  return r;
}

// ---------- Mensajes ----------
async function loadMessages() {
  const r = await api('/rest/v1/contact_messages?select=id,name,email,subject,message,status,created_at,notified_at&order=created_at.desc&limit=500', {
    headers: { Accept: 'application/json' },
  });
  if (!r.ok) throw new Error(`No se pudieron cargar los mensajes (error ${r.status}).`);
  return r.json();
}
async function setStatus(id, status) {
  const r = await api(`/rest/v1/contact_messages?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ status }),
  });
  const d = await r.json().catch(() => []);
  if (!r.ok || !Array.isArray(d) || d.length !== 1) throw new Error('No se pudo cambiar el estado.');
}

// ---------- Fotografías (Supabase Storage) ----------
const objPath = (p) => p.split('/').map(encodeURIComponent).join('/');
const safeName = (n) =>
  n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w.\-]/g, '').replace(/^\.+/, '') || 'foto.jpg';

async function listFolder(prefix) {
  const r = await api(`/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!r.ok) throw new Error('No se pudo leer la carpeta.');
  return r.json();
}
async function upload(path, body, type) {
  const r = await api(`/storage/v1/object/${BUCKET}/${objPath(path)}`, {
    method: 'POST',
    headers: { 'Content-Type': type, 'x-upsert': 'false', 'cache-control': 'max-age=31536000' },
    body,
  });
  if (r.ok) return;
  const d = await r.json().catch(() => ({}));
  const msg = d.message || d.error || `error ${r.status}`;
  throw new Error(/exist|duplicate/i.test(msg) ? 'ya existe una foto con ese nombre' : msg);
}
async function removeFile(path) {
  const r = await api(`/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: [path] }),
  });
  const d = await r.json().catch(() => []);
  if (!r.ok || !Array.isArray(d) || !d.length) throw new Error('No se pudo eliminar.');
}

// Reduce la foto a un máximo de 2000 px y calidad 82 % (suele quedar en 300-700 KB). Además elimina
// los metadatos EXIF (por ejemplo la ubicación GPS). Se hace en el navegador, antes de subirla.
async function optimize(file, max = 2000, quality = 0.82) {
  const url = URL.createObjectURL(file);
  try {
    const im = new Image();
    im.src = url;
    await im.decode();
    const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
    const w = Math.round(im.naturalWidth * k);
    const h = Math.round(im.naturalHeight * k);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(im, 0, 0, w, h);
    const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', quality));
    if (!blob) throw new Error('no se pudo optimizar');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---------- Interfaz ----------
let root;
let tab = 'mensajes';
let msgs = [];
let filter = '';
let openId = null;

function fail(el, e) {
  if (!session) { login(e.message); return; }
  el.innerHTML = `<p class="meta err">${esc(e.message)}</p>`;
}

function login(msg = '') {
  root.innerHTML = `<p class="eyebrow">Acceso privado</p><h1 class="h2">Panel de administración</h1>
  <form id="lf" class="form box" style="max-width:420px" novalidate>
    <label>Correo electrónico<input name="email" type="email" required autocomplete="username"></label>
    <label>Contraseña<input name="password" type="password" required autocomplete="current-password"></label>
    <button class="btn" type="submit">Entrar</button>
    <p id="lgst" class="meta" role="status" aria-live="polite">${esc(msg)}</p>
  </form>`;
  const f = $('#lf', root);
  const st = $('#lgst', root);
  const b = $('button', f);
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    if (!d.email || !d.password) { st.textContent = 'Escribe tu correo y tu contraseña.'; return; }
    b.disabled = true;
    st.textContent = 'Entrando…';
    try {
      saveSession(await authRequest('password', { email: d.email.trim(), password: d.password }));
      tab = 'mensajes';
      openId = null;
      dashboard();
    } catch (err) {
      st.textContent = /invalid/i.test(err.message) ? 'Correo o contraseña incorrectos.' : err.message;
      b.disabled = false;
    }
  });
}

async function logout() {
  try { await api('/auth/v1/logout', { method: 'POST' }); } catch { /* da igual */ }
  saveSession(null);
  msgs = [];
  login('Has cerrado la sesión.');
}

function dashboard() {
  root.innerHTML = `<div class="top"><div><p class="eyebrow">Panel privado</p><h1 class="h2" style="margin:.3rem 0">Administración</h1>
    <p class="meta">${esc(session.email || '')}</p></div><button class="btn" id="out" type="button">Salir</button></div>
  <div class="tabs"><button class="tab" data-t="mensajes" type="button">Mensajes <span id="nb"></span></button>
  <button class="tab" data-t="fotos" type="button">Fotografías</button></div><div id="pane"></div>`;
  $('#out', root).addEventListener('click', logout);
  root.querySelectorAll('.tab').forEach((b) =>
    b.addEventListener('click', () => { tab = b.dataset.t; openId = null; paint(); })
  );
  paint();
}

function paint() {
  root.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b.dataset.t === tab));
  if (tab === 'fotos') paneFotos(); else paneMessages();
}

const badgeCount = () => {
  const n = msgs.filter((m) => m.status === 'nuevo').length;
  const el = $('#nb', root);
  if (el) el.textContent = n ? `(${n})` : '';
};

async function paneMessages() {
  const pane = $('#pane', root);
  if (openId) { paneDetail(pane); return; }
  pane.innerHTML = '<p class="meta">Cargando mensajes…</p>';
  try { msgs = await loadMessages(); } catch (e) { fail(pane, e); return; }
  badgeCount();
  const list = msgs.filter((m) => !filter || m.status === filter);
  pane.innerHTML = `<div class="bar2">
    <select id="flt" aria-label="Filtrar por estado"><option value="">Todos</option>
      ${Object.entries(LABEL).map(([k, v]) => `<option value="${k}"${filter === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
    <button class="btn sm" id="rf" type="button">Actualizar</button></div>
  ${list.length
    ? list.map((m) => `<button class="mrow" type="button" data-id="${esc(m.id)}"><span class="mname">${esc(m.name)}</span>
        <span class="badge s-${esc(m.status)}">${esc(LABEL[m.status] || m.status)}</span>
        <span class="msub">${esc(m.subject)}</span><span class="mdate">${fdate(m.created_at)}</span></button>`).join('')
    : '<p class="meta">No hay mensajes.</p>'}`;
  $('#flt', pane).addEventListener('change', (e) => { filter = e.target.value; paneMessages(); });
  $('#rf', pane).addEventListener('click', paneMessages);
  pane.querySelectorAll('.mrow').forEach((b) => b.addEventListener('click', () => { openId = b.dataset.id; paneMessages(); }));
}

function paneDetail(pane) {
  const m = msgs.find((x) => x.id === openId);
  if (!m) { openId = null; paneMessages(); return; }
  pane.innerHTML = `<button class="btn sm" id="bk" type="button">← Volver a los mensajes</button>
  <div class="box"><p class="meta">Recibido el ${esc(fdate(m.created_at, true))} · <span class="badge s-${esc(m.status)}">${esc(LABEL[m.status] || m.status)}</span></p>
    <h2 style="font-size:1.8rem;margin:.7rem 0">${esc(m.subject)}</h2>
    <p><b>${esc(m.name)}</b> · <a href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: ' + m.subject)}">${esc(m.email)}</a></p>
    <div class="mbody">${esc(m.message)}</div>
    <p class="meta">Aviso por correo: ${m.notified_at ? 'enviado' : 'no enviado'}</p>
    <div class="acts">
      ${m.status !== 'leido' ? '<button class="btn sm" data-s="leido" type="button">Marcar como leído</button>' : ''}
      ${m.status !== 'respondido' ? '<button class="btn sm" data-s="respondido" type="button">Marcar como respondido</button>' : ''}
      ${m.status !== 'nuevo' ? '<button class="btn sm" data-s="nuevo" type="button">Marcar como nuevo</button>' : ''}
      <a class="btn sm" style="color:var(--ink)" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: ' + m.subject)}">Responder por correo</a>
    </div><p id="ds" class="meta" role="status" aria-live="polite"></p></div>`;
  $('#bk', pane).addEventListener('click', () => { openId = null; paneMessages(); });
  pane.querySelectorAll('[data-s]').forEach((b) =>
    b.addEventListener('click', async () => {
      pane.querySelectorAll('button').forEach((x) => { x.disabled = true; });
      try { await setStatus(m.id, b.dataset.s); m.status = b.dataset.s; badgeCount(); paneDetail(pane); }
      catch (e) { fail($('#ds', pane), e); pane.querySelectorAll('button').forEach((x) => { x.disabled = false; }); }
    })
  );
}

function paneFotos() {
  const pane = $('#pane', root);
  const known = [...new Set(galleries.map((g) => g.folder).filter(Boolean))];
  pane.innerHTML = `<div class="box"><h2 style="font-size:1.6rem;margin-bottom:.5rem">Subir fotografías</h2>
    <p class="meta" style="margin-bottom:1rem">Elige la carpeta de destino (año / evento / galería). Si una galería de la web usa esa carpeta, las fotos aparecen solas.</p>
    <form id="upf" class="form" novalidate>
      <label>Carpeta de destino<input id="dst" list="dl" placeholder="2026/besamanos/nombre-de-la-galeria" autocomplete="off"></label>
      <datalist id="dl">${known.map((f) => `<option value="${esc(f)}">`).join('')}</datalist>
      <label>Fotografías (JPG, PNG o WebP)<input id="fil" type="file" multiple accept="image/jpeg,image/png,image/webp"></label>
      <label class="chk"><input id="opt" type="checkbox" checked> Optimizar antes de subir (máx. 2000 px, suele quedar en 300-700 KB; recomendado)</label>
      <button class="btn" type="submit">Subir</button>
      <p id="ust" class="meta" role="status" aria-live="polite"></p>
    </form></div>
  <div class="box"><h2 style="font-size:1.6rem;margin-bottom:.5rem">Explorar y eliminar</h2>
    <p class="meta" id="cur" style="margin-bottom:.8rem"></p><div id="exp"></div></div>`;

  const f = $('#upf', pane);
  const say = (t) => { $('#ust', pane).textContent = t; };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dst = $('#dst', pane).value.trim().replace(/^\/+|\/+$/g, '');
    const files = [...$('#fil', pane).files];
    const opt = $('#opt', pane).checked;
    if (!/^[\w-]+(\/[\w-]+){0,4}$/.test(dst)) {
      say('Escribe una carpeta válida: letras sin tildes, números, "-" y "_", separando niveles con "/". Ejemplo: 2026/besamanos/mi-galeria');
      return;
    }
    if (!files.length) { say('Elige al menos una fotografía.'); return; }
    const btn = $('button[type=submit]', f);
    btn.disabled = true;
    let ok = 0;
    const fails = [];
    for (const [i, file] of files.entries()) {
      say(`Subiendo ${i + 1} de ${files.length}: ${file.name}…`);
      try {
        let body = file;
        let type = file.type;
        let name = safeName(file.name);
        if (opt) { body = await optimize(file); type = 'image/jpeg'; name = `${name.replace(/\.[^.]+$/, '')}.jpg`; }
        await upload(`${dst}/${name}`, body, type);
        ok += 1;
      } catch (err) {
        if (!session) { login(err.message); return; }
        fails.push(`${file.name}: ${err.message}`);
      }
    }
    say(`${ok} de ${files.length} fotografías subidas.${fails.length ? ` No se pudieron subir: ${fails.join(' | ')}` : ''}`);
    $('#fil', pane).value = '';
    btn.disabled = false;
    explore(dst);
  });

  const box = $('#exp', pane);
  box.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const here = box.dataset.path || '';
    if (b.dataset.dir !== undefined) explore(here ? `${here}/${b.dataset.dir}` : b.dataset.dir);
    else if (b.dataset.up !== undefined) explore(here.split('/').slice(0, -1).join('/'));
    else if (b.dataset.copy !== undefined) {
      const text = `sb:${b.dataset.copy}`;
      try { await navigator.clipboard.writeText(text); b.textContent = 'Copiada'; } catch { window.prompt('Copia esta ruta:', text); }
    } else if (b.dataset.del !== undefined) {
      if (!window.confirm(`¿Eliminar "${b.dataset.del}"? Esta acción no se puede deshacer.`)) return;
      b.disabled = true;
      try { await removeFile(b.dataset.del); explore(here); } catch (err) { fail(box, err); }
    }
  });
  explore('');
}

async function explore(path) {
  const box = $('#exp', root);
  if (!box) return;
  box.dataset.path = path;
  $('#cur', root).textContent = `Carpeta actual: /${path}`;
  box.innerHTML = '<p class="meta">Cargando…</p>';
  let items;
  try { items = await listFolder(path); } catch (e) { fail(box, e); return; }
  const dirs = items.filter((i) => !i.id);
  const files = items.filter((i) => i.id && !i.name.startsWith('.'));
  const full = (n) => (path ? `${path}/${n}` : n);
  box.innerHTML = `${path ? '<p><button class="btn sm" data-up type="button">↑ Subir un nivel</button></p>' : ''}
  ${dirs.map((d) => `<div class="frow"><span>Carpeta: <b>${esc(d.name)}</b></span><button class="btn sm" data-dir="${esc(d.name)}" type="button">Abrir</button></div>`).join('')}
  ${files.map((f) => `<div class="frow"><span>${esc(f.name)} <small class="meta">${kb(Number(f.metadata?.size) || 0)}</small></span>
    <span class="acts"><a class="btn sm" style="color:var(--ink)" href="${esc(`${URL_}/storage/v1/object/public/${BUCKET}/${objPath(full(f.name))}`)}" target="_blank" rel="noopener noreferrer">Ver</a>
    <button class="btn sm" data-copy="${esc(full(f.name))}" type="button">Copiar ruta</button>
    <button class="btn sm" data-del="${esc(full(f.name))}" type="button">Eliminar</button></span></div>`).join('')}
  ${!dirs.length && !files.length ? '<p class="meta">Esta carpeta está vacía.</p>' : ''}`;
}

function start(el) {
  root = el;
  if (!URL_ || !KEY) {
    root.innerHTML = '<p class="meta">Supabase no está conectado en esta web (faltan las variables de entorno).</p>';
    return;
  }
  if (session) dashboard(); else login();
}

export const adminView = () => ({
  title: 'Panel privado',
  desc: 'Panel privado de administración.',
  html: `<style>${CSS}</style><section class="pg adm"><div class="wrap" id="adm"></div></section>`,
  init() { start(document.getElementById('adm')); },
});

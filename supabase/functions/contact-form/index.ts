// Edge Function "contact-form"
// Recibe el formulario de contacto de la web, lo valida, lo guarda en public.contact_messages
// y (si está configurado) avisa por correo con Resend.
//
// Secretos necesarios (Supabase > Edge Functions > Secrets). NUNCA van en el código ni en la web:
//   RESEND_API_KEY      Clave de la API de Resend (empieza por re_)
//   CONTACT_TO_EMAIL    Correo donde quieres recibir los avisos (sin dominio propio: el de tu cuenta de Resend)
// Opcionales:
//   CONTACT_FROM_EMAIL  Remitente. Por defecto "Web Manu Sanchez <onboarding@resend.dev>"
//   IP_HASH_SALT        Texto aleatorio para anonimizar las IP (si falta se usa la URL del proyecto)
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase automáticamente en el servidor.

import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://manusanchezfotografiacofrade.github.io',
  'http://localhost:5173', // desarrollo local (npm run dev)
  'http://localhost:4173', // vista previa local (npm run preview)
];

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
});

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Texto de una sola línea: sin saltos ni caracteres de control (evita inyección en cabeceras de correo).
const line = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F]+/g, ' ').trim().slice(0, max + 1) : '';
// Texto multilínea: permite saltos de línea y tabulaciones.
const text = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max + 1) : '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405, origin);
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return json({ error: 'Origen no permitido.' }, 403, origin);

  // 1) Leer y limitar el tamaño de la petición
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 20000) return json({ error: 'Solicitud demasiado grande.' }, 413, origin);
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'Solicitud no válida.' }, 400, origin);
  }

  // 2) Anti-spam: campo trampa (honeypot). Un humano no lo ve ni lo rellena; un bot sí.
  //    A los bots se les responde "ok" sin guardar nada, para que no reintenten.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true }, 200, origin);

  // 3) Anti-spam: tiempo mínimo de relleno (los bots envían al instante)
  const elapsed = Number(body.elapsed);
  if (!Number.isFinite(elapsed) || elapsed < 2500) {
    return json({ error: 'No se pudo validar el envío. Espera un momento e inténtalo de nuevo.' }, 400, origin);
  }

  // 4) Validación de todos los campos
  const name = line(body.name, 100);
  const email = line(body.email, 254).toLowerCase();
  const subject = line(body.subject, 150);
  const message = text(body.message, 5000);
  const fields: Record<string, string> = {};
  if (name.length < 2 || name.length > 100) fields.name = 'Escribe tu nombre (entre 2 y 100 caracteres).';
  if (email.length > 254 || !EMAIL_RE.test(email)) fields.email = 'Escribe un correo electrónico válido.';
  if (subject.length < 3 || subject.length > 150) fields.subject = 'El asunto debe tener entre 3 y 150 caracteres.';
  if (message.length < 10 || message.length > 5000) fields.message = 'El mensaje debe tener entre 10 y 5000 caracteres.';
  if (Object.keys(fields).length) return json({ error: 'Revisa los campos del formulario.', fields }, 422, origin);
  if ((message.match(/https?:\/\//gi) ?? []).length > 3) {
    return json({ error: 'El mensaje contiene demasiados enlaces.', fields: { message: 'Reduce el número de enlaces.' } }, 422, origin);
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // 5) Anti-spam: límite por IP (anonimizada) y límite global por hora
  const ip = (req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? 'desconocida').split(',')[0].trim();
  const ipHash = await sha256(`${Deno.env.get('IP_HASH_SALT') ?? Deno.env.get('SUPABASE_URL')}|${ip}`);
  const since10min = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [byIp, total] = await Promise.all([
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since10min),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).gte('created_at', since1h),
  ]);
  if ((byIp.count ?? 0) >= 3 || (total.count ?? 0) >= 60) {
    return json({ error: 'Has enviado demasiados mensajes. Inténtalo de nuevo en unos minutos.' }, 429, origin);
  }

  // 6) Guardar en Supabase
  const { data: row, error: insertError } = await supabase
    .from('contact_messages')
    .insert({ name, email, subject, message, ip_hash: ipHash })
    .select('id, created_at')
    .single();
  if (insertError || !row) {
    console.error('Error al guardar el mensaje:', insertError?.message);
    return json({ error: 'No se pudo guardar el mensaje. Inténtalo de nuevo más tarde.' }, 500, origin);
  }

  // 7) Aviso por correo con Resend (solo si hay secretos configurados; si no, el mensaje queda guardado igualmente)
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const to = Deno.env.get('CONTACT_TO_EMAIL');
  if (apiKey && to) {
    try {
      const when = new Date(row.created_at).toLocaleString('es-ES', {
        timeZone: 'Europe/Madrid',
        dateStyle: 'full',
        timeStyle: 'medium',
      });
      const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#222">
<h2 style="margin:0 0 14px">Nueva consulta desde la web</h2>
<table style="border-collapse:collapse;width:100%">
<tr><td style="padding:5px 0;color:#666;width:110px">Nombre</td><td><b>${esc(name)}</b></td></tr>
<tr><td style="padding:5px 0;color:#666">Correo</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
<tr><td style="padding:5px 0;color:#666">Asunto</td><td>${esc(subject)}</td></tr>
<tr><td style="padding:5px 0;color:#666">Recibido</td><td>${esc(when)}</td></tr>
</table>
<h3 style="margin:20px 0 8px">Mensaje</h3>
<div style="white-space:pre-wrap;border-left:3px solid #b8964f;padding:10px 14px;background:#faf7f0">${esc(message)}</div>
<p style="color:#888;font-size:12px;margin-top:20px">Puedes responder a este correo: la respuesta irá directamente al visitante. Referencia: ${row.id}</p>
</div>`;
      const plain = `Nueva consulta desde la web\n\nNombre: ${name}\nCorreo: ${email}\nAsunto: ${subject}\nRecibido: ${when}\n\nMensaje:\n${message}\n\nReferencia: ${row.id}`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: Deno.env.get('CONTACT_FROM_EMAIL') ?? 'Web Manu Sanchez <onboarding@resend.dev>',
          to: [to],
          reply_to: email,
          subject: `Nueva consulta web: ${subject}`,
          html,
          text: plain,
        }),
      });
      if (res.ok) {
        await supabase.from('contact_messages').update({ notified_at: new Date().toISOString() }).eq('id', row.id);
      } else {
        console.error('Resend rechazó el envío:', res.status, await res.text());
      }
    } catch (e) {
      console.error('Error al llamar a Resend:', e instanceof Error ? e.message : e);
    }
  } else {
    console.warn('Aviso por correo desactivado: faltan los secretos RESEND_API_KEY y/o CONTACT_TO_EMAIL.');
  }

  return json({ ok: true }, 200, origin);
});

-- Migración aplicada en Supabase: tabla de mensajes del formulario de contacto.
-- Los visitantes NO acceden a esta tabla: los mensajes entran solo a través de la Edge Function
-- "contact-form" (que usa la clave service_role en el servidor, nunca en la web).
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 100),
  email       text not null check (char_length(email) between 5 and 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  subject     text not null check (char_length(subject) between 3 and 150),
  message     text not null check (char_length(message) between 10 and 5000),
  created_at  timestamptz not null default now(),
  status      text not null default 'nuevo' check (status in ('nuevo', 'leido', 'respondido')),
  -- Campos internos (no vienen del visitante):
  ip_hash     text,          -- huella de la IP (SHA-256 con sal) solo para limitar spam; no se guarda la IP
  notified_at timestamptz    -- cuándo se envió el aviso por correo (null = no enviado o sin configurar)
);

comment on table public.contact_messages is 'Consultas recibidas desde el formulario de contacto de la web.';

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_ip_idx on public.contact_messages (ip_hash, created_at desc);

alter table public.contact_messages enable row level security;

-- Defensa en profundidad: ni anónimos ni usuarios autenticados tienen permisos por defecto.
revoke all on table public.contact_messages from anon, authenticated;

-- Solo el administrador (usuario propietario) puede LEER y cambiar el ESTADO. Nadie puede insertar ni borrar desde la web.
grant select on public.contact_messages to authenticated;
grant update (status) on public.contact_messages to authenticated;

drop policy if exists "contact_messages: admin lee" on public.contact_messages;
drop policy if exists "contact_messages: admin cambia estado" on public.contact_messages;

create policy "contact_messages: admin lee"
on public.contact_messages for select to authenticated
using (auth.uid() = 'da494ece-6a3d-4c6e-87fc-20b50c84fab3'::uuid);

create policy "contact_messages: admin cambia estado"
on public.contact_messages for update to authenticated
using (auth.uid() = 'da494ece-6a3d-4c6e-87fc-20b50c84fab3'::uuid)
with check (auth.uid() = 'da494ece-6a3d-4c6e-87fc-20b50c84fab3'::uuid);

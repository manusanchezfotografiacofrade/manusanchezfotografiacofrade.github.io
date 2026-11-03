-- ============================================================
-- SUPABASE STORAGE para Manu Sánchez Fotografía Cofrade
-- Ejecuta este script UNA vez en: Supabase > SQL Editor > New query
-- ============================================================
-- ANTES de ejecutarlo:
--   1) Crea tu usuario propietario en Authentication > Users > Add user (email + contraseña).
--   2) Copia su UUID (columna "User UID") y sustituye TODAS las apariciones de
--      TU_USER_UUID de más abajo (son 3).
-- Resultado: cualquiera puede VER las fotografías; solo TÚ puedes subir, modificar o borrar.

-- 1) Bucket público, solo para fotografías que se muestran en la web
insert into storage.buckets (id, name, public)
values ('fotografias', 'fotografias', true)
on conflict (id) do update set public = true;

-- 2) Lectura y listado públicos (necesario para que la web liste las carpetas)
create policy "fotografias: lectura publica"
on storage.objects for select to public
using (bucket_id = 'fotografias');

-- 3) Escritura reservada al propietario autenticado (sustituye TU_USER_UUID)
create policy "fotografias: subir solo propietario"
on storage.objects for insert to authenticated
with check (bucket_id = 'fotografias' and auth.uid() = 'TU_USER_UUID'::uuid);

create policy "fotografias: modificar solo propietario"
on storage.objects for update to authenticated
using (bucket_id = 'fotografias' and auth.uid() = 'TU_USER_UUID'::uuid)
with check (bucket_id = 'fotografias' and auth.uid() = 'TU_USER_UUID'::uuid);

create policy "fotografias: borrar solo propietario"
on storage.objects for delete to authenticated
using (bucket_id = 'fotografias' and auth.uid() = 'TU_USER_UUID'::uuid);

-- Los visitantes anónimos NO tienen ninguna política de insert/update/delete: no pueden escribir.
-- Estructura recomendada dentro del bucket:
--   2025/semana-santa/  2025/besamanos/  2025/cultos/
--   2026/semana-santa/  2026/besamanos/  2026/cultos/
-- Nombres de archivo recomendados: hermandad-01.jpg, hermandad-02.jpg ... (minúsculas, sin espacios)

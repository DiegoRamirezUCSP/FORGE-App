-- Forge · administración de solo lectura
-- Ejecútalo DESPUÉS de schema.sql: Supabase → SQL Editor → New query → Run.
-- Se puede ejecutar más de una vez.
--
-- Qué permite: que las cuentas listadas en public.admins LEAN los datos de
-- entrenamiento de todas las personas. No permite modificarlos.
-- Qué no expone: contraseñas ni correos. Viven en el esquema auth, que la
-- API de la app no puede consultar.

-- ============ Quién es administrador ============
-- La app NO puede escribir en esta tabla: solo el SQL Editor o la clave secret.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins_read_own" on public.admins;
create policy "admins_read_own" on public.admins
  for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ============ Lectura para administradores (solo SELECT) ============

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "personal_records_admin_read" on public.personal_records;
create policy "personal_records_admin_read" on public.personal_records
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "sessions_admin_read" on public.sessions;
create policy "sessions_admin_read" on public.sessions
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "xp_events_admin_read" on public.xp_events;
create policy "xp_events_admin_read" on public.xp_events
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "routines_admin_read" on public.routines;
create policy "routines_admin_read" on public.routines
  for select to authenticated using ((select public.is_admin()));

-- ============ Vista para el panel ============
-- security_invoker: se ejecuta con los permisos de quien consulta. Una persona
-- normal solo ve su propia fila; una administradora ve todas.

create or replace view public.admin_user_overview
with (security_invoker = true) as
select
  p.id,
  p.display_name,
  p.unit,
  p.total_xp,
  p.streak,
  p.best_streak,
  p.last_training_day,
  p.onboarded,
  p.created_at,
  (select count(*) from public.sessions s where s.user_id = p.id) as sessions_count,
  (select count(*) from public.personal_records r where r.user_id = p.id) as prs_count
from public.profiles p;

revoke all on public.admin_user_overview from anon;
grant select on public.admin_user_overview to authenticated;

-- ============ Convertir una cuenta existente en administradora ============
-- La cuenta debe haberse registrado antes. Quita los guiones y cambia el correo:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'admin@tu-correo.com'
-- on conflict do nothing;
--
-- Para quitar el permiso:
-- delete from public.admins
-- where user_id = (select id from auth.users where email = 'admin@tu-correo.com');

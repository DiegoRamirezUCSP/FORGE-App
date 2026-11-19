-- Forge · esquema inicial
-- Pégalo completo en Supabase → SQL Editor → New query → Run.
-- Se puede ejecutar más de una vez sin duplicar nada.

-- ============ Tablas ============

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Atleta',
  unit text not null default 'kg' check (unit in ('kg', 'lb')),
  total_xp integer not null default 0 check (total_xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  last_training_day date,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.personal_records (
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null,
  weight_kg numeric(7, 2) not null check (weight_kg > 0),
  reps integer not null check (reps > 0),
  e1rm numeric(8, 2) not null check (e1rm > 0),
  achieved_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create table if not exists public.sessions (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  performed_at timestamptz not null,
  -- [{ "exerciseId": "...", "sets": [{ "weightKg": 100, "reps": 5 }] }]
  exercises jsonb not null default '[]'::jsonb,
  volume_kg numeric(12, 2) not null default 0 check (volume_kg >= 0),
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists sessions_user_performed_idx
  on public.sessions (user_id, performed_at desc);

create table if not exists public.xp_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  kind text not null check (kind in ('session', 'pr', 'streak')),
  title text not null,
  xp integer not null check (xp >= 0),
  occurred_at timestamptz not null,
  primary key (user_id, id)
);
create index if not exists xp_events_user_occurred_idx
  on public.xp_events (user_id, occurred_at desc);

create table if not exists public.routines (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  -- [{ "exerciseId": "...", "sets": 4, "reps": 5 }]
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ============ Seguridad por fila (RLS) ============
-- Cada persona solo puede leer y escribir sus propias filas.

alter table public.profiles enable row level security;
alter table public.personal_records enable row level security;
alter table public.sessions enable row level security;
alter table public.xp_events enable row level security;
alter table public.routines enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "personal_records_own" on public.personal_records;
create policy "personal_records_own" on public.personal_records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "sessions_own" on public.sessions;
create policy "sessions_own" on public.sessions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "xp_events_own" on public.xp_events;
create policy "xp_events_own" on public.xp_events
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "routines_own" on public.routines;
create policy "routines_own" on public.routines
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete
  on public.profiles, public.personal_records, public.sessions, public.xp_events, public.routines
  to authenticated;

-- ============ Perfil automático al registrarse ============
-- Para Google usa el nombre de la cuenta; para correo, la parte anterior a la @.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Atleta'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ updated_at ============

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

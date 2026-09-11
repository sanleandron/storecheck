-- ============================================================
-- StoreCheck HD — Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- --------------------------------------------
-- CATÁLOGOS
-- --------------------------------------------
create table if not exists public.chains (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

insert into public.chains (name)
values ('D1'), ('Ara'), ('Isimo'), ('Otro')
on conflict (name) do nothing;

create table if not exists public.countries (
  code text primary key,
  name text not null unique
);

insert into public.countries (code, name)
values
  ('CO', 'Colombia'),
  ('MX', 'México'),
  ('PE', 'Perú'),
  ('AR', 'Argentina'),
  ('CL', 'Chile')
on conflict (code) do nothing;

create table if not exists public.currencies (
  code text primary key,
  name text not null
);

insert into public.currencies (code, name)
values
  ('COP', 'Peso colombiano'),
  ('MXN', 'Peso mexicano'),
  ('USD', 'Dólar'),
  ('ARS', 'Peso argentino'),
  ('PEN', 'Sol peruano')
on conflict (code) do nothing;

-- --------------------------------------------
-- AUDITORÍAS
-- --------------------------------------------
create table if not exists public.audits (
  id uuid primary key,
  evaluador text not null,
  fecha_hora timestamp not null,
  cadena text not null,
  tienda text not null,
  ciudad text not null,
  pais text not null,
  moneda text not null,
  nse text not null check (nse in ('alto','medio','popular')),
  lat double precision,
  lng double precision,
  tipo_ubicacion text,
  momento_observacion text,
  observaciones text,
  status text not null default 'borrador'
    check (status in ('borrador','completa_pendiente','enviada','en_revision','validada','devuelta')),
  checklist_version_id text not null,
  answers jsonb not null default '[]',
  price_observations jsonb not null default '[]',
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_audits_user_id on public.audits(user_id);
create index if not exists idx_audits_status on public.audits(status);

-- --------------------------------------------
-- EVIDENCIA MULTIMEDIA
-- --------------------------------------------
create table if not exists public.media_evidence (
  id uuid primary key,
  audit_id uuid not null references public.audits(id) on delete cascade,
  section_id text,
  question_id text,
  type text not null check (type in ('photo','audio','video')),
  storage_path text,
  mime_type text not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending','uploaded','failed'))
);

create index if not exists idx_media_audit on public.media_evidence(audit_id);

-- --------------------------------------------
-- EVENTOS DE SINCRONIZACIÓN (trazabilidad)
-- --------------------------------------------
create table if not exists public.sync_events (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  kind text not null default 'audit',
  status text not null default 'pending'
    check (status in ('pending','uploading','done','failed')),
  error text,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_sync_audit on public.sync_events(audit_id);

-- --------------------------------------------
-- HISTORIAL / TRAZABILIDAD
-- --------------------------------------------
create table if not exists public.audit_history (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  action text not null,
  detail jsonb default '{}',
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_history_audit on public.audit_history(audit_id);

-- --------------------------------------------
-- FUNCIÓN: actualizar updated_at
-- --------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_audits_updated on public.audits;
create trigger trg_audits_updated
  before update on public.audits
  for each row execute function public.set_updated_at();

comment on table public.audits is 'Auditorías de tiendas hard discount';
comment on table public.media_evidence is 'Fotos y audios asociados a auditorías';
comment on table public.sync_events is 'Intentos y resultados de sincronización';

-- --------------------------------------------
-- ROW LEVEL SECURITY
-- --------------------------------------------
alter table public.chains enable row level security;
alter table public.countries enable row level security;
alter table public.currencies enable row level security;
alter table public.audits enable row level security;
alter table public.media_evidence enable row level security;
alter table public.sync_events enable row level security;
alter table public.audit_history enable row level security;

-- Catálogos: lectura autenticada
create policy "catálogos lectura autenticada"
  on public.chains for select to authenticated using (true);
create policy "catálogos lectura autenticada"
  on public.countries for select to authenticated using (true);
create policy "catálogos lectura autenticada"
  on public.currencies for select to authenticated using (true);

-- Helper: el usuario autenticado es administrador (rol en app_metadata o user_metadata del JWT)
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce(
    auth.jwt() #>> '{app_metadata, role}' = 'admin'
    or auth.jwt() #>> '{user_metadata, role}' = 'admin',
    false
  );
$$;

-- Auditorías: un usuario ve las propias; el admin ve todas
create policy "auditorías: select"
  on public.audits for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "auditorías: insert"
  on public.audits for insert to authenticated
  with check (user_id = auth.uid());

create policy "auditorías: update"
  on public.audits for update to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Evidencia: propietaria vía auditoría
create policy "evidencia: select propia"
  on public.media_evidence for select to authenticated
  using (
    exists (select 1 from public.audits a where a.id = media_evidence.audit_id and a.user_id = auth.uid())
  );

create policy "evidencia: insert propia"
  on public.media_evidence for insert to authenticated
  with check (
    exists (select 1 from public.audits a where a.id = media_evidence.audit_id and a.user_id = auth.uid())
  );

create policy "evidencia: update propia"
  on public.media_evidence for update to authenticated
  using (
    exists (select 1 from public.audits a where a.id = media_evidence.audit_id and a.user_id = auth.uid())
  );

create policy "evidencia: delete propia"
  on public.media_evidence for delete to authenticated
  using (
    exists (select 1 from public.audits a where a.id = media_evidence.audit_id and a.user_id = auth.uid())
  );

-- Sync events: propios
create policy "sync: select propio"
  on public.sync_events for select to authenticated
  using (
    exists (select 1 from public.audits a where a.id = sync_events.audit_id and a.user_id = auth.uid())
  );

create policy "sync: insert propio"
  on public.sync_events for insert to authenticated
  with check (
    exists (select 1 from public.audits a where a.id = sync_events.audit_id and a.user_id = auth.uid())
  );

create policy "sync: update propio"
  on public.sync_events for update to authenticated
  using (
    exists (select 1 from public.audits a where a.id = sync_events.audit_id and a.user_id = auth.uid())
  );

-- Historial: propios
create policy "history: select propio"
  on public.audit_history for select to authenticated
  using (
    exists (select 1 from public.audits a where a.id = audit_history.audit_id and a.user_id = auth.uid())
  );

create policy "history: insert propio"
  on public.audit_history for insert to authenticated
  with check (
    exists (select 1 from public.audits a where a.id = audit_history.audit_id and a.user_id = auth.uid())
  );

-- ============================================================
-- NOTA: tras crear el primer usuario ADMIN desde la app, asigna el rol:
--
--   update auth.users
--   set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'
--   where id = '<uuid_del_admin>'
--   -- y aplica lo mismo en app_metadata:
--   -- set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--
-- (o usa la función de administración que crea la app en /admin)
-- ============================================================
-- ATLAS OSINT — Supabase schema blueprint v0.1
-- Generated: 2026-09-16
-- Status: review before applying to a new, isolated Supabase project.
-- The public Data API should expose `api`, not `osint`.

begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists postgis with schema extensions;

create schema if not exists osint;
create schema if not exists api;

-- Avoid accidental access. The 2026 Supabase defaults also require explicit grants,
-- but this blueprint makes the intended boundary reviewable in code.
revoke all on schema osint from public, anon, authenticated;
revoke all on schema api from public, anon, authenticated;
grant usage on schema api to anon, authenticated, service_role;
grant usage on schema osint to service_role;

create type osint.publication_status as enum
  ('draft', 'review', 'published', 'retracted', 'superseded');

create type osint.confidence_level as enum
  ('confirmed', 'very_probable', 'probable', 'possible',
   'uncorroborated', 'refuted', 'indeterminate');

create type osint.source_kind as enum
  ('official', 'international_organization', 'news_agency', 'media',
   'research', 'structured_dataset', 'satellite', 'social_media',
   'eyewitness', 'other');

create type osint.actor_kind as enum
  ('state', 'armed_forces', 'state_agency', 'international_organization',
   'non_state_armed_group', 'political_group', 'company', 'civil_society',
   'individual', 'other');

create type osint.event_kind as enum
  ('ground_combat', 'air_or_missile_strike', 'territorial_change',
   'movement_or_deployment', 'logistics_strike', 'maritime_incident',
   'nuclear_incident', 'diplomatic_action', 'economic_measure',
   'negotiation_or_ceasefire', 'humanitarian_impact',
   'information_operation', 'other');

create type osint.claim_kind as enum
  ('territorial_control', 'attack', 'casualty', 'capability', 'deployment',
   'logistics', 'diplomacy', 'economic', 'humanitarian', 'attribution', 'other');

create type osint.evidence_relation as enum
  ('supports', 'contradicts', 'contextualizes', 'duplicates');

create type osint.location_precision as enum
  ('exact', 'approximate', 'municipality', 'region', 'country', 'withheld');

create type osint.alert_status as enum
  ('draft', 'review', 'approved', 'sent', 'cancelled');

create table osint.conflicts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  started_on date,
  ended_on date,
  status text not null default 'active'
    check (status in ('monitoring', 'active', 'paused', 'ended')),
  publication_status osint.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table osint.actors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  actor_kind osint.actor_kind not null,
  country_iso3 text check (country_iso3 is null or country_iso3 ~ '^[A-Z]{3}$'),
  description text,
  publication_status osint.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table osint.conflict_actors (
  conflict_id uuid not null references osint.conflicts(id) on delete cascade,
  actor_id uuid not null references osint.actors(id) on delete cascade,
  role_label text,
  valid_from date,
  valid_to date,
  primary key (conflict_id, actor_id, valid_from),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

create table osint.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_iso3 text check (country_iso3 is null or country_iso3 ~ '^[A-Z]{3}$'),
  admin1 text,
  admin2 text,
  geom extensions.geography(Point, 4326),
  precision osint.location_precision not null default 'region',
  geonames_id bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table osint.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_kind osint.source_kind not null,
  homepage_url text,
  country_iso3 text check (country_iso3 is null or country_iso3 ~ '^[A-Z]{3}$'),
  default_language text,
  reliability_notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table osint.documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references osint.sources(id),
  title text,
  canonical_url text not null,
  archive_url text,
  author_text text,
  published_at timestamptz,
  captured_at timestamptz not null default now(),
  language text,
  content_hash text,
  storage_path text,
  license_notes text,
  ingestion_method text not null default 'manual'
    check (ingestion_method in ('manual', 'rss', 'api', 'webhook', 'other')),
  is_sensitive boolean not null default false,
  publication_status osint.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canonical_url, content_hash)
);

create table osint.claims (
  id uuid primary key default gen_random_uuid(),
  conflict_id uuid not null references osint.conflicts(id),
  claim_kind osint.claim_kind not null,
  statement text not null,
  asserted_by_actor_id uuid references osint.actors(id),
  location_id uuid references osint.locations(id),
  occurred_from timestamptz,
  occurred_to timestamptz,
  current_confidence osint.confidence_level not null default 'indeterminate',
  publication_status osint.publication_status not null default 'draft',
  is_sensitive boolean not null default false,
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (occurred_to is null or occurred_from is null or occurred_to >= occurred_from)
);

create table osint.claim_evidence (
  claim_id uuid not null references osint.claims(id) on delete cascade,
  document_id uuid not null references osint.documents(id) on delete cascade,
  relation osint.evidence_relation not null,
  excerpt text,
  locator text,
  is_independent boolean,
  notes text,
  created_at timestamptz not null default now(),
  primary key (claim_id, document_id, relation)
);

create table osint.events (
  id uuid primary key default gen_random_uuid(),
  conflict_id uuid not null references osint.conflicts(id),
  event_kind osint.event_kind not null,
  title text not null,
  summary text not null,
  occurred_from timestamptz,
  occurred_to timestamptz,
  location_id uuid references osint.locations(id),
  geom extensions.geography(Point, 4326),
  location_precision osint.location_precision not null default 'region',
  current_confidence osint.confidence_level not null default 'indeterminate',
  publication_status osint.publication_status not null default 'draft',
  is_sensitive boolean not null default false,
  sensitivity_delay_until timestamptz,
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (occurred_to is null or occurred_from is null or occurred_to >= occurred_from),
  check (publication_status <> 'published' or reviewed_at is not null),
  check (publication_status <> 'published' or is_sensitive = false),
  check (publication_status <> 'published' or sensitivity_delay_until is null
         or sensitivity_delay_until <= now())
);

create table osint.event_claims (
  event_id uuid not null references osint.events(id) on delete cascade,
  claim_id uuid not null references osint.claims(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (event_id, claim_id)
);

create table osint.event_actors (
  event_id uuid not null references osint.events(id) on delete cascade,
  actor_id uuid not null references osint.actors(id) on delete cascade,
  role_label text,
  primary key (event_id, actor_id)
);

create table osint.assessments (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references osint.claims(id) on delete cascade,
  event_id uuid references osint.events(id) on delete cascade,
  confidence osint.confidence_level not null,
  source_reliability smallint check (source_reliability between 0 and 5),
  evidence_strength smallint check (evidence_strength between 0 and 5),
  independence_score smallint check (independence_score between 0 and 5),
  temporal_precision smallint check (temporal_precision between 0 and 5),
  geographic_precision smallint check (geographic_precision between 0 and 5),
  reasoning text not null,
  alternative_explanation text,
  assessed_by uuid references auth.users(id),
  assessed_at timestamptz not null default now(),
  supersedes_assessment_id uuid references osint.assessments(id),
  is_public boolean not null default false,
  check ((claim_id is not null)::int + (event_id is not null)::int = 1)
);

create table osint.contradictions (
  id uuid primary key default gen_random_uuid(),
  claim_a_id uuid not null references osint.claims(id) on delete cascade,
  claim_b_id uuid not null references osint.claims(id) on delete cascade,
  explanation text,
  status text not null default 'open'
    check (status in ('open', 'resolved', 'not_a_contradiction')),
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  check (claim_a_id <> claim_b_id),
  unique (claim_a_id, claim_b_id)
);

create table osint.territory_states (
  id uuid primary key default gen_random_uuid(),
  conflict_id uuid not null references osint.conflicts(id),
  name text not null,
  controller_actor_id uuid references osint.actors(id),
  status_label text not null
    check (status_label in ('controlled', 'contested', 'claimed', 'unknown')),
  geom extensions.geography(MultiPolygon, 4326) not null,
  valid_from timestamptz not null,
  valid_to timestamptz,
  confidence osint.confidence_level not null,
  publication_status osint.publication_status not null default 'draft',
  is_sensitive boolean not null default false,
  created_at timestamptz not null default now(),
  check (valid_to is null or valid_to >= valid_from)
);

create table osint.territory_claims (
  territory_state_id uuid not null references osint.territory_states(id) on delete cascade,
  claim_id uuid not null references osint.claims(id) on delete cascade,
  primary key (territory_state_id, claim_id)
);

create table osint.turns (
  id uuid primary key default gen_random_uuid(),
  conflict_id uuid not null references osint.conflicts(id),
  turn_date date not null,
  title text not null,
  executive_summary text,
  changes_summary text,
  pending_claims_summary text,
  publication_status osint.publication_status not null default 'draft',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (conflict_id, turn_date),
  check (publication_status <> 'published' or reviewed_at is not null)
);

create table osint.turn_events (
  turn_id uuid not null references osint.turns(id) on delete cascade,
  event_id uuid not null references osint.events(id) on delete cascade,
  importance smallint not null default 3 check (importance between 1 and 5),
  display_order integer,
  primary key (turn_id, event_id)
);

create table osint.alerts (
  id uuid primary key default gen_random_uuid(),
  conflict_id uuid not null references osint.conflicts(id),
  event_id uuid references osint.events(id),
  title text not null,
  body text not null,
  severity smallint not null check (severity between 1 and 5),
  status osint.alert_status not null default 'draft',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  check (status not in ('approved', 'sent') or approved_at is not null)
);

create table osint.change_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid,
  action text not null check (action in ('insert', 'update', 'delete', 'publish', 'retract')),
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now(),
  before_data jsonb,
  after_data jsonb,
  reason text
);

-- Public, sanitized publication tables. These contain copies, not raw records.
create table api.conflicts (
  id uuid primary key,
  slug text not null unique,
  name text not null,
  description text,
  started_on date,
  ended_on date,
  status text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create table api.actors (
  id uuid primary key,
  slug text not null unique,
  name text not null,
  short_name text,
  actor_kind text not null,
  country_iso3 text,
  description text,
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table api.events (
  id uuid primary key,
  conflict_id uuid not null references api.conflicts(id) on delete cascade,
  event_kind text not null,
  title text not null,
  summary text not null,
  occurred_from timestamptz,
  occurred_to timestamptz,
  longitude double precision,
  latitude double precision,
  location_name text,
  location_precision text not null,
  confidence text not null,
  fog_state text not null
    check (fog_state in ('visible', 'light_fog', 'dense_fog', 'contradictory', 'hidden', 'refuted')),
  actor_ids uuid[] not null default '{}',
  source_count integer not null default 0 check (source_count >= 0),
  is_published boolean not null default false,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((longitude is null and latitude is null)
         or (longitude between -180 and 180 and latitude between -90 and 90))
);

create table api.turns (
  id uuid primary key,
  conflict_id uuid not null references api.conflicts(id) on delete cascade,
  turn_date date not null,
  title text not null,
  executive_summary text,
  changes_summary text,
  event_ids uuid[] not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (conflict_id, turn_date)
);

create table api.event_sources (
  event_id uuid not null references api.events(id) on delete cascade,
  source_name text not null,
  title text,
  url text not null,
  published_at timestamptz,
  primary key (event_id, url)
);

-- Indexes for the initial query patterns.
create index documents_source_published_idx
  on osint.documents (source_id, published_at desc);
create index documents_content_hash_idx
  on osint.documents (content_hash) where content_hash is not null;
create index claims_conflict_status_idx
  on osint.claims (conflict_id, publication_status, occurred_from desc);
create index claims_location_idx on osint.claims (location_id);
create index events_conflict_status_idx
  on osint.events (conflict_id, publication_status, occurred_from desc);
create index events_geom_gix on osint.events using gist (geom);
create index locations_geom_gix on osint.locations using gist (geom);
create index territory_states_geom_gix on osint.territory_states using gist (geom);
create index territory_states_time_idx
  on osint.territory_states (conflict_id, valid_from desc, valid_to);
create index assessments_claim_idx on osint.assessments (claim_id, assessed_at desc);
create index assessments_event_idx on osint.assessments (event_id, assessed_at desc);
create index api_events_conflict_time_idx
  on api.events (conflict_id, occurred_from desc) where is_published;
create index api_turns_conflict_date_idx
  on api.turns (conflict_id, turn_date desc) where is_published;

-- Generic updated_at trigger. It remains in the private schema and is not an API function.
create or replace function osint.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger conflicts_set_updated_at before update on osint.conflicts
  for each row execute function osint.set_updated_at();
create trigger actors_set_updated_at before update on osint.actors
  for each row execute function osint.set_updated_at();
create trigger locations_set_updated_at before update on osint.locations
  for each row execute function osint.set_updated_at();
create trigger sources_set_updated_at before update on osint.sources
  for each row execute function osint.set_updated_at();
create trigger documents_set_updated_at before update on osint.documents
  for each row execute function osint.set_updated_at();
create trigger claims_set_updated_at before update on osint.claims
  for each row execute function osint.set_updated_at();
create trigger events_set_updated_at before update on osint.events
  for each row execute function osint.set_updated_at();
create trigger turns_set_updated_at before update on osint.turns
  for each row execute function osint.set_updated_at();
create trigger api_conflicts_set_updated_at before update on api.conflicts
  for each row execute function osint.set_updated_at();
create trigger api_actors_set_updated_at before update on api.actors
  for each row execute function osint.set_updated_at();
create trigger api_events_set_updated_at before update on api.events
  for each row execute function osint.set_updated_at();
create trigger api_turns_set_updated_at before update on api.turns
  for each row execute function osint.set_updated_at();

-- RLS is enabled on every table, including private tables, as defense in depth.
alter table osint.conflicts enable row level security;
alter table osint.actors enable row level security;
alter table osint.conflict_actors enable row level security;
alter table osint.locations enable row level security;
alter table osint.sources enable row level security;
alter table osint.documents enable row level security;
alter table osint.claims enable row level security;
alter table osint.claim_evidence enable row level security;
alter table osint.events enable row level security;
alter table osint.event_claims enable row level security;
alter table osint.event_actors enable row level security;
alter table osint.assessments enable row level security;
alter table osint.contradictions enable row level security;
alter table osint.territory_states enable row level security;
alter table osint.territory_claims enable row level security;
alter table osint.turns enable row level security;
alter table osint.turn_events enable row level security;
alter table osint.alerts enable row level security;
alter table osint.change_log enable row level security;

alter table api.conflicts enable row level security;
alter table api.actors enable row level security;
alter table api.events enable row level security;
alter table api.turns enable row level security;
alter table api.event_sources enable row level security;

-- Public clients receive read-only access only to the publication surface.
grant select on api.conflicts, api.actors, api.events, api.turns, api.event_sources
  to anon, authenticated;
grant select, insert, update, delete on all tables in schema api to service_role;
grant usage, select on all sequences in schema api to service_role;

-- Server-side ingestion and publication use the service role. Never expose it to a client.
grant select, insert, update, delete on all tables in schema osint to service_role;
grant usage, select on all sequences in schema osint to service_role;

create policy api_conflicts_public_read on api.conflicts
  for select to anon, authenticated
  using (is_published = true);

create policy api_actors_public_read on api.actors
  for select to anon, authenticated
  using (is_published = true);

create policy api_events_public_read on api.events
  for select to anon, authenticated
  using (is_published = true);

create policy api_turns_public_read on api.turns
  for select to anon, authenticated
  using (is_published = true);

create policy api_event_sources_public_read on api.event_sources
  for select to anon, authenticated
  using (
    exists (
      select 1 from api.events e
      where e.id = event_id and e.is_published = true
    )
  );

-- No INSERT/UPDATE/DELETE policies are intentionally created for public roles.
-- No public policies are intentionally created on the `osint` schema.

commit;

-- Post-apply verification checklist (run separately):
-- 1. Add `api` and remove `public`/`osint` from exposed Data API schemas as appropriate.
-- 2. Run Supabase Security and Performance Advisors.
-- 3. Test anon SELECT: unpublished rows must return zero rows.
-- 4. Test anon writes: INSERT/UPDATE/DELETE must fail.
-- 5. Test direct access to `osint`: anon/authenticated must fail.
-- 6. Confirm the site uses only a publishable key; keep secret/service_role server-side.
-- 7. Create private Storage policies in a separate reviewed migration.

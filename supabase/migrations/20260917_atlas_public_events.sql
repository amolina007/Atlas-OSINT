-- Browser-safe publication table for the ATLAS OSINT site.
-- Deliberately separate from the private osint schema: publishing requires an
-- explicit copy into this table and never grants browser access to raw records.

create table if not exists public.atlas_events (
  id uuid primary key default gen_random_uuid(),
  conflict_slug text not null,
  occurred_at timestamptz,
  event_type text not null,
  title text not null,
  summary text,
  location_name text,
  latitude numeric check (latitude is null or latitude between -90 and 90),
  longitude numeric check (longitude is null or longitude between -180 and 180),
  verification_status text not null default 'unverified',
  confidence smallint check (confidence is null or confidence between 1 and 5),
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  check (not is_published or published_at is not null)
);

alter table public.atlas_events enable row level security;

revoke all on table public.atlas_events from anon, authenticated;
grant select on table public.atlas_events to anon, authenticated;
grant select, insert, update, delete on table public.atlas_events to service_role;

drop policy if exists "atlas_events_public_read" on public.atlas_events;
create policy "atlas_events_public_read"
  on public.atlas_events
  for select
  to anon, authenticated
  using (is_published = true);

comment on table public.atlas_events is
  'Sanitized ATLAS publication surface. Private osint records are never exposed directly.';

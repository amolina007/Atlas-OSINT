create table public.atlas_dev_weather_favorites (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 place_key text not null check(length(place_key) between 3 and 80),
 name text not null check(length(name) between 1 and 150),
 region text not null default '' check(length(region)<=250),
 latitude double precision not null check(latitude between -85 and 85),
 longitude double precision not null check(longitude between -180 and 180),
 timezone text not null default 'UTC' check(length(timezone) between 1 and 100),
 created_at timestamptz not null default now(),
 primary key(user_id,place_key)
);
alter table public.atlas_dev_weather_favorites enable row level security;
revoke all on public.atlas_dev_weather_favorites from public,anon,authenticated;
grant select,insert,update,delete on public.atlas_dev_weather_favorites to authenticated;
create policy own_weather_favorites on public.atlas_dev_weather_favorites for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

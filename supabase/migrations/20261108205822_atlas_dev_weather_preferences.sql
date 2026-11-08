create table public.atlas_dev_weather_preferences (
 user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
 home_key text check(length(home_key) between 3 and 80),
 layer text not null default 'rain' check(layer in ('rain','temperature','wind','alerts')),
 rain_hours integer not null default 24 check(rain_hours in (1,24))
);
alter table public.atlas_dev_weather_preferences enable row level security;
revoke all on public.atlas_dev_weather_preferences from public,anon,authenticated;
grant select,insert,update,delete on public.atlas_dev_weather_preferences to authenticated;
create policy own_weather_preferences on public.atlas_dev_weather_preferences for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

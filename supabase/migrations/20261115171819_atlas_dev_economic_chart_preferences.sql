create table public.atlas_dev_economic_chart_preferences (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 indicator text not null check(indicator in ('dolar','uf','ipc','tpm','cobre','imacec')),
 months integer not null default 12 check(months in (1,3,6,12,60)),
 interval text not null default 'daily' check(interval in ('daily','weekly','monthly')),
 style text not null default 'line' check(style in ('line','candles')),
 studies text[] not null default array['sma20','sma50']::text[] check(studies <@ array['sma20','sma50','ema20','bands','rsi']::text[] and cardinality(studies)<=5),
 primary key(user_id,indicator),
 check(style <> 'candles' or interval <> 'daily')
);
alter table public.atlas_dev_economic_chart_preferences enable row level security;
revoke all on public.atlas_dev_economic_chart_preferences from public,anon,authenticated;
grant select,insert,update,delete on public.atlas_dev_economic_chart_preferences to authenticated;
create policy own_chart_preferences on public.atlas_dev_economic_chart_preferences for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

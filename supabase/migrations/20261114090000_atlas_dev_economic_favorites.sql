create table public.atlas_dev_economic_favorites (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 indicator text not null check(indicator in ('dolar','uf','ipc','tpm','cobre','imacec')),
 created_at timestamptz not null default now(),
 primary key(user_id,indicator)
);
alter table public.atlas_dev_economic_favorites enable row level security;
revoke all on public.atlas_dev_economic_favorites from public,anon,authenticated;
grant select,insert,delete on public.atlas_dev_economic_favorites to authenticated;
create policy own_economic_favorites_select on public.atlas_dev_economic_favorites for select to authenticated using ((select auth.uid())=user_id);
create policy own_economic_favorites_insert on public.atlas_dev_economic_favorites for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_economic_favorites_delete on public.atlas_dev_economic_favorites for delete to authenticated using ((select auth.uid())=user_id);

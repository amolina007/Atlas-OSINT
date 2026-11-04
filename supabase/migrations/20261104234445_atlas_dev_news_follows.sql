create table public.atlas_dev_news_follows (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check(kind in ('topic','tag','place')),
 value text not null check(char_length(btrim(value)) between 1 and 100),
 created_at timestamptz not null default now(),
 primary key(user_id,kind,value)
);
alter table public.atlas_dev_news_follows enable row level security;
revoke all on public.atlas_dev_news_follows from public,anon,authenticated;
grant select,delete on public.atlas_dev_news_follows to authenticated;
grant insert(kind,value) on public.atlas_dev_news_follows to authenticated;
create policy follows_read_own on public.atlas_dev_news_follows for select to authenticated using ((select auth.uid())=user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create policy follows_insert_own on public.atlas_dev_news_follows for insert to authenticated with check ((select auth.uid())=user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create policy follows_delete_own on public.atlas_dev_news_follows for delete to authenticated using ((select auth.uid())=user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));

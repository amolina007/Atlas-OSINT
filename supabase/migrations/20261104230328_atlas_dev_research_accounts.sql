-- Atlas dev only: private notebooks, account ownership and optimistic concurrency.
create table public.atlas_dev_research (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null check(char_length(btrim(title)) between 1 and 150),
 body jsonb not null default '{"events":[],"facts":"","hypotheses":"","questions":""}'::jsonb,
 version bigint not null default 1,
 archived boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint atlas_dev_research_body check (
  jsonb_typeof(body)='object' and octet_length(body::text)<=1048576 and
  body ?& array['events','facts','hypotheses','questions'] and
  jsonb_typeof(body->'events')='array' and jsonb_array_length(body->'events')<=100 and
  jsonb_typeof(body->'facts')='string' and char_length(body->>'facts')<=50000 and
  jsonb_typeof(body->'hypotheses')='string' and char_length(body->>'hypotheses')<=50000 and
  jsonb_typeof(body->'questions')='string' and char_length(body->>'questions')<=50000
 )
);
create index atlas_dev_research_owner_updated on public.atlas_dev_research(user_id,updated_at desc);
alter table public.atlas_dev_research enable row level security;
revoke all on public.atlas_dev_research from public,anon,authenticated;
grant select on public.atlas_dev_research to authenticated;
grant insert(id,title,body) on public.atlas_dev_research to authenticated;
grant update(title,body,archived) on public.atlas_dev_research to authenticated;
create policy research_read_own on public.atlas_dev_research for select to authenticated using ((select auth.uid())=user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create policy research_insert_own on public.atlas_dev_research for insert to authenticated with check ((select auth.uid())=user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create policy research_update_own on public.atlas_dev_research for update to authenticated using ((select auth.uid())=user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false)) with check ((select auth.uid())=user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false));
create function public.atlas_dev_research_stamp() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,4917));
  if (select count(*) from public.atlas_dev_research where user_id=new.user_id)>=100 then raise exception 'Límite de 100 investigaciones por cuenta'; end if;
 else
  new.version=old.version+1;
  new.updated_at=clock_timestamp();
 end if;
 return new;
end;
$$;
revoke all on function public.atlas_dev_research_stamp() from public,anon,authenticated;
create trigger atlas_dev_research_stamp before insert or update on public.atlas_dev_research for each row execute function public.atlas_dev_research_stamp();

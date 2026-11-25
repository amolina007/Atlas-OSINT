create table public.atlas_dev_home_visits(user_id uuid primary key references auth.users(id) on delete cascade,last_visited_at timestamptz not null,seen_ids text[] not null default '{}');
alter table public.atlas_dev_home_visits enable row level security;
revoke all on public.atlas_dev_home_visits from public,anon,authenticated;
grant select,insert,update on public.atlas_dev_home_visits to authenticated;
create policy own_home_visit on public.atlas_dev_home_visits for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create function public.atlas_dev_home_visit(p_ids text[]) returns jsonb language plpgsql security invoker set search_path='' as $$
declare previous public.atlas_dev_home_visits; stamp timestamptz:=now(); ids text[];
begin
 if auth.uid() is null then raise exception 'Sign in required';end if;
 if cardinality(p_ids)>300 or exists(select 1 from unnest(p_ids) x where x is null or length(x)>200) then raise exception 'Invalid article identifiers';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,81837));
 select * into previous from public.atlas_dev_home_visits where user_id=auth.uid() for update;
 select coalesce(array_agg(x),'{}') into ids from (select x from (select distinct unnest(coalesce(p_ids,'{}')||coalesce(previous.seen_ids,'{}')) x) d limit 2000) q;
 insert into public.atlas_dev_home_visits(user_id,last_visited_at,seen_ids) values(auth.uid(),stamp,ids) on conflict(user_id) do update set last_visited_at=greatest(atlas_dev_home_visits.last_visited_at,excluded.last_visited_at),seen_ids=excluded.seen_ids;
 return jsonb_build_object('previous',previous.last_visited_at,'seen',coalesce(previous.seen_ids,'{}'),'current',stamp);
end $$;
revoke all on function public.atlas_dev_home_visit(text[]) from public,anon;
grant execute on function public.atlas_dev_home_visit(text[]) to authenticated;
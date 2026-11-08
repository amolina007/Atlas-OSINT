-- Dev-only scheduler. A short-lived capability is bound to one story, never a user JWT.
create schema if not exists atlas_private;
revoke all on schema atlas_private from public, anon, authenticated;
create table atlas_private.story_jobs (
 story_id uuid primary key references public.atlas_dev_research(id) on delete cascade,
 token_hash text not null unique,
 expires_at timestamptz not null,
 attempted_at timestamptz not null default now(),
 completed_at timestamptz,
 status text not null check (status in ('pending','running','complete','failed')),
 request_id bigint
);
alter table atlas_private.story_jobs enable row level security;
revoke all on atlas_private.story_jobs from public,anon,authenticated;

-- Only the cron owner can dispatch. Fixed dev destination, bounded queue and retry delay.
create function atlas_private.dispatch_story_updates() returns integer
language plpgsql security definer set search_path='' as $$
declare r record; capability text; sent integer:=0; rid bigint;
begin
 if not pg_try_advisory_xact_lock(817364911) then return 0; end if;
 for r in
  select s.id from public.atlas_dev_research s
  left join atlas_private.story_jobs j on j.story_id=s.id
  where not s.archived and jsonb_array_length(coalesce(s.body->'events','[]')) between 1 and 99
   and (j.story_id is null or (j.attempted_at<now()-interval '1 hour' and j.expires_at<now()))
  order by j.attempted_at asc nulls first,s.created_at asc limit 4
 loop
  capability:=encode(extensions.gen_random_bytes(32),'hex');
  insert into atlas_private.story_jobs(story_id,token_hash,expires_at,attempted_at,status)
   values(r.id,encode(extensions.digest(capability,'sha256'),'hex'),now()+interval '15 minutes',now(),'pending')
   on conflict(story_id) do update set token_hash=excluded.token_hash,expires_at=excluded.expires_at,attempted_at=now(),status='pending';
  select net.http_post(url:='https://dev.atlas.convergenciaaura.cl/.netlify/functions/story-background',
   headers:=jsonb_build_object('Content-Type','application/json'),body:=jsonb_build_object('token',capability),timeout_milliseconds:=10000) into rid;
  update atlas_private.story_jobs set request_id=rid where story_id=r.id;
  sent:=sent+1;
 end loop;
 return sent;
end $$;
revoke all on function atlas_private.dispatch_story_updates() from public,anon,authenticated;

-- Capability gate: callers cannot choose a story, owner or arbitrary field to modify.
create function public.atlas_dev_story_job(p_token text,p_action text,p_version bigint default null,p_event jsonb default null,p_success boolean default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare j atlas_private.story_jobs; s public.atlas_dev_research; next_body jsonb;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then return null; end if;
 select * into j from atlas_private.story_jobs where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and expires_at>now() for update;
 if not found then return null; end if;
 if p_action='claim' then
  if j.status<>'pending' then return null; end if;
  update atlas_private.story_jobs set status='running' where story_id=j.story_id;
 elsif j.status<>'running' then return null;
 end if;
 select * into s from public.atlas_dev_research where id=j.story_id for update;
 if not found or s.archived then
  update atlas_private.story_jobs set status='complete',expires_at=now() where story_id=j.story_id;
  return null;
 end if;
 if p_action in ('claim','read') then
  return jsonb_build_object('id',s.id,'version',s.version,'archived',s.archived,'body',jsonb_build_object('events',coalesce(s.body->'events','[]'),'tracking',coalesce(s.body->'tracking','{}')));
 elsif p_action='append' then
  if p_version is null or p_version<>s.version then return 'false'::jsonb; end if;
  if p_event is null or jsonb_typeof(p_event)<>'object' or p_event->>'automatic'<>'true' or p_event->>'id' is null
   or jsonb_array_length(coalesce(p_event->'reading'->'what','[]'))=0
   or jsonb_array_length(coalesce(p_event->'reading'->'context','[]'))=0
   or jsonb_array_length(coalesce(p_event->'changes','[]'))=0 then raise exception 'invalid event'; end if;
  if jsonb_array_length(s.body->'events')>=100 then return 'false'::jsonb; end if;
  if exists(select 1 from jsonb_array_elements(s.body->'events') e where e->>'id'=p_event->>'id' or e->>'url'=p_event->>'url' or lower(e->>'title')=lower(p_event->>'title')) then return 'true'::jsonb; end if;
  next_body:=jsonb_set(s.body,'{events}',(s.body->'events')||jsonb_build_array(p_event));
  if octet_length(next_body::text)>950000 then raise exception 'story capacity'; end if;
  update public.atlas_dev_research set body=next_body where id=s.id;
  return 'true'::jsonb;
 elsif p_action='finish' then
  if p_success is true then
   update public.atlas_dev_research set body=jsonb_set(body,'{tracking}',coalesce(body->'tracking','{}')||jsonb_build_object('checkedAt',now())) where id=s.id;
  end if;
  update atlas_private.story_jobs set status=case when p_success then 'complete' else 'failed' end,completed_at=case when p_success then now() else completed_at end,expires_at=now() where story_id=j.story_id;
  return 'true'::jsonb;
 end if;
 return null;
end $$;
revoke all on function public.atlas_dev_story_job(text,text,bigint,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.atlas_dev_story_job(text,text,bigint,jsonb,boolean) to anon;
-- Enabled after deploying and validating the worker. No production table is used.

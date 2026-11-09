-- Promote existing bounded workers without changing data ownership or capability checks.
create or replace function atlas_private.dispatch_story_updates() returns integer
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
  select net.http_post(url:='https://atlas.convergenciaaura.cl/.netlify/functions/story-background',
   headers:=jsonb_build_object('Content-Type','application/json'),body:=jsonb_build_object('token',capability),timeout_milliseconds:=10000) into rid;
  update atlas_private.story_jobs set request_id=rid where story_id=r.id;
  sent:=sent+1;
 end loop;
 return sent;
end $$;

create or replace function atlas_private.dispatch_feed_preparation() returns boolean language plpgsql security definer set search_path='' as $$
declare capability text; rid bigint;
begin
 if not pg_try_advisory_xact_lock(817364912) then return false; end if;
 if exists(select 1 from atlas_private.feed_job where attempted_at>now()-interval '45 minutes' or expires_at>now()) then return false; end if;
 capability:=encode(extensions.gen_random_bytes(32),'hex');
 insert into atlas_private.feed_job(id,token_hash,expires_at,attempted_at,status) values(true,encode(extensions.digest(capability,'sha256'),'hex'),now()+interval '15 minutes',now(),'pending')
 on conflict(id) do update set token_hash=excluded.token_hash,expires_at=excluded.expires_at,attempted_at=now(),status='pending';
 select net.http_post(url:='https://atlas.convergenciaaura.cl/.netlify/functions/news-feed-background',headers:=jsonb_build_object('Content-Type','application/json'),body:=jsonb_build_object('token',capability),timeout_milliseconds:=10000) into rid;
 update atlas_private.feed_job set request_id=rid where id;
 return true;
end $$;

select cron.schedule('atlas-production-map-layers','47 */6 * * *', $job$ select net.http_post(url := (select decrypted_secret || '?trigger_branch=main&trigger_title=Atlas+production+map+refresh' from vault.decrypted_secrets where name = 'atlas_dev_map_build_hook'), body := '{}'::jsonb, timeout_milliseconds := 10000); $job$);

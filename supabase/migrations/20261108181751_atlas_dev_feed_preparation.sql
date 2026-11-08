create table atlas_private.feed_job (
 id boolean primary key default true check(id),token_hash text not null,
 expires_at timestamptz not null,attempted_at timestamptz not null,
 completed_at timestamptz,status text not null,request_id bigint
);
alter table atlas_private.feed_job enable row level security;
revoke all on atlas_private.feed_job from public,anon,authenticated;
create function atlas_private.dispatch_feed_preparation() returns boolean language plpgsql security definer set search_path='' as $$
declare capability text; rid bigint;
begin
 if not pg_try_advisory_xact_lock(817364912) then return false; end if;
 if exists(select 1 from atlas_private.feed_job where attempted_at>now()-interval '45 minutes' or expires_at>now()) then return false; end if;
 capability:=encode(extensions.gen_random_bytes(32),'hex');
 insert into atlas_private.feed_job(id,token_hash,expires_at,attempted_at,status) values(true,encode(extensions.digest(capability,'sha256'),'hex'),now()+interval '15 minutes',now(),'pending')
 on conflict(id) do update set token_hash=excluded.token_hash,expires_at=excluded.expires_at,attempted_at=now(),status='pending';
 select net.http_post(url:='https://dev.atlas.convergenciaaura.cl/.netlify/functions/news-feed-background',headers:=jsonb_build_object('Content-Type','application/json'),body:=jsonb_build_object('token',capability),timeout_milliseconds:=10000) into rid;
 update atlas_private.feed_job set request_id=rid where id;
 return true;
end $$;
revoke all on function atlas_private.dispatch_feed_preparation() from public,anon,authenticated;
create function public.atlas_dev_feed_job(p_token text,p_action text,p_success boolean default false) returns boolean language plpgsql security definer set search_path='' as $$
declare j atlas_private.feed_job;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then return false; end if;
 select * into j from atlas_private.feed_job where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and expires_at>now() for update;
 if not found then return false; end if;
 if p_action='claim' and j.status='pending' then update atlas_private.feed_job set status='running' where id;return true;end if;
 if p_action='finish' and j.status='running' then update atlas_private.feed_job set status=case when p_success then 'complete' else 'failed' end,expires_at=now(),completed_at=case when p_success then now() else completed_at end where id;return true;end if;
 return false;
end $$;
revoke all on function public.atlas_dev_feed_job(text,text,boolean) from public,anon,authenticated;
grant execute on function public.atlas_dev_feed_job(text,text,boolean) to anon;
select cron.schedule('atlas-dev-prepared-news','7 * * * *','select atlas_private.dispatch_feed_preparation();');

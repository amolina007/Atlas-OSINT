-- Atlas dev only. Public poll definitions; private individual ballots.
create schema if not exists atlas_dev_poll_api;
revoke all on schema atlas_dev_poll_api from public,anon;
grant usage on schema atlas_dev_poll_api to authenticated;
create table public.atlas_dev_polls (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 8 and 240), description text not null default '' check(char_length(description)<=1500),
 topic text not null check(topic in ('Política','Economía','Seguridad','Salud','Deportes','Vida cotidiana','Otros')),
 kind text not null check(kind in ('single','multiple','scale','text')), options jsonb not null check(jsonb_typeof(options)='array'),
 created_at timestamptz not null default now(), closes_at timestamptz not null, closed boolean not null default false, archived boolean not null default false
);
create index atlas_dev_polls_owner_idx on public.atlas_dev_polls(owner_id);
create index atlas_dev_polls_created_idx on public.atlas_dev_polls(created_at desc);
create table public.atlas_dev_poll_votes (
 poll_id uuid not null references public.atlas_dev_polls(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 choices integer[] not null default '{}', answer text not null default '' check(char_length(answer)<=1000),
 created_at timestamptz not null default now(), primary key(poll_id,user_id)
);
create index atlas_dev_poll_votes_user_idx on public.atlas_dev_poll_votes(user_id);
alter table public.atlas_dev_polls enable row level security;
alter table public.atlas_dev_poll_votes enable row level security;
revoke all on public.atlas_dev_polls,public.atlas_dev_poll_votes from anon,authenticated;
grant select on public.atlas_dev_polls to anon,authenticated;
grant select on public.atlas_dev_poll_votes to authenticated;
create policy atlas_poll_read on public.atlas_dev_polls for select to anon,authenticated using(not archived or owner_id=(select auth.uid()));
create policy atlas_vote_own on public.atlas_dev_poll_votes for select to authenticated using(user_id=(select auth.uid()));

create function atlas_dev_poll_api.create_poll(p_title text,p_description text,p_topic text,p_kind text,p_options jsonb,p_closes_at timestamptz) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result uuid; n int;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Ingresa con tu cuenta de Convergencia'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,11));
 if (select count(*) from public.atlas_dev_polls where owner_id=uid and created_at>now()-interval '1 day')>=10 then raise exception 'Puedes crear hasta 10 encuestas por día'; end if;
 if p_closes_at is null or p_closes_at<=now() or p_closes_at>now()+interval '366 days' then raise exception 'Elige un cierre futuro dentro de un año'; end if;
 if p_kind='scale' then p_options:='["1 · Muy bajo","2 · Bajo","3 · Intermedio","4 · Alto","5 · Muy alto"]'; end if;
 if p_kind='text' then p_options:='[]'; end if;
 if p_options is null or jsonb_typeof(p_options)<>'array' then raise exception 'Opciones inválidas'; end if;
 n:=jsonb_array_length(p_options);
 if p_kind in ('single','multiple') and (n<2 or n>8) then raise exception 'Incluye entre 2 y 8 opciones'; end if;
 if exists(select 1 from jsonb_array_elements(p_options) x where jsonb_typeof(x)<>'string' or char_length(btrim(x#>>'{}')) not between 1 and 120) or (select count(distinct lower(btrim(x))) from jsonb_array_elements_text(p_options) x)<>n then raise exception 'Las opciones deben ser distintas y tener hasta 120 caracteres'; end if;
 insert into public.atlas_dev_polls(owner_id,title,description,topic,kind,options,closes_at) values(uid,btrim(p_title),btrim(coalesce(p_description,'')),p_topic,p_kind,p_options,p_closes_at) returning id into result;
 return result;
end $$;
create function atlas_dev_poll_api.vote(p_poll_id uuid,p_choices integer[],p_answer text) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.atlas_dev_polls; n int;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Ingresa con tu cuenta de Convergencia'; end if;
 select * into p from public.atlas_dev_polls where id=p_poll_id for share;
 if not found or p.closed or p.archived or p.closes_at<=now() then raise exception 'Esta encuesta está cerrada'; end if;
 p_choices:=coalesce(p_choices,'{}');p_answer:=btrim(coalesce(p_answer,''));n:=cardinality(p_choices);
 if p.kind='text' then
  if n<>0 or char_length(p_answer) not between 2 and 1000 then raise exception 'Escribe entre 2 y 1000 caracteres'; end if;
 else
  if p_answer<>'' or n<1 or n>jsonb_array_length(p.options) or (p.kind<>'multiple' and n<>1) or exists(select 1 from unnest(p_choices) x where x is null or x<0 or x>=jsonb_array_length(p.options)) or (select count(distinct x) from unnest(p_choices) x)<>n then raise exception 'Selecciona opciones válidas'; end if;
 end if;
 insert into public.atlas_dev_poll_votes(poll_id,user_id,choices,answer) values(p_poll_id,uid,p_choices,p_answer);
exception when unique_violation then raise exception 'Ya respondiste esta encuesta';
end $$;
create function atlas_dev_poll_api.manage(p_poll_id uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Ingresa con Convergencia'; end if;
 if p_action not in ('close','archive','restore') or p_action is null then raise exception 'Acción inválida'; end if;
 update public.atlas_dev_polls set closed=case when p_action='close' then true else closed end,archived=case when p_action='archive' then true when p_action='restore' then false else archived end where id=p_poll_id and owner_id=auth.uid();
 if not found then raise exception 'Solo el creador puede administrar esta encuesta'; end if;
end $$;
create function atlas_dev_poll_api.results(p_poll_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p public.atlas_dev_polls; total bigint; bars jsonb; days jsonb; texts jsonb;
begin
 if auth.uid() is null then raise exception 'Ingresa con Convergencia para ver los resultados'; end if;
 select * into p from public.atlas_dev_polls where id=p_poll_id and (not archived or owner_id=auth.uid());if not found then raise exception 'Encuesta no disponible'; end if;
 select count(*) into total from public.atlas_dev_poll_votes where poll_id=p_poll_id;
 select coalesce(jsonb_agg(jsonb_build_object('label',o.label,'count',(select count(*) from public.atlas_dev_poll_votes v where v.poll_id=p_poll_id and (o.ord-1)::int=any(v.choices))) order by o.ord),'[]') into bars from jsonb_array_elements_text(p.options) with ordinality o(label,ord);
 select coalesce(jsonb_agg(jsonb_build_object('date',d.vote_day,'count',d.n) order by d.vote_day),'[]') into days from (select (created_at at time zone 'America/Santiago')::date as vote_day,count(*) n from public.atlas_dev_poll_votes where poll_id=p_poll_id group by 1) d;
 -- Open answers have explicit publication consent in the form; never expose voter IDs or exact timestamps.
 select coalesce(jsonb_agg(x.answer),'[]') into texts from (select answer from public.atlas_dev_poll_votes where poll_id=p_poll_id and answer<>'' order by created_at desc limit 100) x;
 return jsonb_build_object('total',total,'bars',bars,'days',days,'texts',texts);
end $$;

create function public.atlas_dev_create_poll(p_title text,p_description text,p_topic text,p_kind text,p_options jsonb,p_closes_at timestamptz) returns uuid language sql security invoker set search_path='' as $$select atlas_dev_poll_api.create_poll(p_title,p_description,p_topic,p_kind,p_options,p_closes_at)$$;
create function public.atlas_dev_vote(p_poll_id uuid,p_choices integer[],p_answer text) returns void language sql security invoker set search_path='' as $$select atlas_dev_poll_api.vote(p_poll_id,p_choices,p_answer)$$;
create function public.atlas_dev_manage_poll(p_poll_id uuid,p_action text) returns void language sql security invoker set search_path='' as $$select atlas_dev_poll_api.manage(p_poll_id,p_action)$$;
create function public.atlas_dev_poll_results(p_poll_id uuid) returns jsonb language sql security invoker set search_path='' as $$select atlas_dev_poll_api.results(p_poll_id)$$;
revoke all on all functions in schema atlas_dev_poll_api from public,anon;
grant execute on all functions in schema atlas_dev_poll_api to authenticated;
revoke all on function public.atlas_dev_create_poll(text,text,text,text,jsonb,timestamptz),public.atlas_dev_vote(uuid,integer[],text),public.atlas_dev_manage_poll(uuid,text),public.atlas_dev_poll_results(uuid) from public,anon;
grant execute on function public.atlas_dev_create_poll(text,text,text,text,jsonb,timestamptz),public.atlas_dev_vote(uuid,integer[],text),public.atlas_dev_manage_poll(uuid,text),public.atlas_dev_poll_results(uuid) to authenticated;

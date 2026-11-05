-- Dev only: reuse the existing Convergencia administrator authority.
create function atlas_dev_poll_api.is_admin() returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false) and public.es_admin_plataforma()$$;
create function public.atlas_dev_poll_admin() returns boolean language sql stable security invoker set search_path='' as $$select atlas_dev_poll_api.is_admin()$$;
revoke all on function atlas_dev_poll_api.is_admin(),public.atlas_dev_poll_admin() from public,anon;
grant execute on function atlas_dev_poll_api.is_admin(),public.atlas_dev_poll_admin() to authenticated;

create function atlas_dev_poll_api.question_key(t text) returns text language sql immutable set search_path='' as $$select regexp_replace(translate(lower(btrim(t)),'áéíóúüñ','aeiouun'),'[^a-z0-9]','','g')$$;
revoke all on function atlas_dev_poll_api.question_key(text) from public,anon,authenticated;
create table public.atlas_dev_question_proposals(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 8 and 240),context text not null default '' check(char_length(context)<=1500),
 topic text not null check(topic in ('Política','Economía','Seguridad','Salud','Deportes','Vida cotidiana','Otros')),
 normalized_title text not null unique,
 status text not null default 'pending' check(status in ('pending','published','dismissed')),
 poll_id uuid references public.atlas_dev_polls(id),created_at timestamptz not null default now()
);
create index atlas_dev_question_proposals_owner_idx on public.atlas_dev_question_proposals(owner_id);
create index atlas_dev_question_proposals_poll_idx on public.atlas_dev_question_proposals(poll_id);
alter table public.atlas_dev_question_proposals enable row level security;
revoke all on public.atlas_dev_question_proposals from anon,authenticated;
grant select on public.atlas_dev_question_proposals to authenticated;
create policy atlas_proposals_read on public.atlas_dev_question_proposals for select to authenticated using(true);

create function atlas_dev_poll_api.propose(p_title text,p_context text,p_topic text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); k text; result uuid;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Ingresa con Convergencia para proponer una pregunta';end if;
 k:=atlas_dev_poll_api.question_key(p_title);
 if k is null or char_length(k)<4 then raise exception 'Escribe una pregunta válida';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,12));
 if (select count(*) from public.atlas_dev_question_proposals where owner_id=uid and created_at>now()-interval '1 day')>=20 then raise exception 'Puedes proponer hasta 20 preguntas por día';end if;
 if exists(select 1 from public.atlas_dev_polls p cross join lateral jsonb_array_elements(coalesce(p.questions,jsonb_build_array(jsonb_build_object('title',p.title)))) q where not p.archived and atlas_dev_poll_api.question_key(q->>'title')=k) then raise exception 'Esta pregunta ya está incluida en una encuesta. Consulta las encuestas disponibles';end if;
 insert into public.atlas_dev_question_proposals(owner_id,title,context,topic,normalized_title) values(uid,btrim(p_title),btrim(coalesce(p_context,'')),p_topic,k) returning id into result;
 return result;
exception when unique_violation then raise exception 'Esta pregunta ya fue propuesta. Búscala en Preguntas propuestas';
end $$;
create function atlas_dev_poll_api.review_proposal(p_id uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not atlas_dev_poll_api.is_admin() then raise exception 'Solo el administrador puede revisar propuestas';end if;
 if p_action is null or p_action not in ('dismiss','reopen') then raise exception 'Acción inválida';end if;
 update public.atlas_dev_question_proposals set status=case when p_action='dismiss' then 'dismissed' else 'pending' end where id=p_id and status<>'published';
 if not found then raise exception 'La propuesta no está disponible para revisión';end if;
end $$;
create function atlas_dev_poll_api.publish_reviewed(p_title text,p_description text,p_topic text,p_questions jsonb,p_closes_at timestamptz,p_proposal_ids uuid[]) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; n int;
begin
 if not atlas_dev_poll_api.is_admin() then raise exception 'Solo el administrador puede publicar encuestas';end if;
 p_proposal_ids:=coalesce(p_proposal_ids,'{}');n:=cardinality(p_proposal_ids);
 if n>20 or (select count(distinct x) from unnest(p_proposal_ids) x)<>n then raise exception 'Selección de propuestas inválida';end if;
 perform id from public.atlas_dev_question_proposals where id=any(p_proposal_ids) order by id for update;
 if (select count(*) from public.atlas_dev_question_proposals where id=any(p_proposal_ids) and status='pending')<>n then raise exception 'Una propuesta ya fue revisada. Actualiza el banco de preguntas';end if;
 if jsonb_array_length(p_questions)<n then raise exception 'Cada propuesta necesita una pregunta en la encuesta';end if;
 if (select count(distinct atlas_dev_poll_api.question_key(q->>'title')) from jsonb_array_elements(p_questions) q)<>jsonb_array_length(p_questions) then raise exception 'La encuesta contiene preguntas repetidas';end if;
 result:=atlas_dev_poll_api.create_survey(p_title,p_description,p_topic,p_questions,p_closes_at);
 update public.atlas_dev_question_proposals set status='published',poll_id=result where id=any(p_proposal_ids);
 return result;
end $$;
create function public.atlas_dev_propose_question(p_title text,p_context text,p_topic text) returns uuid language sql security invoker set search_path='' as $$select atlas_dev_poll_api.propose(p_title,p_context,p_topic)$$;
create function public.atlas_dev_review_proposal(p_id uuid,p_action text) returns void language sql security invoker set search_path='' as $$select atlas_dev_poll_api.review_proposal(p_id,p_action)$$;
create function public.atlas_dev_publish_reviewed_survey(p_title text,p_description text,p_topic text,p_questions jsonb,p_closes_at timestamptz,p_proposal_ids uuid[]) returns uuid language sql security invoker set search_path='' as $$select atlas_dev_poll_api.publish_reviewed(p_title,p_description,p_topic,p_questions,p_closes_at,p_proposal_ids)$$;
revoke all on function atlas_dev_poll_api.propose(text,text,text),atlas_dev_poll_api.review_proposal(uuid,text),atlas_dev_poll_api.publish_reviewed(text,text,text,jsonb,timestamptz,uuid[]),public.atlas_dev_propose_question(text,text,text),public.atlas_dev_review_proposal(uuid,text),public.atlas_dev_publish_reviewed_survey(text,text,text,jsonb,timestamptz,uuid[]) from public,anon;
grant execute on function atlas_dev_poll_api.propose(text,text,text),atlas_dev_poll_api.review_proposal(uuid,text),atlas_dev_poll_api.publish_reviewed(text,text,text,jsonb,timestamptz,uuid[]),public.atlas_dev_propose_question(text,text,text),public.atlas_dev_review_proposal(uuid,text),public.atlas_dev_publish_reviewed_survey(text,text,text,jsonb,timestamptz,uuid[]) to authenticated;

-- Guard the shared creation primitive, including legacy RPCs and private entrypoints.
create or replace function atlas_dev_poll_api.create_poll(p_title text,p_description text,p_topic text,p_kind text,p_options jsonb,p_closes_at timestamptz) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result uuid; n int;
begin
 if not atlas_dev_poll_api.is_admin() then raise exception 'Solo el administrador puede publicar encuestas'; end if;
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
create or replace function atlas_dev_poll_api.manage(p_poll_id uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not atlas_dev_poll_api.is_admin() then raise exception 'Solo el administrador puede administrar encuestas'; end if;
 if p_action not in ('close','archive','restore') or p_action is null then raise exception 'Acción inválida'; end if;
 update public.atlas_dev_polls set closed=case when p_action='close' then true else closed end,archived=case when p_action='archive' then true when p_action='restore' then false else archived end where id=p_poll_id;
 if not found then raise exception 'Encuesta no disponible'; end if;
end $$;

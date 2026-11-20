-- Atlas dev: fixed-question survey series with one ballot per account per Chilean week.
alter table public.atlas_dev_polls
  add column weekly boolean not null default false;
alter table public.atlas_dev_polls alter column closes_at drop not null;

alter table public.atlas_dev_poll_votes add column week_start date;
alter table public.atlas_dev_poll_votes drop constraint atlas_dev_poll_votes_pkey;
create unique index atlas_dev_poll_votes_once_idx
  on public.atlas_dev_poll_votes(poll_id,user_id) where week_start is null;
create unique index atlas_dev_poll_votes_weekly_idx
  on public.atlas_dev_poll_votes(poll_id,user_id,week_start) where week_start is not null;
create index atlas_dev_poll_votes_week_idx
  on public.atlas_dev_poll_votes(poll_id,week_start) where week_start is not null;

create or replace function atlas_dev_poll_api.vote_survey(p_poll_id uuid,p_answers jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.atlas_dev_polls; qs jsonb; q jsonb; a jsonb; answer text; choices integer[]; normalized jsonb:='[]'; i int; n int; current_week date;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Ingresa con Convergencia'; end if;
 select * into p from public.atlas_dev_polls where id=p_poll_id for share;
 if not found or p.closed or p.archived or (not p.weekly and p.closes_at<=now()) then raise exception 'Esta encuesta está cerrada'; end if;
 if p.weekly then current_week:=date_trunc('week',timezone('America/Santiago',now()))::date; end if;
 qs:=coalesce(p.questions,jsonb_build_array(jsonb_build_object('title',p.title,'kind',p.kind,'options',p.options)));
 if p_answers is null or jsonb_typeof(p_answers)<>'array' then raise exception 'Responde todas las preguntas'; end if;
 if jsonb_array_length(p_answers)<>jsonb_array_length(qs) then raise exception 'Responde todas las preguntas'; end if;
 for i in 0..jsonb_array_length(qs)-1 loop
  q:=qs->i;a:=p_answers->i;
  if jsonb_typeof(a) is distinct from 'object' or jsonb_typeof(a->'choices') is distinct from 'array' or jsonb_typeof(a->'answer') is distinct from 'string' then raise exception 'Respuesta inválida en pregunta %',i+1; end if;
  if exists(select 1 from jsonb_array_elements(a->'choices') x where jsonb_typeof(x)<>'number' or (x#>>'{}')!~'^[0-7]$') then raise exception 'Opciones inválidas en pregunta %',i+1; end if;
  select coalesce(array_agg(value::int),'{}') into choices from jsonb_array_elements_text(a->'choices');
  answer:=btrim(a->>'answer');n:=cardinality(choices);
  if q->>'kind'='text' then
   if n<>0 or char_length(answer) not between 2 and 1000 then raise exception 'Pregunta %: escribe entre 2 y 1000 caracteres',i+1; end if;
  else
   if answer<>'' or n<1 or n>jsonb_array_length(q->'options') or (q->>'kind'<>'multiple' and n<>1) or exists(select 1 from unnest(choices) x where x>=jsonb_array_length(q->'options')) or (select count(distinct x) from unnest(choices) x)<>n then raise exception 'Selecciona opciones válidas en pregunta %',i+1; end if;
  end if;
  normalized:=normalized||jsonb_build_array(jsonb_build_object('choices',choices,'answer',answer));
 end loop;
 insert into public.atlas_dev_poll_votes(poll_id,user_id,choices,answer,answers,week_start)
 values(p_poll_id,uid,array(select value::int from jsonb_array_elements_text(normalized->0->'choices')),normalized->0->>'answer',normalized,current_week);
exception when unique_violation then
 if p.weekly then raise exception 'Ya respondiste esta medición durante esta semana';
 else raise exception 'Ya respondiste esta encuesta'; end if;
end $$;

-- Keep legacy clients from bypassing per-week uniqueness on single-question series.
create or replace function atlas_dev_poll_api.vote(p_poll_id uuid,p_choices integer[],p_answer text)
returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.atlas_dev_polls; n int; current_week date;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Ingresa con tu cuenta de Convergencia'; end if;
 select * into p from public.atlas_dev_polls where id=p_poll_id for share;
 if not found or p.closed or p.archived or (not p.weekly and p.closes_at<=now()) then raise exception 'Esta encuesta está cerrada'; end if;
 if jsonb_array_length(p.questions)>1 then raise exception 'Actualiza la página para responder todas las preguntas'; end if;
 if p.weekly then current_week:=date_trunc('week',timezone('America/Santiago',now()))::date; end if;
 p_choices:=coalesce(p_choices,'{}');p_answer:=btrim(coalesce(p_answer,''));n:=cardinality(p_choices);
 if p.kind='text' then
  if n<>0 or char_length(p_answer) not between 2 and 1000 then raise exception 'Escribe entre 2 y 1000 caracteres'; end if;
 else
  if p_answer<>'' or n<1 or n>jsonb_array_length(p.options) or (p.kind<>'multiple' and n<>1) or exists(select 1 from unnest(p_choices) x where x is null or x<0 or x>=jsonb_array_length(p.options)) or (select count(distinct x) from unnest(p_choices) x)<>n then raise exception 'Selecciona opciones válidas'; end if;
 end if;
 insert into public.atlas_dev_poll_votes(poll_id,user_id,choices,answer,week_start) values(p_poll_id,uid,p_choices,p_answer,current_week);
exception when unique_violation then
 if p.weekly then raise exception 'Ya respondiste esta medición durante esta semana';
 else raise exception 'Ya respondiste esta encuesta'; end if;
end $$;

create or replace function atlas_dev_poll_api.survey_results(p_poll_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p public.atlas_dev_polls; qs jsonb; q jsonb; total bigint; bars jsonb; texts jsonb; days jsonb; weeks jsonb:='[]'; results jsonb:='[]'; i int;
begin
 if auth.uid() is null then raise exception 'Ingresa con Convergencia para ver los resultados'; end if;
 select * into p from public.atlas_dev_polls where id=p_poll_id and (not archived or owner_id=auth.uid());
 if not found then raise exception 'Encuesta no disponible'; end if;
 qs:=coalesce(p.questions,jsonb_build_array(jsonb_build_object('title',p.title,'kind',p.kind,'options',p.options)));
 select count(*) into total from public.atlas_dev_poll_votes where poll_id=p_poll_id;
 for i in 0..jsonb_array_length(qs)-1 loop
  q:=qs->i;
  select coalesce(jsonb_agg(jsonb_build_object('label',o.label,'count',(select count(*) from public.atlas_dev_poll_votes v where v.poll_id=p_poll_id and coalesce(v.answers,jsonb_build_array(jsonb_build_object('choices',v.choices,'answer',v.answer)))->i->'choices' @> to_jsonb(array[(o.ord-1)::int]))) order by o.ord),'[]') into bars from jsonb_array_elements_text(q->'options') with ordinality o(label,ord);
  select coalesce(jsonb_agg(x.answer),'[]') into texts from (select coalesce(v.answers,jsonb_build_array(jsonb_build_object('choices',v.choices,'answer',v.answer)))->i->>'answer' as answer from public.atlas_dev_poll_votes v where poll_id=p_poll_id order by created_at desc limit 100) x where x.answer<>'';
  results:=results||jsonb_build_array(jsonb_build_object('title',q->>'title','kind',q->>'kind','total',total,'bars',bars,'texts',texts));
 end loop;
 select coalesce(jsonb_agg(jsonb_build_object('date',d.vote_day,'count',d.n) order by d.vote_day),'[]') into days from (select (created_at at time zone 'America/Santiago')::date as vote_day,count(*) n from public.atlas_dev_poll_votes where poll_id=p_poll_id group by 1) d;
 if p.weekly then
  select coalesce(jsonb_agg(jsonb_build_object('week_start',s.week_start,'count',coalesce(v.n,0)) order by s.week_start),'[]') into weeks
  from generate_series(date_trunc('week',p.created_at at time zone 'America/Santiago')::date,date_trunc('week',now() at time zone 'America/Santiago')::date,interval '7 days') s(week_start)
  left join (select week_start,count(*) n from public.atlas_dev_poll_votes where poll_id=p_poll_id and week_start is not null group by week_start) v on v.week_start=s.week_start::date;
 end if;
 return jsonb_build_object('total',total,'questions',results,'days',days,'weekly',p.weekly,'weeks',weeks);
end $$;

-- The existing publication path enforces administrator status and proposal de-duplication.
-- Publish and mark weekly in one transaction so no ordinary one-off survey is exposed in between.
create function atlas_dev_poll_api.publish_reviewed_weekly(p_title text,p_description text,p_topic text,p_questions jsonb,p_proposal_ids uuid[])
returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not atlas_dev_poll_api.is_admin() then raise exception 'Solo el administrador puede publicar encuestas'; end if;
 result:=atlas_dev_poll_api.publish_reviewed(p_title,p_description,p_topic,p_questions,now()+interval '365 days',p_proposal_ids);
 update public.atlas_dev_polls set weekly=true,closes_at=null where id=result;
 return result;
end $$;
create function public.atlas_dev_publish_reviewed_weekly_survey(p_title text,p_description text,p_topic text,p_questions jsonb,p_proposal_ids uuid[])
returns uuid language sql security invoker set search_path='' as $$select atlas_dev_poll_api.publish_reviewed_weekly(p_title,p_description,p_topic,p_questions,p_proposal_ids)$$;
revoke all on function atlas_dev_poll_api.publish_reviewed_weekly(text,text,text,jsonb,uuid[]),public.atlas_dev_publish_reviewed_weekly_survey(text,text,text,jsonb,uuid[]) from public,anon;
grant execute on function atlas_dev_poll_api.publish_reviewed_weekly(text,text,text,jsonb,uuid[]),public.atlas_dev_publish_reviewed_weekly_survey(text,text,text,jsonb,uuid[]) to authenticated;

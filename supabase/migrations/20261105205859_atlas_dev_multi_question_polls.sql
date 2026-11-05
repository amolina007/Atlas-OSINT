-- Additive upgrade: old definitions and ballots remain readable and callable.
alter table public.atlas_dev_polls add column questions jsonb check (questions is null or (jsonb_typeof(questions)='array' and jsonb_array_length(questions) between 1 and 20));
alter table public.atlas_dev_poll_votes add column answers jsonb check (answers is null or (jsonb_typeof(answers)='array' and jsonb_array_length(answers) between 1 and 20));
update public.atlas_dev_polls set questions=jsonb_build_array(jsonb_build_object('title',title,'kind',kind,'options',options));
update public.atlas_dev_poll_votes set answers=jsonb_build_array(jsonb_build_object('choices',choices,'answer',answer));

create function atlas_dev_poll_api.create_survey(p_title text,p_description text,p_topic text,p_questions jsonb,p_closes_at timestamptz) returns uuid language plpgsql security definer set search_path='' as $$
declare q jsonb; opts jsonb; qs jsonb:='[]'; k text; t text; n int; result uuid;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Ingresa con Convergencia'; end if;
 if p_questions is null or jsonb_typeof(p_questions)<>'array' then raise exception 'Incluye entre 1 y 20 preguntas'; end if;
 if jsonb_array_length(p_questions) not between 1 and 20 then raise exception 'Incluye entre 1 y 20 preguntas'; end if;
 for q in select value from jsonb_array_elements(p_questions) loop
  k:=q->>'kind';t:=btrim(q->>'title');opts:=q->'options';
  if jsonb_typeof(q)<>'object' or jsonb_typeof(q->'title') is distinct from 'string' or char_length(t) not between 8 and 240 or k is null or k not in ('single','multiple','scale','text') then raise exception 'Cada pregunta necesita un texto de 8 a 240 caracteres y un formato válido'; end if;
  if k='scale' then opts:='["1 · Muy bajo","2 · Bajo","3 · Intermedio","4 · Alto","5 · Muy alto"]'; end if;
  if k='text' then opts:='[]'; end if;
  if opts is null or jsonb_typeof(opts)<>'array' then raise exception 'Opciones inválidas'; end if;
  n:=jsonb_array_length(opts);
  if k in ('single','multiple') and n not between 2 and 8 then raise exception 'Incluye entre 2 y 8 opciones por pregunta'; end if;
  if exists(select 1 from jsonb_array_elements(opts) x where jsonb_typeof(x)<>'string' or char_length(btrim(x#>>'{}')) not between 1 and 120) or (select count(distinct lower(btrim(x))) from jsonb_array_elements_text(opts) x)<>n then raise exception 'Las opciones deben ser distintas y tener hasta 120 caracteres'; end if;
  select coalesce(jsonb_agg(btrim(value) order by ord),'[]') into opts from jsonb_array_elements_text(opts) with ordinality a(value,ord);
  qs:=qs||jsonb_build_array(jsonb_build_object('title',t,'kind',k,'options',opts));
 end loop;
 -- Reuse account checks, rate limit, metadata validation and deadline validation.
 result:=atlas_dev_poll_api.create_poll(p_title,p_description,p_topic,qs->0->>'kind',qs->0->'options',p_closes_at);
 update public.atlas_dev_polls set questions=qs where id=result;
 return result;
end $$;

create function atlas_dev_poll_api.vote_survey(p_poll_id uuid,p_answers jsonb) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.atlas_dev_polls; qs jsonb; q jsonb; a jsonb; answer text; choices integer[]; normalized jsonb:='[]'; i int; n int;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Ingresa con Convergencia'; end if;
 select * into p from public.atlas_dev_polls where id=p_poll_id for share;
 if not found or p.closed or p.archived or p.closes_at<=now() then raise exception 'Esta encuesta está cerrada'; end if;
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
 insert into public.atlas_dev_poll_votes(poll_id,user_id,choices,answer,answers)
 values(p_poll_id,uid,array(select value::int from jsonb_array_elements_text(normalized->0->'choices')),normalized->0->>'answer',normalized);
exception when unique_violation then raise exception 'Ya respondiste esta encuesta';
end $$;

create function atlas_dev_poll_api.survey_results(p_poll_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p public.atlas_dev_polls; qs jsonb; q jsonb; total bigint; bars jsonb; texts jsonb; days jsonb; results jsonb:='[]'; i int;
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
 return jsonb_build_object('total',total,'questions',results,'days',days);
end $$;

create function public.atlas_dev_create_survey(p_title text,p_description text,p_topic text,p_questions jsonb,p_closes_at timestamptz) returns uuid language sql security invoker set search_path='' as $$select atlas_dev_poll_api.create_survey(p_title,p_description,p_topic,p_questions,p_closes_at)$$;
create function public.atlas_dev_vote_survey(p_poll_id uuid,p_answers jsonb) returns void language sql security invoker set search_path='' as $$select atlas_dev_poll_api.vote_survey(p_poll_id,p_answers)$$;
create function public.atlas_dev_survey_results(p_poll_id uuid) returns jsonb language sql security invoker set search_path='' as $$select atlas_dev_poll_api.survey_results(p_poll_id)$$;
revoke all on function atlas_dev_poll_api.create_survey(text,text,text,jsonb,timestamptz),atlas_dev_poll_api.vote_survey(uuid,jsonb),atlas_dev_poll_api.survey_results(uuid),public.atlas_dev_create_survey(text,text,text,jsonb,timestamptz),public.atlas_dev_vote_survey(uuid,jsonb),public.atlas_dev_survey_results(uuid) from public,anon;
grant execute on function atlas_dev_poll_api.create_survey(text,text,text,jsonb,timestamptz),atlas_dev_poll_api.vote_survey(uuid,jsonb),atlas_dev_poll_api.survey_results(uuid),public.atlas_dev_create_survey(text,text,text,jsonb,timestamptz),public.atlas_dev_vote_survey(uuid,jsonb),public.atlas_dev_survey_results(uuid) to authenticated;

-- Old clients cannot submit a partial ballot for a new survey.
create or replace function atlas_dev_poll_api.vote(p_poll_id uuid,p_choices integer[],p_answer text) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); p public.atlas_dev_polls; n int;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Ingresa con tu cuenta de Convergencia'; end if;
 select * into p from public.atlas_dev_polls where id=p_poll_id for share;
 if not found or p.closed or p.archived or p.closes_at<=now() then raise exception 'Esta encuesta está cerrada'; end if;
 if jsonb_array_length(p.questions)>1 then raise exception 'Actualiza la página para responder todas las preguntas'; end if;
 p_choices:=coalesce(p_choices,'{}');p_answer:=btrim(coalesce(p_answer,''));n:=cardinality(p_choices);
 if p.kind='text' then
  if n<>0 or char_length(p_answer) not between 2 and 1000 then raise exception 'Escribe entre 2 y 1000 caracteres'; end if;
 else
  if p_answer<>'' or n<1 or n>jsonb_array_length(p.options) or (p.kind<>'multiple' and n<>1) or exists(select 1 from unnest(p_choices) x where x is null or x<0 or x>=jsonb_array_length(p.options)) or (select count(distinct x) from unnest(p_choices) x)<>n then raise exception 'Selecciona opciones válidas'; end if;
 end if;
 insert into public.atlas_dev_poll_votes(poll_id,user_id,choices,answer) values(p_poll_id,uid,p_choices,p_answer);
exception when unique_violation then raise exception 'Ya respondiste esta encuesta';
end $$;

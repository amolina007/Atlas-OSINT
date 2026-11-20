-- Fixes weekly survey ballot insertion by using the RPC parameter.
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

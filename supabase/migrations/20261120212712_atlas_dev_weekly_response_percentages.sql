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
  select coalesce(jsonb_agg(jsonb_build_object('week_start',s.week_start,'count',coalesce(v.n,0),'questions',(select jsonb_agg(jsonb_build_object('title',qq.q->>'title','kind',qq.q->>'kind','bars',(select coalesce(jsonb_agg(jsonb_build_object('label',o.label,'count',(select count(*) from public.atlas_dev_poll_votes bv where bv.poll_id=p_poll_id and bv.week_start=s.week_start::date and coalesce(bv.answers,jsonb_build_array(jsonb_build_object('choices',bv.choices,'answer',bv.answer)))->(qq.ord-1)::int->'choices' @> to_jsonb(array[(o.ord-1)::int]))) order by o.ord),'[]') from jsonb_array_elements_text(qq.q->'options') with ordinality o(label,ord))) order by qq.ord) from jsonb_array_elements(qs) with ordinality qq(q,ord))) order by s.week_start),'[]') into weeks
  from generate_series(date_trunc('week',p.created_at at time zone 'America/Santiago')::date,date_trunc('week',now() at time zone 'America/Santiago')::date,interval '7 days') s(week_start)
  left join (select week_start,count(*) n from public.atlas_dev_poll_votes where poll_id=p_poll_id and week_start is not null group by week_start) v on v.week_start=s.week_start::date;
 end if;
 return jsonb_build_object('total',total,'questions',results,'days',days,'weekly',p.weekly,'weeks',weeks);
end $$;



-- Community reshares of public Atlas news. Only authenticated Convergencia users can publish.
create table public.atlas_dev_news_shares (
 id uuid primary key default gen_random_uuid(),
 article_id text not null check(article_id ~ '^[a-f0-9]{64}$'),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 author_name text not null default 'Miembro de Convergencia',
 body text not null default '' check(char_length(body)<=600),
 created_at timestamptz not null default now()
);

create index atlas_dev_news_shares_created_idx on public.atlas_dev_news_shares(created_at desc);
create index atlas_dev_news_shares_article_idx on public.atlas_dev_news_shares(article_id,created_at desc);
alter table public.atlas_dev_news_shares enable row level security;

create policy read_atlas_dev_news_shares on public.atlas_dev_news_shares
 for select to anon,authenticated using(true);
create policy publish_own_atlas_dev_news_share on public.atlas_dev_news_shares
 for insert to authenticated
 with check((select auth.uid())=user_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');

revoke all on public.atlas_dev_news_shares from anon,authenticated;
grant select on public.atlas_dev_news_shares to anon,authenticated;
grant insert(article_id,user_id,body) on public.atlas_dev_news_shares to authenticated;

create function public.atlas_dev_news_share_guard() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or new.user_id<>auth.uid() or coalesce(auth.jwt()->>'is_anonymous','false')='true' then
  raise exception 'Sesión de Convergencia requerida';
 end if;
 new.body:=btrim(coalesce(new.body,''));
 if char_length(new.body)>600 then raise exception 'El comentario supera los 600 caracteres'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,8193));
 if (select count(*) from public.atlas_dev_news_shares where user_id=auth.uid() and created_at>now()-interval '1 minute')>=4 then
  raise exception 'Espera un minuto antes de volver a compartir';
 end if;
 new.author_name:=left(coalesce(nullif(auth.jwt()->'user_metadata'->>'full_name',''),nullif(auth.jwt()->'user_metadata'->>'name',''),'Miembro de Convergencia'),80);
 return new;
end $$;

revoke all on function public.atlas_dev_news_share_guard() from public;
create trigger atlas_dev_news_share_guard before insert on public.atlas_dev_news_shares
 for each row execute function public.atlas_dev_news_share_guard();

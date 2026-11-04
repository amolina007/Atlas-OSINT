-- Development-only participation. Existing Core Auth identities are reused.
create table public.atlas_dev_news_likes (
 article_id text not null check(article_id ~ '^[a-f0-9]{64}$'),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(article_id,user_id)
);
create index atlas_dev_news_likes_user_idx on public.atlas_dev_news_likes(user_id);
create table public.atlas_dev_news_comments (
 id uuid primary key default gen_random_uuid(),
 article_id text not null check(article_id ~ '^[a-f0-9]{64}$'),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 body text not null check(char_length(btrim(body)) between 1 and 1500),
 created_at timestamptz not null default now()
);
create index atlas_dev_news_comments_article_idx on public.atlas_dev_news_comments(article_id,created_at);
create index atlas_dev_news_comments_user_idx on public.atlas_dev_news_comments(user_id);
alter table public.atlas_dev_news_likes enable row level security;
alter table public.atlas_dev_news_comments enable row level security;
-- Public reactions and comments; identities are UUIDs, never email addresses.
create policy read_likes on public.atlas_dev_news_likes for select to anon,authenticated using(true);
create policy own_like on public.atlas_dev_news_likes for insert to authenticated with check((select auth.uid())=user_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
create policy remove_own_like on public.atlas_dev_news_likes for delete to authenticated using((select auth.uid())=user_id);
create policy read_comments on public.atlas_dev_news_comments for select to anon,authenticated using(true);
create policy own_comment on public.atlas_dev_news_comments for insert to authenticated with check((select auth.uid())=user_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false');
create policy remove_own_comment on public.atlas_dev_news_comments for delete to authenticated using((select auth.uid())=user_id);
revoke all on public.atlas_dev_news_likes,public.atlas_dev_news_comments from anon,authenticated;
grant select on public.atlas_dev_news_likes,public.atlas_dev_news_comments to anon,authenticated;
grant insert(article_id,user_id),delete on public.atlas_dev_news_likes to authenticated;
grant insert(article_id,user_id,body),delete on public.atlas_dev_news_comments to authenticated;
-- Aggregation avoids client-side row limits; reads obey the same RLS policies.
create function public.atlas_dev_news_counts(article_ids text[]) returns table(article_id text,likes bigint,comments bigint)
language sql stable security invoker set search_path='' as $$
 select a.id,(select count(*) from public.atlas_dev_news_likes l where l.article_id=a.id),
 (select count(*) from public.atlas_dev_news_comments c where c.article_id=a.id)
 from (select distinct unnest(article_ids[1:200]) id) a;
$$;
revoke all on function public.atlas_dev_news_counts(text[]) from public;
grant execute on function public.atlas_dev_news_counts(text[]) to anon,authenticated;
alter table public.atlas_dev_news_comments add column author_name text not null default 'Miembro de Convergencia';
create function public.atlas_dev_news_comment_guard() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or new.user_id <> auth.uid() then raise exception 'Sesión requerida'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,8127));
 if (select count(*) from public.atlas_dev_news_comments where user_id=auth.uid() and created_at>now()-interval '1 minute')>=5 then raise exception 'Espera un minuto antes de volver a comentar'; end if;
 new.author_name := left(coalesce(nullif(auth.jwt()->'user_metadata'->>'full_name',''),nullif(auth.jwt()->'user_metadata'->>'name',''),'Miembro de Convergencia'),80);
 new.body:=btrim(new.body);
 return new;
end $$;
revoke all on function public.atlas_dev_news_comment_guard() from public;
create trigger atlas_dev_news_comment_guard before insert on public.atlas_dev_news_comments for each row execute function public.atlas_dev_news_comment_guard();

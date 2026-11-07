-- Atlas dev only. Direct publication by signed-in, non-anonymous Convergencia members.
create table public.atlas_dev_letters (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 signature text not null check(char_length(btrim(signature)) between 2 and 80),
 title text not null check(char_length(btrim(title)) between 8 and 180),
 body text not null check(char_length(btrim(body)) between 80 and 8000),
 created_at timestamptz not null default now()
);
alter table public.atlas_dev_letters enable row level security;
revoke all on public.atlas_dev_letters from anon,authenticated;
grant select on public.atlas_dev_letters to anon,authenticated;
grant insert(signature,title,body) on public.atlas_dev_letters to authenticated;
grant delete on public.atlas_dev_letters to authenticated;
create policy letters_read on public.atlas_dev_letters for select using(true);
create policy letters_publish on public.atlas_dev_letters for insert to authenticated with check(owner_id=auth.uid() and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false));
create policy letters_remove on public.atlas_dev_letters for delete to authenticated using(owner_id=auth.uid() or public.atlas_dev_poll_admin());
create index atlas_dev_letters_created_idx on public.atlas_dev_letters(created_at desc);
create index atlas_dev_letters_owner_idx on public.atlas_dev_letters(owner_id);

create table public.atlas_dev_war_reviews (
 report_id text primary key check(report_id ~ '^[a-f0-9]{64}$'),
 event_date date not null check(event_date<=current_date),
 evidence_one text not null check(evidence_one ~ '^https://[^/[:space:]]+/[^[:space:]]+'),
 evidence_two text not null check(evidence_two ~ '^https://[^/[:space:]]+/[^[:space:]]+'),
 note text not null check(char_length(btrim(note)) between 40 and 2000),
 reviewed_at timestamptz not null default now(),
 check(lower(split_part(evidence_one,'/',3))<>lower(split_part(evidence_two,'/',3)))
);
alter table public.atlas_dev_war_reviews enable row level security;
revoke all on public.atlas_dev_war_reviews from anon,authenticated;
grant select on public.atlas_dev_war_reviews to anon,authenticated;
grant insert(report_id,event_date,evidence_one,evidence_two,note),delete on public.atlas_dev_war_reviews to authenticated;
create policy war_reviews_read on public.atlas_dev_war_reviews for select using(true);
create policy war_reviews_insert on public.atlas_dev_war_reviews for insert to authenticated with check(public.atlas_dev_poll_admin());
create policy war_reviews_delete on public.atlas_dev_war_reviews for delete to authenticated using(public.atlas_dev_poll_admin());

-- Keep a stable row identity while partial unique indexes enforce one response
-- per account for ordinary surveys and one response per account-week for series.
alter table public.atlas_dev_poll_votes
  add column id bigint generated always as identity;
alter table public.atlas_dev_poll_votes
  add constraint atlas_dev_poll_votes_pkey primary key (id);

-- Initial schema for i-love-physics
-- Tables: profiles, collections, collection_items, topic_progress,
-- content_proposals, votes. Enables RLS with owner-scoped policies
-- and seeds ten content proposals.

create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key
    constraint profiles_id_fkey references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid (),
  owner_id uuid not null
    constraint collections_owner_id_fkey references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  is_public boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_items (
  id uuid primary key default gen_random_uuid (),
  collection_id uuid not null
    constraint collection_items_collection_id_fkey references public.collections (id) on delete cascade,
  topic_slug text not null,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  constraint collection_items_collection_id_topic_slug_key unique (collection_id, topic_slug)
);

create table public.topic_progress (
  user_id uuid not null
    constraint topic_progress_user_id_fkey references public.profiles (id) on delete cascade,
  topic_slug text not null,
  status text not null
    constraint topic_progress_status_check check (status in ('want', 'learning', 'learned')),
  updated_at timestamptz not null default now(),
  constraint topic_progress_pkey primary key (user_id, topic_slug)
);

create table public.content_proposals (
  id uuid primary key default gen_random_uuid (),
  title text not null,
  summary text not null,
  domain text not null,
  proposed_by uuid
    constraint content_proposals_proposed_by_fkey references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.votes (
  proposal_id uuid not null
    constraint votes_proposal_id_fkey references public.content_proposals (id) on delete cascade,
  user_id uuid not null
    constraint votes_user_id_fkey references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint votes_proposal_id_user_id_key unique (proposal_id, user_id)
);

create index idx_collections_owner_id on public.collections (owner_id);
create index idx_collection_items_collection_id on public.collection_items (collection_id);
create index idx_topic_progress_user_id on public.topic_progress (user_id);
create index idx_votes_proposal_id on public.votes (proposal_id);

create function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger collections_set_updated_at
before update on public.collections
for each row
execute function public.set_updated_at ();

create trigger topic_progress_set_updated_at
before update on public.topic_progress
for each row
execute function public.set_updated_at ();

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.topic_progress enable row level security;
alter table public.content_proposals enable row level security;
alter table public.votes enable row level security;

-- profiles: select / insert / update own rows only
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- collections: full ownership, public read
create policy "collections_select_public_or_own"
  on public.collections for select
  using (is_public or owner_id = auth.uid());

create policy "collections_insert_own"
  on public.collections for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "collections_update_own"
  on public.collections for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "collections_delete_own"
  on public.collections for delete
  to authenticated
  using (owner_id = auth.uid());

-- collection_items: access gated by parent collection
create policy "collection_items_select_via_parent"
  on public.collection_items for select
  using (
    exists (
      select 1
      from public.collections c
      where c.id = collection_id
        and (c.is_public or c.owner_id = auth.uid())
    )
  );

create policy "collection_items_insert_via_parent"
  on public.collection_items for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.collections c
      where c.id = collection_id
        and c.owner_id = auth.uid()
    )
  );

create policy "collection_items_update_via_parent"
  on public.collection_items for update
  to authenticated
  using (
    exists (
      select 1
      from public.collections c
      where c.id = collection_id
        and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.collections c
      where c.id = collection_id
        and c.owner_id = auth.uid()
    )
  );

create policy "collection_items_delete_via_parent"
  on public.collection_items for delete
  to authenticated
  using (
    exists (
      select 1
      from public.collections c
      where c.id = collection_id
        and c.owner_id = auth.uid()
    )
  );

-- topic_progress: fully owned by the user
create policy "topic_progress_select_own"
  on public.topic_progress for select
  to authenticated
  using (user_id = auth.uid());

create policy "topic_progress_insert_own"
  on public.topic_progress for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "topic_progress_update_own"
  on public.topic_progress for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "topic_progress_delete_own"
  on public.topic_progress for delete
  to authenticated
  using (user_id = auth.uid());

-- content_proposals: world-readable, authenticated authors only
create policy "content_proposals_select_all"
  on public.content_proposals for select
  using (true);

create policy "content_proposals_insert_authenticated"
  on public.content_proposals for insert
  to authenticated
  with check (proposed_by = auth.uid());

-- votes: world-readable tally, one vote per user, retractable
create policy "votes_select_all"
  on public.votes for select
  using (true);

create policy "votes_insert_own"
  on public.votes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "votes_delete_own"
  on public.votes for delete
  to authenticated
  using (user_id = auth.uid());

insert into public.content_proposals (id, title, summary, domain, proposed_by)
values
  ('a1000000-0000-4000-8000-000000000001', 'Fluid Dynamics', 'Flow, vortices and the Navier-Stokes horizon', 'classical-mechanics', null),
  ('a1000000-0000-4000-8000-000000000002', 'AC Circuits & Impedance', 'Resistors meet reactance — phasors made visible', 'electromagnetism', null),
  ('a1000000-0000-4000-8000-000000000003', 'Optical Instruments', 'Telescopes, microscopes and the ray diagrams that design them', 'waves-optics', null),
  ('a1000000-0000-4000-8000-000000000004', 'Paradoxes II', 'A second anthology — from Gibbs to EPR', 'quantum', null),
  ('a1000000-0000-4000-8000-000000000005', 'Real Engines', 'Otto, Diesel and why Carnot keeps winning', 'thermo-statistical', null),
  ('a1000000-0000-4000-8000-000000000006', 'Mathematical Methods', 'Fourier series, special functions and the physicist’s toolbox', 'waves-optics', null),
  ('a1000000-0000-4000-8000-000000000007', 'Chaotic Pendulum Gallery', 'Driven damped pendula and their period-doubling cascades', 'chaos-complexity', null),
  ('a1000000-0000-4000-8000-000000000008', 'Fourier Optics', 'Lenses as Fourier transformers', 'waves-optics', null),
  ('a1000000-0000-4000-8000-000000000009', 'Ising Model', 'Emergent magnetism from tiny spinning neighbors', 'thermo-statistical', null),
  ('a1000000-0000-4000-8000-000000000010', 'Navier-Stokes Primer', 'The equation, term by term, before the million dollars', 'classical-mechanics', null);

-- Textbausteine der Praxis: Sätze, Hinweise und Links, die Charles immer
-- wieder braucht und mit einem Griff kopieren will.
create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists snippets_sortierung_idx on public.snippets (position, created_at);

alter table public.snippets enable row level security;

-- Nur das Praxisteam; Patienten haben damit nichts zu tun.
create policy "Bausteine lesen" on public.snippets for select
  using ((select public.is_therapist()));
create policy "Bausteine anlegen" on public.snippets for insert
  with check (author_id = (select auth.uid()) and (select public.is_therapist()));
create policy "Bausteine ändern" on public.snippets for update
  using ((select public.is_therapist())) with check ((select public.is_therapist()));
create policy "Bausteine löschen" on public.snippets for delete
  using ((select public.is_therapist()));

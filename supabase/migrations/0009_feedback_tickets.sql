-- Feedback-Tickets: Charles meldet Wünsche und Fehler direkt aus der App.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  art text not null default 'fehler' check (art in ('fehler', 'wunsch', 'frage')),
  status text not null default 'neu' check (status in ('neu', 'in_arbeit', 'erledigt', 'zurueckgestellt')),
  antwort text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback_attachments (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedback(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  content_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists feedback_author_idx on public.feedback (author_id, created_at desc);
create index if not exists feedback_status_idx on public.feedback (status, created_at desc);
create index if not exists feedback_attachments_feedback_idx on public.feedback_attachments (feedback_id);

alter table public.feedback enable row level security;
alter table public.feedback_attachments enable row level security;

-- Nur das Praxisteam sieht und schreibt Tickets; Patienten haben damit nichts zu tun.
create policy "Tickets lesen" on public.feedback for select
  using ((select public.is_therapist()));
create policy "Tickets anlegen" on public.feedback for insert
  with check (author_id = (select auth.uid()) and (select public.is_therapist()));
create policy "Tickets ändern" on public.feedback for update
  using ((select public.is_therapist())) with check ((select public.is_therapist()));
create policy "Tickets löschen" on public.feedback for delete
  using (author_id = (select auth.uid()) and (select public.is_therapist()));

create policy "Anhänge lesen" on public.feedback_attachments for select
  using ((select public.is_therapist()));
create policy "Anhänge anlegen" on public.feedback_attachments for insert
  with check ((select public.is_therapist()));
create policy "Anhänge löschen" on public.feedback_attachments for delete
  using ((select public.is_therapist()));

-- Privater Speicher für Screenshots
insert into storage.buckets (id, name, public)
values ('feedback-media', 'feedback-media', false)
on conflict (id) do nothing;

create policy "Screenshots lesen" on storage.objects for select
  using (bucket_id = 'feedback-media' and (select public.is_therapist()));
create policy "Screenshots hochladen" on storage.objects for insert
  with check (bucket_id = 'feedback-media' and (select public.is_therapist()));
create policy "Screenshots löschen" on storage.objects for delete
  using (bucket_id = 'feedback-media' and (select public.is_therapist()));

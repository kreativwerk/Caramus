-- Curamus Medical Patienten-App – Kernschema
-- Angewendet auf Supabase-Projekt jiixpoyxctohzagldcel (eu-central-1) am 2026-08-19
-- via MCP-Migration "curamus_core_schema". Diese Datei dient als Referenz/Backup.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'patient' check (role in ('therapist','patient')),
  full_name text not null default '',
  phone text, street text, zip text, city text,
  birth_date date, notes text,
  created_at timestamptz not null default now()
);

create table public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  preferred_times text not null,
  message text,
  status text not null default 'pending' check (status in ('pending','confirmed','declined','proposed')),
  proposal text,
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  duration_min int not null default 60,
  address text, travel_note text,
  status text not null default 'geplant' check (status in ('geplant','abgeschlossen','abgesagt')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text, media_url text,
  media_type text check (media_type in ('image','video')),
  category text,
  created_at timestamptz not null default now()
);

create table public.training_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Mein Trainingsplan',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.training_plans(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  sets int not null default 3,
  reps text not null default '10',
  frequency text default 'täglich',
  instructions text,
  position int not null default 0
);

create table public.plan_feedback (
  id uuid primary key default gen_random_uuid(),
  plan_item_id uuid not null references public.plan_items(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  on_date date not null default current_date,
  completed boolean not null default true,
  pain_level int check (pain_level between 0 and 10),
  note text,
  created_at timestamptz not null default now(),
  unique (plan_item_id, patient_id, on_date)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index on public.appointments (patient_id, starts_at);
create index on public.messages (patient_id, created_at);
create index on public.plan_feedback (patient_id, on_date);

create or replace function public.is_therapist()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'therapist'); $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'patient'))
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.appointment_requests enable row level security;
alter table public.appointments enable row level security;
alter table public.exercises enable row level security;
alter table public.training_plans enable row level security;
alter table public.plan_items enable row level security;
alter table public.plan_feedback enable row level security;
alter table public.messages enable row level security;

create policy "eigenes Profil lesen" on public.profiles for select using (id = auth.uid() or public.is_therapist());
create policy "eigenes Profil ändern" on public.profiles for update using (id = auth.uid() or public.is_therapist());
create policy "Anfragen lesen" on public.appointment_requests for select using (patient_id = auth.uid() or public.is_therapist());
create policy "Anfrage stellen" on public.appointment_requests for insert with check (patient_id = auth.uid() or public.is_therapist());
create policy "Anfrage bearbeiten" on public.appointment_requests for update using (public.is_therapist());
create policy "Termine lesen" on public.appointments for select using (patient_id = auth.uid() or public.is_therapist());
create policy "Termine verwalten einf" on public.appointments for insert with check (public.is_therapist());
create policy "Termine verwalten upd" on public.appointments for update using (public.is_therapist());
create policy "Termine verwalten del" on public.appointments for delete using (public.is_therapist());
create policy "Übungen lesen" on public.exercises for select using (auth.uid() is not null);
create policy "Übungen einfügen" on public.exercises for insert with check (public.is_therapist());
create policy "Übungen ändern" on public.exercises for update using (public.is_therapist());
create policy "Übungen löschen" on public.exercises for delete using (public.is_therapist());
create policy "Pläne lesen" on public.training_plans for select using (patient_id = auth.uid() or public.is_therapist());
create policy "Pläne einfügen" on public.training_plans for insert with check (public.is_therapist());
create policy "Pläne ändern" on public.training_plans for update using (public.is_therapist());
create policy "Pläne löschen" on public.training_plans for delete using (public.is_therapist());
create policy "Planübungen lesen" on public.plan_items for select using (
  public.is_therapist() or exists (select 1 from public.training_plans p where p.id = plan_id and p.patient_id = auth.uid())
);
create policy "Planübungen einfügen" on public.plan_items for insert with check (public.is_therapist());
create policy "Planübungen ändern" on public.plan_items for update using (public.is_therapist());
create policy "Planübungen löschen" on public.plan_items for delete using (public.is_therapist());
create policy "Feedback lesen" on public.plan_feedback for select using (patient_id = auth.uid() or public.is_therapist());
create policy "Feedback geben" on public.plan_feedback for insert with check (patient_id = auth.uid());
create policy "Feedback ändern" on public.plan_feedback for update using (patient_id = auth.uid());
create policy "Nachrichten lesen" on public.messages for select using (patient_id = auth.uid() or public.is_therapist());
create policy "Nachricht senden Patient" on public.messages for insert with check (
  (patient_id = auth.uid() and sender_id = auth.uid()) or (public.is_therapist() and sender_id = auth.uid())
);
create policy "Nachricht gelesen markieren" on public.messages for update using (patient_id = auth.uid() or public.is_therapist());

alter publication supabase_realtime add table public.messages;

insert into storage.buckets (id, name, public) values ('exercise-media', 'exercise-media', false);
create policy "Übungsmedien lesen" on storage.objects for select using (bucket_id = 'exercise-media' and auth.uid() is not null);
create policy "Übungsmedien hochladen" on storage.objects for insert with check (bucket_id = 'exercise-media' and public.is_therapist());
create policy "Übungsmedien löschen" on storage.objects for delete using (bucket_id = 'exercise-media' and public.is_therapist());

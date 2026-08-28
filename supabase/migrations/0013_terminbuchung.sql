-- Anrede für die förmliche Ansprache
alter table public.profiles
  add column if not exists anrede text check (anrede in ('herr', 'frau'));

-- Einstellungen der Praxis. Genau eine Zeile, erzwungen über den Primärschlüssel.
create table if not exists public.praxis_einstellungen (
  id boolean primary key default true check (id),
  slot_minuten int not null default 60 check (slot_minuten between 15 and 240),
  puffer_minuten int not null default 30 check (puffer_minuten between 0 and 180),
  vorlauf_stunden int not null default 24 check (vorlauf_stunden between 0 and 336),
  horizont_tage int not null default 28 check (horizont_tage between 1 and 180),
  auto_bestaetigen boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.praxis_einstellungen (id) values (true) on conflict (id) do nothing;

-- Wiederkehrende Sprechzeiten je Wochentag (0 = Sonntag, wie in Postgres dow)
create table if not exists public.verfuegbarkeit (
  id uuid primary key default gen_random_uuid(),
  wochentag int not null check (wochentag between 0 and 6),
  von time not null,
  bis time not null check (bis > von),
  aktiv boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists verfuegbarkeit_tag_idx on public.verfuegbarkeit (wochentag);

-- Einzelne Ausnahmen: Urlaub, Fortbildung, freier Nachmittag
create table if not exists public.sperrzeiten (
  id uuid primary key default gen_random_uuid(),
  datum date not null,
  von time,
  bis time,
  grund text,
  created_at timestamptz not null default now(),
  check (von is null or (bis is not null and bis > von))
);

create index if not exists sperrzeiten_datum_idx on public.sperrzeiten (datum);

alter table public.praxis_einstellungen enable row level security;
alter table public.verfuegbarkeit enable row level security;
alter table public.sperrzeiten enable row level security;

-- Sprechzeiten und Einstellungen darf jede angemeldete Person lesen – sie
-- braucht sie, um freie Termine zu sehen. Ändern nur das Praxisteam.
create policy "Einstellungen lesen" on public.praxis_einstellungen for select
  using (auth.uid() is not null);
create policy "Einstellungen ändern" on public.praxis_einstellungen for update
  using ((select public.is_therapist())) with check ((select public.is_therapist()));

create policy "Sprechzeiten lesen" on public.verfuegbarkeit for select
  using (auth.uid() is not null);
create policy "Sprechzeiten pflegen" on public.verfuegbarkeit for all
  using ((select public.is_therapist())) with check ((select public.is_therapist()));

create policy "Sperrzeiten lesen" on public.sperrzeiten for select
  using (auth.uid() is not null);
create policy "Sperrzeiten pflegen" on public.sperrzeiten for all
  using ((select public.is_therapist())) with check ((select public.is_therapist()));

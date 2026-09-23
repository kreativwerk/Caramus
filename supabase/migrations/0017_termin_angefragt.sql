-- Eine Buchung ist erst ein Wunsch. Solange die Praxis nicht bestätigt hat,
-- steht der Termin auf „angefragt“. Der Platz ist trotzdem schon belegt, damit
-- niemand anderes dieselbe Zeit nimmt. Die Praxis bestätigt und darf die
-- Uhrzeit dabei noch anpassen (z. B. 16:00 → 16:15 Uhr).
--
-- Gilt nur, wenn in den Einstellungen „Termine stehen sofort fest“ aus ist.
-- Mit Haken bleibt alles wie bisher: Buchung = fester Termin.

alter table public.appointments drop constraint if exists appointments_status_check;
alter table public.appointments
  add constraint appointments_status_check
  check (status in ('angefragt', 'geplant', 'abgeschlossen', 'abgesagt'));

-- Wann die Praxis bestätigt hat – für den Hinweis beim Patienten
alter table public.appointments
  add column if not exists bestaetigt_am timestamptz;

-- Angefragte Termine belegen den Platz genauso wie feste
create or replace function public.freie_termine(p_von date, p_bis date)
returns table (beginn timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  e praxis_einstellungen%rowtype;
  tag date;
  regel verfuegbarkeit%rowtype;
  slot timestamptz;
  schluss timestamptz;
  heute date;
begin
  if auth.uid() is null then return; end if;

  select * into e from praxis_einstellungen where id;
  if not found then return; end if;

  heute := (now() at time zone 'Europe/Berlin')::date;
  p_von := greatest(p_von, heute);
  p_bis := least(p_bis, heute + e.horizont_tage);

  for tag in select d::date from generate_series(p_von, p_bis, interval '1 day') d loop
    for regel in
      select * from verfuegbarkeit
       where aktiv and wochentag = extract(dow from tag)::int
       order by von
    loop
      slot := (tag + regel.von) at time zone 'Europe/Berlin';
      schluss := (tag + regel.bis) at time zone 'Europe/Berlin';

      while slot + make_interval(mins => e.slot_minuten) <= schluss loop
        if slot >= now() + make_interval(hours => e.vorlauf_stunden)
           -- Termin belegt inklusive Fahrzeit davor und danach
           and not exists (
             select 1 from appointments a
              where a.status in ('angefragt', 'geplant')
                and tstzrange(
                      a.starts_at - make_interval(mins => e.puffer_minuten),
                      a.starts_at + make_interval(mins => a.duration_min + e.puffer_minuten)
                    ) && tstzrange(slot, slot + make_interval(mins => e.slot_minuten))
           )
           -- Urlaub, Fortbildung, freier Nachmittag
           and not exists (
             select 1 from sperrzeiten s
              where s.datum = tag
                and (
                  s.von is null
                  or tstzrange(
                       (tag + s.von) at time zone 'Europe/Berlin',
                       (tag + s.bis) at time zone 'Europe/Berlin'
                     ) && tstzrange(slot, slot + make_interval(mins => e.slot_minuten))
                )
           )
        then
          beginn := slot;
          return next;
        end if;

        slot := slot + make_interval(mins => e.slot_minuten);
      end loop;
    end loop;
  end loop;
end;
$$;

-- Buchung: je nach Einstellung fest oder erst angefragt
create or replace function public.termin_buchen(p_beginn timestamptz, p_nachricht text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  e praxis_einstellungen%rowtype;
  patient profiles%rowtype;
  neue_id uuid;
  adresse text;
begin
  select * into patient from profiles where id = auth.uid();
  if not found or patient.role <> 'patient' then
    raise exception 'nicht_berechtigt';
  end if;

  select * into e from praxis_einstellungen where id;

  if not exists (
    select 1 from freie_termine(
      (p_beginn at time zone 'Europe/Berlin')::date,
      (p_beginn at time zone 'Europe/Berlin')::date
    ) f where f.beginn = p_beginn
  ) then
    raise exception 'termin_vergeben';
  end if;

  adresse := nullif(trim(both ', ' from
    coalesce(patient.street, '') || ', ' ||
    trim(coalesce(patient.zip, '') || ' ' || coalesce(patient.city, ''))), '');

  insert into appointments (patient_id, starts_at, duration_min, address, notes, status, gebucht_von)
  values (
    patient.id, p_beginn, e.slot_minuten, adresse, nullif(trim(p_nachricht), ''),
    case when e.auto_bestaetigen then 'geplant' else 'angefragt' end,
    'patient'
  )
  returning id into neue_id;

  return neue_id;
end;
$$;

-- Auch einen noch nicht bestätigten Termin darf der Patient zurückziehen
create or replace function public.termin_absagen(p_termin uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  e praxis_einstellungen%rowtype;
  t appointments%rowtype;
begin
  select * into t from appointments where id = p_termin and patient_id = auth.uid();
  if not found then
    raise exception 'nicht_gefunden';
  end if;
  if t.status not in ('angefragt', 'geplant') then
    raise exception 'nicht_geplant';
  end if;

  select * into e from praxis_einstellungen where id;
  if e.storno_stunden is null then
    raise exception 'absage_gesperrt';
  end if;
  if t.starts_at < now() + make_interval(hours => e.storno_stunden) then
    raise exception 'zu_kurzfristig';
  end if;

  update appointments
     set status = 'abgesagt', abgesagt_am = now(), abgesagt_von = 'patient'
   where id = t.id;
end;
$$;

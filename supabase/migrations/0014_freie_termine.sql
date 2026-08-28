-- Freie Termine berechnen. Läuft mit erhöhten Rechten, damit Patientinnen und
-- Patienten sehen können, was frei ist, ohne die Termine anderer zu sehen.
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
              where a.status = 'geplant'
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

revoke execute on function public.freie_termine(date, date) from public, anon;
grant execute on function public.freie_termine(date, date) to authenticated;

-- Buchung. Prüft im selben Aufruf noch einmal, ob der Termin wirklich frei ist –
-- sonst könnten zwei Personen gleichzeitig denselben Platz nehmen.
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

  insert into appointments (patient_id, starts_at, duration_min, address, notes, status)
  values (patient.id, p_beginn, e.slot_minuten, adresse, nullif(trim(p_nachricht), ''), 'geplant')
  returning id into neue_id;

  return neue_id;
end;
$$;

revoke execute on function public.termin_buchen(timestamptz, text) from public, anon;
grant execute on function public.termin_buchen(timestamptz, text) to authenticated;

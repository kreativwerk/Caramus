-- Die Praxis soll erfahren, wenn etwas passiert: neue Nachricht, selbst
-- gebuchter Termin, Absage durch Patienten. Bisher gab es dafür keinen
-- Auslöser – die Edge Function „notify-message" wartete auf einen Webhook,
-- den nie jemand angelegt hat. Jetzt ruft die Datenbank sie selbst auf.

create extension if not exists pg_net with schema extensions;

-- Woher stammt ein Termin? Nur selbst gebuchte lösen eine Nachricht aus.
alter table public.appointments
  add column if not exists gebucht_von text not null default 'praxis'
  check (gebucht_von in ('patient', 'praxis'));

-- Buchung durch Patienten markieren (sonst unverändert zu 0014).
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
  values (patient.id, p_beginn, e.slot_minuten, adresse, nullif(trim(p_nachricht), ''), 'geplant', 'patient')
  returning id into neue_id;

  return neue_id;
end;
$$;

-- Ruft die Edge Function auf. Mitgeschickt wird nur die Kennung – die
-- Funktion liest sich den Datensatz selbst aus der Datenbank, Inhalte von
-- Nachrichten verlassen die Datenbank auf diesem Weg also nicht.
-- Der anon-Schlüssel ist öffentlich (er steckt in jeder Seite der App); er
-- dient hier nur dazu, die JWT-Prüfung der Funktion zu bestehen.
create or replace function public.hinweis_an_funktion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ziel text := 'https://jiixpoyxctohzagldcel.supabase.co/functions/v1/notify-message';
  schluessel text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppaXhwb3l4Y3RvaHphZ2xkY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNzE4NjAsImV4cCI6MjEwMjc0Nzg2MH0._braIvnWNJHM8KP0xFEikaqC65fScOgn9vOP4wWzqWQ';
  art text;
begin
  if tg_table_name = 'messages' then
    art := 'nachricht';
  elsif tg_table_name = 'appointments' then
    if tg_op = 'INSERT' and new.gebucht_von = 'patient' then
      art := 'buchung';
    elsif tg_op = 'UPDATE' and new.status = 'abgesagt' and old.status is distinct from 'abgesagt'
          and new.abgesagt_von = 'patient' then
      art := 'absage';
    else
      return new;
    end if;
  else
    return new;
  end if;

  perform net.http_post(
    url := ziel,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || schluessel
    ),
    body := jsonb_build_object(
      'art', art,
      'table', tg_table_name,
      'record', jsonb_build_object('id', new.id)
    ),
    timeout_milliseconds := 5000
  );
  return new;
end;
$$;

revoke execute on function public.hinweis_an_funktion() from public, anon, authenticated;

drop trigger if exists hinweis_neue_nachricht on public.messages;
create trigger hinweis_neue_nachricht
  after insert on public.messages
  for each row execute function public.hinweis_an_funktion();

drop trigger if exists hinweis_termin on public.appointments;
create trigger hinweis_termin
  after insert or update of status on public.appointments
  for each row execute function public.hinweis_an_funktion();

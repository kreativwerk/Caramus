-- Auch Patientinnen und Patienten bekommen E-Mails: wenn ihr Wunsch eingeht,
-- wenn die Praxis bestätigt (auch mit angepasster Uhrzeit), wenn die Praxis
-- einen Termin einträgt oder absagt und wenn sie auf Wunschzeiten antwortet.
-- Die Praxis erfährt zusätzlich von neuen Wunschzeiten-Anfragen.
--
-- Wie bisher geht nur die Kennung an die Edge Function „notify-message“;
-- bei Bestätigungen zusätzlich die vorherige Uhrzeit, damit die Mail sagen
-- kann, ob sich etwas verschoben hat.

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
  vorher timestamptz;
begin
  if tg_table_name = 'messages' then
    art := 'nachricht';

  elsif tg_table_name = 'appointments' then
    if tg_op = 'INSERT' and new.gebucht_von = 'patient' then
      art := 'buchung';
    elsif tg_op = 'INSERT' and new.gebucht_von = 'praxis' then
      art := 'termin';
    elsif tg_op = 'UPDATE' and old.status = 'angefragt' and new.status = 'geplant' then
      art := 'bestaetigung';
      vorher := old.starts_at;
    elsif tg_op = 'UPDATE' and new.status = 'abgesagt' and old.status is distinct from 'abgesagt' then
      if new.abgesagt_von = 'patient' then
        art := 'absage';
      else
        art := 'absage_praxis';
      end if;
    else
      return new;
    end if;

  elsif tg_table_name = 'appointment_requests' then
    if tg_op = 'INSERT' then
      art := 'anfrage_neu';
    elsif tg_op = 'UPDATE' and new.status in ('proposed', 'declined')
          and new.status is distinct from old.status then
      art := 'anfrage';
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
      'record', jsonb_build_object('id', new.id),
      'vorher', vorher
    ),
    timeout_milliseconds := 5000
  );
  return new;
end;
$$;

revoke execute on function public.hinweis_an_funktion() from public, anon, authenticated;

drop trigger if exists hinweis_anfrage on public.appointment_requests;
create trigger hinweis_anfrage
  after insert or update of status on public.appointment_requests
  for each row execute function public.hinweis_an_funktion();

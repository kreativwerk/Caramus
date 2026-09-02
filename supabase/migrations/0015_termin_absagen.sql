-- Patientinnen und Patienten dürfen Termine selbst absagen – bis zu einer
-- Frist, die die Praxis festlegt. NULL heißt: Absagen in der App ist aus.
-- Testweise 24 Stunden.
alter table public.praxis_einstellungen
  add column if not exists storno_stunden int default 24
  check (storno_stunden is null or storno_stunden between 0 and 336);

-- Wer hat abgesagt, und wann? Die Praxis will das sehen.
alter table public.appointments
  add column if not exists abgesagt_am timestamptz,
  add column if not exists abgesagt_von text
    check (abgesagt_von is null or abgesagt_von in ('patient', 'praxis'));

-- Absage durch die Patientin oder den Patienten. Läuft mit erhöhten Rechten,
-- weil Patienten ihre Termine sonst nicht ändern dürfen – die Frist wird hier
-- geprüft, nicht nur in der Oberfläche.
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
  if t.status <> 'geplant' then
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

revoke execute on function public.termin_absagen(uuid) from public, anon;
grant execute on function public.termin_absagen(uuid) to authenticated;

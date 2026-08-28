-- Merkt sich, ob jemand das Willkommen schon durchlaufen hat.
alter table public.profiles
  add column if not exists onboarding_at timestamptz;

comment on column public.profiles.onboarding_at is
  'Zeitpunkt, an dem das Willkommen abgeschlossen wurde. Null = beim nächsten Öffnen zeigen.';

-- Bestehende Konten sollen nicht plötzlich durch das Willkommen geschickt werden,
-- wenn sie ihre Daten längst hinterlegt haben.
update public.profiles
   set onboarding_at = created_at
 where onboarding_at is null
   and street is not null
   and full_name is not null;

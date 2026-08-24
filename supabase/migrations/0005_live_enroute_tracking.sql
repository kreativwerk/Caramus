-- Live-Anfahrt: Therapeut startet die Fahrt, Patient sieht Countdown in Echtzeit
-- (Angewendet als MCP-Migration "live_enroute_tracking".)
alter table public.appointments
  add column enroute_at timestamptz,
  add column eta_minutes int check (eta_minutes between 1 and 240),
  add column arrived_at timestamptz;

-- Realtime-Updates für Termine (Patient bekommt Startsignal sofort)
alter publication supabase_realtime add table public.appointments;

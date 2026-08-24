-- Verspätung melden und Herkunft der Fahrzeit-Schätzung festhalten
-- (Angewendet als MCP-Migration "verspaetung_und_fahrzeit".)
alter table public.appointments
  add column eta_updated_at timestamptz,
  add column delay_note text,
  add column eta_quelle text not null default 'manuell'
    check (eta_quelle in ('manuell','verkehr'));

-- Zwischenspeicher für Koordinaten, damit die Adresse nur einmal
-- an einen Kartendienst übertragen werden muss
alter table public.profiles
  add column lat double precision,
  add column lng double precision,
  add column geo_updated_at timestamptz;

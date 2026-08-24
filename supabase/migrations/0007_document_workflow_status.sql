-- Dokumentenbereich mit nachvollziehbarem Bearbeitungsstand
-- (Projektprotokoll 24.08.2026, Kapitel 03B und 04)
-- (Angewendet als MCP-Migration "document_workflow_status".)
alter table public.documents
  add column kind text not null default 'sonstiges'
    check (kind in ('rezept','ueberweisung','bericht','sonstiges')),
  add column status text not null default 'eingegangen'
    check (status in ('eingegangen','in_pruefung','weitergeleitet','unvollstaendig')),
  add column status_note text,
  add column status_changed_at timestamptz;

create index documents_status_idx on public.documents (status, created_at desc);

-- Nur der Therapeut darf den Bearbeitungsstand ändern; Patienten laden hoch und lesen.
create policy "Dokumentstatus setzen" on public.documents for update
  using ((select public.is_therapist()));

-- Patient sieht Statusänderungen sofort
alter publication supabase_realtime add table public.documents;

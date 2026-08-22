-- Dokumente der Patienten (Rezepte, Überweisungen, Arztberichte)
-- (Angewendet als MCP-Migration "patient_documents".)
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.appointment_requests(id) on delete set null,
  file_path text not null,
  file_name text not null,
  content_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index documents_patient_id_idx on public.documents (patient_id);
create index documents_request_id_idx on public.documents (request_id);

alter table public.documents enable row level security;

create policy "Dokumente lesen" on public.documents for select
  using (patient_id = (select auth.uid()) or (select public.is_therapist()));
create policy "Dokumente hochladen" on public.documents for insert
  with check (patient_id = (select auth.uid()) or (select public.is_therapist()));
create policy "Dokumente löschen" on public.documents for delete
  using (patient_id = (select auth.uid()) or (select public.is_therapist()));

-- Privater Bucket; Uploads nur in den eigenen Ordner (Pfad beginnt mit der User-ID)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('patient-docs', 'patient-docs', false, 10485760,
        array['application/pdf','image/jpeg','image/png','image/heic','image/heif','image/webp']);

create policy "Patientendokumente lesen" on storage.objects for select
  using (bucket_id = 'patient-docs' and ((select auth.uid())::text = split_part(name, '/', 1) or (select public.is_therapist())));
create policy "Patientendokumente hochladen" on storage.objects for insert
  with check (bucket_id = 'patient-docs' and (select auth.uid())::text = split_part(name, '/', 1));
create policy "Patientendokumente löschen" on storage.objects for delete
  using (bucket_id = 'patient-docs' and ((select auth.uid())::text = split_part(name, '/', 1) or (select public.is_therapist())));

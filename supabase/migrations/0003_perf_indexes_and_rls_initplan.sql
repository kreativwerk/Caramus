-- Performance-Advisors: fehlende FK-Indizes + RLS-Initplan-Muster
-- (auth.uid()/is_therapist() einmal pro Abfrage statt pro Zeile auswerten).
-- (Angewendet als MCP-Migration "perf_indexes_and_rls_initplan"; vollständige
-- Policy-Neufassungen siehe Migrationshistorie im Supabase-Dashboard.)
create index if not exists appointment_requests_patient_id_idx on public.appointment_requests (patient_id);
create index if not exists messages_sender_id_idx on public.messages (sender_id);
create index if not exists plan_items_plan_id_idx on public.plan_items (plan_id);
create index if not exists plan_items_exercise_id_idx on public.plan_items (exercise_id);
create index if not exists training_plans_patient_id_idx on public.training_plans (patient_id);

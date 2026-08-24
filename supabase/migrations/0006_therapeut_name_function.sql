-- Patienten dürfen ihr eigenes Profil sehen, aber nicht die Profiltabelle
-- durchsuchen. Für Anzeigen wie „Charles ist unterwegs" wird nur der Name
-- benötigt – diese Funktion gibt ausschließlich den Namen zurück.
-- (Angewendet als MCP-Migration "therapeut_name_function".)
create or replace function public.therapeut_name()
returns text
language sql stable security definer set search_path = public
as $$
  select full_name from public.profiles where role = 'therapist' order by created_at limit 1;
$$;

revoke execute on function public.therapeut_name() from public, anon;
grant execute on function public.therapeut_name() to authenticated;

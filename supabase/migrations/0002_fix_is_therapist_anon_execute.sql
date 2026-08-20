-- is_therapist wird von RLS-Policies aufgerufen, die auch bei anonymen
-- Anfragen ausgewertet werden. Ohne EXECUTE für anon wirft jede solche
-- Abfrage einen Fehler statt 0 Zeilen zurückzugeben. Die Funktion gibt für
-- anon immer false zurück und leakt nichts.
-- (Angewendet als MCP-Migration "fix_is_therapist_anon_execute".)
grant execute on function public.is_therapist() to anon;

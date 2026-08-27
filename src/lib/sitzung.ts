import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Angemeldete Person und ihr Profil – einmal pro Seitenaufruf.
 *
 * Layout und Seite brauchen beides. Ohne `cache()` fragt jede Stelle einzeln
 * bei Supabase nach, und weil der Server hier und die Datenbank in Frankfurt
 * stehen, kostet jede dieser Rückfragen echte Wartezeit. `cache()` merkt sich
 * das Ergebnis für die Dauer eines Aufrufs; alle weiteren Stellen bekommen es
 * ohne neue Anfrage.
 */
export const aktuellerNutzer = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const aktuellesProfil = cache(async (): Promise<Profile | null> => {
  const user = await aktuellerNutzer();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
});

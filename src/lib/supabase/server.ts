import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cookieOptionenFuerSitzung, nurFuerDieseSitzung } from "@/lib/sitzungsdauer";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            // Ohne „Angemeldet bleiben“ bekommen die Anmelde-Cookies kein
            // Ablaufdatum – der Browser vergisst sie beim Schließen.
            const nurBrowser = nurFuerDieseSitzung(cookieStore.getAll());
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, cookieOptionenFuerSitzung(options, nurBrowser))
            );
          } catch {
            // Aufruf aus einer Server Component – der Proxy übernimmt das Setzen.
          }
        },
      },
    }
  );
}

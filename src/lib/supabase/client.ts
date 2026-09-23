import { createBrowserClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { cookieOptionenFuerSitzung, nurFuerDieseSitzung } from "@/lib/sitzungsdauer";

function alleCookies() {
  return parseCookieHeader(document.cookie).map(({ name, value }) => ({ name, value: value ?? "" }));
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return alleCookies();
        },
        setAll(cookiesToSet) {
          // Ohne „Angemeldet bleiben“ bekommen die Anmelde-Cookies kein
          // Ablaufdatum – der Browser vergisst sie beim Schließen.
          const nurBrowser = nurFuerDieseSitzung(alleCookies());
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = serializeCookieHeader(
              name,
              value,
              cookieOptionenFuerSitzung(options, nurBrowser)
            );
          });
        },
      },
    }
  );
}

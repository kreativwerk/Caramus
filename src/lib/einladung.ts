import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Einladungen für neue Patientinnen und Patienten.
 *
 * Zwei Wege, beide erzeugt Supabase:
 * - per E-Mail: Supabase verschickt die Einladung über das eigene Postfach
 * - als Link: derselbe Zugang zum Weitergeben, wenn Charles jemanden vor sich
 *   hat oder die Adresse nicht stimmt
 *
 * Beides braucht den Dienst-Schlüssel (`SUPABASE_SERVICE_ROLE_KEY`), weil nur
 * er Konten anlegen darf. Fehlt er, meldet das die Oberfläche verständlich.
 */

export function einladungMoeglich() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function dienstClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/** Wohin die eingeladene Person nach dem Klick geleitet wird. */
function zielAdresse() {
  const basis = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.curamus-medical.de";
  return `${basis}/auth/callback?weiter=${encodeURIComponent("/passwort-neu")}`;
}

export type EinladungErgebnis =
  | { ok: true; link?: string; verschickt: boolean }
  | { ok: false; fehler: string };

/**
 * Legt den Zugang an und verschickt die Einladung per E-Mail.
 * Der Name landet im Profil, damit Charles die Person sofort wiedererkennt.
 */
export async function einladungVerschicken(
  email: string,
  name: string
): Promise<EinladungErgebnis> {
  if (!einladungMoeglich()) {
    return {
      ok: false,
      fehler: "Einladungen sind auf diesem Server noch nicht eingerichtet.",
    };
  }

  try {
    const supabase = dienstClient();
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name, role: "patient" },
      redirectTo: zielAdresse(),
    });

    if (error) {
      const text = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
      if (text.includes("already been registered") || text.includes("already exists")) {
        return { ok: false, fehler: "Für diese Adresse gibt es schon einen Zugang." };
      }
      if (text.includes("invalid") && text.includes("email")) {
        return { ok: false, fehler: "Diese E-Mail-Adresse scheint nicht zu stimmen." };
      }
      if (text.includes("rate limit")) {
        return {
          ok: false,
          fehler: "Gerade wurden schon viele Einladungen verschickt. Bitte in einer Stunde noch einmal.",
        };
      }
      return {
        ok: false,
        fehler: "Das Verschicken hat nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal.",
      };
    }

    return { ok: true, verschickt: true };
  } catch {
    return {
      ok: false,
      fehler: "Das Verschicken hat nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal.",
    };
  }
}

/**
 * Erzeugt denselben Zugang, verschickt aber nichts – zurück kommt ein Link zum
 * Weitergeben. Praktisch beim Hausbesuch: Charles zeigt ihn direkt auf dem
 * Handy oder schickt ihn über den Weg, den die Person ohnehin nutzt.
 */
export async function einladungAlsLink(
  email: string,
  name: string
): Promise<EinladungErgebnis> {
  if (!einladungMoeglich()) {
    return { ok: false, fehler: "Einladungen sind auf diesem Server noch nicht eingerichtet." };
  }

  try {
    const supabase = dienstClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "invite",
      email,
      options: { data: { full_name: name, role: "patient" }, redirectTo: zielAdresse() },
    });

    if (error || !data?.properties?.action_link) {
      const text = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
      if (text.includes("already been registered") || text.includes("already exists")) {
        return { ok: false, fehler: "Für diese Adresse gibt es schon einen Zugang." };
      }
      return {
        ok: false,
        fehler: "Der Link konnte nicht erzeugt werden. Bitte versuchen Sie es in einem Moment noch einmal.",
      };
    }

    return { ok: true, link: data.properties.action_link, verschickt: false };
  } catch {
    return {
      ok: false,
      fehler: "Der Link konnte nicht erzeugt werden. Bitte versuchen Sie es in einem Moment noch einmal.",
    };
  }
}

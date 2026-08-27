import "server-only";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

/**
 * Push-Benachrichtigungen auf das Handy – auch wenn die App gerade zu ist.
 *
 * Konfiguration (nur auf dem Server, niemals im Browser):
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY  – darf öffentlich sein, der Browser braucht ihn
 *   VAPID_PRIVATE_KEY             – geheim
 *   VAPID_SUBJECT                 – Kontaktadresse, z. B. mailto:kontakt@curamus-medical.de
 *   SUPABASE_SERVICE_ROLE_KEY     – nötig, um die Geräte des Empfängers zu lesen
 *
 * Fehlt eine dieser Angaben, versendet die App still nichts. Alles andere
 * funktioniert unverändert weiter – eine ausgefallene Benachrichtigung darf
 * niemals einen Termin oder eine Nachricht blockieren.
 */

export type PushInhalt = {
  titel: string;
  text: string;
  /** Wohin der Tipp auf die Benachrichtigung führt */
  ziel: string;
  /** Gleiche Kennung ersetzt eine ältere Benachrichtigung, statt zu stapeln */
  gruppe?: string;
};

function konfiguration() {
  const oeffentlich = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const geheim = process.env.VAPID_PRIVATE_KEY;
  const dienstSchluessel = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!oeffentlich || !geheim || !dienstSchluessel || !url) return null;
  return { oeffentlich, geheim, dienstSchluessel, url };
}

/** Sind Push-Benachrichtigungen auf diesem Server überhaupt eingerichtet? */
export function pushVerfuegbar() {
  return konfiguration() !== null;
}

/**
 * Schickt eine Benachrichtigung an alle Geräte der genannten Personen.
 * Wirft nie. Geräte, die der Push-Dienst als abgemeldet meldet, werden
 * entfernt – sonst sammeln sich tote Einträge an.
 */
export async function pushSenden(empfaenger: string[], inhalt: PushInhalt) {
  const konf = konfiguration();
  if (!konf || empfaenger.length === 0) return { gesendet: 0 };

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? "mailto:kontakt@curamus-medical.de",
      konf.oeffentlich,
      konf.geheim
    );

    const supabase = createClient(konf.url, konf.dienstSchluessel, {
      auth: { persistSession: false },
    });

    const { data: abos } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", empfaenger);
    if (!abos?.length) return { gesendet: 0 };

    const nutzlast = JSON.stringify(inhalt);
    const veraltet: string[] = [];
    let gesendet = 0;

    await Promise.all(
      abos.map(async (abo) => {
        try {
          await webpush.sendNotification(
            { endpoint: abo.endpoint, keys: { p256dh: abo.p256dh, auth: abo.auth } },
            nutzlast,
            { TTL: 60 * 30 }
          );
          gesendet += 1;
        } catch (fehler) {
          // 404/410: Das Gerät ist beim Push-Dienst nicht mehr bekannt
          const status = (fehler as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) veraltet.push(abo.id);
        }
      })
    );

    if (veraltet.length) {
      await supabase.from("push_subscriptions").delete().in("id", veraltet);
    }
    if (gesendet > 0) {
      await supabase
        .from("push_subscriptions")
        .update({ last_used_at: new Date().toISOString() })
        .in("user_id", empfaenger);
    }
    return { gesendet };
  } catch {
    return { gesendet: 0 };
  }
}

/**
 * An das Praxisteam – die Empfänger stehen nicht im Voraus fest, deshalb
 * werden sie hier nachgeschlagen.
 */
export async function pushAnPraxis(inhalt: PushInhalt) {
  const konf = konfiguration();
  if (!konf) return { gesendet: 0 };
  try {
    const supabase = createClient(konf.url, konf.dienstSchluessel, {
      auth: { persistSession: false },
    });
    const { data } = await supabase.from("profiles").select("id").eq("role", "therapist");
    return pushSenden((data ?? []).map((p) => p.id), inhalt);
  } catch {
    return { gesendet: 0 };
  }
}

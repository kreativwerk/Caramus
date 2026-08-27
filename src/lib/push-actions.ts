"use server";

import { createClient } from "@/lib/supabase/server";
import { MELDUNG, nichtGeklappt } from "@/lib/meldungen";
import { pushAnPraxis, pushSenden, pushVerfuegbar } from "@/lib/push";

export type PushAbo = {
  endpoint: string;
  p256dh: string;
  auth: string;
  geraet?: string;
};

/** Gerät für Benachrichtigungen anmelden. */
export async function pushAnmelden(abo: PushAbo) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: abo.endpoint,
      p256dh: abo.p256dh,
      auth: abo.auth,
      geraet: abo.geraet?.slice(0, 200) ?? null,
    },
    { onConflict: "endpoint" }
  );
  if (error) return { fehler: nichtGeklappt("Das Einschalten der Benachrichtigungen") };
  return { ok: true };
}

/** Gerät wieder abmelden. */
export async function pushAbmelden(endpoint: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) return { fehler: nichtGeklappt("Das Ausschalten der Benachrichtigungen") };
  return { ok: true };
}

/** Probebenachrichtigung an das eigene Gerät – damit man sieht, dass es geht. */
export async function pushProbe() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  if (!pushVerfuegbar()) {
    return { fehler: "Benachrichtigungen sind auf diesem Server noch nicht eingerichtet." };
  }

  const { gesendet } = await pushSenden([user.id], {
    titel: "Curamus Medical",
    text: "Alles eingerichtet – so sieht eine Benachrichtigung aus.",
    ziel: "/",
    gruppe: "probe",
  });
  if (gesendet === 0) {
    return { fehler: "Die Probe kam nicht an. Bitte schalten Sie sie einmal aus und wieder ein." };
  }
  return { ok: true };
}

/**
 * Hinweis auf eine neue Chat-Nachricht. Die Nachricht selbst legt der Browser
 * direkt an, damit sie sofort im Verlauf steht – hier wird nur noch die
 * Benachrichtigung ausgelöst. Der Text der Nachricht bleibt bewusst draußen:
 * Auf einem gesperrten Bildschirm hat er nichts zu suchen.
 */
export async function pushNeueNachricht(patientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: profil } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profil?.role === "therapist") {
    await pushSenden([patientId], {
      titel: "Neue Nachricht von Ihrer Praxis",
      text: "Tippen Sie hier, um sie zu lesen.",
      ziel: "/app/chat",
      gruppe: "chat",
    });
  } else {
    await pushAnPraxis({
      titel: "Neue Nachricht",
      text: `${profil?.full_name ?? "Eine Patientin oder ein Patient"} hat geschrieben.`,
      ziel: `/praxis/chat/${patientId}`,
      gruppe: `chat-${patientId}`,
    });
  }
  return { ok: true };
}

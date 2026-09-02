"use server";

import { revalidatePath } from "next/cache";
import { stornoFrist } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { MELDUNG, nichtGeklappt } from "@/lib/meldungen";
import { pushAnPraxis } from "@/lib/push";

export async function terminAnfragen(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  const preferred_times = String(formData.get("wunschzeiten") ?? "").trim();
  const message = String(formData.get("nachricht") ?? "").trim() || null;
  if (!preferred_times) return { fehler: "Bitte nennen Sie uns mindestens einen Wunschtermin." };

  const { data: anfrage, error } = await supabase
    .from("appointment_requests")
    .insert({ patient_id: user.id, preferred_times, message })
    .select("id")
    .single();

  if (error || !anfrage)
    return { fehler: nichtGeklappt("Das Senden Ihrer Anfrage") };

  // Zuvor vom Client in den geschützten Speicher geladene Dokumente verknüpfen
  try {
    const dokumente = JSON.parse(String(formData.get("dokumente") ?? "[]")) as {
      file_path: string;
      file_name: string;
      content_type?: string;
      size_bytes?: number;
    }[];
    const art = String(formData.get("dok_art") ?? "rezept");
    if (Array.isArray(dokumente) && dokumente.length > 0) {
      await supabase.from("documents").insert(
        dokumente.slice(0, 3).map((d) => ({
          patient_id: user.id,
          request_id: anfrage.id,
          kind: art,
          file_path: String(d.file_path),
          file_name: String(d.file_name).slice(0, 200),
          content_type: d.content_type ? String(d.content_type) : null,
          size_bytes: typeof d.size_bytes === "number" ? d.size_bytes : null,
        }))
      );
    }
  } catch {
    // Anfrage bleibt gültig, auch wenn die Dokument-Verknüpfung scheitert
  }

  await pushAnPraxis({
    titel: "Neue Terminanfrage",
    text: `Wunschzeiten: ${preferred_times.slice(0, 120)}`,
    ziel: "/praxis/anfragen",
    gruppe: "anfrage",
  });

  revalidatePath("/app/termine");
  return { ok: true };
}

export async function feedbackSpeichern(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  const plan_item_id = String(formData.get("plan_item_id"));
  const completed = formData.get("completed") === "true";
  const painRaw = formData.get("pain_level");
  const pain_level = painRaw === null || painRaw === "" ? null : Number(painRaw);
  const note = String(formData.get("note") ?? "").trim() || null;

  const { error } = await supabase.from("plan_feedback").upsert(
    {
      plan_item_id,
      patient_id: user.id,
      on_date: new Date().toISOString().slice(0, 10),
      completed,
      pain_level,
      note,
    },
    { onConflict: "plan_item_id,patient_id,on_date" }
  );

  if (error) return { fehler: nichtGeklappt("Das Speichern Ihrer Rückmeldung") };
  revalidatePath("/app/plan");
  return { ok: true };
}

export async function profilSpeichern(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  const anredeRoh = String(formData.get("anrede") ?? "");

  const { error } = await supabase
    .from("profiles")
    .update({
      anrede: anredeRoh === "herr" || anredeRoh === "frau" ? anredeRoh : null,
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || null,
      street: String(formData.get("street") ?? "").trim() || null,
      zip: String(formData.get("zip") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
    })
    .eq("id", user.id);

  if (error) return { fehler: nichtGeklappt("Das Speichern Ihrer Angaben") };
  revalidatePath("/app/profil");
  return { ok: true };
}

/** Dokument (Rezept, Überweisung, Bericht) im Dokumentenbereich ablegen. */
export async function dokumentSpeichern(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  const file_path = String(formData.get("file_path") ?? "");
  const file_name = String(formData.get("file_name") ?? "").slice(0, 200);
  if (!file_path || !file_name) return { fehler: "Bitte wählen Sie zuerst eine Unterlage aus oder machen Sie ein Foto." };

  const { error } = await supabase.from("documents").insert({
    patient_id: user.id,
    file_path,
    file_name,
    content_type: String(formData.get("content_type") ?? "") || null,
    size_bytes: Number(formData.get("size_bytes") ?? 0) || null,
    kind: String(formData.get("kind") ?? "sonstiges"),
  });
  if (error) return { fehler: nichtGeklappt("Das Ablegen Ihrer Unterlage") };

  await pushAnPraxis({
    titel: "Neue Unterlage",
    text: "Eine Patientin oder ein Patient hat etwas hochgeladen.",
    ziel: "/praxis/dokumente",
    gruppe: "dokument",
  });

  revalidatePath("/app/dokumente");
  return { ok: true };
}

/** Vom Patienten hochgeladenes Dokument wieder entfernen. */
export async function dokumentLoeschen(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  const id = String(formData.get("id"));
  const { data: dok } = await supabase
    .from("documents")
    .select("file_path, patient_id")
    .eq("id", id)
    .maybeSingle();
  if (!dok || dok.patient_id !== user.id) return { fehler: "Diese Unterlage gibt es nicht mehr. Bitte laden Sie die Seite neu." };

  await supabase.storage.from("patient-docs").remove([dok.file_path]);
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { fehler: nichtGeklappt("Das Entfernen der Unterlage") };

  revalidatePath("/app/dokumente");
  return { ok: true };
}

/**
 * Abschluss des Willkommens: Name, Anschrift und die freiwilligen Angaben in
 * einem Rutsch. `onboarding_at` sorgt dafür, dass es nur einmal erscheint.
 */
export async function onboardingSpeichern(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  const full_name = String(formData.get("full_name") ?? "").trim();
  if (!full_name) return { fehler: "Bitte tragen Sie Ihren Namen ein." };

  const geburtstag = String(formData.get("birth_date") ?? "").trim();

  const anredeRoh = String(formData.get("anrede") ?? "");
  const anrede = anredeRoh === "herr" || anredeRoh === "frau" ? anredeRoh : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      anrede,
      full_name: full_name.slice(0, 120),
      street: String(formData.get("street") ?? "").trim() || null,
      zip: String(formData.get("zip") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      birth_date: geburtstag || null,
      onboarding_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { fehler: nichtGeklappt("Das Speichern Ihrer Angaben") };

  revalidatePath("/app");
  revalidatePath("/app/profil");
  return { ok: true };
}

/**
 * Termin absagen. Die Frist prüft die Datenbank, nicht die Oberfläche – wer
 * den Knopf zu spät drückt, bekommt eine verständliche Antwort statt eines
 * stillschweigend abgesagten Termins.
 */
export async function terminAbsagen(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: MELDUNG.abgemeldet };

  const { error } = await supabase.rpc("termin_absagen", {
    p_termin: String(formData.get("termin_id")),
  });

  if (error) {
    const grund = String(error.message);
    if (grund.includes("zu_kurzfristig")) {
      const { data: e } = await supabase
        .from("praxis_einstellungen")
        .select("storno_stunden")
        .maybeSingle();
      const frist = e?.storno_stunden != null ? stornoFrist(e.storno_stunden) : "24 Stunden";
      return {
        fehler: `Dafür ist es leider zu spät – absagen geht bis ${frist} vorher. Bitte rufen Sie die Praxis kurz an.`,
      };
    }
    if (grund.includes("absage_gesperrt")) {
      return {
        fehler: "Termine lassen sich hier nicht absagen. Bitte melden Sie sich telefonisch oder über die Nachrichten.",
      };
    }
    if (grund.includes("nicht_geplant")) {
      return { fehler: "Dieser Termin ist bereits abgesagt oder schon vorbei." };
    }
    return { fehler: nichtGeklappt("Das Absagen") };
  }

  revalidatePath("/app/termine");
  revalidatePath("/app");
  revalidatePath("/praxis/termine");
  revalidatePath("/praxis");
  return { ok: true };
}

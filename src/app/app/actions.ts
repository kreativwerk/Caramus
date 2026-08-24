"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function terminAnfragen(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: "Nicht angemeldet." };

  const preferred_times = String(formData.get("wunschzeiten") ?? "").trim();
  const message = String(formData.get("nachricht") ?? "").trim() || null;
  if (!preferred_times) return { fehler: "Bitte geben Sie mindestens einen Wunschtermin an." };

  const { data: anfrage, error } = await supabase
    .from("appointment_requests")
    .insert({ patient_id: user.id, preferred_times, message })
    .select("id")
    .single();

  if (error || !anfrage)
    return { fehler: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut." };

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

  revalidatePath("/app/termine");
  return { ok: true };
}

export async function feedbackSpeichern(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: "Nicht angemeldet." };

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

  if (error) return { fehler: "Die Rückmeldung konnte nicht gespeichert werden." };
  revalidatePath("/app/plan");
  return { ok: true };
}

export async function profilSpeichern(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: "Nicht angemeldet." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || null,
      street: String(formData.get("street") ?? "").trim() || null,
      zip: String(formData.get("zip") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
    })
    .eq("id", user.id);

  if (error) return { fehler: "Das Profil konnte nicht gespeichert werden." };
  revalidatePath("/app/profil");
  return { ok: true };
}

/** Dokument (Rezept, Überweisung, Bericht) im Dokumentenbereich ablegen. */
export async function dokumentSpeichern(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: "Nicht angemeldet." };

  const file_path = String(formData.get("file_path") ?? "");
  const file_name = String(formData.get("file_name") ?? "").slice(0, 200);
  if (!file_path || !file_name) return { fehler: "Bitte eine Datei auswählen." };

  const { error } = await supabase.from("documents").insert({
    patient_id: user.id,
    file_path,
    file_name,
    content_type: String(formData.get("content_type") ?? "") || null,
    size_bytes: Number(formData.get("size_bytes") ?? 0) || null,
    kind: String(formData.get("kind") ?? "sonstiges"),
  });
  if (error) return { fehler: "Das Dokument konnte nicht gespeichert werden." };

  revalidatePath("/app/dokumente");
  return { ok: true };
}

/** Vom Patienten hochgeladenes Dokument wieder entfernen. */
export async function dokumentLoeschen(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { fehler: "Nicht angemeldet." };

  const id = String(formData.get("id"));
  const { data: dok } = await supabase
    .from("documents")
    .select("file_path, patient_id")
    .eq("id", id)
    .maybeSingle();
  if (!dok || dok.patient_id !== user.id) return { fehler: "Dokument nicht gefunden." };

  await supabase.storage.from("patient-docs").remove([dok.file_path]);
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { fehler: "Das Dokument konnte nicht entfernt werden." };

  revalidatePath("/app/dokumente");
  return { ok: true };
}

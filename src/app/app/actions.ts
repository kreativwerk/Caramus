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

  const { error } = await supabase
    .from("appointment_requests")
    .insert({ patient_id: user.id, preferred_times, message });

  if (error) return { fehler: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut." };
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

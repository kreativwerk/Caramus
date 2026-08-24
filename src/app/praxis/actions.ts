"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok?: boolean; fehler?: string | null; planId?: string };

async function therapeutClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, fehler: "Nicht angemeldet." };
  const { data: profil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profil?.role !== "therapist") return { supabase: null, fehler: "Keine Berechtigung." };
  return { supabase, fehler: null };
}

export async function anfrageBestaetigen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const anfrageId = String(formData.get("anfrage_id"));
  const patientId = String(formData.get("patient_id"));
  const startsAt = String(formData.get("starts_at"));
  const dauer = Number(formData.get("duration_min") || 60);
  const notiz = String(formData.get("notes") ?? "").trim() || null;
  const travel = String(formData.get("travel_note") ?? "").trim() || null;
  if (!startsAt) return { fehler: "Bitte Datum und Uhrzeit wählen." };

  const { data: patient } = await supabase
    .from("profiles")
    .select("street, zip, city")
    .eq("id", patientId)
    .single();
  const adresse = [patient?.street, [patient?.zip, patient?.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  const { error: e1 } = await supabase.from("appointments").insert({
    patient_id: patientId,
    starts_at: new Date(startsAt).toISOString(),
    duration_min: dauer,
    address: adresse || null,
    travel_note: travel,
    notes: notiz,
  });
  if (e1) return { fehler: "Der Termin konnte nicht angelegt werden." };

  const { error: e2 } = await supabase
    .from("appointment_requests")
    .update({ status: "confirmed", handled_at: new Date().toISOString() })
    .eq("id", anfrageId);
  if (e2) return { fehler: "Der Termin wurde angelegt, aber die Anfrage konnte nicht aktualisiert werden." };

  revalidatePath("/praxis/anfragen");
  revalidatePath("/praxis/termine");
  revalidatePath("/praxis");
  return { ok: true };
}

export async function anfrageVorschlagen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const anfrageId = String(formData.get("anfrage_id"));
  const proposal = String(formData.get("proposal") ?? "").trim();
  if (!proposal) return { fehler: "Bitte einen Alternativvorschlag eintragen." };

  const { error } = await supabase
    .from("appointment_requests")
    .update({ status: "proposed", proposal, handled_at: new Date().toISOString() })
    .eq("id", anfrageId);
  if (error) return { fehler: "Der Vorschlag konnte nicht gespeichert werden." };
  revalidatePath("/praxis/anfragen");
  return { ok: true };
}

export async function anfrageAblehnen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const { error } = await supabase
    .from("appointment_requests")
    .update({ status: "declined", handled_at: new Date().toISOString() })
    .eq("id", String(formData.get("anfrage_id")));
  if (error) return { fehler: "Die Anfrage konnte nicht aktualisiert werden." };
  revalidatePath("/praxis/anfragen");
  return { ok: true };
}

export async function terminAnlegen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const patientId = String(formData.get("patient_id"));
  const startsAt = String(formData.get("starts_at"));
  if (!patientId || !startsAt) return { fehler: "Bitte Patient sowie Datum und Uhrzeit wählen." };

  const { data: patient } = await supabase
    .from("profiles")
    .select("street, zip, city")
    .eq("id", patientId)
    .single();
  const adresse = [patient?.street, [patient?.zip, patient?.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  const { error } = await supabase.from("appointments").insert({
    patient_id: patientId,
    starts_at: new Date(startsAt).toISOString(),
    duration_min: Number(formData.get("duration_min") || 60),
    address: adresse || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  if (error) return { fehler: "Der Termin konnte nicht angelegt werden." };
  revalidatePath("/praxis/termine");
  revalidatePath("/praxis");
  return { ok: true };
}

export async function terminStatusSetzen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const { error } = await supabase
    .from("appointments")
    .update({ status: String(formData.get("status")) })
    .eq("id", String(formData.get("termin_id")));
  if (error) return { fehler: "Der Status konnte nicht geändert werden." };
  revalidatePath("/praxis/termine");
  revalidatePath("/praxis");
  return { ok: true };
}

/** „Ich mache mich auf den Weg" – startet die Live-Anfahrt für den Patienten. */
export async function fahrtStarten(formData: FormData): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const eta = Number(formData.get("eta_minutes") || 0);
  if (!eta || eta < 1 || eta > 240) return { fehler: "Bitte eine Fahrzeit zwischen 1 und 240 Minuten wählen." };

  const { error } = await supabase
    .from("appointments")
    .update({ enroute_at: new Date().toISOString(), eta_minutes: eta, arrived_at: null })
    .eq("id", String(formData.get("termin_id")));
  if (error) return { fehler: "Die Anfahrt konnte nicht gestartet werden." };

  revalidatePath("/praxis");
  revalidatePath("/praxis/termine");
  return { ok: true };
}

/** Ankunft melden – beendet die Live-Anzeige beim Patienten. */
export async function fahrtBeenden(formData: FormData): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const { error } = await supabase
    .from("appointments")
    .update({ arrived_at: new Date().toISOString() })
    .eq("id", String(formData.get("termin_id")));
  if (error) return { fehler: "Die Ankunft konnte nicht gemeldet werden." };

  revalidatePath("/praxis");
  revalidatePath("/praxis/termine");
  return { ok: true };
}

/** Anfahrt zurücknehmen (versehentlich gestartet). */
export async function fahrtAbbrechen(formData: FormData): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const { error } = await supabase
    .from("appointments")
    .update({ enroute_at: null, eta_minutes: null, arrived_at: null })
    .eq("id", String(formData.get("termin_id")));
  if (error) return { fehler: "Die Anfahrt konnte nicht zurückgenommen werden." };

  revalidatePath("/praxis");
  revalidatePath("/praxis/termine");
  return { ok: true };
}

export async function uebungSpeichern(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const id = String(formData.get("id") ?? "");
  const werte = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    media_url: String(formData.get("media_url") ?? "").trim() || null,
    media_type: (String(formData.get("media_type") ?? "image") || "image") as "image" | "video",
  };
  if (!werte.title) return { fehler: "Bitte einen Übungstitel eingeben." };

  const { error } = id
    ? await supabase.from("exercises").update(werte).eq("id", id)
    : await supabase.from("exercises").insert(werte);
  if (error) return { fehler: "Die Übung konnte nicht gespeichert werden." };
  revalidatePath("/praxis/uebungen");
  return { ok: true };
}

export async function uebungLoeschen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const { error } = await supabase.from("exercises").delete().eq("id", String(formData.get("id")));
  if (error)
    return { fehler: "Die Übung konnte nicht gelöscht werden (wird sie noch in einem Plan verwendet?)." };
  revalidatePath("/praxis/uebungen");
  return { ok: true };
}

export async function planSicherstellen(patientId: string): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const { data: vorhanden } = await supabase
    .from("training_plans")
    .select("id")
    .eq("patient_id", patientId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (vorhanden) return { ok: true, planId: vorhanden.id };

  const { data, error } = await supabase
    .from("training_plans")
    .insert({ patient_id: patientId })
    .select("id")
    .single();
  if (error) return { fehler: "Der Plan konnte nicht angelegt werden." };
  revalidatePath(`/praxis/patienten/${patientId}`);
  return { ok: true, planId: data.id };
}

export async function planItemHinzufuegen(formData: FormData): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const patientId = String(formData.get("patient_id"));
  const exerciseId = String(formData.get("exercise_id"));
  if (!exerciseId) return { fehler: "Bitte eine Übung auswählen." };

  const ergebnis = await planSicherstellen(patientId);
  if (!ergebnis.planId) return ergebnis;

  const { count } = await supabase
    .from("plan_items")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", ergebnis.planId!);

  const { error } = await supabase.from("plan_items").insert({
    plan_id: ergebnis.planId,
    exercise_id: exerciseId,
    sets: Number(formData.get("sets") || 3),
    reps: String(formData.get("reps") || "10").trim(),
    frequency: String(formData.get("frequency") ?? "").trim() || "täglich",
    instructions: String(formData.get("instructions") ?? "").trim() || null,
    position: (count ?? 0) + 1,
  });
  if (error) return { fehler: "Die Übung konnte nicht zum Plan hinzugefügt werden." };
  revalidatePath(`/praxis/patienten/${patientId}`);
  return { ok: true };
}

export async function planItemEntfernen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const { error } = await supabase
    .from("plan_items")
    .delete()
    .eq("id", String(formData.get("plan_item_id")));
  if (error) return { fehler: "Die Übung konnte nicht entfernt werden." };
  revalidatePath(`/praxis/patienten/${String(formData.get("patient_id"))}`);
  return { ok: true };
}

/** Bearbeitungsstand eines Patientendokuments setzen (Kapitel 04 des Protokolls). */
export async function dokumentStatusSetzen(formData: FormData): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const status = String(formData.get("status"));
  const erlaubt = ["eingegangen", "in_pruefung", "weitergeleitet", "unvollstaendig"];
  if (!erlaubt.includes(status)) return { fehler: "Unbekannter Status." };

  const { error } = await supabase
    .from("documents")
    .update({
      status,
      status_note: String(formData.get("status_note") ?? "").trim() || null,
      status_changed_at: new Date().toISOString(),
    })
    .eq("id", String(formData.get("id")));
  if (error) return { fehler: "Der Status konnte nicht gesetzt werden." };

  revalidatePath("/praxis/dokumente");
  revalidatePath("/praxis");
  return { ok: true };
}

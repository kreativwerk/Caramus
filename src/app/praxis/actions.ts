"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MELDUNG, nichtGeklappt } from "@/lib/meldungen";
import { adresseZuKoordinate, fahrzeitMinuten, fahrzeitVerfuegbar } from "@/lib/fahrzeit";
import { pushSenden } from "@/lib/push";
import { einladungAlsLink, einladungVerschicken } from "@/lib/einladung";
import { formatDateTime } from "@/lib/types";

export type ActionResult = {
  ok?: boolean;
  fehler?: string | null;
  planId?: string;
  link?: string | null;
  verschickt?: boolean;
};

async function therapeutClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, fehler: MELDUNG.abgemeldet };
  const { data: profil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profil?.role !== "therapist") return { supabase: null, fehler: MELDUNG.nurPraxis };
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
  if (!startsAt) return { fehler: "Bitte wählen Sie Datum und Uhrzeit." };

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
  if (e1) return { fehler: nichtGeklappt("Das Anlegen des Termins") };

  const { error: e2 } = await supabase
    .from("appointment_requests")
    .update({ status: "confirmed", handled_at: new Date().toISOString() })
    .eq("id", anfrageId);
  if (e2) return { fehler: "Der Termin steht, nur die Anfrage zeigt noch den alten Stand. Bitte laden Sie die Seite neu." };

  await pushSenden([patientId], {
    titel: "Ihr Termin ist bestätigt",
    text: `Hausbesuch am ${formatDateTime(new Date(startsAt).toISOString())} Uhr.`,
    ziel: "/app/termine",
    gruppe: "termin",
  });

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
  if (!proposal) return { fehler: "Bitte tragen Sie einen Alternativvorschlag ein." };

  const { error } = await supabase
    .from("appointment_requests")
    .update({ status: "proposed", proposal, handled_at: new Date().toISOString() })
    .eq("id", anfrageId);
  if (error) return { fehler: nichtGeklappt("Das Speichern des Vorschlags") };
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
  if (error) return { fehler: nichtGeklappt("Das Aktualisieren der Anfrage") };
  revalidatePath("/praxis/anfragen");
  return { ok: true };
}

export async function terminAnlegen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const patientId = String(formData.get("patient_id"));
  const startsAt = String(formData.get("starts_at"));
  if (!patientId || !startsAt) return { fehler: "Bitte wählen Sie den Patienten sowie Datum und Uhrzeit." };

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
  if (error) return { fehler: nichtGeklappt("Das Anlegen des Termins") };

  await pushSenden([patientId], {
    titel: "Neuer Termin",
    text: `Hausbesuch am ${formatDateTime(new Date(startsAt).toISOString())} Uhr.`,
    ziel: "/app/termine",
    gruppe: "termin",
  });

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
  if (error) return { fehler: nichtGeklappt("Das Ändern des Status") };
  revalidatePath("/praxis/termine");
  revalidatePath("/praxis");
  return { ok: true };
}

/**
 * Fahrzeit-Vorschlag mit aktueller Verkehrslage. Wird einmalig beim Öffnen der
 * Auswahl geholt und ist rein optional: Ohne konfigurierten Anbieter oder bei
 * einem Fehler kommt `null` zurück und der Therapeut wählt wie bisher manuell.
 */
export async function fahrzeitVorschlag(
  terminId: string,
  start?: { lat: number; lng: number }
): Promise<{ minuten: number | null; verfuegbar: boolean }> {
  const { supabase } = await therapeutClient();
  if (!supabase || !fahrzeitVerfuegbar()) return { minuten: null, verfuegbar: false };

  const { data: termin } = await supabase
    .from("appointments")
    .select("patient_id")
    .eq("id", terminId)
    .maybeSingle();
  if (!termin) return { minuten: null, verfuegbar: true };

  const { data: patient } = await supabase
    .from("profiles")
    .select("street, zip, city, lat, lng")
    .eq("id", termin.patient_id)
    .maybeSingle();
  if (!patient) return { minuten: null, verfuegbar: true };

  // Ziel: gespeicherte Koordinaten nutzen, sonst einmalig ermitteln und merken
  let ziel = patient.lat != null && patient.lng != null
    ? { lat: patient.lat as number, lng: patient.lng as number }
    : null;
  if (!ziel) {
    const adresse = [patient.street, [patient.zip, patient.city].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", ");
    ziel = await adresseZuKoordinate(adresse);
    if (ziel) {
      await supabase
        .from("profiles")
        .update({ lat: ziel.lat, lng: ziel.lng, geo_updated_at: new Date().toISOString() })
        .eq("id", termin.patient_id);
    }
  }
  if (!ziel) return { minuten: null, verfuegbar: true };

  // Start: Position des Geräts, sonst Adresse der Praxis aus dem eigenen Profil
  let von = start ?? null;
  if (!von) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: ich } = await supabase
      .from("profiles")
      .select("street, zip, city, lat, lng")
      .eq("id", user!.id)
      .maybeSingle();
    if (ich?.lat != null && ich?.lng != null) {
      von = { lat: ich.lat as number, lng: ich.lng as number };
    } else if (ich?.street) {
      const eigene = [ich.street, [ich.zip, ich.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ");
      von = await adresseZuKoordinate(eigene);
      if (von) {
        await supabase
          .from("profiles")
          .update({ lat: von.lat, lng: von.lng, geo_updated_at: new Date().toISOString() })
          .eq("id", user!.id);
      }
    }
  }
  if (!von) return { minuten: null, verfuegbar: true };

  const minuten = await fahrzeitMinuten(von, ziel);
  return { minuten, verfuegbar: true };
}

/** Verspätung melden: verlängert die laufende Anfahrt um die gewählten Minuten. */
export async function verspaetungMelden(formData: FormData): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const zusatz = Number(formData.get("zusatz_minuten") || 0);
  if (!zusatz || zusatz < 1 || zusatz > 120) return { fehler: "Bitte wählen Sie zwischen 1 und 120 Minuten." };

  const terminId = String(formData.get("termin_id"));
  const { data: termin } = await supabase
    .from("appointments")
    .select("eta_minutes, enroute_at, patient_id")
    .eq("id", terminId)
    .maybeSingle();
  if (!termin?.enroute_at || !termin.eta_minutes) return { fehler: "Für diesen Termin ist gerade keine Anfahrt gestartet." };

  const { error } = await supabase
    .from("appointments")
    .update({
      eta_minutes: Math.min(240, termin.eta_minutes + zusatz),
      eta_updated_at: new Date().toISOString(),
      delay_note: String(formData.get("grund") ?? "").trim() || null,
    })
    .eq("id", terminId);
  if (error) return { fehler: nichtGeklappt("Das Melden der Verspätung") };

  const grund = String(formData.get("grund") ?? "").trim();
  await pushSenden([termin.patient_id], {
    titel: "Es dauert etwas länger",
    text: grund
      ? `${grund} – die neue Ankunftszeit steht in der App.`
      : "Die neue Ankunftszeit steht in der App.",
    ziel: "/app",
    gruppe: "anfahrt",
  });

  revalidatePath("/praxis");
  revalidatePath("/praxis/termine");
  return { ok: true };
}

/** „Ich mache mich auf den Weg" – startet die Live-Anfahrt für den Patienten. */
export async function fahrtStarten(formData: FormData): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const eta = Number(formData.get("eta_minutes") || 0);
  if (!eta || eta < 1 || eta > 240) return { fehler: "Bitte wählen Sie eine Fahrzeit zwischen 1 und 240 Minuten." };

  const { error } = await supabase
    .from("appointments")
    .update({
      enroute_at: new Date().toISOString(),
      eta_minutes: eta,
      arrived_at: null,
      eta_updated_at: null,
      delay_note: null,
      eta_quelle: String(formData.get("quelle") ?? "manuell") === "verkehr" ? "verkehr" : "manuell",
    })
    .eq("id", String(formData.get("termin_id")));
  if (error) return { fehler: nichtGeklappt("Das Starten der Anfahrt") };

  const { data: unterwegs } = await supabase
    .from("appointments")
    .select("patient_id")
    .eq("id", String(formData.get("termin_id")))
    .maybeSingle();
  if (unterwegs) {
    await pushSenden([unterwegs.patient_id], {
      titel: "Ihr Therapeut ist unterwegs",
      text: `Ankunft in etwa ${eta} Minuten.`,
      ziel: "/app",
      gruppe: "anfahrt",
    });
  }

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
  if (error) return { fehler: nichtGeklappt("Das Melden der Ankunft") };

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
    .update({
      enroute_at: null,
      eta_minutes: null,
      arrived_at: null,
      eta_updated_at: null,
      delay_note: null,
    })
    .eq("id", String(formData.get("termin_id")));
  if (error) return { fehler: nichtGeklappt("Das Zurücknehmen der Anfahrt") };

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
  if (!werte.title) return { fehler: "Bitte geben Sie der Übung einen Namen." };

  const { error } = id
    ? await supabase.from("exercises").update(werte).eq("id", id)
    : await supabase.from("exercises").insert(werte);
  if (error) return { fehler: nichtGeklappt("Das Speichern der Übung") };
  revalidatePath("/praxis/uebungen");
  return { ok: true };
}

export async function uebungLoeschen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const { error } = await supabase.from("exercises").delete().eq("id", String(formData.get("id")));
  if (error)
    return { fehler: "Diese Übung steht noch in mindestens einem Trainingsplan. Bitte nehmen Sie sie dort zuerst heraus." };
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
  if (error) return { fehler: nichtGeklappt("Das Anlegen des Plans") };
  revalidatePath(`/praxis/patienten/${patientId}`);
  return { ok: true, planId: data.id };
}

export async function planItemHinzufuegen(formData: FormData): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const patientId = String(formData.get("patient_id"));
  const exerciseId = String(formData.get("exercise_id"));
  if (!exerciseId) return { fehler: "Bitte wählen Sie eine Übung aus." };

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
  if (error) return { fehler: nichtGeklappt("Das Hinzufügen der Übung") };
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
  if (error) return { fehler: nichtGeklappt("Das Entfernen der Übung") };
  revalidatePath(`/praxis/patienten/${String(formData.get("patient_id"))}`);
  return { ok: true };
}

/** Bearbeitungsstand eines Patientendokuments setzen (Kapitel 04 des Protokolls). */
export async function dokumentStatusSetzen(formData: FormData): Promise<ActionResult> {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const status = String(formData.get("status"));
  const erlaubt = ["eingegangen", "in_pruefung", "weitergeleitet", "unvollstaendig"];
  if (!erlaubt.includes(status)) return { fehler: "Diesen Status gibt es nicht. Bitte laden Sie die Seite neu." };

  const { error } = await supabase
    .from("documents")
    .update({
      status,
      status_note: String(formData.get("status_note") ?? "").trim() || null,
      status_changed_at: new Date().toISOString(),
    })
    .eq("id", String(formData.get("id")));
  if (error) return { fehler: nichtGeklappt("Das Setzen des Status") };

  revalidatePath("/praxis/dokumente");
  revalidatePath("/praxis");
  return { ok: true };
}

/**
 * Rückmeldung aus der Praxis: Charles meldet Fehler, Wünsche und Fragen
 * direkt aus der App – mit Screenshots, damit nichts erklärt werden muss.
 * Die Bilder liegen schon im geschützten Speicher, hier werden sie nur verknüpft.
 */
export async function feedbackSenden(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { fehler: "Bitte geben Sie der Rückmeldung eine kurze Überschrift." };

  const art = String(formData.get("art") ?? "fehler");
  if (!["fehler", "wunsch", "frage"].includes(art)) {
    return { fehler: "Bitte wählen Sie aus, worum es geht." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: eintrag, error } = await supabase
    .from("feedback")
    .insert({
      author_id: user!.id,
      title: title.slice(0, 200),
      body: String(formData.get("body") ?? "").trim() || null,
      art,
    })
    .select("id")
    .single();
  if (error || !eintrag) return { fehler: nichtGeklappt("Das Senden Ihrer Rückmeldung") };

  try {
    const bilder = JSON.parse(String(formData.get("bilder") ?? "[]")) as {
      file_path: string;
      file_name: string;
      content_type?: string;
      size_bytes?: number;
    }[];
    if (Array.isArray(bilder) && bilder.length > 0) {
      await supabase.from("feedback_attachments").insert(
        bilder.slice(0, 5).map((b) => ({
          feedback_id: eintrag.id,
          file_path: String(b.file_path),
          file_name: String(b.file_name).slice(0, 200),
          content_type: b.content_type ? String(b.content_type) : null,
          size_bytes: typeof b.size_bytes === "number" ? b.size_bytes : null,
        }))
      );
    }
  } catch {
    // Die Rückmeldung zählt auch ohne Bild – lieber unvollständig als verloren
  }

  revalidatePath("/praxis/feedback");
  return { ok: true };
}

/** Charles hakt eine erledigte Sache selbst ab oder nimmt sie zurück. */
export async function feedbackStatusSetzen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const status = String(formData.get("status"));
  if (!["neu", "in_arbeit", "erledigt", "zurueckgestellt"].includes(status)) {
    return { fehler: "Diesen Status gibt es nicht. Bitte laden Sie die Seite neu." };
  }

  const { error } = await supabase
    .from("feedback")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", String(formData.get("id")));
  if (error) return { fehler: nichtGeklappt("Das Setzen des Status") };

  revalidatePath("/praxis/feedback");
  return { ok: true };
}

/** Rückmeldung wieder zurückziehen, solange noch niemand daran gearbeitet hat. */
export async function feedbackLoeschen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const id = String(formData.get("id"));
  const { data: anhaenge } = await supabase
    .from("feedback_attachments")
    .select("file_path")
    .eq("feedback_id", id);
  if (anhaenge?.length) {
    await supabase.storage.from("feedback-media").remove(anhaenge.map((a) => a.file_path));
  }

  const { error } = await supabase.from("feedback").delete().eq("id", id);
  if (error) return { fehler: nichtGeklappt("Das Zurückziehen der Rückmeldung") };

  revalidatePath("/praxis/feedback");
  return { ok: true };
}

/**
 * Neue Patientin oder neuen Patienten einladen – wahlweise per E-Mail oder
 * als Link zum Weitergeben. Der Zugang entsteht in beiden Fällen sofort; die
 * Person vergibt beim ersten Öffnen ihr Passwort.
 */
export async function patientEinladen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const alsLink = String(formData.get("weg") ?? "mail") === "link";

  if (!name) return { fehler: "Bitte tragen Sie Vor- und Nachname ein." };
  if (!email || !email.includes("@")) return { fehler: "Bitte tragen Sie eine E-Mail-Adresse ein." };

  const ergebnis = alsLink
    ? await einladungAlsLink(email, name.slice(0, 120))
    : await einladungVerschicken(email, name.slice(0, 120));

  if (!ergebnis.ok) return { fehler: ergebnis.fehler };

  revalidatePath("/praxis/patienten");
  return { ok: true, link: ergebnis.link ?? null, verschickt: ergebnis.verschickt };
}

/** Textbaustein anlegen – Überschrift und Inhalt, mehr braucht es nicht. */
export async function bausteinSpeichern(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) return { fehler: "Bitte geben Sie dem Baustein eine Überschrift." };
  if (!body) return { fehler: "Bitte tragen Sie ein, was kopiert werden soll." };

  const id = String(formData.get("id") ?? "").trim();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = id
    ? await supabase
        .from("snippets")
        .update({ title: title.slice(0, 120), body, updated_at: new Date().toISOString() })
        .eq("id", id)
    : await supabase
        .from("snippets")
        .insert({ author_id: user!.id, title: title.slice(0, 120), body });

  if (error) return { fehler: nichtGeklappt("Das Speichern des Bausteins") };

  revalidatePath("/praxis/bausteine");
  revalidatePath("/praxis");
  return { ok: true };
}

/** Baustein entfernen. */
export async function bausteinLoeschen(formData: FormData) {
  const { supabase, fehler } = await therapeutClient();
  if (!supabase) return { fehler };

  const { error } = await supabase.from("snippets").delete().eq("id", String(formData.get("id")));
  if (error) return { fehler: nichtGeklappt("Das Entfernen des Bausteins") };

  revalidatePath("/praxis/bausteine");
  revalidatePath("/praxis");
  return { ok: true };
}

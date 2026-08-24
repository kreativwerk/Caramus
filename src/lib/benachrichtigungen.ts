import type { SupabaseClient } from "@supabase/supabase-js";
import { DOKUMENT_STATUS, dokumentArtLabel, formatDateTime } from "@/lib/types";
import type { DocumentKind, DocumentStatus } from "@/lib/types";

export type Benachrichtigung = {
  id: string;
  href: string;
  titel: string;
  text: string;
  zeit?: string;
};

/** Hinweise für den Patienten: neue Nachrichten, Terminantworten, Dokumentstatus. */
export async function patientenBenachrichtigungen(
  supabase: SupabaseClient,
  patientId: string
): Promise<Benachrichtigung[]> {
  const [{ data: nachrichten }, { data: anfragen }, { data: dokumente }] = await Promise.all([
    supabase
      .from("messages")
      .select("id, body, created_at")
      .eq("patient_id", patientId)
      .neq("sender_id", patientId)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("appointment_requests")
      .select("id, status, proposal, handled_at")
      .eq("patient_id", patientId)
      .in("status", ["proposed", "confirmed", "declined"])
      .not("handled_at", "is", null)
      .order("handled_at", { ascending: false })
      .limit(3),
    supabase
      .from("documents")
      .select("id, kind, status, status_note, status_changed_at")
      .eq("patient_id", patientId)
      .in("status", ["unvollstaendig", "weitergeleitet"])
      .not("status_changed_at", "is", null)
      .order("status_changed_at", { ascending: false })
      .limit(5),
  ]);

  const liste: Benachrichtigung[] = [];

  for (const m of nachrichten ?? []) {
    liste.push({
      id: `msg-${m.id}`,
      href: "/app/chat",
      titel: "Neue Nachricht",
      text: String(m.body).slice(0, 90),
      zeit: formatDateTime(m.created_at),
    });
  }

  for (const a of anfragen ?? []) {
    if (a.status === "proposed") {
      liste.push({
        id: `req-${a.id}`,
        href: "/app/termine",
        titel: "Terminvorschlag",
        text: a.proposal ? `Vorschlag: ${a.proposal}` : "Ihr Therapeut hat einen anderen Termin vorgeschlagen.",
        zeit: a.handled_at ? formatDateTime(a.handled_at) : undefined,
      });
    } else if (a.status === "confirmed") {
      liste.push({
        id: `req-${a.id}`,
        href: "/app/termine",
        titel: "Termin bestätigt",
        text: "Ihr Hausbesuch wurde bestätigt.",
        zeit: a.handled_at ? formatDateTime(a.handled_at) : undefined,
      });
    } else {
      liste.push({
        id: `req-${a.id}`,
        href: "/app/termine",
        titel: "Termin nicht möglich",
        text: "Ihre Anfrage konnte leider nicht angenommen werden.",
        zeit: a.handled_at ? formatDateTime(a.handled_at) : undefined,
      });
    }
  }

  for (const d of dokumente ?? []) {
    liste.push({
      id: `doc-${d.id}`,
      href: "/app/dokumente",
      titel: `${dokumentArtLabel(d.kind as DocumentKind)}: ${DOKUMENT_STATUS[d.status as DocumentStatus].label}`,
      text: d.status_note ?? DOKUMENT_STATUS[d.status as DocumentStatus].patientText,
      zeit: d.status_changed_at ? formatDateTime(d.status_changed_at) : undefined,
    });
  }

  return liste.slice(0, 8);
}

/** Hinweise für die Praxis: offene Anfragen, neue Unterlagen, Patientennachrichten. */
export async function praxisBenachrichtigungen(
  supabase: SupabaseClient
): Promise<Benachrichtigung[]> {
  const [{ data: anfragen }, { data: dokumente }, { data: nachrichten }] = await Promise.all([
    supabase
      .from("appointment_requests")
      .select("id, preferred_times, created_at, profiles!appointment_requests_patient_id_fkey(full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("documents")
      .select("id, kind, created_at, profiles!documents_patient_id_fkey(full_name)")
      .eq("status", "eingegangen")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("messages")
      .select("id, body, patient_id, sender_id, created_at")
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const liste: Benachrichtigung[] = [];

  for (const a of anfragen ?? []) {
    const name = (a.profiles as { full_name?: string } | null)?.full_name ?? "Patient";
    liste.push({
      id: `req-${a.id}`,
      href: "/praxis/anfragen",
      titel: "Neue Terminanfrage",
      text: `${name}: ${String(a.preferred_times).slice(0, 70)}`,
      zeit: formatDateTime(a.created_at),
    });
  }

  for (const d of dokumente ?? []) {
    const name = (d.profiles as { full_name?: string } | null)?.full_name ?? "Patient";
    liste.push({
      id: `doc-${d.id}`,
      href: "/praxis/dokumente",
      titel: "Neue Unterlage",
      text: `${name}: ${dokumentArtLabel(d.kind as DocumentKind)}`,
      zeit: formatDateTime(d.created_at),
    });
  }

  // Nur Nachrichten, die der Patient geschrieben hat
  for (const m of (nachrichten ?? []).filter((m) => m.sender_id === m.patient_id).slice(0, 5)) {
    liste.push({
      id: `msg-${m.id}`,
      href: `/praxis/chat/${m.patient_id}`,
      titel: "Neue Nachricht",
      text: String(m.body).slice(0, 90),
      zeit: formatDateTime(m.created_at),
    });
  }

  return liste.slice(0, 8);
}

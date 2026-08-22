import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveDocumentUrl } from "@/lib/media";
import type { Exercise, PatientDocument, PlanItem } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/types";
import { PlanEditor } from "./plan-editor";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!patient) notFound();

  const [{ data: plan }, { data: uebungen }, { data: termine }, { data: feedback }, { data: dokumente }] =
    await Promise.all([
      supabase
        .from("training_plans")
        .select("*, plan_items(*, exercises(*))")
        .eq("patient_id", id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle(),
      supabase.from("exercises").select("*").order("title"),
      supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", id)
        .order("starts_at", { ascending: false })
        .limit(8),
      supabase
        .from("plan_feedback")
        .select("*, plan_items(exercises(title))")
        .eq("patient_id", id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("documents")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

  const dokumentLinks = await Promise.all(
    ((dokumente ?? []) as PatientDocument[]).map(async (d) => ({
      dokument: d,
      url: await resolveDocumentUrl(supabase, d.file_path),
    }))
  );

  const items = ((plan?.plan_items ?? []) as PlanItem[]).sort((a, b) => a.position - b.position);
  const adresse = [patient.street, [patient.zip, patient.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/praxis/patienten" className="text-sm font-semibold text-teal-600 hover:underline">
          ← Alle Patienten
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy-800">{patient.full_name}</h1>
        <p className="mt-1 text-navy-600/80">
          📍 {adresse || "Keine Adresse hinterlegt"}
          {patient.phone ? ` · 📞 ${patient.phone}` : ""}
        </p>
        <div className="mt-3 flex gap-2">
          <Link href={`/praxis/chat/${patient.id}`} className="btn-secondary">Nachricht schreiben</Link>
        </div>
      </div>

      <PlanEditor patientId={patient.id} items={items} uebungen={(uebungen ?? []) as Exercise[]} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <p className="text-lg font-bold text-navy-800">Letzte Rückmeldungen</p>
          {feedback?.length ? (
            <ul className="mt-3 space-y-2">
              {feedback.map((f) => (
                <li key={f.id} className="rounded-lg bg-mist-50 px-4 py-3 text-sm">
                  <p className="font-semibold text-navy-800">
                    {formatDate(f.on_date)} ·{" "}
                    {(f.plan_items as { exercises?: { title?: string } })?.exercises?.title}
                  </p>
                  <p className="text-navy-600/80">
                    {f.completed ? "✓ erledigt" : "nicht erledigt"}
                    {f.pain_level !== null ? ` · Schmerz ${f.pain_level}/10` : ""}
                  </p>
                  {f.note && <p className="mt-1 text-navy-600/90">„{f.note}“</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-navy-600/80">Noch keine Rückmeldungen.</p>
          )}
        </section>

        <section className="card">
          <p className="text-lg font-bold text-navy-800">Termine</p>
          {termine?.length ? (
            <ul className="mt-3 space-y-2">
              {termine.map((t) => (
                <li key={t.id} className="flex justify-between rounded-lg bg-mist-50 px-4 py-3 text-sm">
                  <span className="font-medium text-navy-800">{formatDateTime(t.starts_at)}</span>
                  <span className="text-navy-600/80">{t.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-navy-600/80">Noch keine Termine.</p>
          )}
        </section>
      </div>

      <section className="card">
        <p className="text-lg font-bold text-navy-800">Dokumente</p>
        <p className="text-sm text-navy-600/80">
          Vom Patienten hochgeladene Rezepte, Überweisungen und Berichte.
        </p>
        {dokumentLinks.length ? (
          <ul className="mt-3 space-y-2">
            {dokumentLinks.map(({ dokument, url }) => (
              <li key={dokument.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-mist-50 px-4 py-3 text-sm">
                <span className="font-medium text-navy-800">📄 {dokument.file_name}</span>
                <span className="flex items-center gap-3">
                  <span className="text-navy-600/70">{formatDate(dokument.created_at)}</span>
                  {url && (
                    <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-teal-600 hover:underline">
                      Öffnen
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-navy-600/80">Noch keine Dokumente hochgeladen.</p>
        )}
      </section>

      {patient.notes && (
        <section className="card">
          <p className="text-lg font-bold text-navy-800">Interne Notizen</p>
          <p className="mt-2 whitespace-pre-wrap text-navy-600/90">{patient.notes}</p>
        </section>
      )}
    </div>
  );
}

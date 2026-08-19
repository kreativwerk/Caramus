import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/types";
import { AnfrageForm } from "./anfrage-form";

const statusText: Record<string, { label: string; klasse: string }> = {
  pending: { label: "Wartet auf Bestätigung", klasse: "bg-amber-50 text-amber-700" },
  proposed: { label: "Neuer Vorschlag für Sie", klasse: "bg-teal-50 text-teal-600" },
  confirmed: { label: "Bestätigt", klasse: "bg-teal-50 text-teal-600" },
  declined: { label: "Leider nicht möglich", klasse: "bg-red-50 text-red-700" },
};

export default async function TerminePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const jetzt = new Date().toISOString();
  const [{ data: kommende }, { data: vergangene }, { data: anfragen }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", user!.id)
      .gte("starts_at", jetzt)
      .neq("status", "abgesagt")
      .order("starts_at"),
    supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", user!.id)
      .lt("starts_at", jetzt)
      .order("starts_at", { ascending: false })
      .limit(5),
    supabase
      .from("appointment_requests")
      .select("*")
      .eq("patient_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Termine</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Ihre <span className="text-teal-500">Hausbesuche</span>.
        </h1>
      </div>

      <AnfrageForm />

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy-800">Kommende Termine</h2>
        {kommende?.length ? (
          <div className="space-y-3">
            {kommende.map((t) => (
              <div key={t.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-navy-800">{formatDateTime(t.starts_at)}</p>
                  <p className="text-sm text-navy-600/80">
                    Bei Ihnen zu Hause{t.address ? ` – ${t.address}` : ""} · ca. {t.duration_min} Minuten
                  </p>
                  {t.notes && <p className="mt-1 text-sm text-navy-600/80">Hinweis: {t.notes}</p>}
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-600">
                  Bestätigt
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="card text-navy-600/80">Aktuell sind keine Termine geplant.</p>
        )}
      </section>

      {anfragen?.length ? (
        <section>
          <h2 className="mb-3 text-lg font-bold text-navy-800">Ihre Anfragen</h2>
          <div className="space-y-3">
            {anfragen.map((a) => {
              const s = statusText[a.status] ?? statusText.pending;
              return (
                <div key={a.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="whitespace-pre-wrap font-medium text-navy-800">{a.preferred_times}</p>
                      {a.message && <p className="mt-1 text-sm text-navy-600/80">{a.message}</p>}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${s.klasse}`}>{s.label}</span>
                  </div>
                  {a.status === "proposed" && a.proposal && (
                    <p className="mt-3 rounded-lg bg-teal-50 px-4 py-3 text-sm text-navy-800">
                      💬 Vorschlag Ihres Therapeuten: <strong>{a.proposal}</strong> – bitte antworten
                      Sie kurz über die Nachrichten.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {vergangene?.length ? (
        <section>
          <h2 className="mb-3 text-lg font-bold text-navy-800">Vergangene Termine</h2>
          <div className="card divide-y divide-mist-100">
            {vergangene.map((t) => (
              <p key={t.id} className="flex justify-between py-2.5 text-sm text-navy-600/80">
                <span>{formatDateTime(t.starts_at)}</span>
                <span>{t.status === "abgesagt" ? "Abgesagt" : "Stattgefunden"}</span>
              </p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

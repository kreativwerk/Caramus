import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, formatTime } from "@/lib/types";
import { NeuerTerminForm, TerminStatusButtons } from "./termin-formulare";
import { MIcon } from "@/components/m-icon";

export default async function PraxisTerminePage() {
  const supabase = await createClient();

  const [{ data: termine }, { data: patienten }, { data: abgesagt }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, profiles!appointments_patient_id_fkey(full_name)")
      // eslint-disable-next-line react-hooks/purity -- Server Component, läuft pro Request
      .gte("starts_at", new Date(Date.now() - 86400000).toISOString())
      .eq("status", "geplant")
      .order("starts_at")
      .limit(100),
    supabase.from("profiles").select("id, full_name").eq("role", "patient").order("full_name"),
    // Absagen durch Patienten der letzten zwei Wochen – die soll Charles
    // sehen, sonst verschwindet ein Termin einfach aus dem Plan.
    supabase
      .from("appointments")
      .select("*, profiles!appointments_patient_id_fkey(full_name)")
      .eq("status", "abgesagt")
      .eq("abgesagt_von", "patient")
      // eslint-disable-next-line react-hooks/purity -- Server Component, läuft pro Request
      .gte("abgesagt_am", new Date(Date.now() - 14 * 86400000).toISOString())
      .order("abgesagt_am", { ascending: false })
      .limit(20),
  ]);

  // Nach Tag gruppieren
  const gruppen = new Map<string, NonNullable<typeof termine>>();
  for (const t of termine ?? []) {
    const tag = formatDate(t.starts_at);
    if (!gruppen.has(tag)) gruppen.set(tag, []);
    gruppen.get(tag)!.push(t);
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Termine</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Geplante <span className="text-teal-500">Hausbesuche</span>.
        </h1>
      </div>

      <NeuerTerminForm patienten={patienten ?? []} />

      {abgesagt?.length ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-amber-900">
            <MIcon name="uhr" /> Von Patienten abgesagt
          </h2>
          <ul className="mt-3 divide-y divide-amber-200/70">
            {abgesagt.map((t) => (
              <li key={t.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                <span className="font-semibold text-navy-800">
                  {formatDateTime(t.starts_at)} · {(t.profiles as { full_name?: string })?.full_name}
                </span>
                <span className="text-sm text-amber-900/80">
                  abgesagt {t.abgesagt_am ? formatDateTime(t.abgesagt_am) : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-900/70">
            Die Plätze sind wieder frei und können neu gebucht werden.
          </p>
        </section>
      ) : null}

      {gruppen.size === 0 && <p className="card text-navy-600/80">Keine geplanten Termine.</p>}

      {[...gruppen.entries()].map(([tag, liste]) => (
        <section key={tag}>
          <h2 className="mb-3 text-lg font-bold text-navy-800">{tag}</h2>
          <div className="space-y-3">
            {liste.map((t) => (
              <div key={t.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-navy-800">
                    {formatTime(t.starts_at)} Uhr · {(t.profiles as { full_name?: string })?.full_name}
                  </p>
                  <p className="text-sm text-navy-600/80">
                    <MIcon name="ort" className="mr-1 text-navy-600/70" />{t.address ?? "Adresse fehlt"} · {t.duration_min} Min.
                  </p>
                  {t.notes && (
                <p className="flex items-center gap-1.5 text-sm text-navy-600/80">
                  <MIcon name="notiz" /> {t.notes}
                </p>
              )}
                </div>
                <TerminStatusButtons terminId={t.id} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

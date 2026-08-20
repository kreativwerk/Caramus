import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/types";
import { NeuerTerminForm, TerminStatusButtons } from "./termin-formulare";

export default async function PraxisTerminePage() {
  const supabase = await createClient();

  const [{ data: termine }, { data: patienten }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, profiles!appointments_patient_id_fkey(full_name)")
      // eslint-disable-next-line react-hooks/purity -- Server Component, läuft pro Request
      .gte("starts_at", new Date(Date.now() - 86400000).toISOString())
      .eq("status", "geplant")
      .order("starts_at")
      .limit(100),
    supabase.from("profiles").select("id, full_name").eq("role", "patient").order("full_name"),
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
                    📍 {t.address ?? "Adresse fehlt"} · {t.duration_min} Min.
                  </p>
                  {t.notes && <p className="text-sm text-navy-600/80">📝 {t.notes}</p>}
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

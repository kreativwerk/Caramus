import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTime } from "@/lib/types";

export default async function PraxisStart() {
  const supabase = await createClient();

  const heuteStart = new Date();
  heuteStart.setHours(0, 0, 0, 0);
  const heuteEnde = new Date();
  heuteEnde.setHours(23, 59, 59, 999);

  const [{ count: offeneAnfragen }, { data: heutigeTermine }, { count: patienten }, { data: ungelesene }] =
    await Promise.all([
      supabase
        .from("appointment_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("appointments")
        .select("*, profiles!appointments_patient_id_fkey(full_name)")
        .gte("starts_at", heuteStart.toISOString())
        .lte("starts_at", heuteEnde.toISOString())
        .eq("status", "geplant")
        .order("starts_at"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "patient"),
      supabase.from("messages").select("id, patient_id, sender_id, read_at").is("read_at", null),
    ]);

  const ungeleseneFremde = (ungelesene ?? []).filter((m) => m.sender_id === m.patient_id).length;

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Praxisbereich</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Guten Tag. Ihre <span className="text-teal-500">Tagesübersicht</span>.
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/praxis/anfragen" className="card transition hover:border-teal-500">
          <p className="text-4xl font-bold text-teal-500">{offeneAnfragen ?? 0}</p>
          <p className="mt-1 font-semibold text-navy-800">Offene Terminanfragen</p>
        </Link>
        <Link href="/praxis/chat" className="card transition hover:border-teal-500">
          <p className="text-4xl font-bold text-teal-500">{ungeleseneFremde}</p>
          <p className="mt-1 font-semibold text-navy-800">Ungelesene Nachrichten</p>
        </Link>
        <Link href="/praxis/patienten" className="card transition hover:border-teal-500">
          <p className="text-4xl font-bold text-teal-500">{patienten ?? 0}</p>
          <p className="mt-1 font-semibold text-navy-800">Patientinnen &amp; Patienten</p>
        </Link>
      </div>

      <section className="card bg-navy-900 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-400">
          Ihre Tour heute
        </p>
        {heutigeTermine?.length ? (
          <ol className="mt-4 space-y-3">
            {heutigeTermine.map((t, i) => (
              <li key={t.id} className="flex items-start gap-4 rounded-xl bg-white/5 px-4 py-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500 font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">
                    {formatTime(t.starts_at)} Uhr · {(t.profiles as { full_name?: string })?.full_name}
                  </p>
                  <p className="text-sm text-white/70">
                    {t.address ?? "Adresse fehlt – bitte im Patientenprofil ergänzen"} · {t.duration_min} Min.
                  </p>
                  {t.travel_note && <p className="text-sm text-teal-400">🚗 {t.travel_note}</p>}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-white/70">Heute stehen keine Hausbesuche an.</p>
        )}
        <Link href="/praxis/termine" className="btn-primary mt-5">Alle Termine</Link>
      </section>
    </div>
  );
}

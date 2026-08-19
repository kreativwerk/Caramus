import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/types";

export default async function PatientStart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: termin }, { data: plan }, { count: ungelesen }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, street").eq("id", user!.id).single(),
      supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", user!.id)
        .eq("status", "geplant")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("training_plans")
        .select("id, title, plan_items(id)")
        .eq("patient_id", user!.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", user!.id)
        .neq("sender_id", user!.id)
        .is("read_at", null),
    ]);

  const vorname = (profile?.full_name ?? "").split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Ihre Übersicht</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Guten Tag{vorname ? `, ${vorname}` : ""}. 👋
        </h1>
        <p className="mt-1 text-navy-600/80">Schön, dass Sie da sind. Das steht als Nächstes an:</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card sm:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
            Nächster Hausbesuch
          </p>
          {termin ? (
            <>
              <p className="mt-2 text-2xl font-bold text-navy-800">{formatDateTime(termin.starts_at)}</p>
              <p className="mt-1 text-navy-600/80">
                Bei Ihnen zu Hause{termin.address ? ` – ${termin.address}` : ""} · ca. {termin.duration_min} Minuten
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-lg font-semibold text-navy-800">Aktuell ist kein Termin geplant.</p>
              <p className="mt-1 text-navy-600/80">Fragen Sie einfach Ihren nächsten Wunschtermin an.</p>
            </>
          )}
          <Link href="/app/termine" className="btn-primary mt-4">
            {termin ? "Termine ansehen" : "Termin anfragen"}
          </Link>
        </div>

        <div className="card">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Ihr Training</p>
          {plan ? (
            <p className="mt-2 font-semibold text-navy-800">
              „{plan.title}“ mit {plan.plan_items?.length ?? 0} Übungen wartet auf Sie.
            </p>
          ) : (
            <p className="mt-2 text-navy-600/80">
              Ihr Trainingsplan wird gerade vorbereitet – Ihr Therapeut stellt ihn beim nächsten
              Besuch mit Ihnen zusammen.
            </p>
          )}
          <Link href="/app/plan" className="btn-secondary mt-4">Zum Trainingsplan</Link>
        </div>

        <div className="card">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Nachrichten</p>
          <p className="mt-2 font-semibold text-navy-800">
            {ungelesen ? `${ungelesen} neue Nachricht${ungelesen === 1 ? "" : "en"}` : "Keine neuen Nachrichten"}
          </p>
          <p className="mt-1 text-sm text-navy-600/80">Ihr direkter Draht zu Ihrem Therapeuten.</p>
          <Link href="/app/chat" className="btn-secondary mt-4">Zu den Nachrichten</Link>
        </div>
      </div>

      {!profile?.street && (
        <div className="card border-teal-500/40 bg-teal-50">
          <p className="font-semibold text-navy-800">📍 Ihre Adresse fehlt noch</p>
          <p className="mt-1 text-sm text-navy-600/90">
            Damit Ihr Therapeut zu Ihnen nach Hause kommen kann, hinterlegen Sie bitte einmalig Ihre
            Anschrift im Profil.
          </p>
          <Link href="/app/profil" className="btn-primary mt-3">Adresse hinterlegen</Link>
        </div>
      )}
    </div>
  );
}

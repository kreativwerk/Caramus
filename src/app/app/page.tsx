import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnfahrtLive } from "@/components/anfahrt-live";
import { FortschrittKarte } from "@/components/fortschritt-karte";
import { Schnellzugriff } from "@/components/schnellzugriff";
import type { Appointment } from "@/lib/types";
import { formatTime } from "@/lib/types";
import { MIcon } from "@/components/m-icon";
import { aktuellerNutzer } from "@/lib/sitzung";

const TAGE = 7;

export default async function PatientStart() {
  const supabase = await createClient();
  const user = await aktuellerNutzer();

  const seit = new Date();
  seit.setDate(seit.getDate() - (TAGE - 1));
  seit.setHours(0, 0, 0, 0);

  const [{ data: profile }, { data: termin }, { data: plan }, { count: ungelesen }, { data: feedback }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, street").eq("id", user!.id).single(),
      // Auch bereits begonnene Termine berücksichtigen, damit die Live-Anfahrt
      // sichtbar bleibt, wenn sich der Start leicht verschoben hat.
      supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", user!.id)
        .eq("status", "geplant")
        // eslint-disable-next-line react-hooks/purity -- Server Component, laeuft pro Request
        .gte("starts_at", new Date(Date.now() - 4 * 3600_000).toISOString())
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
      supabase
        .from("plan_feedback")
        .select("on_date, completed")
        .eq("patient_id", user!.id)
        .gte("on_date", seit.toISOString().slice(0, 10)),
    ]);

  const vorname = (profile?.full_name ?? "").split(" ")[0];
  const aktuellerTermin = termin as Appointment | null;
  const { data: therapeutName } = aktuellerTermin
    ? await supabase.rpc("therapeut_name")
    : { data: null };

  // Fortschritt der letzten sieben Tage: erledigte Übungen je Tag im Verhältnis
  // zur Anzahl der Übungen im Plan.
  const uebungenImPlan = plan?.plan_items?.length ?? 0;
  const proTag = new Map<string, number>();
  for (const f of feedback ?? []) {
    if (!f.completed) continue;
    proTag.set(f.on_date, (proTag.get(f.on_date) ?? 0) + 1);
  }
  const verlauf: number[] = [];
  for (let i = 0; i < TAGE; i++) {
    const tag = new Date(seit);
    tag.setDate(seit.getDate() + i);
    const erledigt = proTag.get(tag.toISOString().slice(0, 10)) ?? 0;
    verlauf.push(uebungenImPlan ? Math.min(1, erledigt / uebungenImPlan) : 0);
  }
  const prozent = verlauf.length
    ? Math.round((verlauf.reduce((a, b) => a + b, 0) / verlauf.length) * 100)
    : 0;
  const fortschrittText =
    uebungenImPlan === 0
      ? "Sobald Ihr Trainingsplan steht, sehen Sie hier Ihren Verlauf."
      : prozent >= 70
        ? "Weiter so – Sie sind auf einem sehr guten Weg."
        : prozent >= 30
          ? "Gut dabei. Jede Übung zählt."
          : "Jeder Anfang zählt – schon eine Übung am Tag hilft.";

  const terminDatum = aktuellerTermin ? new Date(aktuellerTermin.starts_at) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-800">
          Hallo{vorname ? ` ${vorname}` : ""} <MIcon name="winken" className="text-teal-500" />
        </h1>
        <p className="mt-1 text-navy-600/80">Schön, dass Sie da sind.</p>
      </div>

      {aktuellerTermin && (
        <AnfahrtLive termin={aktuellerTermin} therapeutName={therapeutName ?? "Ihr Therapeut"} />
      )}

      <FortschrittKarte prozent={prozent} verlauf={verlauf} text={fortschrittText} />

      <div className="card">
        <p className="text-lg font-bold text-navy-800">Nächster Termin</p>
        {aktuellerTermin && terminDatum ? (
          <Link href="/app/termine" className="mt-3 flex items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-mist-100">
              <span className="text-2xl font-bold text-navy-800">{terminDatum.getDate()}</span>
              <span className="text-sm font-medium text-navy-600/80">
                {terminDatum.toLocaleDateString("de-DE", { month: "long" })}
              </span>
            </span>
            <span className="min-w-0 flex-1 border-l border-mist-100 pl-4">
              <span className="block text-xl font-bold text-navy-800">
                {formatTime(aktuellerTermin.starts_at)} Uhr
              </span>
              <span className="block truncate text-navy-600/80">
                mit {therapeutName ?? "Ihrem Therapeuten"}
              </span>
              <span className="mt-1 block font-semibold text-teal-600">Termin anzeigen</span>
            </span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-navy-600/50" aria-hidden>
              <path d="m9 6 6 6-6 6" />
            </svg>
          </Link>
        ) : (
          <>
            <p className="mt-2 text-navy-600/80">
              Aktuell ist kein Termin geplant. Fragen Sie einfach Ihren nächsten Wunschtermin an.
            </p>
            <Link href="/app/termine" className="btn-primary mt-4">Termin anfragen</Link>
          </>
        )}
      </div>

      <Schnellzugriff />

      {ungelesen ? (
        <Link href="/app/chat" className="card flex items-center justify-between gap-3 transition hover:border-teal-500">
          <span>
            <span className="block font-bold text-navy-800">
              {ungelesen} neue Nachricht{ungelesen === 1 ? "" : "en"}
            </span>
            <span className="block text-sm text-navy-600/80">Von Ihrem Therapeuten</span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 font-bold text-white">
            {ungelesen}
          </span>
        </Link>
      ) : null}

      {!profile?.street && (
        <div className="card border-teal-500/40 bg-teal-50">
          <p className="flex items-center gap-2 font-semibold text-navy-800">
            <MIcon name="ort" className="text-teal-600" /> Ihre Adresse fehlt noch
          </p>
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

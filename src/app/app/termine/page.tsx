import { createClient } from "@/lib/supabase/server";
import { AnfahrtLive } from "@/components/anfahrt-live";
import { resolveDocumentUrl } from "@/lib/media";
import type { Appointment, PatientDocument } from "@/lib/types";
import { formatDateTime, tagesSchluessel } from "@/lib/types";
import { AnfrageForm } from "./anfrage-form";
import { TerminBuchen } from "./termin-buchen";
import { TerminAbsagen } from "./termin-absagen";
import { stornoFrist } from "@/lib/types";
import type { PraxisEinstellungen } from "@/lib/types";
import { MIcon } from "@/components/m-icon";
import { aktuellerNutzer } from "@/lib/sitzung";

const statusText: Record<string, { label: string; klasse: string }> = {
  pending: { label: "Wartet auf Bestätigung", klasse: "bg-amber-50 text-amber-700" },
  proposed: { label: "Neuer Vorschlag für Sie", klasse: "bg-teal-50 text-teal-600" },
  confirmed: { label: "Bestätigt", klasse: "bg-teal-50 text-teal-600" },
  declined: { label: "Leider nicht möglich", klasse: "bg-red-50 text-red-700" },
};

export default async function TerminePage() {
  const supabase = await createClient();
  const user = await aktuellerNutzer();

  const jetzt = new Date().toISOString();
  const [{ data: kommende }, { data: vergangene }, { data: anfragen }] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      // Auch gerade laufende Termine zeigen, damit die Live-Anfahrt sichtbar bleibt
      // eslint-disable-next-line react-hooks/purity -- Server Component, laeuft pro Request
      .gte("starts_at", new Date(Date.now() - 4 * 3600_000).toISOString())
      .eq("patient_id", user!.id)
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

  const anfrageIds = (anfragen ?? []).map((a) => a.id);
  const { data: dokumente } = anfrageIds.length
    ? await supabase.from("documents").select("*").in("request_id", anfrageIds)
    : { data: [] as PatientDocument[] };
  const dokumenteProAnfrage = new Map<string, { name: string; url: string | null }[]>();
  for (const d of (dokumente ?? []) as PatientDocument[]) {
    if (!d.request_id) continue;
    const liste = dokumenteProAnfrage.get(d.request_id) ?? [];
    liste.push({ name: d.file_name, url: await resolveDocumentUrl(supabase, d.file_path) });
    dokumenteProAnfrage.set(d.request_id, liste);
  }

  // Nächster Termin: Live-Karte immer einbinden, sie zeigt sich erst bei Fahrtbeginn.
  const heute = new Date();
  const horizont = new Date(heute);
  horizont.setDate(heute.getDate() + 56);

  const [{ data: einstellungen }, { data: slots }] = await Promise.all([
    supabase.from("praxis_einstellungen").select("*").maybeSingle<PraxisEinstellungen>(),
    supabase.rpc("freie_termine", {
      p_von: heute.toISOString().slice(0, 10),
      p_bis: horizont.toISOString().slice(0, 10),
    }),
  ]);

  // Freie Zeiten nach Tagen bündeln – in Ortszeit, so wie sie angezeigt werden
  const nachTag = new Map<string, string[]>();
  for (const zeile of (slots ?? []) as { beginn: string }[]) {
    const schluessel = tagesSchluessel(zeile.beginn);
    nachTag.set(schluessel, [...(nachTag.get(schluessel) ?? []), zeile.beginn]);
  }
  const startTage = [...nachTag.entries()].map(([datum, zeiten]) => ({ datum, zeiten }));

  // null = Absagen in der App ist von der Praxis abgeschaltet
  const stornoStunden = einstellungen?.storno_stunden ?? null;

  const anfahrt = ((kommende ?? []) as Appointment[]).find((t) => t.status === "geplant");
  const { data: therapeutName } = anfahrt ? await supabase.rpc("therapeut_name") : { data: null };

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Termine</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Ihre <span className="text-teal-500">Hausbesuche</span>.
        </h1>
      </div>

      {anfahrt && <AnfahrtLive termin={anfahrt} therapeutName={therapeutName ?? "Ihr Therapeut"} />}

      <TerminBuchen
        slotMinuten={einstellungen?.slot_minuten ?? 60}
        autoBestaetigen={einstellungen?.auto_bestaetigen ?? true}
        stornoStunden={stornoStunden}
        startTage={startTage}
      />

      {/* Rückfalllösung: Wenn nichts Passendes dabei ist, bleibt der Weg über
          freie Wunschzeiten offen. */}
      <details className="card">
        <summary className="cursor-pointer font-semibold text-navy-800">
          Keine passende Zeit dabei?
        </summary>
        <p className="mt-2 text-sm text-navy-600/80">
          Nennen Sie uns einfach Ihre Wunschzeiten – Ihre Praxis meldet sich mit einem Vorschlag.
        </p>
        <div className="mt-4">
          <AnfrageForm />
        </div>
      </details>

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
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-600">
                    Bestätigt
                  </span>
                  {t.status === "geplant" && (
                    <TerminAbsagen
                      terminId={t.id}
                      startsAt={t.starts_at}
                      stornoStunden={stornoStunden}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="card text-navy-600/80">Aktuell sind keine Termine geplant.</p>
        )}
        <p className="mt-3 text-xs text-navy-600/70">
          {stornoStunden !== null
            ? `Termine können Sie bis ${stornoFrist(stornoStunden)} vorher hier in der App kostenfrei absagen. Bei späterer Absage kann ein Ausfallhonorar anfallen (siehe AGB).`
            : "Absagen bitte telefonisch oder über die Nachrichten – bis spätestens 24 Stunden vorher, sonst kann ein Ausfallhonorar anfallen (siehe AGB)."}
        </p>
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
                  {dokumenteProAnfrage.get(a.id)?.length ? (
                    <p className="mt-2 flex flex-wrap gap-2 text-sm">
                      {dokumenteProAnfrage.get(a.id)!.map((d, i) =>
                        d.url ? (
                          <a key={i} href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-mist-100 px-3 py-1 font-medium text-navy-700 hover:text-teal-600">
                            <MIcon name="dokument" className="mr-1 text-navy-600/70" />{d.name}
                          </a>
                        ) : (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-mist-100 px-3 py-1 font-medium text-navy-700"><MIcon name="dokument" className="mr-1 text-navy-600/70" />{d.name}</span>
                        )
                      )}
                    </p>
                  ) : null}
                  {a.status === "proposed" && a.proposal && (
                    <p className="mt-3 rounded-lg bg-teal-50 px-4 py-3 text-sm text-navy-800">
                      <MIcon name="sprechblase" className="mr-1.5 text-teal-600" />Vorschlag Ihres Therapeuten: <strong>{a.proposal}</strong> – bitte antworten
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

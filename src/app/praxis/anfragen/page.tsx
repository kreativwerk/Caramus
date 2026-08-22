import { createClient } from "@/lib/supabase/server";
import { resolveDocumentUrl } from "@/lib/media";
import type { AppointmentRequest, PatientDocument, Profile } from "@/lib/types";
import { AnfrageKarte } from "./anfrage-karte";

export default async function AnfragenPage() {
  const supabase = await createClient();

  const { data: anfragen } = await supabase
    .from("appointment_requests")
    .select("*, profiles!appointment_requests_patient_id_fkey(*)")
    .in("status", ["pending", "proposed"])
    .order("created_at");

  const liste = (anfragen ?? []) as (AppointmentRequest & { profiles: Profile })[];

  const { data: dokumente } = liste.length
    ? await supabase.from("documents").select("*").in("request_id", liste.map((a) => a.id))
    : { data: [] as PatientDocument[] };
  const dokumenteProAnfrage = new Map<string, { name: string; url: string | null }[]>();
  for (const d of (dokumente ?? []) as PatientDocument[]) {
    if (!d.request_id) continue;
    const docListe = dokumenteProAnfrage.get(d.request_id) ?? [];
    docListe.push({ name: d.file_name, url: await resolveDocumentUrl(supabase, d.file_path) });
    dokumenteProAnfrage.set(d.request_id, docListe);
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Terminanfragen</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Offene <span className="text-teal-500">Anfragen</span>.
        </h1>
        <p className="mt-1 text-navy-600/80">
          Bestätigen Sie Anfragen mit konkretem Termin – die Adresse des Patienten wird automatisch übernommen.
        </p>
      </div>

      {liste.length ? (
        <div className="space-y-4">
          {liste.map((a) => (
            <AnfrageKarte key={a.id} anfrage={a} dokumente={dokumenteProAnfrage.get(a.id) ?? []} />
          ))}
        </div>
      ) : (
        <p className="card text-navy-600/80">🎉 Alles erledigt – keine offenen Anfragen.</p>
      )}
    </div>
  );
}

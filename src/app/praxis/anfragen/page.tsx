import { createClient } from "@/lib/supabase/server";
import type { AppointmentRequest, Profile } from "@/lib/types";
import { AnfrageKarte } from "./anfrage-karte";

export default async function AnfragenPage() {
  const supabase = await createClient();

  const { data: anfragen } = await supabase
    .from("appointment_requests")
    .select("*, profiles!appointment_requests_patient_id_fkey(*)")
    .in("status", ["pending", "proposed"])
    .order("created_at");

  const liste = (anfragen ?? []) as (AppointmentRequest & { profiles: Profile })[];

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
            <AnfrageKarte key={a.id} anfrage={a} />
          ))}
        </div>
      ) : (
        <p className="card text-navy-600/80">🎉 Alles erledigt – keine offenen Anfragen.</p>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { resolveMediaUrl } from "@/lib/media";
import type { Exercise } from "@/lib/types";
import { NeueUebung, UebungKarte } from "./uebung-form";

export default async function UebungenPage() {
  const supabase = await createClient();
  const { data: uebungen } = await supabase.from("exercises").select("*").order("category").order("title");

  const liste = await Promise.all(
    ((uebungen ?? []) as Exercise[]).map(async (u) => ({
      uebung: u,
      anzeigeUrl: await resolveMediaUrl(supabase, u.media_url),
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Übungsbibliothek</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Ihre <span className="text-teal-500">Übungen</span>.
        </h1>
        <p className="mt-1 text-navy-600/80">
          Einmal anlegen, beliebig oft in Trainingspläne übernehmen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NeueUebung />
        {liste.map(({ uebung, anzeigeUrl }) => (
          <UebungKarte key={uebung.id} uebung={uebung} anzeigeUrl={anzeigeUrl} />
        ))}
      </div>
    </div>
  );
}

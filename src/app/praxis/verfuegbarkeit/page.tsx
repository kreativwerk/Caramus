import { createClient } from "@/lib/supabase/server";
import type { PraxisEinstellungen, Sperrzeit, Verfuegbarkeit } from "@/lib/types";
import { Steuerung } from "./steuerung";

export const metadata = { title: "Verfügbarkeit" };

export default async function VerfuegbarkeitPage() {
  const supabase = await createClient();
  const heute = new Date().toISOString().slice(0, 10);

  const [{ data: einstellungen }, { data: sprechzeiten }, { data: sperrzeiten }] = await Promise.all([
    supabase.from("praxis_einstellungen").select("*").maybeSingle<PraxisEinstellungen>(),
    supabase.from("verfuegbarkeit").select("*").order("wochentag").order("von"),
    supabase.from("sperrzeiten").select("*").gte("datum", heute).order("datum").limit(50),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <span className="badge-pill">Verfügbarkeit</span>
        <h1 className="mt-3 text-2xl font-bold text-navy-800 sm:text-3xl">
          Wann Sie <span className="text-teal-500">buchbar</span> sind.
        </h1>
        <p className="mt-1 text-navy-600/80">
          Aus diesen Angaben entstehen die Zeiten, die Ihre Patientinnen und Patienten in der App
          sehen. Belegte Termine und Fahrzeiten rechnet die App selbst heraus.
        </p>
      </header>

      {einstellungen ? (
        <Steuerung
          einstellungen={einstellungen}
          sprechzeiten={(sprechzeiten ?? []) as Verfuegbarkeit[]}
          sperrzeiten={(sperrzeiten ?? []) as Sperrzeit[]}
        />
      ) : (
        <p className="card text-navy-600/80">
          Die Einstellungen lassen sich gerade nicht laden. Bitte laden Sie die Seite neu.
        </p>
      )}
    </div>
  );
}

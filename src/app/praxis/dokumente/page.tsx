import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { resolveDocumentUrl } from "@/lib/media";
import { DOKUMENT_STATUS, dokumentArtLabel, formatDateTime } from "@/lib/types";
import type { DocumentStatus, PatientDocument, Profile } from "@/lib/types";
import { StatusSteuerung } from "./status-steuerung";

export const metadata = { title: "Dokumenteneingang" };

const REIHENFOLGE: DocumentStatus[] = ["unvollstaendig", "eingegangen", "in_pruefung", "weitergeleitet"];

export default async function PraxisDokumentePage() {
  const supabase = await createClient();

  const { data: dokumente } = await supabase
    .from("documents")
    .select("*, profiles!documents_patient_id_fkey(id, full_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const liste = await Promise.all(
    ((dokumente ?? []) as (PatientDocument & { profiles: Profile })[]).map(async (d) => ({
      dokument: d,
      url: await resolveDocumentUrl(supabase, d.file_path),
    }))
  );

  const offen = liste.filter(
    (e) => e.dokument.status === "eingegangen" || e.dokument.status === "in_pruefung"
  ).length;
  const beiPatient = liste.filter((e) => e.dokument.status === "unvollstaendig").length;
  const hinweise = [
    offen > 0 ? `${offen} ${offen === 1 ? "Unterlage wartet" : "Unterlagen warten"} auf Bearbeitung` : null,
    beiPatient > 0
      ? `${beiPatient} ${beiPatient === 1 ? "Unterlage ist" : "Unterlagen sind"} beim Patienten nachgefragt`
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Dokumenteneingang</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Rezepte &amp; <span className="text-teal-500">Unterlagen</span>.
        </h1>
        <p className="mt-1 text-navy-600/80">
          {hinweise.length ? `${hinweise.join(" · ")}.` : "Alles bearbeitet – nichts offen."}
        </p>
      </div>

      {REIHENFOLGE.map((status) => {
        const gruppe = liste.filter((e) => e.dokument.status === status);
        if (!gruppe.length) return null;
        return (
          <section key={status}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-800">
              {DOKUMENT_STATUS[status].label}
              <span className="rounded-full bg-mist-100 px-2 py-0.5 text-sm font-semibold text-navy-700">
                {gruppe.length}
              </span>
            </h2>
            <ul className="space-y-3">
              {gruppe.map(({ dokument, url }) => (
                <li key={dokument.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-navy-800">
                        {dokument.profiles?.full_name ?? "Unbekannt"} · {dokumentArtLabel(dokument.kind)}
                      </p>
                      <p className="truncate text-sm text-navy-600/80">{dokument.file_name}</p>
                      <p className="mt-1 text-xs text-navy-600/60">
                        Eingegangen {formatDateTime(dokument.created_at)}
                        {dokument.request_id ? " · zu einer Terminanfrage" : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3 text-sm font-semibold">
                      {url && (
                        <a href={url} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                          Öffnen
                        </a>
                      )}
                      {dokument.profiles?.id && (
                        <Link href={`/praxis/patienten/${dokument.profiles.id}`} className="text-navy-600/80 hover:text-teal-600">
                          Patient
                        </Link>
                      )}
                    </div>
                  </div>
                  <StatusSteuerung dokument={dokument} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {liste.length === 0 && (
        <p className="card text-navy-600/80">Es wurden noch keine Unterlagen übermittelt.</p>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { resolveDocumentUrl } from "@/lib/media";
import type { PatientDocument } from "@/lib/types";
import { UploadForm } from "./upload-form";
import { DokumentKarte } from "./dokument-karte";

export const metadata = { title: "Unterlagen" };

export default async function DokumentePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: dokumente } = await supabase
    .from("documents")
    .select("*")
    .eq("patient_id", user!.id)
    .order("created_at", { ascending: false });

  const liste = await Promise.all(
    ((dokumente ?? []) as PatientDocument[]).map(async (d) => ({
      dokument: d,
      url: await resolveDocumentUrl(supabase, d.file_path),
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Unterlagen</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Ihre <span className="text-teal-500">Dokumente</span>.
        </h1>
        <p className="mt-1 text-navy-600/80">
          Rezepte, Überweisungen und Berichte an einem Ort – Sie sehen jederzeit, wie weit die
          Bearbeitung ist.
        </p>
      </div>

      <UploadForm />

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy-800">Übermittelte Unterlagen</h2>
        {liste.length ? (
          <ul className="space-y-3">
            {liste.map(({ dokument, url }) => (
              <DokumentKarte key={dokument.id} dokument={dokument} url={url} />
            ))}
          </ul>
        ) : (
          <p className="card text-navy-600/80">
            Sie haben noch keine Unterlagen übermittelt. Nutzen Sie das Formular oben.
          </p>
        )}
      </section>
    </div>
  );
}

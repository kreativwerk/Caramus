"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DateiFeld } from "@/components/datei-feld";
import { DOCS_BUCKET } from "@/lib/media";
import { DOKUMENT_ARTEN } from "@/lib/types";
import { terminAnfragen } from "../actions";

const MAX_DATEIEN = 3;
const MAX_GROESSE = 10 * 1024 * 1024;
const ERLAUBTE_TYPEN = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
];

export function AnfrageForm() {
  const [offen, setOffen] = useState(false);
  const [meldung, setMeldung] = useState<{ typ: "ok" | "fehler"; text: string } | null>(null);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();
  const dateiRef = useRef<HTMLInputElement>(null);

  function absenden(formData: FormData) {
    startTransition(async () => {
      // Dokumente (Rezept/Überweisung) zuerst in den geschützten Speicher laden
      const dateien = [...(dateiRef.current?.files ?? [])];
      if (dateien.length > MAX_DATEIEN) {
        setMeldung({ typ: "fehler", text: `Bitte höchstens ${MAX_DATEIEN} Dateien anhängen.` });
        return;
      }
      for (const d of dateien) {
        if (d.size > MAX_GROESSE) {
          setMeldung({ typ: "fehler", text: `„${d.name}“ ist größer als 10 MB. Bitte verkleinern oder als PDF speichern.` });
          return;
        }
        if (d.type && !ERLAUBTE_TYPEN.includes(d.type)) {
          setMeldung({ typ: "fehler", text: `„${d.name}“ hat ein nicht unterstütztes Format. Erlaubt: PDF oder Foto (JPG, PNG, HEIC).` });
          return;
        }
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMeldung({ typ: "fehler", text: "Bitte melden Sie sich erneut an." });
        return;
      }

      const hochgeladen: { file_path: string; file_name: string; content_type: string; size_bytes: number }[] = [];
      for (const d of dateien) {
        const endung = d.name.split(".").pop()?.toLowerCase() ?? "bin";
        const pfad = `${user.id}/${crypto.randomUUID()}.${endung}`;
        const { error } = await supabase.storage
          .from(DOCS_BUCKET)
          .upload(pfad, d, { contentType: d.type || undefined });
        if (error) {
          setMeldung({ typ: "fehler", text: `„${d.name}“ konnte nicht hochgeladen werden. Bitte erneut versuchen.` });
          return;
        }
        hochgeladen.push({ file_path: pfad, file_name: d.name, content_type: d.type, size_bytes: d.size });
      }
      formData.set("dokumente", JSON.stringify(hochgeladen));

      const ergebnis = await terminAnfragen(formData);
      if (ergebnis?.fehler) {
        setMeldung({ typ: "fehler", text: ergebnis.fehler });
      } else {
        setMeldung({
          typ: "ok",
          text:
            hochgeladen.length > 0
              ? `Ihre Anfrage wurde gesendet – inklusive ${hochgeladen.length} ${hochgeladen.length === 1 ? "Dokument" : "Dokumenten"}. Sie erhalten eine Rückmeldung, sobald der Termin bestätigt ist.`
              : "Ihre Anfrage wurde gesendet. Sie erhalten eine Rückmeldung, sobald der Termin bestätigt ist.",
        });
        setOffen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-navy-800">Neuen Hausbesuch anfragen</p>
          <p className="text-sm text-navy-600/80">
            Nennen Sie uns Ihre Wunschzeiten – Ihr Therapeut bestätigt oder schlägt eine Alternative vor.
          </p>
        </div>
        {!offen && (
          <button onClick={() => { setOffen(true); setMeldung(null); }} className="btn-primary">
            Termin anfragen
          </button>
        )}
      </div>

      {meldung && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
            meldung.typ === "ok" ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-700"
          }`}
        >
          {meldung.text}
        </p>
      )}

      {offen && (
        <form action={absenden} className="mt-5 space-y-4">
          <div>
            <label htmlFor="wunschzeiten" className="label-base">Ihre Wunschzeiten</label>
            <textarea
              id="wunschzeiten"
              name="wunschzeiten"
              required
              rows={3}
              className="input-base"
              placeholder={"z. B.:\nDienstag Vormittag\noder Donnerstag zwischen 14 und 17 Uhr"}
            />
            <p className="mt-1 text-xs text-navy-600/70">
              Behandlungszeiten: Mo–Fr 8–18 Uhr, Sa 9–14 Uhr. Gern mehrere Vorschläge angeben.
            </p>
          </div>
          <div>
            <label htmlFor="nachricht" className="label-base">Nachricht (optional)</label>
            <textarea
              id="nachricht"
              name="nachricht"
              rows={2}
              className="input-base"
              placeholder="z. B. Anlass des Besuchs, Besonderheiten beim Zugang zur Wohnung …"
            />
          </div>
          <div>
            <label htmlFor="dok-art" className="label-base">Art der Unterlage</label>
            <select id="dok-art" name="dok_art" defaultValue="rezept" className="input-base mb-3">
              {DOKUMENT_ARTEN.map((a) => (
                <option key={a.wert} value={a.wert}>{a.label}</option>
              ))}
            </select>
            <label htmlFor="dokumente-upload" className="label-base">
              Rezept oder Überweisung anhängen (optional)
            </label>
            <DateiFeld
              id="dokumente-upload"
              feldRef={dateiRef}
              multiple
              accept="application/pdf,image/jpeg,image/png,image/heic,image/heif,image/webp"
              knopfText="Dateien wählen"
            />
            <p className="mt-1 text-xs text-navy-600/70">
              PDF oder Foto (auch direkt mit der Handykamera), bis zu {MAX_DATEIEN} Dateien à max.
              10 MB. Die Übertragung ist verschlüsselt – nur Ihr Therapeut kann die Dokumente sehen.
            </p>
          </div>
          <p className="text-xs text-navy-600/70">
            Mit dieser Anfrage kommt noch kein kostenpflichtiger Vertrag zustande. Ein Termin ist
            erst verbindlich, wenn Ihr Therapeut ihn ausdrücklich bestätigt und Sie die
            wesentlichen Kosteninformationen erhalten haben.
          </p>
          <div className="flex gap-3">
            <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
              {laeuft ? "Wird gesendet …" : "Termin anfragen"}
            </button>
            <button type="button" onClick={() => setOffen(false)} className="btn-secondary">
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

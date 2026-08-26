"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DateiFeld } from "@/components/datei-feld";
import { DOCS_BUCKET } from "@/lib/media";
import { DOKUMENT_ARTEN } from "@/lib/types";
import { dokumentSpeichern } from "../actions";

const MAX_GROESSE = 10 * 1024 * 1024;
const ERLAUBTE_TYPEN = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"];

export function UploadForm() {
  const [meldung, setMeldung] = useState<{ typ: "ok" | "fehler"; text: string } | null>(null);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();
  const dateiRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function absenden(formData: FormData) {
    startTransition(async () => {
      const datei = dateiRef.current?.files?.[0];
      if (!datei) {
        setMeldung({ typ: "fehler", text: "Bitte wählen Sie zuerst eine Unterlage aus oder machen Sie ein Foto." });
        return;
      }
      if (datei.size > MAX_GROESSE) {
        setMeldung({ typ: "fehler", text: `„${datei.name}" ist zu groß. Bitte schicken Sie ein Foto in normaler Qualität oder speichern Sie die Unterlage als PDF.` });
        return;
      }
      if (datei.type && !ERLAUBTE_TYPEN.includes(datei.type)) {
        setMeldung({ typ: "fehler", text: "Das können wir leider nicht öffnen. Bitte schicken Sie ein Foto oder ein PDF." });
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMeldung({ typ: "fehler", text: "Sie sind nicht mehr angemeldet. Bitte melden Sie sich noch einmal an." });
        return;
      }

      const endung = datei.name.split(".").pop()?.toLowerCase() ?? "bin";
      const pfad = `${user.id}/${crypto.randomUUID()}.${endung}`;
      const { error } = await supabase.storage
        .from(DOCS_BUCKET)
        .upload(pfad, datei, { contentType: datei.type || undefined });
      if (error) {
        setMeldung({ typ: "fehler", text: "Das Senden Ihrer Unterlage hat gerade nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal." });
        return;
      }

      formData.set("file_path", pfad);
      formData.set("file_name", datei.name);
      formData.set("content_type", datei.type);
      formData.set("size_bytes", String(datei.size));

      const ergebnis = await dokumentSpeichern(formData);
      if (ergebnis?.fehler) {
        setMeldung({ typ: "fehler", text: ergebnis.fehler });
      } else {
        setMeldung({
          typ: "ok",
          text: "Vielen Dank! Ihre Unterlage ist bei uns eingegangen. Den Bearbeitungsstand sehen Sie unten.",
        });
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <form ref={formRef} action={absenden} className="card space-y-4">
      <div>
        <p className="text-lg font-bold text-navy-800">Unterlage übermitteln</p>
        <p className="text-sm text-navy-600/80">
          Fotografieren Sie Ihr Rezept einfach mit dem Handy ab – das genügt.
        </p>
      </div>

      <div>
        <label htmlFor="kind" className="label-base">Um was handelt es sich?</label>
        <select id="kind" name="kind" defaultValue="rezept" className="input-base">
          {DOKUMENT_ARTEN.map((a) => (
            <option key={a.wert} value={a.wert}>{a.label}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-navy-600/70">
          Für Hausbesuche brauchen wir eine ärztliche Verordnung mit dem Vermerk „Hausbesuch“.
        </p>
      </div>

      <div>
        <label htmlFor="datei" className="label-base">Datei oder Foto</label>
        <DateiFeld
          id="datei"
          feldRef={dateiRef}
          required
          accept="application/pdf,image/jpeg,image/png,image/heic,image/heif,image/webp"
          knopfText="Datei wählen"
        />
        <p className="mt-1 text-xs text-navy-600/70">
          PDF oder Foto, bis 10 MB. Verschlüsselt übertragen – nur Ihr Therapeut kann es sehen.
        </p>
      </div>

      {meldung && (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            meldung.typ === "ok" ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-700"
          }`}
        >
          {meldung.text}
        </p>
      )}

      <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
        {laeuft ? "Wird übermittelt …" : "Unterlage senden"}
      </button>
    </form>
  );
}

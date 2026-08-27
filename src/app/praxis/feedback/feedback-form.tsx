"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DateiFeld } from "@/components/datei-feld";
import { FEEDBACK_BUCKET } from "@/lib/media";
import { FEEDBACK_ARTEN } from "@/lib/types";
import { feedbackSenden } from "../actions";

const MAX_BILDER = 5;
const MAX_GROESSE = 10 * 1024 * 1024;
const ERLAUBTE_TYPEN = ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp", "application/pdf"];

/**
 * Rückmeldung aus der Praxis. Die Screenshots gehen direkt aus dem Browser in
 * den geschützten Speicher, erst danach wird das Ticket angelegt – so landet
 * kein Bild auf einem Zwischenserver.
 */
export function FeedbackForm() {
  const [offen, setOffen] = useState(false);
  const [meldung, setMeldung] = useState<{ typ: "ok" | "fehler"; text: string } | null>(null);
  const [laeuft, startTransition] = useTransition();
  const bildRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function absenden(formData: FormData) {
    startTransition(async () => {
      const bilder = [...(bildRef.current?.files ?? [])];
      if (bilder.length > MAX_BILDER) {
        setMeldung({ typ: "fehler", text: `Bitte hängen Sie höchstens ${MAX_BILDER} Bilder an.` });
        return;
      }
      for (const b of bilder) {
        if (b.size > MAX_GROESSE) {
          setMeldung({ typ: "fehler", text: `„${b.name}“ ist zu groß. Ein normaler Screenshot reicht völlig.` });
          return;
        }
        if (b.type && !ERLAUBTE_TYPEN.includes(b.type)) {
          setMeldung({ typ: "fehler", text: `„${b.name}“ können wir leider nicht öffnen. Bitte ein Bild oder ein PDF.` });
          return;
        }
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMeldung({ typ: "fehler", text: "Sie sind nicht mehr angemeldet. Bitte melden Sie sich noch einmal an." });
        return;
      }

      const hochgeladen: {
        file_path: string;
        file_name: string;
        content_type: string;
        size_bytes: number;
      }[] = [];
      for (const b of bilder) {
        const endung = b.name.split(".").pop()?.toLowerCase() ?? "png";
        const pfad = `${user.id}/${crypto.randomUUID()}.${endung}`;
        const { error } = await supabase.storage
          .from(FEEDBACK_BUCKET)
          .upload(pfad, b, { contentType: b.type || undefined });
        if (error) {
          setMeldung({
            typ: "fehler",
            text: `„${b.name}“ ist nicht angekommen. Bitte versuchen Sie es in einem Moment noch einmal.`,
          });
          return;
        }
        hochgeladen.push({
          file_path: pfad,
          file_name: b.name,
          content_type: b.type,
          size_bytes: b.size,
        });
      }

      formData.set("bilder", JSON.stringify(hochgeladen));
      const ergebnis = await feedbackSenden(formData);
      if (ergebnis?.fehler) {
        setMeldung({ typ: "fehler", text: ergebnis.fehler });
        return;
      }
      setMeldung({
        typ: "ok",
        text: "Danke! Ihre Rückmeldung ist bei uns – Sie sehen den Stand gleich hier in der Liste.",
      });
      formRef.current?.reset();
      setOffen(false);
      router.refresh();
    });
  }

  if (!offen) {
    return (
      <div className="card">
        <h2 className="text-lg font-bold text-navy-800">Etwas gefunden?</h2>
        <p className="mt-1 text-navy-600/80">
          Schreiben Sie es hier auf – am besten mit einem Screenshot. Dann müssen Sie es niemandem
          erklären.
        </p>
        {meldung && (
          <p
            className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
              meldung.typ === "ok" ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
            }`}
          >
            {meldung.text}
          </p>
        )}
        <button onClick={() => setOffen(true)} className="btn-primary mt-4 w-full sm:w-auto">
          Rückmeldung schreiben
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={absenden} className="card space-y-4">
      <h2 className="text-lg font-bold text-navy-800">Rückmeldung schreiben</h2>

      <div>
        <label htmlFor="art" className="label-base">
          Worum geht es?
        </label>
        <select id="art" name="art" defaultValue="fehler" className="input-base">
          {FEEDBACK_ARTEN.map((a) => (
            <option key={a.wert} value={a.wert}>
              {a.label} – {a.hinweis}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="label-base">
          Überschrift
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder="z. B. Termin lässt sich nicht speichern"
          className="input-base"
        />
      </div>

      <div>
        <label htmlFor="body" className="label-base">
          Was ist passiert?
        </label>
        <textarea
          id="body"
          name="body"
          rows={5}
          placeholder="Wo waren Sie in der App, was haben Sie getan, was haben Sie erwartet?"
          className="input-base"
        />
        <p className="mt-1 text-xs text-navy-600/70">
          Je genauer, desto schneller können wir es beheben. Ein Satz reicht aber auch.
        </p>
      </div>

      <div>
        <label htmlFor="bilder" className="label-base">
          Screenshots (optional)
        </label>
        <DateiFeld
          id="bilder"
          feldRef={bildRef}
          accept="image/*,application/pdf"
          multiple
          knopfText="Bilder wählen"
        />
        <p className="mt-1 text-xs text-navy-600/70">
          Bis zu {MAX_BILDER} Bilder. Auf dem Handy: Sperrtaste und Leiser gleichzeitig drücken,
          auf dem Mac Umschalt + Befehl + 4.
        </p>
      </div>

      {meldung && (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            meldung.typ === "ok" ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
          }`}
        >
          {meldung.text}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
          {laeuft ? "Wird gesendet …" : "Rückmeldung senden"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOffen(false);
            setMeldung(null);
          }}
          className="btn-secondary"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

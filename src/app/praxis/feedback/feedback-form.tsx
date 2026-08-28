"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DateiFeld } from "@/components/datei-feld";
import { MIcon } from "@/components/m-icon";
import { FEEDBACK_BUCKET } from "@/lib/media";
import { feedbackSenden } from "../actions";

const MAX_BILDER = 5;
const MAX_GROESSE = 10 * 1024 * 1024;
const ERLAUBTE_TYPEN = ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp", "application/pdf"];

/**
 * Feedback schreiben: ein Textfeld, ein Knopf für Bilder, fertig. Bewusst ohne
 * Überschrift und ohne Auswahl der Art – beides hat Charles beim Tippen nur
 * aufgehalten. Die Überschrift für die Liste entsteht aus dem ersten Satz.
 *
 * Die Bilder gehen direkt aus dem Browser in den geschützten Speicher, erst
 * danach entsteht das Ticket – so landet kein Screenshot auf einem
 * Zwischenserver.
 */
export function FeedbackForm() {
  const [text, setText] = useState("");
  const [bildNamen, setBildNamen] = useState<string[]>([]);
  const [meldung, setMeldung] = useState<{ typ: "ok" | "fehler"; text: string } | null>(null);
  const [laeuft, startTransition] = useTransition();
  const bildRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function absenden(formData: FormData) {
    startTransition(async () => {
      setMeldung(null);
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
      setMeldung({ typ: "ok", text: "Danke! Steht jetzt rechts in der Liste." });
      formRef.current?.reset();
      setText("");
      setBildNamen([]);
      router.refresh();
    });
  }

  return (
    <form ref={formRef} action={absenden} className="card space-y-4">
      <div>
        <label htmlFor="body" className="label-base">
          Was ist Ihnen aufgefallen?
        </label>
        <textarea
          id="body"
          name="body"
          rows={7}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Zum Beispiel: Wenn ich bei einem Termin auf Bestätigen tippe, passiert nichts."
          className="input-base"
        />
        <p className="mt-1 text-xs text-navy-600/70">
          Ein Satz reicht. Je genauer, desto schneller lässt es sich beheben.
        </p>
      </div>

      <div>
        <label htmlFor="bilder" className="label-base">
          Bilder <span className="font-normal text-navy-600/60">(optional)</span>
        </label>
        <DateiFeld
          id="bilder"
          feldRef={bildRef}
          accept="image/*,application/pdf"
          multiple
          knopfText="Bilder wählen"
          onAuswahl={setBildNamen}
        />
        <p className="mt-1 text-xs text-navy-600/70">
          Bis zu {MAX_BILDER}. Screenshot auf dem Handy: Sperrtaste und Leiser gleichzeitig
          drücken, auf dem Mac Umschalt + Befehl + 4.
        </p>
      </div>

      {meldung && (
        <p
          role="status"
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            meldung.typ === "ok" ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
          }`}
        >
          {meldung.text}
        </p>
      )}

      <button
        type="submit"
        disabled={laeuft || !text.trim()}
        className="btn-primary w-full disabled:opacity-50"
      >
        {laeuft ? (
          "Wird gesendet …"
        ) : (
          <>
            <MIcon name="pfeilHoch" /> Absenden
            {bildNamen.length > 0 && ` (${bildNamen.length} ${bildNamen.length === 1 ? "Bild" : "Bilder"})`}
          </>
        )}
      </button>
    </form>
  );
}

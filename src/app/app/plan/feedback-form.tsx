"use client";

import { useState, useTransition } from "react";
import { feedbackSpeichern } from "../actions";
import type { PlanFeedback } from "@/lib/types";
import { MIcon } from "@/components/m-icon";

export function FeedbackForm({
  planItemId,
  heutigesFeedback,
}: {
  planItemId: string;
  heutigesFeedback: PlanFeedback | null;
}) {
  const [offen, setOffen] = useState(false);
  const [pain, setPain] = useState(heutigesFeedback?.pain_level ?? 0);
  const [note, setNote] = useState(heutigesFeedback?.note ?? "");
  const [laeuft, startTransition] = useTransition();
  const [fehler, setFehler] = useState<string | null>(null);

  const erledigt = heutigesFeedback?.completed ?? false;

  function speichern() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("plan_item_id", planItemId);
      fd.set("completed", "true");
      fd.set("pain_level", String(pain));
      fd.set("note", note);
      const ergebnis = await feedbackSpeichern(fd);
      if (ergebnis?.fehler) setFehler(ergebnis.fehler);
      else setOffen(false);
    });
  }

  if (erledigt && !offen) {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-teal-50 px-4 py-3">
        <p className="flex items-center gap-2 font-semibold text-teal-600">
          <MIcon name="erledigt" /> Heute erledigt – super gemacht!
        </p>
        <button onClick={() => setOffen(true)} className="text-sm font-semibold text-navy-600/80 hover:text-teal-600">
          Rückmeldung ändern
        </button>
      </div>
    );
  }

  if (!offen) {
    return (
      <button onClick={() => setOffen(true)} className="btn-primary mt-4 w-full sm:w-auto">
        Übung erledigt – Rückmeldung geben
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg bg-mist-50 p-4">
      <div>
        <label className="label-base">Wie stark waren die Schmerzen dabei? ({pain}/10)</label>
        <input
          type="range"
          min={0}
          max={10}
          value={pain}
          onChange={(e) => setPain(Number(e.target.value))}
          className="w-full accent-teal-500"
        />
        <div className="flex justify-between text-xs text-navy-600/70">
          <span>0 – keine</span>
          <span>5 – mittel</span>
          <span>10 – sehr stark</span>
        </div>
      </div>
      <div>
        <label className="label-base">Notiz an Ihren Therapeuten (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="input-base"
          placeholder="z. B. „Die letzte Wiederholung fiel schwer.“"
        />
      </div>
      {fehler && <p className="text-sm font-medium text-red-700">{fehler}</p>}
      <div className="flex gap-3">
        <button onClick={speichern} disabled={laeuft} className="btn-primary disabled:opacity-60">
          {laeuft ? "Wird gespeichert …" : "Speichern"}
        </button>
        <button onClick={() => setOffen(false)} className="btn-secondary">Abbrechen</button>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { planItemEntfernen, planItemHinzufuegen } from "../../actions";
import type { Exercise, PlanItem } from "@/lib/types";

export function PlanEditor({
  patientId,
  items,
  uebungen,
}: {
  patientId: string;
  items: PlanItem[];
  uebungen: Exercise[];
}) {
  const [offen, setOffen] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();

  function hinzufuegen(fd: FormData) {
    fd.set("patient_id", patientId);
    startTransition(async () => {
      const ergebnis = await planItemHinzufuegen(fd);
      if (ergebnis?.fehler) setMeldung(ergebnis.fehler);
      else {
        setMeldung(null);
        setOffen(false);
        router.refresh();
      }
    });
  }

  function entfernen(planItemId: string) {
    const fd = new FormData();
    fd.set("plan_item_id", planItemId);
    fd.set("patient_id", patientId);
    startTransition(async () => {
      await planItemEntfernen(fd);
      router.refresh();
    });
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-bold text-navy-800">Trainingsplan</p>
        {!offen && (
          <button onClick={() => setOffen(true)} className="btn-primary">Übung hinzufügen</button>
        )}
      </div>

      {items.length ? (
        <ol className="mt-4 space-y-2">
          {items.map((item, i) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-mist-50 px-4 py-3">
              <div>
                <p className="font-semibold text-navy-800">
                  {i + 1}. {item.exercises?.title}
                </p>
                <p className="text-sm text-navy-600/80">
                  {item.sets} × {item.reps}
                  {item.frequency ? ` · ${item.frequency}` : ""}
                  {item.instructions ? ` · ${item.instructions}` : ""}
                </p>
              </div>
              <button
                onClick={() => entfernen(item.id)}
                disabled={laeuft}
                className="shrink-0 text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
              >
                Entfernen
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-navy-600/80">Noch keine Übungen im Plan.</p>
      )}

      {meldung && <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{meldung}</p>}

      {offen && (
        <form action={hinzufuegen} className="mt-4 grid gap-3 rounded-lg bg-mist-50 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-base">Übung</label>
            <select name="exercise_id" required defaultValue="" className="input-base">
              <option value="" disabled>Aus der Bibliothek wählen …</option>
              {uebungen.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                  {u.category ? ` (${u.category})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Sätze</label>
            <input type="number" name="sets" defaultValue={3} min={1} className="input-base" />
          </div>
          <div>
            <label className="label-base">Wiederholungen</label>
            <input name="reps" defaultValue="10" className="input-base" placeholder="z. B. 10 oder 30 Sek." />
          </div>
          <div>
            <label className="label-base">Häufigkeit</label>
            <input name="frequency" defaultValue="täglich" className="input-base" placeholder="z. B. täglich, 3× pro Woche" />
          </div>
          <div>
            <label className="label-base">Hinweis für den Patienten</label>
            <input name="instructions" className="input-base" placeholder="z. B. langsam ausführen" />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
              {laeuft ? "Wird gespeichert …" : "Hinzufügen"}
            </button>
            <button type="button" onClick={() => setOffen(false)} className="btn-secondary">Abbrechen</button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { DOKUMENT_STATUS } from "@/lib/types";
import type { DocumentStatus, PatientDocument } from "@/lib/types";
import { dokumentStatusSetzen } from "../actions";

const SCHRITTE: { wert: DocumentStatus; knopf: string }[] = [
  { wert: "in_pruefung", knopf: "In Prüfung" },
  { wert: "weitergeleitet", knopf: "Weitergeleitet" },
  { wert: "unvollstaendig", knopf: "Unvollständig" },
];

export function StatusSteuerung({ dokument }: { dokument: PatientDocument }) {
  const [offen, setOffen] = useState<DocumentStatus | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();

  function setzen(status: DocumentStatus, note?: string) {
    const fd = new FormData();
    fd.set("id", dokument.id);
    fd.set("status", status);
    if (note) fd.set("status_note", note);
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await dokumentStatusSetzen(fd);
      if (ergebnis?.fehler) setFehler(ergebnis.fehler);
      else setOffen(null);
    });
  }

  return (
    <div className="mt-3 border-t border-mist-100 pt-3">
      <div className="flex flex-wrap gap-2">
        {SCHRITTE.filter((s) => s.wert !== dokument.status).map((s) => (
          <button
            key={s.wert}
            onClick={() => (s.wert === "unvollstaendig" ? setOffen(s.wert) : setzen(s.wert))}
            disabled={laeuft}
            className={`rounded-lg border border-mist-200 px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
              s.wert === "unvollstaendig"
                ? "text-red-600 hover:border-red-300"
                : "text-teal-600 hover:border-teal-500"
            }`}
          >
            → {s.knopf}
          </button>
        ))}
      </div>

      {offen === "unvollstaendig" && (
        <form
          action={(fd) => setzen("unvollstaendig", String(fd.get("status_note") ?? ""))}
          className="mt-3 space-y-2 rounded-lg bg-mist-50 p-3"
        >
          <label className="label-base">Was fehlt? (sieht der Patient)</label>
          <input
            name="status_note"
            required
            className="input-base"
            placeholder="z. B. Bitte die Rückseite mit dem Vermerk „Hausbesuch“ nachreichen"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
              Hinweis senden
            </button>
            <button type="button" onClick={() => setOffen(null)} className="btn-secondary">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {fehler && <p className="mt-2 text-sm font-medium text-red-700">{fehler}</p>}
      {dokument.status_note && offen === null && (
        <p className="mt-2 text-sm text-navy-600/80">
          Hinweis an Patient: „{dokument.status_note}&ldquo;
        </p>
      )}
      <p className="mt-2 text-xs text-navy-600/60">
        Aktueller Stand: {DOKUMENT_STATUS[dokument.status].label}
      </p>
    </div>
  );
}

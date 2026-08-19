"use client";

import { useState, useTransition } from "react";
import { terminAnfragen } from "../actions";

export function AnfrageForm() {
  const [offen, setOffen] = useState(false);
  const [meldung, setMeldung] = useState<{ typ: "ok" | "fehler"; text: string } | null>(null);
  const [laeuft, startTransition] = useTransition();

  function absenden(formData: FormData) {
    startTransition(async () => {
      const ergebnis = await terminAnfragen(formData);
      if (ergebnis?.fehler) {
        setMeldung({ typ: "fehler", text: ergebnis.fehler });
      } else {
        setMeldung({
          typ: "ok",
          text: "Ihre Anfrage wurde gesendet. Sie erhalten eine Rückmeldung, sobald der Termin bestätigt ist.",
        });
        setOffen(false);
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
          <div className="flex gap-3">
            <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
              {laeuft ? "Wird gesendet …" : "Anfrage senden"}
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

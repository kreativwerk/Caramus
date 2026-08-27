"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { terminAnlegen, terminStatusSetzen } from "../actions";
import { MIcon } from "@/components/m-icon";

export function NeuerTerminForm({ patienten }: { patienten: { id: string; full_name: string }[] }) {
  const [offen, setOffen] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();

  function absenden(fd: FormData) {
    startTransition(async () => {
      const ergebnis = await terminAnlegen(fd);
      if (ergebnis?.fehler) setMeldung(ergebnis.fehler);
      else {
        setMeldung(null);
        setOffen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-bold text-navy-800">Termin direkt anlegen</p>
        {!offen && <button onClick={() => setOffen(true)} className="btn-primary">Neuer Termin</button>}
      </div>
      {offen && (
        <form action={absenden} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label-base">Patient</label>
            <select name="patient_id" required className="input-base" defaultValue="">
              <option value="" disabled>Bitte wählen …</option>
              {patienten.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Datum &amp; Uhrzeit</label>
            <input type="datetime-local" name="starts_at" required className="input-base" />
          </div>
          <div>
            <label className="label-base">Dauer (Minuten)</label>
            <input type="number" name="duration_min" defaultValue={60} min={15} step={5} className="input-base" />
          </div>
          <div>
            <label className="label-base">Notiz (optional)</label>
            <input name="notes" className="input-base" />
          </div>
          {meldung && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:col-span-2">{meldung}</p>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
              {laeuft ? "Wird gespeichert …" : "Termin anlegen"}
            </button>
            <button type="button" onClick={() => setOffen(false)} className="btn-secondary">Abbrechen</button>
          </div>
        </form>
      )}
    </div>
  );
}

export function TerminStatusButtons({ terminId }: { terminId: string }) {
  const [laeuft, startTransition] = useTransition();

  function setzen(status: "abgeschlossen" | "abgesagt") {
    const fd = new FormData();
    fd.set("termin_id", terminId);
    fd.set("status", status);
    startTransition(async () => {
      await terminStatusSetzen(fd);
    });
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setzen("abgeschlossen")}
        disabled={laeuft}
        className="rounded-lg border border-mist-200 px-3 py-1.5 text-sm font-semibold text-teal-600 transition hover:border-teal-500 disabled:opacity-50"
      >
        <MIcon name="erledigt" className="mr-1.5" />Erledigt
      </button>
      <button
        onClick={() => setzen("abgesagt")}
        disabled={laeuft}
        className="rounded-lg border border-mist-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:border-red-300 disabled:opacity-50"
      >
        Absagen
      </button>
    </div>
  );
}

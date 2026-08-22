"use client";

import { useState, useTransition } from "react";
import { anfrageAblehnen, anfrageBestaetigen, anfrageVorschlagen } from "../actions";
import type { AppointmentRequest, Profile } from "@/lib/types";
import { formatDateTime } from "@/lib/types";

export function AnfrageKarte({
  anfrage,
  dokumente = [],
}: {
  anfrage: AppointmentRequest & { profiles: Profile };
  dokumente?: { name: string; url: string | null }[];
}) {
  const [modus, setModus] = useState<"zu" | "bestaetigen" | "vorschlag">("zu");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();

  const patient = anfrage.profiles;
  const adresse = [patient?.street, [patient?.zip, patient?.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  function ausfuehren(aktion: (fd: FormData) => Promise<{ fehler?: string | null; ok?: boolean }>, fd: FormData) {
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await aktion(fd);
      if (ergebnis?.fehler) setFehler(ergebnis.fehler);
      else setModus("zu");
    });
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-navy-800">{patient?.full_name}</p>
          <p className="text-sm text-navy-600/80">
            📍 {adresse || "Keine Adresse hinterlegt"}
            {patient?.phone ? ` · 📞 ${patient.phone}` : ""}
          </p>
          <p className="mt-1 text-xs text-navy-600/60">Angefragt am {formatDateTime(anfrage.created_at)}</p>
        </div>
        {anfrage.status === "proposed" && (
          <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-600">
            Vorschlag gesendet
          </span>
        )}
      </div>

      <div className="mt-3 rounded-lg bg-mist-50 px-4 py-3">
        <p className="text-sm font-semibold text-navy-700">Wunschzeiten</p>
        <p className="whitespace-pre-wrap text-navy-800">{anfrage.preferred_times}</p>
        {anfrage.message && <p className="mt-2 text-sm text-navy-600/80">„{anfrage.message}“</p>}
        {anfrage.status === "proposed" && anfrage.proposal && (
          <p className="mt-2 text-sm text-teal-600">Ihr Vorschlag: {anfrage.proposal}</p>
        )}
        {dokumente.length > 0 && (
          <div className="mt-3 border-t border-mist-200 pt-3">
            <p className="text-sm font-semibold text-navy-700">Mitgesendete Dokumente</p>
            <p className="mt-1 flex flex-wrap gap-2 text-sm">
              {dokumente.map((d, i) =>
                d.url ? (
                  <a key={i} href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium text-navy-700 shadow-sm hover:text-teal-600">
                    📄 {d.name}
                  </a>
                ) : (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium text-navy-700 shadow-sm">📄 {d.name}</span>
                )
              )}
            </p>
          </div>
        )}
      </div>

      {fehler && <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{fehler}</p>}

      {modus === "zu" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setModus("bestaetigen")} className="btn-primary">Termin bestätigen</button>
          <button onClick={() => setModus("vorschlag")} className="btn-secondary">Alternative vorschlagen</button>
          <button
            onClick={() => {
              const fd = new FormData();
              fd.set("anfrage_id", anfrage.id);
              ausfuehren(anfrageAblehnen, fd);
            }}
            disabled={laeuft}
            className="btn-secondary text-red-600 hover:border-red-300 hover:text-red-700"
          >
            Ablehnen
          </button>
        </div>
      )}

      {modus === "bestaetigen" && (
        <form
          action={(fd) => {
            fd.set("anfrage_id", anfrage.id);
            fd.set("patient_id", anfrage.patient_id);
            ausfuehren(anfrageBestaetigen, fd);
          }}
          className="mt-4 grid gap-3 rounded-lg bg-mist-50 p-4 sm:grid-cols-2"
        >
          <div>
            <label className="label-base">Datum &amp; Uhrzeit</label>
            <input type="datetime-local" name="starts_at" required className="input-base" />
          </div>
          <div>
            <label className="label-base">Dauer (Minuten)</label>
            <input type="number" name="duration_min" defaultValue={60} min={15} step={5} className="input-base" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Fahrhinweis (optional)</label>
            <input name="travel_note" className="input-base" placeholder="z. B. „ca. 25 Min. von vorherigem Termin in Fürth“" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Notiz (optional)</label>
            <input name="notes" className="input-base" placeholder="z. B. „Bitte Übungsmatte bereitlegen“" />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
              {laeuft ? "Wird gespeichert …" : "Bestätigen"}
            </button>
            <button type="button" onClick={() => setModus("zu")} className="btn-secondary">Abbrechen</button>
          </div>
        </form>
      )}

      {modus === "vorschlag" && (
        <form
          action={(fd) => {
            fd.set("anfrage_id", anfrage.id);
            ausfuehren(anfrageVorschlagen, fd);
          }}
          className="mt-4 space-y-3 rounded-lg bg-mist-50 p-4"
        >
          <div>
            <label className="label-base">Ihr Alternativvorschlag</label>
            <input
              name="proposal"
              required
              className="input-base"
              placeholder="z. B. „Mittwoch, 27.08. um 10:30 Uhr“"
            />
            <p className="mt-1 text-xs text-navy-600/70">
              Der Patient sieht den Vorschlag in seinen Terminen und antwortet über den Chat.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
              Vorschlag senden
            </button>
            <button type="button" onClick={() => setModus("zu")} className="btn-secondary">Abbrechen</button>
          </div>
        </form>
      )}
    </div>
  );
}

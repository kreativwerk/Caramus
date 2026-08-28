"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MIcon } from "@/components/m-icon";
import type { Baustein } from "@/lib/types";
import { bausteinLoeschen, bausteinSpeichern } from "../actions";

const VORSCHAU_ZEICHEN = 160;

/** Bausteine anlegen, ändern, kopieren und entfernen. */
export function BausteinListe({ bausteine }: { bausteine: Baustein[] }) {
  const [formOffen, setFormOffen] = useState(false);
  const [bearbeitet, setBearbeitet] = useState<Baustein | null>(null);
  const [ausgeklappt, setAusgeklappt] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();

  function speichern(formData: FormData) {
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await bausteinSpeichern(formData);
      if (ergebnis?.fehler) return setFehler(ergebnis.fehler);
      setFormOffen(false);
      setBearbeitet(null);
      router.refresh();
    });
  }

  function entfernen(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      const ergebnis = await bausteinLoeschen(fd);
      if (ergebnis?.fehler) return setFehler(ergebnis.fehler);
      router.refresh();
    });
  }

  async function kopieren(b: Baustein) {
    try {
      await navigator.clipboard.writeText(b.body);
      setKopiert(b.id);
      setTimeout(() => setKopiert((k) => (k === b.id ? null : k)), 1800);
    } catch {
      setFehler("Kopieren hat nicht geklappt. Bitte markieren Sie den Text von Hand.");
    }
  }

  return (
    <div className="space-y-4">
      {formOffen || bearbeitet ? (
        <form action={speichern} className="card space-y-4">
          <h2 className="text-lg font-bold text-navy-800">
            {bearbeitet ? "Baustein ändern" : "Neuer Baustein"}
          </h2>
          {bearbeitet && <input type="hidden" name="id" value={bearbeitet.id} />}
          <div>
            <label htmlFor="title" className="label-base">
              Überschrift
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={120}
              defaultValue={bearbeitet?.title ?? ""}
              placeholder="z. B. Hinweis zur Verordnung"
              className="input-base"
            />
            <p className="mt-1 text-xs text-navy-600/70">
              Nur für Sie – daran erkennen Sie den Baustein in der Liste wieder.
            </p>
          </div>
          <div>
            <label htmlFor="body" className="label-base">
              Inhalt
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={6}
              defaultValue={bearbeitet?.body ?? ""}
              placeholder="Der Text oder Link, der kopiert werden soll."
              className="input-base"
            />
          </div>
          {fehler && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{fehler}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
              {laeuft ? "Einen Moment …" : "Speichern"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormOffen(false);
                setBearbeitet(null);
                setFehler(null);
              }}
              className="btn-secondary"
            >
              Abbrechen
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setFormOffen(true)} className="btn-primary w-full sm:w-auto">
          <MIcon name="plus" /> Neuer Baustein
        </button>
      )}

      {fehler && !formOffen && !bearbeitet && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{fehler}</p>
      )}

      {bausteine.length === 0 ? (
        <p className="card text-navy-600/80">
          Noch nichts hinterlegt. Gut geeignet sind Sätze, die Sie oft schreiben – etwa der Hinweis
          „Hausbesuch“ für die Verordnung, Ihre Bankverbindung oder ein Link zur Terminanfrage.
        </p>
      ) : (
        <ul className="space-y-3">
          {bausteine.map((b) => {
            const lang = b.body.length > VORSCHAU_ZEICHEN;
            const offen = ausgeklappt === b.id;
            return (
              <li key={b.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-navy-800">{b.title}</h3>
                  <button
                    onClick={() => kopieren(b)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      kopiert === b.id
                        ? "bg-teal-500 text-white"
                        : "bg-mist-100 text-navy-700 hover:bg-teal-100 hover:text-teal-700"
                    }`}
                  >
                    {kopiert === b.id ? (
                      <>
                        <MIcon name="haken" className="mr-1" />
                        Kopiert
                      </>
                    ) : (
                      <>
                        <MIcon name="kopieren" className="mr-1" />
                        Kopieren
                      </>
                    )}
                  </button>
                </div>

                <p
                  className={`mt-2 whitespace-pre-wrap text-navy-700 ${
                    lang && !offen ? "line-clamp-3" : ""
                  }`}
                >
                  {b.body}
                </p>

                {lang && (
                  <button
                    onClick={() => setAusgeklappt(offen ? null : b.id)}
                    className="mt-1 text-sm font-semibold text-teal-600 hover:underline"
                  >
                    {offen ? "Weniger anzeigen" : "Ganzen Text anzeigen"}
                  </button>
                )}

                <div className="mt-3 flex flex-wrap gap-2 border-t border-mist-100 pt-3">
                  <button
                    onClick={() => setBearbeitet(b)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 transition hover:bg-mist-100"
                  >
                    Ändern
                  </button>
                  <button
                    onClick={() => entfernen(b.id)}
                    disabled={laeuft}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-navy-600/70 transition hover:text-red-700 disabled:opacity-50"
                  >
                    Entfernen
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

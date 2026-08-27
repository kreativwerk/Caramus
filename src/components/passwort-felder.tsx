"use client";

import { useState } from "react";

export const PASSWORT_MINDESTLAENGE = 6;

/**
 * Prüft die Eingabe, bevor sie überhaupt losgeschickt wird – so kommt die
 * Rückmeldung sofort und in verständlichen Worten.
 * Gibt den Hinweistext zurück oder null, wenn alles passt.
 */
export function passwortPruefen(passwort: string, wiederholung: string) {
  if (passwort.length < PASSWORT_MINDESTLAENGE) {
    return `Bitte wählen Sie ein längeres Passwort – mindestens ${PASSWORT_MINDESTLAENGE} Zeichen.`;
  }
  if (passwort !== wiederholung) {
    return "Die beiden Eingaben sind nicht gleich. Bitte schauen Sie noch einmal drüber.";
  }
  return null;
}

/**
 * Passwort zweimal eingeben, mit Anzeigen-Schalter. Die Zielgruppe tippt oft
 * auf dem Handy – deshalb die Möglichkeit, das Getippte sichtbar zu machen.
 *
 * Die Mindestlänge prüft bewusst `passwortPruefen` und nicht der Browser:
 * Sonst mischen sich zwei Tonlagen – die Sprechblase des Browsers und unsere.
 */
export function PasswortFelder({
  passwort,
  wiederholung,
  setPasswort,
  setWiederholung,
  kennung = "passwort",
  beschriftung = "Neues Passwort",
}: {
  passwort: string;
  wiederholung: string;
  setPasswort: (wert: string) => void;
  setWiederholung: (wert: string) => void;
  kennung?: string;
  beschriftung?: string;
}) {
  const [sichtbar, setSichtbar] = useState(false);

  return (
    <>
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={kennung} className="label-base">
            {beschriftung}
          </label>
          <button
            type="button"
            onClick={() => setSichtbar((s) => !s)}
            className="text-sm font-semibold text-teal-600 hover:underline"
          >
            {sichtbar ? "Verbergen" : "Anzeigen"}
          </button>
        </div>
        <input
          id={kennung}
          type={sichtbar ? "text" : "password"}
          required
          autoComplete="new-password"
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
          className="input-base"
        />
        <p className="mt-1 text-xs text-navy-600/70">
          Mindestens {PASSWORT_MINDESTLAENGE} Zeichen.
        </p>
      </div>
      <div>
        <label htmlFor={`${kennung}-wdh`} className="label-base">
          Zur Sicherheit noch einmal
        </label>
        <input
          id={`${kennung}-wdh`}
          type={sichtbar ? "text" : "password"}
          required
          autoComplete="new-password"
          value={wiederholung}
          onChange={(e) => setWiederholung(e.target.value)}
          className="input-base"
        />
      </div>
    </>
  );
}

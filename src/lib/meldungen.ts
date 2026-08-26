/**
 * Alle Meldungen, die Patientinnen, Patienten und das Praxisteam zu sehen
 * bekommen, wenn etwas nicht klappt.
 *
 * Regeln für neue Texte:
 * - normale Sprache, keine Fachbegriffe („Upload", „Server", „Session", „Datei-ID")
 * - keine Fehlernummern und keine technischen Details
 * - immer sagen, was jetzt zu tun ist – oder dass man nichts tun muss
 * - freundlich bleiben, niemandem die Schuld geben
 */
export const MELDUNG = {
  /** Sitzung abgelaufen oder Abmeldung in einem anderen Tab */
  abgemeldet: "Sie sind nicht mehr angemeldet. Bitte melden Sie sich noch einmal an.",
  /** Patient ruft einen Praxisbereich auf */
  nurPraxis: "Dieser Bereich ist nur für das Praxisteam.",
  /** Allgemeiner Rückfall, wenn wirklich nichts Genaueres bekannt ist */
  allgemein: "Das hat gerade nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal.",
} as const;

/**
 * Baut einen Satz nach dem immer gleichen Muster:
 * „<Was> ist gerade nicht angekommen. Bitte versuchen Sie es in einem Moment noch einmal."
 */
export function nichtGeklappt(was: string) {
  return `${was} hat gerade nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal.`;
}

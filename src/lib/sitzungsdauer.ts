/**
 * „Angemeldet bleiben“ – wie lange die Anmeldung auf einem Gerät gilt.
 *
 * Standard: Die Anmeldung bleibt bestehen, auch wenn der Browser geschlossen
 * wird. Wer auf der Anmeldeseite das Häkchen wegnimmt (z. B. an einem fremden
 * Gerät), bekommt Sitzungs-Cookies ohne Ablaufdatum – der Browser wirft sie
 * beim Schließen weg.
 *
 * Supabase setzt sonst immer ein Ablaufdatum von 400 Tagen, egal was man
 * konfiguriert. Deshalb merkt sich ein kleines Cookie den Wunsch, und alle
 * Stellen, die Anmelde-Cookies schreiben (Browser, Server, Proxy), lassen das
 * Ablaufdatum weg, solange dieses Cookie da ist.
 *
 * Diese Datei ist bewusst ohne Server-Abhängigkeiten, damit sie auch im
 * Browser läuft.
 */

export const SITZUNG_COOKIE = "cm-sitzung";
export const SITZUNG_NUR_BROWSER = "browser";

type CookieEintrag = { name: string; value: string };

/** Hat die Person „Angemeldet bleiben“ abgewählt? */
export function nurFuerDieseSitzung(cookies: CookieEintrag[]) {
  return cookies.some((c) => c.name === SITZUNG_COOKIE && c.value === SITZUNG_NUR_BROWSER);
}

/**
 * Nimmt einem Cookie das Ablaufdatum, wenn die Anmeldung nur bis zum Schließen
 * des Browsers gelten soll. Sonst kommen die Optionen unverändert zurück.
 */
export function cookieOptionenFuerSitzung<T extends { maxAge?: number; expires?: Date }>(
  options: T,
  nurBrowser: boolean
): T {
  if (!nurBrowser) return options;
  const rest = { ...options };
  delete rest.maxAge;
  delete rest.expires;
  return rest;
}

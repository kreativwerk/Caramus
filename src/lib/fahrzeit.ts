/**
 * Fahrzeit-Schätzung mit Live-Verkehr.
 *
 * Bewusst anbieterunabhängig: Der Anbieter wird über Umgebungsvariablen
 * gewählt. Ist nichts konfiguriert oder scheitert der Aufruf, liefert die
 * Funktion `null` – die App fällt dann auf die manuelle Auswahl zurück und
 * funktioniert unverändert weiter. Es gibt bewusst keine Ausnahmen nach außen.
 *
 * Konfiguration (Server, niemals im Browser):
 *   FAHRZEIT_ANBIETER = here | google | openrouteservice
 *   FAHRZEIT_SCHLUESSEL = <API-Key>
 */

export type Koordinate = { lat: number; lng: number };

const ZEITLIMIT_MS = 4000;

function anbieter() {
  const name = (process.env.FAHRZEIT_ANBIETER ?? "").toLowerCase().trim();
  const schluessel = (process.env.FAHRZEIT_SCHLUESSEL ?? "").trim();
  if (!name || !schluessel) return null;
  return { name, schluessel };
}

/** Ist die Live-Berechnung überhaupt eingerichtet? */
export function fahrzeitVerfuegbar() {
  return anbieter() !== null;
}

async function holen(url: string, init?: RequestInit) {
  const abbruch = AbortSignal.timeout(ZEITLIMIT_MS);
  const antwort = await fetch(url, { ...init, signal: abbruch, cache: "no-store" });
  if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
  return antwort.json();
}

/**
 * Fahrzeit in Minuten von A nach B, mit aktueller Verkehrslage.
 * Gibt `null` zurück, wenn nicht konfiguriert oder nicht ermittelbar.
 */
export async function fahrzeitMinuten(
  von: Koordinate,
  nach: Koordinate
): Promise<number | null> {
  const a = anbieter();
  if (!a) return null;

  try {
    let sekunden: number | null = null;

    if (a.name === "here") {
      // HERE Routing v8 – EU-Anbieter, departureTime=now liefert Live-Verkehr
      const url =
        `https://router.hereapi.com/v8/routes?transportMode=car` +
        `&origin=${von.lat},${von.lng}&destination=${nach.lat},${nach.lng}` +
        `&departureTime=now&return=summary&apiKey=${encodeURIComponent(a.schluessel)}`;
      const daten = await holen(url);
      sekunden = daten?.routes?.[0]?.sections?.[0]?.summary?.duration ?? null;
    } else if (a.name === "google") {
      // Google Routes API – TRAFFIC_AWARE nutzt die aktuelle Verkehrslage
      const daten = await holen("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": a.schluessel,
          "X-Goog-FieldMask": "routes.duration",
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: von.lat, longitude: von.lng } } },
          destination: { location: { latLng: { latitude: nach.lat, longitude: nach.lng } } },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
        }),
      });
      const dauer = daten?.routes?.[0]?.duration; // z. B. "1284s"
      sekunden = typeof dauer === "string" ? parseInt(dauer, 10) : null;
    } else if (a.name === "openrouteservice") {
      // OpenRouteService – kostenfrei, aber ohne Live-Verkehr (reine Fahrzeit)
      const daten = await holen("https://api.openrouteservice.org/v2/directions/driving-car", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: a.schluessel },
        body: JSON.stringify({
          coordinates: [
            [von.lng, von.lat],
            [nach.lng, nach.lat],
          ],
        }),
      });
      sekunden = daten?.routes?.[0]?.summary?.duration ?? null;
    }

    if (!sekunden || !Number.isFinite(sekunden)) return null;
    const minuten = Math.round(sekunden / 60);
    // Unplausible Werte verwerfen, damit der Patient keinen Unsinn sieht
    if (minuten < 1 || minuten > 240) return null;
    return minuten;
  } catch {
    // Zeitüberschreitung, Kontingent erschöpft, Netzfehler: still auf manuell zurückfallen
    return null;
  }
}

/**
 * Adresse zu Koordinaten. Ergebnis wird beim Patienten gespeichert, damit die
 * Adresse nur ein einziges Mal an einen Kartendienst übermittelt wird.
 */
export async function adresseZuKoordinate(adresse: string): Promise<Koordinate | null> {
  const a = anbieter();
  if (!a || !adresse.trim()) return null;

  try {
    if (a.name === "here") {
      const url =
        `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(adresse)}` +
        `&in=countryCode:DEU&apiKey=${encodeURIComponent(a.schluessel)}`;
      const daten = await holen(url);
      const p = daten?.items?.[0]?.position;
      return p ? { lat: p.lat, lng: p.lng } : null;
    }
    if (a.name === "google") {
      const url =
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(adresse)}` +
        `&region=de&key=${encodeURIComponent(a.schluessel)}`;
      const daten = await holen(url);
      const p = daten?.results?.[0]?.geometry?.location;
      return p ? { lat: p.lat, lng: p.lng } : null;
    }
    if (a.name === "openrouteservice") {
      const url =
        `https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(a.schluessel)}` +
        `&text=${encodeURIComponent(adresse)}&boundary.country=DE&size=1`;
      const daten = await holen(url);
      const k = daten?.features?.[0]?.geometry?.coordinates;
      return Array.isArray(k) ? { lat: k[1], lng: k[0] } : null;
    }
    return null;
  } catch {
    return null;
  }
}

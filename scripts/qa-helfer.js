/*
 * Helfer für die Testläufe, die den Browser nicht brauchen.
 *
 * `speicherRundlauf` prüft einen Storage-Bucket auf Herz und Nieren:
 * hochladen, signiert wieder abrufen, Byte für Byte vergleichen, löschen.
 *
 * Warum eigens: Der Browsertest tunnelt seine Anfragen durch Node, weil die
 * TLS-Prüfung der Testumgebung die Verbindung sonst abbricht. Bei diesem Umweg
 * kommen Binärdaten nicht unverändert an – die Bilddatei landet leer im
 * Speicher. Der Weg über die echte Schnittstelle zeigt darum als Einziger
 * verlässlich, ob Inhalte wirklich ankommen.
 */
const fs = require("node:fs");
const path = require("node:path");

function konfiguration() {
  const datei = path.join(__dirname, "..", ".env.local");
  const werte = {};
  for (const zeile of fs.readFileSync(datei, "utf8").split("\n")) {
    const treffer = zeile.match(/^([A-Z0-9_]+)=(.*)$/);
    if (treffer) werte[treffer[1]] = treffer[2].trim();
  }
  return { url: werte.NEXT_PUBLIC_SUPABASE_URL, key: werte.NEXT_PUBLIC_SUPABASE_ANON_KEY };
}

async function anmelden({ url, key }, email, passwort) {
  const antwort = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: passwort }),
  });
  if (!antwort.ok) throw new Error(`Anmeldung fehlgeschlagen (${antwort.status})`);
  const daten = await antwort.json();
  return { token: daten.access_token, uid: daten.user.id };
}

/**
 * Lädt `dateiPfad` in `bucket` unter `zielPfad`, ruft die Datei signiert wieder
 * ab und vergleicht den Inhalt. Räumt danach auf. Wirft bei jeder Abweichung.
 * In `zielPfad` steht `{uid}` für die Kennung des angemeldeten Kontos – die
 * Speicherregeln erlauben nur den eigenen Ordner.
 */
async function speicherRundlauf({ bucket, dateiPfad, zielPfad, email, passwort, mime }) {
  const konf = konfiguration();
  const { token, uid } = await anmelden(konf, email, passwort);
  const kopf = { apikey: konf.key, Authorization: `Bearer ${token}` };
  const inhalt = fs.readFileSync(dateiPfad);
  // Die Regeln im Speicher verlangen den eigenen Ordner als erste Ebene
  zielPfad = zielPfad.replace("{uid}", uid);

  const hoch = await fetch(`${konf.url}/storage/v1/object/${bucket}/${zielPfad}`, {
    method: "POST",
    headers: { ...kopf, "Content-Type": mime },
    body: inhalt,
  });
  if (!hoch.ok) throw new Error(`Hochladen abgelehnt (${hoch.status}): ${await hoch.text()}`);

  try {
    const signatur = await fetch(`${konf.url}/storage/v1/object/sign/${bucket}/${zielPfad}`, {
      method: "POST",
      headers: { ...kopf, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: 120 }),
    });
    if (!signatur.ok) throw new Error(`Keine signierte Adresse (${signatur.status})`);
    const { signedURL } = await signatur.json();

    const runter = await fetch(`${konf.url}/storage/v1${signedURL}`);
    if (!runter.ok) throw new Error(`Abruf fehlgeschlagen (${runter.status})`);
    const zurueck = Buffer.from(await runter.arrayBuffer());

    if (zurueck.length !== inhalt.length) {
      throw new Error(`Größe weicht ab: ${inhalt.length} hoch, ${zurueck.length} zurück`);
    }
    if (!zurueck.equals(inhalt)) throw new Error("Inhalt weicht ab");

    // Ohne Anmeldung darf nichts herauskommen
    const ohne = await fetch(`${konf.url}/storage/v1/object/${bucket}/${zielPfad}`, {
      headers: { apikey: konf.key },
    });
    if (ohne.ok) throw new Error("Datei ist auch ohne Anmeldung abrufbar");

    return inhalt.length;
  } finally {
    await fetch(`${konf.url}/storage/v1/object/${bucket}/${zielPfad}`, {
      method: "DELETE",
      headers: kopf,
    });
  }
}

/**
 * Räumt Testdaten weg, damit ein Durchlauf denselben Ausgangszustand
 * vorfindet wie der davor. `filter` ist ein PostgREST-Ausdruck, z. B.
 * `file_name=eq.test-rezept.pdf`.
 */
async function testdatenLoeschen({ tabelle, filter, email, passwort }) {
  const konf = konfiguration();
  const { token } = await anmelden(konf, email, passwort);
  await fetch(`${konf.url}/rest/v1/${tabelle}?${filter}`, {
    method: "DELETE",
    headers: { apikey: konf.key, Authorization: `Bearer ${token}` },
  });
}

/**
 * Bringt die Termine in den Ausgangszustand: genau ein geplanter Termin,
 * der noch heute ansteht, keine laufende Anfahrt. Ohne das stolpert der Anfahrtstest
 * über die Termine, die frühere Durchläufe angelegt haben.
 */
async function terminBuehneVorbereiten({ email, passwort }) {
  const konf = konfiguration();
  const { token } = await anmelden(konf, email, passwort);
  const kopf = { apikey: konf.key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const antwort = await fetch(`${konf.url}/rest/v1/appointments?select=id&order=starts_at.asc`, {
    headers: kopf,
  });
  const termine = await antwort.json();
  if (!Array.isArray(termine) || termine.length === 0) {
    throw new Error("Kein Testtermin vorhanden – bitte einen Termin anlegen");
  }

  for (const t of termine.slice(1)) {
    await fetch(`${konf.url}/rest/v1/appointments?id=eq.${t.id}`, { method: "DELETE", headers: kopf });
  }

  // Die Praxis-Übersicht zeigt nur den heutigen Tag. Der Testtermin muss also
  // in der Zukunft liegen, aber noch heute – sonst taucht er dort nicht auf.
  const jetzt = new Date();
  const tagesende = new Date(jetzt);
  tagesende.setHours(23, 59, 0, 0);
  const start = new Date(Math.min(jetzt.getTime() + 30 * 60 * 1000, tagesende.getTime()));
  const beginn = start.toISOString();
  await fetch(`${konf.url}/rest/v1/appointments?id=eq.${termine[0].id}`, {
    method: "PATCH",
    headers: kopf,
    body: JSON.stringify({
      starts_at: beginn,
      status: "geplant",
      enroute_at: null,
      eta_minutes: null,
      arrived_at: null,
      eta_updated_at: null,
      delay_note: null,
      eta_quelle: "manuell",
    }),
  });
  return termine[0].id;
}

module.exports = { speicherRundlauf, testdatenLoeschen, terminBuehneVorbereiten };

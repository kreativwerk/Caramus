#!/usr/bin/env node
/*
 * Tickets aus dem Feedback-Bereich abholen und bearbeiten.
 *
 * Gedacht als Einstiegspunkt für eine Claude-Code-Routine: Das Skript holt
 * offene Rückmeldungen samt Screenshots und legt sie als Markdown ab, sodass
 * eine Sitzung direkt damit arbeiten kann.
 *
 *   node scripts/tickets.js holen                     offene Tickets + Bilder nach ./tickets/
 *   node scripts/tickets.js holen --alle              auch erledigte
 *   node scripts/tickets.js status <id> in_arbeit     Stand setzen
 *   node scripts/tickets.js antwort <id> "Text"       Rückmeldung an die Praxis schreiben
 *
 * Zugang (kein Service-Key nötig, es wird das Praxiskonto verwendet):
 *   TICKET_EMAIL=...  TICKET_PASSWORT=...  node scripts/tickets.js holen
 */
const fs = require("node:fs");
const path = require("node:path");

const WURZEL = path.join(__dirname, "..");
const ZIEL = path.join(WURZEL, "tickets");
const OFFEN = ["neu", "in_arbeit"];

function env() {
  const datei = path.join(WURZEL, ".env.local");
  const werte = {};
  if (fs.existsSync(datei)) {
    for (const zeile of fs.readFileSync(datei, "utf8").split("\n")) {
      const treffer = zeile.match(/^([A-Z0-9_]+)=(.*)$/);
      if (treffer) werte[treffer[1]] = treffer[2].trim();
    }
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || werte.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || werte.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.TICKET_EMAIL;
  const passwort = process.env.TICKET_PASSWORT;
  if (!url || !key) abbruch("Es fehlen NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  if (!email || !passwort) abbruch("Bitte TICKET_EMAIL und TICKET_PASSWORT setzen (Praxiskonto).");
  return { url, key, email, passwort };
}

function abbruch(text) {
  console.error("Abbruch:", text);
  process.exit(1);
}

async function anmelden({ url, key, email, passwort }) {
  const antwort = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: passwort }),
  });
  if (!antwort.ok) abbruch(`Anmeldung fehlgeschlagen (${antwort.status}).`);
  const daten = await antwort.json();
  return daten.access_token;
}

function kopf(key, token) {
  return { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function tickets({ url, key }, token, alle) {
  const filter = alle ? "" : `&status=in.(${OFFEN.join(",")})`;
  const antwort = await fetch(
    `${url}/rest/v1/feedback?select=*,feedback_attachments(*)&order=created_at.desc${filter}`,
    { headers: kopf(key, token) }
  );
  if (!antwort.ok) abbruch(`Tickets konnten nicht geladen werden (${antwort.status}).`);
  return antwort.json();
}

async function bildHolen({ url, key }, token, pfad, zielDatei) {
  // Erst eine signierte Adresse erzeugen, dann herunterladen – derselbe Weg,
  // den auch die App nimmt. Der Speicher bleibt dadurch privat.
  const signatur = await fetch(`${url}/storage/v1/object/sign/feedback-media/${pfad}`, {
    method: "POST",
    headers: kopf(key, token),
    body: JSON.stringify({ expiresIn: 300 }),
  });
  if (!signatur.ok) {
    console.error(`  Screenshot ${pfad} nicht freigegeben (${signatur.status})`);
    return false;
  }
  const { signedURL } = await signatur.json();
  const antwort = await fetch(`${url}/storage/v1${signedURL}`);
  if (!antwort.ok) {
    console.error(`  Screenshot ${pfad} nicht abrufbar (${antwort.status})`);
    return false;
  }
  const inhalt = Buffer.from(await antwort.arrayBuffer());
  if (inhalt.length === 0) {
    console.error(`  Screenshot ${pfad} kam leer an`);
    return false;
  }
  fs.writeFileSync(zielDatei, inhalt);
  return true;
}

async function holen(konf, token, alle) {
  const liste = await tickets(konf, token, alle);
  if (liste.length === 0) {
    console.log("Keine offenen Tickets.");
    return;
  }
  fs.mkdirSync(ZIEL, { recursive: true });

  const zeilen = ["# Offene Rückmeldungen aus der Praxis", ""];
  for (const t of liste) {
    const ordner = path.join(ZIEL, t.id);
    fs.mkdirSync(ordner, { recursive: true });

    zeilen.push(`## ${t.title}`, "");
    zeilen.push(`- Ticket: \`${t.id}\``);
    zeilen.push(`- Art: ${t.art} · Stand: ${t.status}`);
    zeilen.push(`- Gemeldet: ${new Date(t.created_at).toLocaleString("de-DE")}`);
    if (t.body) zeilen.push("", t.body);

    const bilder = t.feedback_attachments ?? [];
    if (bilder.length) {
      zeilen.push("", "Screenshots:");
      for (const b of bilder) {
        const name = path.basename(b.file_path);
        const ok = await bildHolen(konf, token, b.file_path, path.join(ordner, name));
        zeilen.push(`- ${ok ? `tickets/${t.id}/${name}` : `(konnte nicht geladen werden: ${b.file_name})`}`);
      }
    }
    zeilen.push("");
  }

  const datei = path.join(ZIEL, "OFFEN.md");
  fs.writeFileSync(datei, zeilen.join("\n"));
  console.log(`${liste.length} Ticket(s) abgelegt in ${path.relative(WURZEL, datei)}`);
}

async function aendern(konf, token, id, felder) {
  const antwort = await fetch(`${konf.url}/rest/v1/feedback?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...kopf(konf.key, token), Prefer: "return=representation" },
    body: JSON.stringify({ ...felder, updated_at: new Date().toISOString() }),
  });
  if (!antwort.ok) abbruch(`Ticket konnte nicht geändert werden (${antwort.status}).`);
  const [neu] = await antwort.json();
  if (!neu) abbruch("Ticket nicht gefunden.");
  console.log(`Ticket „${neu.title}" → Stand: ${neu.status}`);
}

(async () => {
  const [befehl, ...rest] = process.argv.slice(2);
  const konf = env();
  const token = await anmelden(konf);

  if (!befehl || befehl === "holen") {
    await holen(konf, token, rest.includes("--alle"));
  } else if (befehl === "status") {
    const [id, status] = rest;
    if (!id || !["neu", "in_arbeit", "erledigt", "zurueckgestellt"].includes(status)) {
      abbruch("Aufruf: node scripts/tickets.js status <id> neu|in_arbeit|erledigt|zurueckgestellt");
    }
    await aendern(konf, token, id, { status });
  } else if (befehl === "antwort") {
    const [id, ...text] = rest;
    if (!id || text.length === 0) abbruch('Aufruf: node scripts/tickets.js antwort <id> "Text"');
    await aendern(konf, token, id, { antwort: text.join(" ") });
  } else {
    abbruch(`Unbekannter Befehl „${befehl}". Möglich: holen, status, antwort.`);
  }
})().catch((e) => {
  console.error("Fehler:", e.message);
  process.exit(2);
});

// Test des Feedback-Bereichs: Charles schreibt ein Ticket mit Screenshot,
// hakt es ab – und das Abhol-Skript findet es dazwischen.
const pw = require("playwright-core");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { speicherRundlauf } = require("./qa-helfer");

const BASE = "http://localhost:3000";
const PASS = "QaTest!2026";
const KONTO = "qa-therapeut@curamus-test.de";
const TITEL = `QA-Ticket ${Date.now()}`;
const results = [];
const ok = (s) => { results.push(true); console.log("PASS:", s); };
const fail = (s, e) => { results.push(false); console.log("FAIL:", s, "-", (e?.message ?? e).split("\n")[0]); };

async function supabaseBridge(ctx) {
  await ctx.route(/supabase\.co/, async (route) => {
    const req = route.request();
    try {
      const headers = { ...req.headers() };
      delete headers["host"]; delete headers["content-length"]; delete headers["accept-encoding"];
      const antwort = await fetch(req.url(), {
        method: req.method(), headers,
        body: ["GET", "HEAD"].includes(req.method()) ? undefined : req.postDataBuffer(),
      });
      const body = Buffer.from(await antwort.arrayBuffer());
      const resHeaders = {};
      antwort.headers.forEach((v, k) => {
        if (!["content-encoding", "transfer-encoding", "content-length"].includes(k)) resHeaders[k] = v;
      });
      await route.fulfill({ status: antwort.status, headers: resHeaders, body });
    } catch { await route.abort(); }
  });
}

function skript(...args) {
  return execFileSync("node", [path.join(__dirname, "tickets.js"), ...args], {
    env: { ...process.env, TICKET_EMAIL: KONTO, TICKET_PASSWORT: PASS },
    encoding: "utf8",
  });
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await supabaseBridge(ctx);
  const praxis = await ctx.newPage();

  await praxis.goto(BASE + "/login", { waitUntil: "networkidle" });
  await praxis.getByRole("button", { name: "Mit Passwort" }).click();
  await praxis.fill("#email", KONTO);
  await praxis.fill("#passwort", PASS);
  await praxis.getByRole("button", { name: "Anmelden", exact: true }).click();
  await praxis.waitForURL(/\/praxis/, { timeout: 20000 });

  // Ticket mit Screenshot schreiben
  try {
    await praxis.goto(BASE + "/praxis/feedback", { waitUntil: "domcontentloaded" });
    await praxis.waitForSelector("#body", { timeout: 20000 });
    // Ein einziges Textfeld: die Ueberschrift entsteht aus dem ersten Satz
    await praxis.fill("#body", `${TITEL}. Beim Speichern passiert nichts, der Knopf bleibt grau.`);
    await praxis.setInputFiles("#bilder", path.join(__dirname, "test-screenshot.png"));
    await praxis.getByRole("button", { name: /Absenden/ }).click();
    const karte = praxis.locator("li:has(> .card)").filter({ hasText: TITEL }).first();
    await karte.waitFor({ timeout: 25000 });
    const text = await karte.textContent();
    if (!text.includes("Eingegangen")) throw new Error("Stand fehlt: " + text.slice(0, 90));
    ok("Ticket mit Screenshot angelegt, Zeitstrahl zeigt Stand 'Eingegangen'");
  } catch (e) { fail("Ticket anlegen", e); }

  // Screenshot wird als Vorschau angezeigt
  try {
    const karte = praxis.locator("li:has(> .card)").filter({ hasText: TITEL }).first();
    const bild = karte.locator("img").first();
    await bild.waitFor({ timeout: 15000 });
    const quelle = await bild.getAttribute("src");
    if (!quelle || !quelle.includes("feedback-media")) throw new Error("Kein Screenshot: " + quelle);
    if (quelle.includes("token") === false) throw new Error("Bild ohne signierte URL – Speicher wäre öffentlich");
    ok("Screenshot wird als Vorschau über eine signierte URL angezeigt");
  } catch (e) { fail("Screenshot-Vorschau", e); }

  await praxis.screenshot({ path: "feedback-praxis.png", clip: { x: 0, y: 100, width: 1000, height: 620 } });

  // Bilder muessen unveraendert im Speicher ankommen. Das prueft nur dieser
  // Weg zuverlaessig – der Browsertest tunnelt und verliert dabei Binaerdaten.
  try {
    const groesse = await speicherRundlauf({
      bucket: "feedback-media",
      dateiPfad: path.join(__dirname, "test-screenshot.png"),
      zielPfad: `{uid}/qa-pruefung-${Date.now()}.png`,
      email: KONTO,
      passwort: PASS,
      mime: "image/png",
    });
    ok(`Screenshot kommt unveraendert im privaten Speicher an (${groesse} Byte) und ist ohne Anmeldung gesperrt`);
  } catch (e) { fail("Speicher-Rundlauf feedback-media", e); }

  // Das Abhol-Skript findet das Ticket samt Bild
  let ticketId = null;
  try {
    const ausgabe = skript("holen");
    const md = fs.readFileSync(path.join(__dirname, "..", "tickets", "OFFEN.md"), "utf8");
    if (!md.includes(TITEL)) throw new Error("Ticket fehlt in OFFEN.md");
    ticketId = md.match(/- Ticket: `([0-9a-f-]{36})`/g)
      ?.map((z) => z.match(/`([0-9a-f-]{36})`/)[1])
      .find((id) => md.split(id)[0].includes(TITEL) === false || md.includes(TITEL));
    if (!md.includes("Screenshots:")) throw new Error("Screenshot nicht verknuepft");
    if (!md.includes("Beim Speichern passiert nichts")) throw new Error("Beschreibung fehlt");
    ok(`Abhol-Skript legt Ticket samt Beschreibung und Screenshot-Verweis ab (${ausgabe.trim()})`);
  } catch (e) { fail("Abhol-Skript", e); }

  // Stand über das Skript setzen – die Praxis sieht ihn
  try {
    const md = fs.readFileSync(path.join(__dirname, "..", "tickets", "OFFEN.md"), "utf8");
    const block = md.split("## ").find((b) => b.startsWith(TITEL));
    const id = block?.match(/Ticket: `([0-9a-f-]{36})`/)?.[1];
    if (!id) throw new Error("Ticket-Nummer nicht gefunden");
    skript("status", id, "in_arbeit");
    skript("antwort", id, "Ist erkannt, wir bauen das gerade um.");
    await praxis.reload({ waitUntil: "domcontentloaded" });
    await praxis.waitForSelector("#body", { timeout: 20000 });
    const karte = praxis.locator("li:has(> .card)").filter({ hasText: TITEL }).first();
    const text = await karte.textContent();
    if (!text.includes("In Arbeit")) throw new Error("Stand nicht übernommen: " + text.slice(0, 90));
    if (!text.includes("Ist erkannt")) throw new Error("Antwort fehlt");
    ticketId = id;
    ok("Skript setzt Stand auf 'In Arbeit' und schreibt eine Antwort, die Praxis sieht beides");
  } catch (e) { fail("Stand und Antwort über das Skript", e); }

  // Charles hakt selbst ab
  try {
    const karte = praxis.locator("li:has(> .card)").filter({ hasText: TITEL }).first();
    await karte.getByRole("button", { name: /Erledigt/ }).click();
    await praxis.waitForSelector(`li:has(> .card):has-text("${TITEL}"):has-text("Erledigt")`, { timeout: 20000 });
    ok("Praxis hakt den Eintrag selbst als erledigt ab");
  } catch (e) { fail("Erledigt abhaken", e); }

  // Aufräumen: Testticket entfernen
  if (ticketId) {
    try {
      skript("status", ticketId, "neu");
      await praxis.reload({ waitUntil: "domcontentloaded" });
    await praxis.waitForSelector("#body", { timeout: 20000 });
      const karte = praxis.locator("li:has(> .card)").filter({ hasText: TITEL }).first();
      await karte.getByRole("button", { name: "Zurückziehen" }).click();
      await praxis.waitForTimeout(2500);
    } catch { /* Testdaten dürfen liegenbleiben */ }
  }
  if (!process.env.TICKETS_BEHALTEN) {
    fs.rmSync(path.join(__dirname, "..", "tickets"), { recursive: true, force: true });
  }

  await browser.close();
  const fails = results.filter((r) => !r).length;
  console.log(`\n===== FEEDBACK: ${results.length - fails}/${results.length} bestanden =====`);
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error("FATAL:", e); process.exit(2); });

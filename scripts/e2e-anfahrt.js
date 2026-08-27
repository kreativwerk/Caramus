// Test der Live-Anfahrt: Therapeut startet die Fahrt, Patient sieht sie in Echtzeit.
// Vorbereitung (sonst schlaegt der Lauf fehl, weil der Termin noch auf "unterwegs" steht):
//   update public.appointments set enroute_at=null, eta_minutes=null, arrived_at=null,
//     starts_at = now() + interval '90 minutes'
//   where patient_id = (select id from public.profiles where full_name = 'Erika Beispiel');
// Start: npm run build && npm run start, dann
//   NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=<CA> node scripts/e2e-anfahrt.js
const pw = require("playwright-core");
const { terminBuehneVorbereiten } = require("./qa-helfer");
const BASE = "http://localhost:3000";
const PASS = "QaTest!2026";
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

async function login(page, email) {
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Mit Passwort" }).click();
  await page.fill("#email", email);
  await page.fill("#passwort", PASS);
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.waitForURL(/\/(app|praxis)/, { timeout: 20000 });
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });
  const patientCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const praxisCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await supabaseBridge(patientCtx);
  await supabaseBridge(praxisCtx);
  const patient = await patientCtx.newPage();
  const praxis = await praxisCtx.newPage();

  // Ausgangszustand herstellen: ein geplanter Termin, keine laufende Anfahrt
  await terminBuehneVorbereiten({ email: "qa-therapeut@curamus-test.de", passwort: PASS });

  await login(patient, "qa-patient@curamus-test.de");
  await login(praxis, "qa-therapeut@curamus-test.de");

  // Patient bleibt auf dem Dashboard – ohne Neuladen soll die Live-Karte erscheinen
  try {
    await patient.goto(BASE + "/app", { waitUntil: "networkidle" });
    const sichtbar = await patient.locator("section[aria-label='Anfahrt Ihres Therapeuten']").count();
    if (sichtbar > 0) throw new Error("Live-Karte war schon vor dem Start sichtbar");
    ok("Vor dem Start: keine Live-Karte beim Patienten");
  } catch (e) { fail("Ausgangszustand", e); }

  // Therapeut startet die Fahrt
  try {
    await praxis.goto(BASE + "/praxis", { waitUntil: "networkidle" });
    await praxis.waitForSelector("text=Erika Beispiel", { timeout: 15000 });
    // Bei mehreren Terminen zaehlt der naechste – der steht oben
    await praxis.getByRole("button", { name: /Bin unterwegs/ }).first().click();
    await praxis.waitForSelector("text=Wie lange brauchen Sie", { timeout: 5000 });
    // Fallback: Ohne eingerichteten Verkehrsdienst bleibt die manuelle Auswahl
    await praxis.waitForSelector("text=Fahrzeit wird berechnet", { state: "detached", timeout: 20000 });
    if (await praxis.getByRole("button", { name: /Vorschlag:/ }).count()) {
      throw new Error("Vorschlag ohne eingerichteten Anbieter angezeigt");
    }
    await praxis.getByRole("button", { name: "20 Min.", exact: true }).first().click();
    await praxis.waitForSelector("text=/Unterwegs · noch ca\\./", { timeout: 20000 });
    ok("Therapeut startet Anfahrt mit 20 Minuten, Status wechselt auf 'Unterwegs'");
  } catch (e) { fail("Anfahrt starten", e); }

  // Echtzeit: Patient sieht die Karte OHNE Neuladen
  try {
    await patient.waitForSelector("section[aria-label='Anfahrt Ihres Therapeuten']", { timeout: 20000 });
    await patient.waitForSelector("text=Auf dem Weg zu Ihnen", { timeout: 5000 });
    await patient.waitForSelector("text=/^Charles ist unterwegs zu Ihnen\\.$/", { timeout: 5000 });
    await patient.waitForSelector("text=/noch ca\\. (19|20) Min\\./", { timeout: 5000 });
    ok("Patient sieht Live-Karte in Echtzeit (ohne Neuladen) mit Countdown");
  } catch (e) { fail("Echtzeit-Anzeige beim Patienten", e); }

  // Animation: Fortschrittsbalken und Auto bewegen sich
  try {
    const balken = patient.locator("section[aria-label='Anfahrt Ihres Therapeuten'] div[style*='width']").first();
    const vorher = await balken.getAttribute("style");
    await patient.waitForTimeout(6000);
    const nachher = await balken.getAttribute("style");
    if (vorher === nachher) throw new Error("Fortschritt hat sich nicht verändert: " + vorher);
    ok(`Animation läuft: Fortschritt wandert (${vorher?.slice(0, 24)} → ${nachher?.slice(0, 24)})`);
  } catch (e) { fail("Fortschrittsanimation", e); }

  // Verspätung über die Praxis-App melden
  try {
    await praxis.getByRole("button", { name: "Verspätung melden" }).first().click();
    await praxis.waitForSelector("text=Wie viel später wird es?", { timeout: 5000 });
    await praxis.getByRole("button", { name: "+10 Min.", exact: true }).first().click();
    await praxis.waitForSelector("text=/Verspätung gemeldet um/", { timeout: 20000 });
    await praxis.waitForSelector("text=/noch ca\\. (29|30) Min\\./", { timeout: 10000 });
    ok("Praxis meldet +10 Min. Verspätung, neue Restzeit wird übernommen");
  } catch (e) { fail("Verspätung melden", e); }

  try {
    await patient.waitForSelector("text=Es dauert etwas länger", { timeout: 20000 });
    await patient.waitForSelector("text=/noch ca\\. (29|30) Min\\./", { timeout: 10000 });
    ok("Patient sieht Verspätungshinweis und aktualisierte Ankunftszeit in Echtzeit");
  } catch (e) { fail("Verspätung beim Patienten", e); }

  await patient.screenshot({ path: "anfahrt-patient.png" });
  await praxis.screenshot({ path: "anfahrt-praxis.png", clip: { x: 0, y: 130, width: 1000, height: 460 } });

  // Ankunft melden
  try {
    await praxis.getByRole("button", { name: "Angekommen" }).first().click();
    await praxis.waitForSelector("text=/Angekommen um/", { timeout: 20000 });
    await patient.waitForSelector("text=/ist da/", { timeout: 20000 });
    ok("Ankunft gemeldet: Patient sieht in Echtzeit 'ist da'");
  } catch (e) { fail("Ankunft melden", e); }

  await patient.screenshot({ path: "anfahrt-angekommen.png" });
  await browser.close();

  const fails = results.filter((r) => !r).length;
  console.log(`\n===== LIVE-ANFAHRT: ${results.length - fails}/${results.length} bestanden =====`);
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error("FATAL:", e); process.exit(2); });

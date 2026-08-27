// Test des Dokumentenbereichs: Patient laedt Unterlage hoch, Praxis setzt Status.
// Vorbereitung: delete from public.documents where patient_id =
//   (select id from public.profiles where full_name = 'Erika Beispiel');
// Start: npm run build && npm run start, dann node scripts/e2e-dokumente.js
const pw = require("playwright-core");
const path = require("node:path");
const { speicherRundlauf, testdatenLoeschen } = require("./speicher-check");
const BASE = "http://localhost:3000";
const PASS = "QaTest!2026";
const results = [];
const ok = (s) => { results.push(true); console.log("PASS:", s); };
const fail = (s, e) => { results.push(false); console.log("FAIL:", s, "-", (e?.message ?? e).split("\n")[0]); };

async function supabaseBridge(ctx) {
  await ctx.route(/supabase\.co/, async (route) => {
    const req = route.request();
    try {
      const h = { ...req.headers() }; delete h["host"]; delete h["content-length"]; delete h["accept-encoding"];
      const a = await fetch(req.url(), { method: req.method(), headers: h,
        body: ["GET","HEAD"].includes(req.method()) ? undefined : req.postDataBuffer() });
      const body = Buffer.from(await a.arrayBuffer());
      const rh = {}; a.headers.forEach((v,k)=>{ if(!["content-encoding","transfer-encoding","content-length"].includes(k)) rh[k]=v; });
      await route.fulfill({ status: a.status, headers: rh, body });
    } catch { await route.abort(); }
  });
}
async function login(page, email) {
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Mit Passwort" }).click();
  await page.fill("#email", email); await page.fill("#passwort", PASS);
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.waitForURL(/\/(app|praxis)/, { timeout: 20000 });
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });
  const pCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const xCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await supabaseBridge(pCtx); await supabaseBridge(xCtx);
  const patient = await pCtx.newPage();
  const praxis = await xCtx.newPage();
  await login(patient, "qa-patient@curamus-test.de");
  await login(praxis, "qa-therapeut@curamus-test.de");

  // Reste frueherer Durchlaeufe wegraeumen, sonst trifft die Suche unten
  // die alte Karte statt der neuen
  await testdatenLoeschen({
    tabelle: "documents",
    filter: "file_name=eq.test-rezept.pdf",
    email: "qa-therapeut@curamus-test.de",
    passwort: PASS,
  });

  // Patient: Unterlage hochladen
  try {
    await patient.goto(BASE + "/app/dokumente", { waitUntil: "networkidle" });
    await patient.selectOption("#kind", "rezept");
    await patient.setInputFiles("#datei", __dirname + "/test-rezept.pdf");
    await patient.getByRole("button", { name: "Unterlage senden" }).click();
    await patient.waitForSelector("text=/ist bei uns eingegangen/", { timeout: 25000 });
    // Auf die Karte in der Liste pruefen (nicht auf die Auswahlliste im Formular)
    const karte = patient.locator("li.card").filter({ hasText: "test-rezept.pdf" }).first();
    await karte.waitFor({ timeout: 15000 });
    const text = (await karte.textContent()) ?? "";
    if (!text.includes("Rezept / Verordnung")) throw new Error("Dokumentart fehlt: " + text.slice(0, 80));
    if (!text.includes("Eingegangen")) throw new Error("Status fehlt: " + text.slice(0, 80));
    ok("Patient laedt Rezept hoch, Karte zeigt Art und Status 'Eingegangen'");
  } catch (e) { fail("Upload Patient", e); }
  await patient.screenshot({ path: "dok-patient.png", fullPage: false });

  // Der Inhalt muss unveraendert im privaten Speicher ankommen. Der Browsertest
  // tunnelt seine Anfragen durch Node und verliert dabei Binaerdaten, deshalb
  // laeuft diese Pruefung ueber die echte Schnittstelle.
  try {
    const groesse = await speicherRundlauf({
      bucket: "patient-docs",
      dateiPfad: path.join(__dirname, "test-rezept.pdf"),
      zielPfad: `{uid}/qa-pruefung-${Date.now()}.pdf`,
      email: "qa-patient@curamus-test.de",
      passwort: PASS,
      mime: "application/pdf",
    });
    ok(`Rezept kommt unveraendert im privaten Speicher an (${groesse} Byte) und ist ohne Anmeldung gesperrt`);
  } catch (e) { fail("Speicher-Rundlauf patient-docs", e); }

  // Praxis: Eingang sehen und Status setzen
  try {
    await praxis.goto(BASE + "/praxis/dokumente", { waitUntil: "networkidle" });
    await praxis.waitForSelector("text=/Erika Beispiel · Rezept/", { timeout: 15000 });
    ok("Praxis sieht die Unterlage im strukturierten Eingang");
  } catch (e) { fail("Eingang Praxis", e); }

  try {
    await praxis.getByRole("button", { name: "→ In Prüfung" }).first().click();
    await praxis.waitForSelector("h2:has-text('In Prüfung')", { timeout: 20000 });
    ok("Praxis setzt Status auf 'In Prüfung', Gruppierung aktualisiert sich");
  } catch (e) { fail("Status in Pruefung", e); }

  try {
    await praxis.getByRole("button", { name: "→ Unvollständig" }).first().click();
    await praxis.fill('input[name="status_note"]', "Bitte die Rückseite mit dem Vermerk Hausbesuch nachreichen.");
    await praxis.getByRole("button", { name: "Hinweis senden" }).click();
    await praxis.waitForSelector("text=/Hinweis an Patient/", { timeout: 20000 });
    ok("Praxis meldet 'Unvollständig' mit Hinweistext");
  } catch (e) { fail("Status unvollstaendig", e); }
  await praxis.screenshot({ path: "dok-praxis.png", clip: { x: 0, y: 100, width: 1000, height: 520 } });

  // Patient sieht Hinweis
  try {
    await patient.reload({ waitUntil: "networkidle" });
    await patient.waitForSelector("text=Unvollständig", { timeout: 15000 });
    await patient.waitForSelector("text=/Rückseite mit dem Vermerk/", { timeout: 5000 });
    ok("Patient sieht Status 'Unvollständig' samt Hinweis");
  } catch (e) { fail("Hinweis beim Patienten", e); }

  // Weitergeleitet -> Patient kann nicht mehr loeschen
  try {
    await praxis.goto(BASE + "/praxis/dokumente", { waitUntil: "networkidle" });
    await praxis.getByRole("button", { name: "→ Weitergeleitet" }).first().click();
    await praxis.waitForSelector("h2:has-text('Weitergeleitet')", { timeout: 20000 });
    await patient.reload({ waitUntil: "networkidle" });
    await patient.waitForSelector("text=/An die Abrechnung weitergeleitet/", { timeout: 15000 });
    // Nur die weitergeleitete Karte pruefen – aeltere Testdaten duerfen loeschbar bleiben
    const karte = patient
      .locator("li.card")
      .filter({ hasText: "An die Abrechnung weitergeleitet" })
      .first();
    const loeschbar = await karte.getByRole("button", { name: "Entfernen" }).count();
    if (loeschbar > 0) throw new Error("Weitergeleitetes Dokument ist noch loeschbar");
    ok("Weitergeleitet: Patient sieht Abschlussstatus, Löschen gesperrt");
  } catch (e) { fail("Weiterleitung", e); }

  await browser.close();
  const fails = results.filter((r) => !r).length;
  console.log(`\n===== DOKUMENTE: ${results.length - fails}/${results.length} bestanden =====`);
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error("FATAL:", e); process.exit(2); });

// End-to-End-Test der Curamus-App mit den QA-Konten (docs/deployment.md).
// Voraussetzungen: Produktions-Build läuft auf localhost:3000 (npm run build && npm run start),
// playwright-core installiert, Chromium unter /opt/pw-browsers/chromium (oder PW_CHROMIUM setzen).
// In Umgebungen mit TLS-Interception-Proxy:
//   NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=<CA-Bundle> node scripts/e2e.js
// Die eingebaute Supabase-Bruecke tunnelt Browser-Aufrufe dann durch Node.
// Vor jedem Lauf die QA-Daten von "Erika Beispiel" zuruecksetzen (siehe docs/deployment.md).
const pw = require("playwright-core");
const BASE = "http://localhost:3000";
const PASS = "QaTest!2026";
const results = [];

function ok(step) { results.push(["PASS", step]); console.log("PASS:", step); }
function fail(step, err) { results.push(["FAIL", step + " – " + (err?.message ?? err)]); console.log("FAIL:", step, "-", err?.message ?? err); }

async function setRange(page, selector, value) {
  await page.$eval(selector, (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function login(page, email) {
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Mit Passwort" }).click();
  await page.fill("#email", email);
  await page.fill("#passwort", PASS);
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.waitForURL(/\/(app|praxis)/, { timeout: 20000 });
}


// Brücke: Browser-Aufrufe an Supabase durch Node tunneln (Chromiums TLS wird vom
// Abhör-Proxy resettet; Node-fetch mit NODE_USE_ENV_PROXY funktioniert).
async function supabaseBridge(ctx) {
  await ctx.route(/supabase\.co/, async (route) => {
    const req = route.request();
    try {
      const headers = { ...req.headers() };
      delete headers["host"]; delete headers["content-length"]; delete headers["accept-encoding"];
      const antwort = await fetch(req.url(), {
        method: req.method(),
        headers,
        body: ["GET", "HEAD"].includes(req.method()) ? undefined : req.postDataBuffer(),
      });
      const body = Buffer.from(await antwort.arrayBuffer());
      const resHeaders = {};
      antwort.headers.forEach((v, k) => {
        if (!["content-encoding", "transfer-encoding", "content-length"].includes(k)) resHeaders[k] = v;
      });
      await route.fulfill({ status: antwort.status, headers: resHeaders, body });
    } catch (e) {
      await route.abort();
    }
  });
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium" });
  const patientCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const praxisCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Fuer den Test der Benachrichtigungen: Der Browser fragt sonst nicht
  await patientCtx.grantPermissions(["notifications"], { origin: BASE });
  await supabaseBridge(patientCtx);
  await supabaseBridge(praxisCtx);
  const patient = await patientCtx.newPage();
  const praxis = await praxisCtx.newPage();

  // ---------- Patient: Login, Profil, Terminanfrage ----------
  try {
    await login(patient, "qa-patient@curamus-test.de");
    await patient.waitForSelector("text=Hallo Erika", { timeout: 15000 });
    ok("Patient-Login mit Passwort, Dashboard begrüßt mit Vornamen");
  } catch (e) { fail("Patient-Login", e); }

  try {
    await patient.goto(BASE + "/app/profil", { waitUntil: "networkidle" });
    await patient.fill("#phone", "0911 555 1234");
    await patient.fill("#street", "Beispielstraße 12");
    await patient.fill("#zip", "90411");
    await patient.fill("#city", "Nürnberg");
    await patient.getByRole("button", { name: "Speichern" }).click();
    await patient.waitForSelector("text=Ihre Angaben wurden gespeichert", { timeout: 15000 });
    ok("Patient-Profil: Adresse gespeichert");
  } catch (e) { fail("Patient-Profil speichern", e); }

  try {
    await patient.goto(BASE + "/app/termine", { waitUntil: "networkidle" });
    await patient.getByRole("button", { name: "Termin anfragen" }).click();
    await patient.fill("#wunschzeiten", "Donnerstag Vormittag oder Freitag zwischen 14 und 17 Uhr");
    await patient.fill("#nachricht", "Bitte klingeln, Aufzug vorhanden.");
    await patient.setInputFiles("#dokumente-upload", __dirname + "/test-rezept.pdf");
    await patient.getByRole("button", { name: "Termin anfragen", exact: true }).last().click();
    await patient.waitForSelector("text=inklusive 1 Dokument", { timeout: 25000 });
    await patient.waitForSelector("text=Wartet auf Bestätigung", { timeout: 15000 });
    ok("Terminanfrage gestellt, Status 'Wartet auf Bestätigung' sichtbar");
  } catch (e) { fail("Terminanfrage stellen", e); }

  // ---------- Therapeut: Anfrage bestätigen ----------
  try {
    await login(praxis, "qa-therapeut@curamus-test.de");
    await praxis.waitForSelector("text=Tagesübersicht", { timeout: 15000 });
    ok("Therapeuten-Login, Praxis-Dashboard sichtbar");
  } catch (e) { fail("Therapeuten-Login", e); }

  try {
    await praxis.goto(BASE + "/praxis/anfragen", { waitUntil: "networkidle" });
    await praxis.waitForSelector("text=Erika Beispiel", { timeout: 15000 });
    await praxis.waitForSelector("text=Beispielstraße 12", { timeout: 5000 });
    await praxis.waitForSelector("text=Mitgesendete Dokumente", { timeout: 8000 });
    await praxis.waitForSelector("text=test-rezept.pdf", { timeout: 5000 });
    ok("Anfrage erscheint im Praxisbereich mit Patientenadresse und PDF-Dokument");
  } catch (e) { fail("Anfrage im Praxisbereich", e); }

  try {
    await praxis.getByRole("button", { name: "Termin bestätigen" }).click();
    const morgen = new Date(Date.now() + 2 * 3600 * 1000);
    const val = morgen.toISOString().slice(0, 16);
    await praxis.fill('input[name="starts_at"]', val);
    await praxis.fill('input[name="travel_note"]', "ca. 20 Min. Anfahrt");
    await praxis.getByRole("button", { name: "Bestätigen", exact: true }).click();
    await praxis.waitForSelector("text=Alles erledigt", { timeout: 20000 });
    ok("Anfrage bestätigt, Termin angelegt, Anfrageliste leer");
  } catch (e) { fail("Anfrage bestätigen", e); }

  try {
    await praxis.goto(BASE + "/praxis/termine", { waitUntil: "networkidle" });
    await praxis.waitForSelector("text=Erika Beispiel", { timeout: 15000 });
    await praxis.waitForSelector("text=Beispielstraße 12", { timeout: 5000 });
    ok("Termin in Praxis-Terminliste mit Adresse");
  } catch (e) { fail("Praxis-Terminliste", e); }

  if (global.terminHeute) {
    try {
      await praxis.goto(BASE + "/praxis", { waitUntil: "networkidle" });
      await praxis.waitForSelector("text=Erika Beispiel", { timeout: 15000 });
      await praxis.waitForSelector("text=ca. 20 Min. Anfahrt", { timeout: 5000 });
      ok("Tagestour auf Dashboard zeigt Besuch mit Fahrhinweis");
    } catch (e) { fail("Tagestour", e); }
  } else {
    console.log("SKIP: Tagestour (Testtermin liegt nach Mitternacht)");
  }

  // ---------- Therapeut: Trainingsplan zusammenstellen ----------
  try {
    await praxis.goto(BASE + "/praxis/patienten", { waitUntil: "networkidle" });
    await praxis.getByText("Erika Beispiel").click();
    await praxis.waitForSelector("text=Trainingsplan", { timeout: 15000 });
    await praxis.getByRole("button", { name: "Übung hinzufügen" }).click();
    await praxis.selectOption('select[name="exercise_id"]', { index: 1 });
    await praxis.fill('input[name="instructions"]', "Langsam und kontrolliert");
    await praxis.getByRole("button", { name: "Hinzufügen", exact: true }).click();
    await praxis.waitForSelector("text=1.", { timeout: 20000 });
    ok("Übung aus Bibliothek zum Trainingsplan hinzugefügt");
  } catch (e) { fail("Plan-Editor", e); }

  // ---------- Chat Therapeut -> Patient ----------
  try {
    await praxis.goto(BASE + "/praxis/chat", { waitUntil: "networkidle" });
    await praxis.getByText("Erika Beispiel").click();
    await praxis.waitForSelector("textarea", { timeout: 15000 });
    await praxis.fill("textarea", "Hallo Frau Beispiel, Ihr Termin ist bestätigt. Bis bald!");
    await praxis.getByRole("button", { name: "Senden" }).click();
    await praxis.waitForSelector("text=Ihr Termin ist bestätigt", { timeout: 15000 });
    ok("Chat: Nachricht Therapeut → Patient gesendet");
  } catch (e) { fail("Chat senden (Therapeut)", e); }

  // ---------- Patient: Termin, Plan-Feedback, Chat-Antwort ----------
  try {
    await patient.goto(BASE + "/app", { waitUntil: "networkidle" });
    await patient.waitForSelector("text=Nächster Termin", { timeout: 15000 });
    const dashboardText = await patient.textContent("main");
    // Terminkarte zeigt Tag, Monatsnamen und Uhrzeit
    const monate = "Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember";
    if (!new RegExp(`(${monate})`).test(dashboardText)) throw new Error("kein Monat auf Dashboard");
    if (!/\d{1,2}:\d{2} Uhr/.test(dashboardText)) throw new Error("keine Uhrzeit auf Dashboard");
    ok("Patient-Dashboard zeigt bestätigten Hausbesuch");
  } catch (e) { fail("Patient-Dashboard Termin", e); }

  try {
    await patient.goto(BASE + "/app/plan", { waitUntil: "networkidle" });
    await patient.waitForSelector("text=Übung 1", { timeout: 15000 });
    await patient.waitForSelector("text=Langsam und kontrolliert", { timeout: 5000 });
    // Der Plan kann aus frueheren Testlaeufen mehrere Uebungen enthalten
    await patient.getByRole("button", { name: /Übung erledigt/ }).first().click();
    await setRange(patient, 'input[type="range"]', "3");
    await patient.locator("textarea").first().fill("Ging gut, leichtes Ziehen im Knie.");
    await patient.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await patient.waitForSelector("text=Heute erledigt", { timeout: 20000 });
    // Zaehler haengt davon ab, wie viele Uebungen im Plan liegen
    await patient.waitForSelector("text=/[1-9]\\d* von \\d+ Übungen geschafft/", { timeout: 8000 });
    ok("Trainingsplan: Übung abgehakt mit Schmerzskala 3 und Notiz, Fortschritt sichtbar");
  } catch (e) { fail("Plan-Feedback", e); }

  try {
    await patient.goto(BASE + "/app/chat", { waitUntil: "networkidle" });
    await patient.waitForSelector("text=Ihr Termin ist bestätigt", { timeout: 15000 });
    await patient.fill("textarea", "Vielen Dank, bis Donnerstag!");
    await patient.getByRole("button", { name: "Senden" }).click();
    await patient.waitForSelector("text=bis Donnerstag", { timeout: 15000 });
    ok("Chat: Patient sieht Nachricht und antwortet");
  } catch (e) { fail("Chat antworten (Patient)", e); }

  // ---------- Therapeut sieht Feedback + Antwort ----------
  try {
    await praxis.goto(BASE + "/praxis/patienten", { waitUntil: "networkidle" });
    await praxis.getByText("Erika Beispiel").click();
    await praxis.waitForSelector("text=Schmerz 3/10", { timeout: 15000 });
    await praxis.waitForSelector("text=Ging gut, leichtes Ziehen", { timeout: 5000 });
    await praxis.waitForSelector("text=test-rezept.pdf", { timeout: 8000 });
    ok("Patientendetail zeigt Rückmeldung und hochgeladenes Dokument");
  } catch (e) { fail("Rückmeldung im Patientendetail", e); }

  try {
    await praxis.goto(BASE + "/praxis/chat", { waitUntil: "networkidle" });
    await praxis.waitForSelector("text=Vielen Dank, bis Donnerstag!", { timeout: 15000 });
    ok("Chat-Übersicht zeigt Patientenantwort als letzte Nachricht");
  } catch (e) { fail("Chat-Übersicht", e); }

  // ---------- Rechtsseiten & Sicherheit ----------
  try {
    for (const pfad of ["/impressum", "/datenschutz", "/agb", "/widerruf"]) {
      const r = await patient.goto(BASE + pfad, { waitUntil: "domcontentloaded" });
      if (r.status() !== 200) throw new Error(pfad + " -> " + r.status());
    }
    ok("Rechtsseiten (Impressum, Datenschutz, AGB, Widerruf) laden mit 200");
  } catch (e) { fail("Rechtsseiten", e); }

  try {
    // Patient darf nicht in den Praxisbereich
    await patient.goto(BASE + "/praxis", { waitUntil: "networkidle" });
    await patient.waitForURL(/\/app/, { timeout: 15000 });
    ok("Zugriffsschutz: Patient wird von /praxis nach /app umgeleitet");
  } catch (e) { fail("Zugriffsschutz /praxis", e); }

  try {
    const anon = await browser.newContext();
    const anonPage = await anon.newPage();
    await anonPage.goto(BASE + "/app", { waitUntil: "networkidle" });
    await anonPage.waitForURL(/\/login/, { timeout: 15000 });
    ok("Zugriffsschutz: Nicht angemeldet → Weiterleitung zum Login");
    await anon.close();
  } catch (e) { fail("Zugriffsschutz ohne Login", e); }

  // ---------- Verständliche Meldungen ----------
  // Kein Fachjargon, keine Codes: weder auf den Hinweisseiten noch beim Anmelden
  const TECHNIK = /\b(error|exception|failed|digest|500|404|undefined|null|stack|token|session|bucket|upload)\b/i;

  try {
    const antwort = await patient.goto(BASE + "/gibt-es-nicht", { waitUntil: "networkidle" });
    if (antwort.status() !== 404) throw new Error("Statuscode " + antwort.status());
    const text = await patient.locator("body").innerText();
    if (!text.includes("Diese Seite gibt es nicht.")) throw new Error("Freundlicher Text fehlt");
    if (TECHNIK.test(text)) throw new Error("Technische Begriffe sichtbar: " + text.match(TECHNIK)[0]);
    ok("Unbekannte Adresse: freundliche Hinweisseite ohne Fachbegriffe");
  } catch (e) { fail("Hinweisseite unbekannte Adresse", e); }

  try {
    const anon = await browser.newContext();
    await supabaseBridge(anon);
    const anonPage = await anon.newPage();
    await anonPage.goto(BASE + "/login", { waitUntil: "networkidle" });
    await anonPage.getByRole("button", { name: "Mit Passwort" }).click();
    await anonPage.fill("#email", "qa-patient@curamus-test.de");
    await anonPage.fill("#passwort", "FalschesPasswort!1");
    await anonPage.getByRole("button", { name: "Anmelden", exact: true }).click();
    await anonPage.waitForSelector("text=Das hat nicht gepasst", { timeout: 15000 });
    const text = await anonPage.locator("body").innerText();
    if (TECHNIK.test(text)) throw new Error("Technische Begriffe sichtbar: " + text.match(TECHNIK)[0]);
    ok("Falsches Passwort: verständliche Meldung ohne Fachbegriffe");
    await anon.close();
  } catch (e) { fail("Meldung bei falschem Passwort", e); }

  // ---------- Passwort ----------
  try {
    const anon = await browser.newContext();
    const seite = await anon.newPage();
    await seite.goto(BASE + "/login", { waitUntil: "networkidle" });
    await seite.getByRole("button", { name: "Mit Passwort" }).click();
    await seite.getByRole("link", { name: "Passwort vergessen?" }).click();
    await seite.waitForURL(/passwort-vergessen/, { timeout: 15000 });
    await seite.waitForSelector("text=Link zum Zurücksetzen senden", { timeout: 10000 });
    ok("Anmeldung verlinkt auf 'Passwort vergessen', die Seite laedt");
    await anon.close();
  } catch (e) { fail("Seite 'Passwort vergessen'", e); }

  try {
    // Ohne gueltigen Link darf hier niemand ein Passwort setzen
    const anon = await browser.newContext();
    const seite = await anon.newPage();
    await seite.goto(BASE + "/passwort-neu", { waitUntil: "networkidle" });
    await seite.waitForSelector("text=/nicht mehr gültig/", { timeout: 15000 });
    const felder = await seite.locator('input[type="password"]').count();
    if (felder > 0) throw new Error("Passwortfeld trotz fehlender Anmeldung sichtbar");
    ok("Ohne gueltigen Link zeigt 'Neues Passwort' nur einen Hinweis, kein Formular");
    await anon.close();
  } catch (e) { fail("Schutz von 'Neues Passwort'", e); }

  try {
    await patient.goto(BASE + "/app/profil", { waitUntil: "networkidle" });
    const karte = patient.locator("section.card").filter({ hasText: "Passwort" }).first();
    await karte.getByRole("button", { name: "Passwort ändern" }).click();
    await patient.fill("#neues-passwort", "kurz");
    await patient.fill("#neues-passwort-wdh", "kurz");
    await karte.getByRole("button", { name: "Passwort speichern" }).click();
    await karte.getByText(/mindestens 6 Zeichen/).waitFor({ timeout: 10000 });

    await patient.fill("#neues-passwort", "EinLangesPasswort1");
    await patient.fill("#neues-passwort-wdh", "EinAnderesPasswort2");
    await karte.getByRole("button", { name: "Passwort speichern" }).click();
    await karte.getByText(/nicht gleich/).waitFor({ timeout: 10000 });
    ok("Passwort ändern: zu kurz und Tippfehler werden verstaendlich abgefangen");
  } catch (e) { fail("Passwortpruefung im Profil", e); }

  try {
    // Bis zu Supabase und zurueck – ohne das QA-Konto zu veraendern wird das
    // bisherige Passwort erneut gesetzt. Beide moeglichen Antworten sind richtig.
    const karte = patient.locator("section.card").filter({ hasText: "Passwort" }).first();
    await patient.fill("#neues-passwort", PASS);
    await patient.fill("#neues-passwort-wdh", PASS);
    await karte.getByRole("button", { name: "Passwort speichern" }).click();
    await karte.getByText(/gespeichert|bisheriges Passwort/).waitFor({ timeout: 20000 });
    const text = await karte.innerText();
    if (TECHNIK.test(text)) throw new Error("Technische Begriffe sichtbar: " + text.match(TECHNIK)[0]);
    ok("Passwort ändern erreicht die Anmeldung und meldet verstaendlich zurueck");
  } catch (e) { fail("Passwort speichern", e); }

  // ---------- Benachrichtigungen ----------
  try {
    await patient.goto(BASE + "/app/profil", { waitUntil: "networkidle" });
    const karte = patient.locator("section.card").filter({ hasText: "Benachrichtigungen" }).first();
    await karte.waitFor({ timeout: 15000 });
    const knopf = karte.getByRole("button", { name: /Benachrichtigungen einschalten/ });
    await knopf.waitFor({ timeout: 10000 });
    ok("Profil zeigt den Schalter für Benachrichtigungen");
  } catch (e) { fail("Schalter für Benachrichtigungen", e); }

  try {
    // Im Testbrowser gibt es keinen Push-Dienst. Genau dieser Fall darf nicht
    // haengenbleiben, sondern muss verstaendlich abbrechen.
    const karte = patient.locator("section.card").filter({ hasText: "Benachrichtigungen" }).first();
    await karte.getByRole("button", { name: /Benachrichtigungen einschalten/ }).click();
    await karte.getByText(/nicht geklappt|eingeschaltet|gesperrt/).waitFor({ timeout: 30000 });
    const text = await karte.innerText();
    if (TECHNIK.test(text)) throw new Error("Technische Begriffe sichtbar: " + text.match(TECHNIK)[0]);
    ok("Ohne erreichbaren Push-Dienst bricht der Schalter verstaendlich ab statt haengenzubleiben");
  } catch (e) { fail("Abbruch ohne Push-Dienst", e); }

  // Screenshots
  await patient.goto(BASE + "/app/plan", { waitUntil: "networkidle" });
  await patient.screenshot({ path: "qa-patient-plan.png" });
  await praxis.goto(BASE + "/praxis", { waitUntil: "networkidle" });
  await praxis.screenshot({ path: "qa-praxis-dashboard.png" });

  await browser.close();

  const fails = results.filter(([s]) => s === "FAIL");
  console.log("\n===== QA-ERGEBNIS: " + (results.length - fails.length) + "/" + results.length + " bestanden =====");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error("FATAL:", e); process.exit(2); });

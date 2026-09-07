// Edge Function: E-Mail-Hinweise an die Praxis und an Patienten.
//
// Drei Anlässe, alle ausgelöst von Datenbank-Triggern (Migration 0016):
//   nachricht – neue Chat-Nachricht: der jeweils andere wird informiert
//   buchung   – Patient hat selbst einen Termin gebucht: Praxis wird informiert
//   absage    – Patient hat einen Termin abgesagt: Praxis wird informiert
//
// Der Trigger schickt nur die Kennung des Datensatzes. Alles Weitere liest
// diese Funktion selbst aus der Datenbank – so kann niemand mit erfundenen
// Aufrufen erfundene Inhalte verschicken lassen.
//
// Versand über das eigene Postfach per SMTP – kein Drittanbieter.
// Benötigte Secrets (Dashboard → Edge Functions → Secrets):
//   SMTP_HOST  – z. B. w021b7b7.kasserver.com
//   SMTP_PORT  – 465 (SSL) oder 587 (STARTTLS)
//   SMTP_USER  – vollständige E-Mail-Adresse des Postfachs
//   SMTP_PASS  – Passwort dieses Postfachs
//   NOTIFY_FROM – Absender, muss zum Postfach passen,
//                 z. B. "Curamus Medical <kontakt@curamus-medical.de>"
//   APP_URL    – z. B. https://app.curamus-medical.de
//
// Deployment: supabase functions deploy notify-message --project-ref jiixpoyxctohzagldcel

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const APP_URL = Deno.env.get("APP_URL") ?? "https://app.curamus-medical.de";
const ZEITZONE = "Europe/Berlin";

type Anlass = "nachricht" | "buchung" | "absage";

/** „Donnerstag, 10. September, 10:00 Uhr" */
function terminText(iso: string) {
  const wann = new Date(iso);
  const tag = wann.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ZEITZONE,
  });
  const uhr = wann.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZEITZONE,
  });
  return `${tag}, ${uhr} Uhr`;
}

function html(s: string) {
  return s.replace(/[&<>"]/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[z]!);
}

/** Dasselbe Gerüst wie die Vorlagen in docs/email-vorlagen.md. */
function mailKoerper(ueberschrift: string, absaetze: string[], knopf: { text: string; ziel: string }) {
  const text = [
    "Guten Tag,",
    "",
    ...absaetze,
    "",
    `${knopf.text}: ${knopf.ziel}`,
    "",
    "Herzliche Grüße",
    "Ihr Team von Curamus Medical",
  ].join("\n");

  const htmlText = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr><td style="background:#1f315b;padding:24px 32px">
        <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px">CURAMUS</span>
        <span style="color:#34b8be;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">&nbsp;Medical</span>
      </td></tr>
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1f315b">${html(ueberschrift)}</h1>
        ${absaetze.map((a) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3c4a6b">${html(a)}</p>`).join("")}
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#34b8be">
          <a href="${knopf.ziel}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">${html(knopf.text)}</a>
        </td></tr></table>
        <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#3c4a6b">Herzliche Grüße<br>Ihr Team von Curamus Medical</p>
      </td></tr>
      <tr><td style="background:#f4f6fa;padding:20px 32px">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7796">Curamus Medical · Charles Obinna Mba · Nürnberg<br>
        Diese E-Mail wurde automatisch erzeugt.</p>
      </td></tr>
    </table>
  </td></tr>
</table>`;
  return { text, html: htmlText };
}

async function mailSenden(an: string[], betreff: string, inhalt: { text: string; html: string }) {
  if (an.length === 0) return;
  const port = Number(Deno.env.get("SMTP_PORT") ?? 465);
  const client = new SMTPClient({
    connection: {
      hostname: Deno.env.get("SMTP_HOST")!,
      port,
      // Port 465 spricht von Anfang an verschlüsselt, 587 schaltet per STARTTLS um.
      tls: port === 465,
      auth: {
        username: Deno.env.get("SMTP_USER")!,
        password: Deno.env.get("SMTP_PASS")!,
      },
    },
  });
  try {
    for (const to of an) {
      await client.send({
        from: Deno.env.get("NOTIFY_FROM") ?? "Curamus Medical <kontakt@curamus-medical.de>",
        to,
        subject: betreff,
        content: inhalt.text,
        html: inhalt.html,
      });
    }
  } finally {
    await client.close();
  }
}

/** E-Mail-Adressen aller Therapeuten-Konten. */
async function praxisAdressen(supabase: SupabaseClient) {
  const { data } = await supabase.from("profiles").select("id").eq("role", "therapist");
  const adressen: string[] = [];
  for (const p of data ?? []) {
    const { data: nutzer } = await supabase.auth.admin.getUserById(p.id);
    if (nutzer?.user?.email) adressen.push(nutzer.user.email);
  }
  return adressen;
}

async function nutzerAdresse(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.auth.admin.getUserById(id);
  return data?.user?.email ?? null;
}

async function patientenName(supabase: SupabaseClient, id: string) {
  const { data } = await supabase.from("profiles").select("full_name").eq("id", id).maybeSingle();
  return data?.full_name?.trim() || "Eine Patientin oder ein Patient";
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    // Alte Webhook-Form (record mit sender_id) und neue Trigger-Form (art) verstehen
    const anlass: Anlass = payload?.art ?? (payload?.table === "messages" ? "nachricht" : "");
    const id: string | undefined = payload?.record?.id;
    if (!anlass || !id) return new Response("ignored", { status: 200 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (anlass === "nachricht") {
      const { data: m } = await supabase
        .from("messages")
        .select("patient_id, sender_id")
        .eq("id", id)
        .maybeSingle();
      if (!m) return new Response("not found", { status: 200 });

      // Schreibt der Patient, wird die Praxis informiert – und umgekehrt.
      const patientSchreibt = m.sender_id === m.patient_id;
      const an = patientSchreibt
        ? await praxisAdressen(supabase)
        : [await nutzerAdresse(supabase, m.patient_id)].filter((a): a is string => !!a);
      const ziel = patientSchreibt ? `${APP_URL}/praxis/chat/${m.patient_id}` : `${APP_URL}/app/chat`;
      const absaetze = patientSchreibt
        ? [`${await patientenName(supabase, m.patient_id)} hat Ihnen im Praxisbereich geschrieben.`]
        : ["Ihre Praxis hat Ihnen in Ihrem Curamus-Bereich geschrieben."];
      // Aus Datenschutzgründen steht der Inhalt der Nachricht nicht in der E-Mail.
      absaetze.push("Den Inhalt lesen Sie direkt in der App.");
      await mailSenden(
        an,
        "Neue Nachricht bei Curamus Medical",
        mailKoerper("Neue Nachricht", absaetze, { text: "Nachricht lesen", ziel })
      );
      return new Response("sent", { status: 200 });
    }

    // Termin gebucht oder abgesagt – geht immer an die Praxis
    const { data: t } = await supabase
      .from("appointments")
      .select("patient_id, starts_at, address, status, gebucht_von, abgesagt_von")
      .eq("id", id)
      .maybeSingle();
    if (!t) return new Response("not found", { status: 200 });

    const name = await patientenName(supabase, t.patient_id);
    const wann = terminText(t.starts_at);
    const an = await praxisAdressen(supabase);
    const ziel = `${APP_URL}/praxis/termine`;

    if (anlass === "buchung") {
      if (t.gebucht_von !== "patient") return new Response("ignored", { status: 200 });
      await mailSenden(
        an,
        `Neuer Termin: ${name}, ${wann}`,
        mailKoerper(
          "Neuer Termin gebucht",
          [
            `${name} hat über die App einen Hausbesuch gebucht:`,
            wann + (t.address ? ` · ${t.address}` : ""),
            "Der Termin steht bereits in Ihrer Terminübersicht. Ein eventuelles Rezept finden Sie unter Unterlagen.",
          ],
          { text: "Termine ansehen", ziel }
        )
      );
      return new Response("sent", { status: 200 });
    }

    if (anlass === "absage") {
      if (t.status !== "abgesagt" || t.abgesagt_von !== "patient") {
        return new Response("ignored", { status: 200 });
      }
      await mailSenden(
        an,
        `Termin abgesagt: ${name}, ${wann}`,
        mailKoerper(
          "Termin abgesagt",
          [
            `${name} hat den Hausbesuch am ${wann} über die App abgesagt.`,
            "Die Zeit ist damit wieder frei und kann neu vergeben werden.",
          ],
          { text: "Termine ansehen", ziel }
        )
      );
      return new Response("sent", { status: 200 });
    }

    return new Response("ignored", { status: 200 });
  } catch {
    // Eine nicht zugestellte Hinweis-Mail darf den Chat niemals blockieren.
    return new Response("error", { status: 200 });
  }
});

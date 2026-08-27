// Edge Function: E-Mail-Benachrichtigung bei neuer Chat-Nachricht.
//
// Versand über das eigene Postfach per SMTP – kein Drittanbieter, kein API-Schlüssel.
//
// Auslösung über einen Database Webhook (Dashboard → Database → Webhooks):
//   Tabelle: public.messages, Ereignis: INSERT, Ziel: diese Funktion.
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

import { createClient } from "npm:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload?.record;
    if (!record?.patient_id || !record?.sender_id) {
      return new Response("ignored", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Empfänger bestimmen: schreibt der Patient, wird der Therapeut informiert – und umgekehrt.
    const patientSchreibt = record.sender_id === record.patient_id;
    let empfaengerId: string;
    if (patientSchreibt) {
      const { data: therapeut } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "therapist")
        .limit(1)
        .single();
      if (!therapeut) return new Response("no therapist", { status: 200 });
      empfaengerId = therapeut.id;
    } else {
      empfaengerId = record.patient_id;
    }

    const { data: nutzer } = await supabase.auth.admin.getUserById(empfaengerId);
    const email = nutzer?.user?.email;
    if (!email) return new Response("no email", { status: 200 });

    const appUrl = Deno.env.get("APP_URL") ?? "https://app.curamus-medical.de";
    const ziel = patientSchreibt ? `${appUrl}/praxis/chat/${record.patient_id}` : `${appUrl}/app/chat`;

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
      await client.send({
        from: Deno.env.get("NOTIFY_FROM") ?? "Curamus Medical <kontakt@curamus-medical.de>",
        to: email,
        subject: "Neue Nachricht bei Curamus Medical",
        content: [
          "Guten Tag,",
          "",
          "Sie haben eine neue Nachricht in Ihrem Curamus-Bereich erhalten.",
          "",
          ziel,
          "",
          "Aus Datenschutzgründen enthält diese E-Mail nicht den Inhalt der Nachricht.",
          "",
          "Herzliche Grüße",
          "Ihr Team von Curamus Medical",
        ].join("\n"),
        html: `<p>Guten Tag,</p>
<p>Sie haben eine neue Nachricht in Ihrem Curamus-Bereich erhalten.</p>
<p><a href="${ziel}" style="display:inline-block;background:#34b8be;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Nachricht lesen</a></p>
<p>Aus Datenschutzgründen enthält diese E-Mail nicht den Inhalt der Nachricht.</p>
<p>Herzliche Grüße<br>Ihr Team von Curamus Medical</p>`,
      });
    } finally {
      await client.close();
    }

    return new Response("sent", { status: 200 });
  } catch {
    // Eine nicht zugestellte Hinweis-Mail darf den Chat niemals blockieren.
    return new Response("error", { status: 200 });
  }
});

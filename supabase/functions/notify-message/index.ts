// Edge Function: E-Mail-Benachrichtigung bei neuer Chat-Nachricht.
//
// Auslösung über einen Database Webhook (Dashboard → Database → Webhooks):
//   Tabelle: public.messages, Ereignis: INSERT, Ziel: diese Funktion.
// Benötigte Secrets (Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY  – API-Schlüssel von resend.com (oder anderen Anbieter einbauen)
//   NOTIFY_FROM     – Absender, z. B. "Curamus Medical <mail@curamus-medical.de>"
//   APP_URL         – z. B. https://mein.curamus-medical.de
//
// Deployment: supabase functions deploy notify-message --project-ref jiixpoyxctohzagldcel

import { createClient } from "npm:@supabase/supabase-js@2";

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

    const appUrl = Deno.env.get("APP_URL") ?? "https://mein.curamus-medical.de";
    const ziel = patientSchreibt ? `${appUrl}/praxis/chat/${record.patient_id}` : `${appUrl}/app/chat`;

    const antwort = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("NOTIFY_FROM") ?? "Curamus Medical <onboarding@resend.dev>",
        to: [email],
        subject: "Neue Nachricht bei Curamus Medical",
        html: `<p>Guten Tag,</p>
<p>Sie haben eine neue Nachricht in Ihrem Curamus-Bereich erhalten.</p>
<p><a href="${ziel}" style="display:inline-block;background:#2fb5b3;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Nachricht lesen</a></p>
<p>Aus Datenschutzgründen enthält diese E-Mail nicht den Inhalt der Nachricht.</p>
<p>Herzliche Grüße<br>Ihr Team von Curamus Medical</p>`,
      }),
    });

    return new Response(antwort.ok ? "sent" : "mail error", { status: 200 });
  } catch {
    return new Response("error", { status: 200 });
  }
});

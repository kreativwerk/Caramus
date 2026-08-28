import { createClient } from "@/lib/supabase/server";
import { resolveFeedbackUrl } from "@/lib/media";
import type { Feedback } from "@/lib/types";
import { FeedbackForm } from "./feedback-form";
import { TicketTimeline, type TicketEintrag } from "./ticket-timeline";

export const metadata = { title: "Feedback" };

/**
 * Feedback: links schreiben, rechts der Zeitstrahl aller Einträge mit ihrem
 * Stand. Bewusst auf zwei Dinge reduziert – ein Textfeld und ein Knopf für
 * Bilder. Was daraus wird, steht daneben.
 */
export default async function FeedbackPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("feedback")
    .select("*, feedback_attachments(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  const tickets = (data ?? []) as Feedback[];

  const eintraege: TicketEintrag[] = await Promise.all(
    tickets.map(async (t) => ({
      eintrag: t,
      bilder: await Promise.all(
        (t.feedback_attachments ?? []).map(async (a) => ({
          name: a.file_name,
          url: await resolveFeedbackUrl(supabase, a.file_path),
        }))
      ),
    }))
  );

  const offen = tickets.filter((t) => t.status === "neu" || t.status === "in_arbeit").length;

  return (
    <div className="space-y-6">
      <header>
        <span className="badge-pill">Feedback</span>
        <h1 className="mt-3 text-2xl font-bold text-navy-800 sm:text-3xl">
          Was sollen wir <span className="text-teal-500">verbessern</span>?
        </h1>
        <p className="mt-1 text-navy-600/80">
          {offen > 0
            ? `${offen} ${offen === 1 ? "Sache ist" : "Sachen sind"} gerade offen.`
            : "Gerade ist nichts offen – schreiben Sie einfach, wenn Ihnen etwas auffällt."}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr] lg:items-start">
        {/* Links schreiben – bleibt beim Scrollen stehen */}
        <div className="lg:sticky lg:top-6">
          <FeedbackForm />
        </div>

        {/* Rechts der Verlauf */}
        <div className="space-y-4">
          <TicketTimeline eintraege={eintraege} />
          {eintraege.length > 0 && (
            <p className="px-1 text-xs text-navy-600/60">
              „In Arbeit“ und „Erledigt“ setzen wir beim Beheben selbst – Sie sehen hier also
              ohne Nachfrage, woran gerade gearbeitet wird.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

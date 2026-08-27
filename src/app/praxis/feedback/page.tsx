import { createClient } from "@/lib/supabase/server";
import { resolveFeedbackUrl } from "@/lib/media";
import type { Feedback, FeedbackStatus } from "@/lib/types";
import { FeedbackForm } from "./feedback-form";
import { TicketKarte } from "./ticket-karte";

export const metadata = { title: "Rückmeldung" };

/** Offene Sachen zuerst, Erledigtes unten. */
const REIHENFOLGE: FeedbackStatus[] = ["in_arbeit", "neu", "zurueckgestellt", "erledigt"];

export default async function FeedbackPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("feedback")
    .select("*, feedback_attachments(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  const tickets = (data ?? []) as Feedback[];

  const mitBildern = await Promise.all(
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
        <span className="badge-pill">Rückmeldung</span>
        <h1 className="mt-3 text-2xl font-bold text-navy-800 sm:text-3xl">
          Was sollen wir <span className="text-teal-500">verbessern</span>?
        </h1>
        <p className="mt-1 text-navy-600/80">
          {offen > 0
            ? `${offen} ${offen === 1 ? "Sache ist" : "Sachen sind"} gerade bei uns offen.`
            : "Gerade ist nichts offen – schreiben Sie einfach, wenn Ihnen etwas auffällt."}
        </p>
      </header>

      <FeedbackForm />

      {mitBildern.length === 0 ? (
        <p className="card text-navy-600/80">
          Noch keine Rückmeldungen. Alles, was Sie hier notieren, landet direkt bei uns.
        </p>
      ) : (
        <ul className="space-y-4">
          {[...mitBildern]
            .sort(
              (a, b) =>
                REIHENFOLGE.indexOf(a.eintrag.status) - REIHENFOLGE.indexOf(b.eintrag.status)
            )
            .map((e) => (
              <TicketKarte key={e.eintrag.id} eintrag={e.eintrag} bilder={e.bilder} />
            ))}
        </ul>
      )}
    </div>
  );
}

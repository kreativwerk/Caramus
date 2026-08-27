import { createClient } from "@/lib/supabase/server";
import { resolveMediaUrl } from "@/lib/media";
import type { PlanFeedback, PlanItem } from "@/lib/types";
import { FeedbackForm } from "./feedback-form";
import { MIcon } from "@/components/m-icon";
import { aktuellerNutzer } from "@/lib/sitzung";

export default async function PlanPage() {
  const supabase = await createClient();
  const user = await aktuellerNutzer();

  const { data: plan } = await supabase
    .from("training_plans")
    .select("*, plan_items(*, exercises(*))")
    .eq("patient_id", user!.id)
    .eq("is_active", true)
    .order("position", { referencedTable: "plan_items" })
    .limit(1)
    .maybeSingle();

  const heute = new Date().toISOString().slice(0, 10);
  const { data: feedbackHeute } = await supabase
    .from("plan_feedback")
    .select("*")
    .eq("patient_id", user!.id)
    .eq("on_date", heute);

  const feedbackMap = new Map<string, PlanFeedback>(
    (feedbackHeute ?? []).map((f) => [f.plan_item_id, f as PlanFeedback])
  );

  const items = ((plan?.plan_items ?? []) as PlanItem[]).sort((a, b) => a.position - b.position);
  const erledigt = items.filter((i) => feedbackMap.get(i.id)?.completed).length;

  const medienUrls = new Map<string, string | null>(
    await Promise.all(
      items.map(async (i): Promise<[string, string | null]> => [
        i.id,
        await resolveMediaUrl(supabase, i.exercises?.media_url ?? null),
      ])
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Ihr Training</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          {plan ? plan.title : "Ihr Trainingsplan"}
        </h1>
        {plan?.notes && <p className="mt-1 text-navy-600/80">{plan.notes}</p>}
      </div>

      {!plan || items.length === 0 ? (
        <div className="card">
          <p className="text-lg font-semibold text-navy-800">Ihr Plan wird gerade vorbereitet.</p>
          <p className="mt-1 text-navy-600/80">
            Ihr Therapeut stellt Ihren persönlichen Trainingsplan zusammen – meist direkt beim
            nächsten Hausbesuch. Schauen Sie danach einfach wieder hier vorbei.
          </p>
        </div>
      ) : (
        <>
          <div className="card-dark">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-400">Heute</p>
            <p className="mt-1 text-2xl font-bold">
              {erledigt} von {items.length} Übungen geschafft
            </p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all"
                style={{ width: `${items.length ? Math.round((erledigt / items.length) * 100) : 0}%` }}
              />
            </div>
          </div>

          <ol className="space-y-4">
            {items.map((item, index) => {
              const uebung = item.exercises;
              const medienUrl = medienUrls.get(item.id) ?? null;
              return (
                <li key={item.id} className="card">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-mist-100 sm:h-36 sm:w-48">
                      {medienUrl ? (
                        uebung?.media_type === "video" ? (
                          <video src={medienUrl} controls preload="metadata" className="h-full w-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={medienUrl} alt={uebung?.title ?? "Übung"} className="h-full w-full object-cover" />
                        )
                      ) : (
                        <MIcon name="training" groesse="2.25rem" className="text-navy-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-teal-600">Übung {index + 1}</p>
                      <h2 className="text-xl font-bold text-navy-800">{uebung?.title}</h2>
                      <p className="mt-1 font-semibold text-navy-700">
                        {item.sets} × {item.reps}
                        {item.frequency ? ` · ${item.frequency}` : ""}
                      </p>
                      {uebung?.description && (
                        <p className="mt-2 text-navy-600/90">{uebung.description}</p>
                      )}
                      {item.instructions && (
                        <p className="mt-2 rounded-lg bg-teal-50 px-3 py-2 text-sm text-navy-800">
                          <MIcon name="tipp" className="mr-1.5 text-teal-600" />Hinweis für Sie: {item.instructions}
                        </p>
                      )}
                      <FeedbackForm planItemId={item.id} heutigesFeedback={feedbackMap.get(item.id) ?? null} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}

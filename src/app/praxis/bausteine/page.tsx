import { createClient } from "@/lib/supabase/server";
import type { Baustein } from "@/lib/types";
import { BausteinListe } from "./baustein-liste";

export const metadata = { title: "Zwischenablage" };

export default async function BausteinePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("snippets")
    .select("*")
    .order("position")
    .order("created_at");

  return (
    <div className="space-y-6">
      <header>
        <span className="badge-pill">Zwischenablage</span>
        <h1 className="mt-3 text-2xl font-bold text-navy-800 sm:text-3xl">
          Was Sie oft <span className="text-teal-500">brauchen</span>.
        </h1>
        <p className="mt-1 text-navy-600/80">
          Sätze, Hinweise und Links, die Sie mit einem Griff kopieren können – auch unterwegs über
          das Symbol oben rechts.
        </p>
      </header>

      <BausteinListe bausteine={(data ?? []) as Baustein[]} />
    </div>
  );
}

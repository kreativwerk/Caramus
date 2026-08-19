import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/types";

export default async function ChatUebersichtPage() {
  const supabase = await createClient();

  const [{ data: patienten }, { data: letzte }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, city").eq("role", "patient").order("full_name"),
    supabase
      .from("messages")
      .select("patient_id, sender_id, body, created_at, read_at")
      .order("created_at", { ascending: false })
      .limit(300),
  ]);

  const proPatient = new Map<
    string,
    { letzte?: { body: string; created_at: string }; ungelesen: number }
  >();
  for (const m of letzte ?? []) {
    const eintrag = proPatient.get(m.patient_id) ?? { ungelesen: 0 };
    if (!eintrag.letzte) eintrag.letzte = { body: m.body, created_at: m.created_at };
    if (m.sender_id === m.patient_id && !m.read_at) eintrag.ungelesen += 1;
    proPatient.set(m.patient_id, eintrag);
  }

  const sortiert = [...(patienten ?? [])].sort((a, b) => {
    const za = proPatient.get(a.id)?.letzte?.created_at ?? "";
    const zb = proPatient.get(b.id)?.letzte?.created_at ?? "";
    return zb.localeCompare(za);
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Nachrichten</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Ihre <span className="text-teal-500">Unterhaltungen</span>.
        </h1>
      </div>

      {sortiert.length ? (
        <div className="space-y-2">
          {sortiert.map((p) => {
            const info = proPatient.get(p.id);
            return (
              <Link
                key={p.id}
                href={`/praxis/chat/${p.id}`}
                className="card flex items-center justify-between gap-4 transition hover:border-teal-500"
              >
                <div className="min-w-0">
                  <p className="font-bold text-navy-800">{p.full_name}</p>
                  {info?.letzte ? (
                    <p className="truncate text-sm text-navy-600/80">
                      {info.letzte.body} · {formatDateTime(info.letzte.created_at)}
                    </p>
                  ) : (
                    <p className="text-sm text-navy-600/60">Noch keine Nachrichten</p>
                  )}
                </div>
                {info?.ungelesen ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white">
                    {info.ungelesen}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="card text-navy-600/80">Noch keine Patienten registriert.</p>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FEEDBACK_STATUS, feedbackArtLabel, formatDateTime } from "@/lib/types";
import type { Feedback } from "@/lib/types";
import { feedbackLoeschen, feedbackStatusSetzen } from "../actions";

/** Ein Ticket mit Screenshots, Stand und den beiden Handgriffen dazu. */
export function TicketKarte({
  eintrag,
  bilder,
}: {
  eintrag: Feedback;
  bilder: { name: string; url: string | null }[];
}) {
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();
  const status = FEEDBACK_STATUS[eintrag.status];

  function ausfuehren(
    aktion: (fd: FormData) => Promise<{ fehler?: string | null; ok?: boolean }>,
    extra?: Record<string, string>
  ) {
    const fd = new FormData();
    fd.set("id", eintrag.id);
    for (const [k, v] of Object.entries(extra ?? {})) fd.set(k, v);
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await aktion(fd);
      if (ergebnis?.fehler) setFehler(ergebnis.fehler);
      else router.refresh();
    });
  }

  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-600/60">
            {feedbackArtLabel(eintrag.art)} · {formatDateTime(eintrag.created_at)}
          </p>
          <h3 className="mt-1 text-lg font-bold text-navy-800">{eintrag.title}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.klasse}`}>
          {status.label}
        </span>
      </div>

      <p className="mt-1 text-sm text-navy-600/80">{status.erklaerung}</p>

      {eintrag.body && (
        <p className="mt-3 whitespace-pre-wrap text-navy-700">{eintrag.body}</p>
      )}

      {eintrag.antwort && (
        <div className="mt-4 rounded-lg bg-mist-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-600/60">
            Antwort von uns
          </p>
          <p className="mt-1 whitespace-pre-wrap text-navy-700">{eintrag.antwort}</p>
        </div>
      )}

      {bilder.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-3">
          {bilder.map((b) =>
            b.url ? (
              <li key={b.url}>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-lg border border-mist-200 transition hover:border-teal-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.url} alt={b.name} className="h-24 w-auto max-w-[10rem] object-cover" />
                </a>
              </li>
            ) : null
          )}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {eintrag.status !== "erledigt" && (
          <button
            onClick={() => ausfuehren(feedbackStatusSetzen, { status: "erledigt" })}
            disabled={laeuft}
            className="rounded-lg bg-teal-100 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-500 hover:text-white disabled:opacity-50"
          >
            Passt jetzt – erledigt
          </button>
        )}
        {eintrag.status === "erledigt" && (
          <button
            onClick={() => ausfuehren(feedbackStatusSetzen, { status: "neu" })}
            disabled={laeuft}
            className="rounded-lg bg-mist-100 px-3 py-2 text-sm font-semibold text-navy-700 transition hover:bg-mist-200 disabled:opacity-50"
          >
            Tritt wieder auf
          </button>
        )}
        {eintrag.status === "neu" && (
          <button
            onClick={() => ausfuehren(feedbackLoeschen)}
            disabled={laeuft}
            className="rounded-lg px-3 py-2 text-sm font-medium text-navy-600/70 transition hover:text-red-700 disabled:opacity-50"
          >
            Zurückziehen
          </button>
        )}
      </div>

      {fehler && <p className="mt-2 text-sm font-medium text-red-700">{fehler}</p>}
    </li>
  );
}

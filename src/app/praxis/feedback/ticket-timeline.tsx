"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MIcon, type MIconName } from "@/components/m-icon";
import { FEEDBACK_STATUS, formatDateTime } from "@/lib/types";
import type { Feedback, FeedbackStatus } from "@/lib/types";
import { feedbackLoeschen, feedbackStatusSetzen } from "../actions";

export type TicketEintrag = {
  eintrag: Feedback;
  bilder: { name: string; url: string | null }[];
};

/** Punkt am Zeitstrahl: Farbe und Symbol richten sich nach dem Stand. */
const PUNKT: Record<FeedbackStatus, { icon: MIconName; klasse: string }> = {
  neu: { icon: "sprechblase", klasse: "bg-mist-100 text-navy-600/70 ring-mist-200" },
  in_arbeit: { icon: "uhr", klasse: "bg-amber-50 text-amber-700 ring-amber-200" },
  erledigt: { icon: "haken", klasse: "bg-teal-500 text-white ring-teal-200" },
  zurueckgestellt: { icon: "notiz", klasse: "bg-mist-100 text-navy-600/60 ring-mist-200" },
};

/**
 * Alle Tickets als Zeitstrahl, das Neueste oben. Jeder Eintrag zeigt seinen
 * Stand; ist etwas behoben, hakt Charles es hier selbst ab.
 *
 * Die Stände „In Arbeit“ und „Erledigt“ setzt auch die Routine (siehe
 * `scripts/tickets.js`) – beides landet an derselben Stelle, Charles sieht
 * also ohne Nachfrage, woran gerade gearbeitet wird.
 */
export function TicketTimeline({ eintraege }: { eintraege: TicketEintrag[] }) {
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();

  function ausfuehren(
    aktion: (fd: FormData) => Promise<{ fehler?: string | null; ok?: boolean }>,
    id: string,
    extra?: Record<string, string>
  ) {
    const fd = new FormData();
    fd.set("id", id);
    for (const [k, v] of Object.entries(extra ?? {})) fd.set(k, v);
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await aktion(fd);
      if (ergebnis?.fehler) setFehler(ergebnis.fehler);
      else router.refresh();
    });
  }

  if (eintraege.length === 0) {
    return (
      <div className="card text-navy-600/80">
        <p className="font-semibold text-navy-800">Noch nichts eingetragen.</p>
        <p className="mt-1">
          Alles, was Sie links notieren, erscheint hier – mit dem Stand, an dem es gerade ist.
        </p>
      </div>
    );
  }

  return (
    <div>
      {fehler && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {fehler}
        </p>
      )}

      <ol className="relative space-y-5 border-l-2 border-mist-200 pl-6 sm:pl-7">
        {eintraege.map(({ eintrag, bilder }) => {
          const stand = FEEDBACK_STATUS[eintrag.status];
          const punkt = PUNKT[eintrag.status];
          const erledigt = eintrag.status === "erledigt";

          return (
            <li key={eintrag.id} className="relative">
              {/* Punkt auf dem Zeitstrahl */}
              <span
                className={`absolute -left-[2.15rem] top-1 grid h-7 w-7 place-items-center rounded-full ring-4 ring-mist-50 sm:-left-[2.4rem] ${punkt.klasse}`}
                aria-hidden
              >
                <MIcon name={punkt.icon} groesse="1rem" />
              </span>

              <div className={`card ${erledigt ? "opacity-75" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy-600/60">
                    {formatDateTime(eintrag.created_at)}
                  </p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stand.klasse}`}>
                    {stand.label}
                  </span>
                </div>

                <p
                  className={`mt-2 whitespace-pre-wrap text-navy-800 ${
                    erledigt ? "line-through decoration-navy-600/30" : ""
                  }`}
                >
                  {eintrag.body || eintrag.title}
                </p>

                {eintrag.antwort && (
                  <div className="mt-3 rounded-lg bg-mist-100 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy-600/60">
                      Antwort
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-navy-700">
                      {eintrag.antwort}
                    </p>
                  </div>
                )}

                {bilder.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
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
                            <img
                              src={b.url}
                              alt={b.name}
                              className="h-20 w-auto max-w-[8rem] object-cover"
                            />
                          </a>
                        </li>
                      ) : null
                    )}
                  </ul>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-mist-100 pt-3">
                  {erledigt ? (
                    <button
                      onClick={() => ausfuehren(feedbackStatusSetzen, eintrag.id, { status: "neu" })}
                      disabled={laeuft}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 transition hover:bg-mist-100 disabled:opacity-50"
                    >
                      Tritt wieder auf
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        ausfuehren(feedbackStatusSetzen, eintrag.id, { status: "erledigt" })
                      }
                      disabled={laeuft}
                      className="rounded-lg bg-teal-100 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-500 hover:text-white disabled:opacity-50"
                    >
                      <MIcon name="haken" className="mr-1" />
                      Erledigt
                    </button>
                  )}
                  {eintrag.status === "neu" && (
                    <button
                      onClick={() => ausfuehren(feedbackLoeschen, eintrag.id)}
                      disabled={laeuft}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-navy-600/70 transition hover:text-red-700 disabled:opacity-50"
                    >
                      Zurückziehen
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

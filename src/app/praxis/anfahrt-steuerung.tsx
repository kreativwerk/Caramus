"use client";

import { useEffect, useState, useTransition } from "react";
import { fahrtAbbrechen, fahrtBeenden, fahrtStarten } from "./actions";
import type { Appointment } from "@/lib/types";
import { formatTime, restMinuten } from "@/lib/types";

const SCHNELLWAHL = [15, 20, 30, 45];

/**
 * „Bin unterwegs" – startet beim Patienten die Live-Anzeige mit Countdown.
 */
export function AnfahrtSteuerung({ termin }: { termin: Appointment }) {
  const [offen, setOffen] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const [jetzt, setJetzt] = useState(() => Date.now());

  const unterwegs = Boolean(termin.enroute_at && termin.eta_minutes && !termin.arrived_at);

  useEffect(() => {
    if (!unterwegs) return;
    const timer = setInterval(() => setJetzt(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, [unterwegs]);

  function ausfuehren(
    aktion: (fd: FormData) => Promise<{ fehler?: string | null; ok?: boolean }>,
    extra?: Record<string, string>
  ) {
    const fd = new FormData();
    fd.set("termin_id", termin.id);
    for (const [k, v] of Object.entries(extra ?? {})) fd.set(k, v);
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await aktion(fd);
      if (ergebnis?.fehler) setFehler(ergebnis.fehler);
      else setOffen(false);
    });
  }

  if (termin.arrived_at) {
    return (
      <p className="text-sm font-semibold text-teal-400">
        ✓ Angekommen um {formatTime(termin.arrived_at)} Uhr
      </p>
    );
  }

  if (unterwegs) {
    const rest = restMinuten(termin.enroute_at!, termin.eta_minutes!, jetzt);
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 px-3 py-1.5 text-sm font-semibold text-teal-400">
          <span className="live-dot" aria-hidden />
          Unterwegs · noch ca. {rest} Min.
        </span>
        <button
          onClick={() => ausfuehren(fahrtBeenden)}
          disabled={laeuft}
          className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/25 disabled:opacity-50"
        >
          Angekommen
        </button>
        <button
          onClick={() => ausfuehren(fahrtAbbrechen)}
          disabled={laeuft}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-white/60 transition hover:text-white disabled:opacity-50"
        >
          Abbrechen
        </button>
        {fehler && <span className="text-sm text-red-300">{fehler}</span>}
      </div>
    );
  }

  if (!offen) {
    return (
      <button
        onClick={() => setOffen(true)}
        className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition active:scale-95"
      >
        🚗 Bin unterwegs
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl bg-white/10 p-3">
      <p className="text-sm font-semibold text-white">Wie lange brauchen Sie ungefähr?</p>
      <p className="mt-0.5 text-xs text-white/60">
        Der Patient sieht sofort einen Countdown mit dieser Zeit.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SCHNELLWAHL.map((min) => (
          <button
            key={min}
            onClick={() => ausfuehren(fahrtStarten, { eta_minutes: String(min) })}
            disabled={laeuft}
            className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:opacity-50"
          >
            {min} Min.
          </button>
        ))}
        <form
          action={(fd) => ausfuehren(fahrtStarten, { eta_minutes: String(fd.get("eta_minutes") ?? "") })}
          className="flex items-center gap-2"
        >
          <input
            name="eta_minutes"
            type="number"
            min={1}
            max={240}
            placeholder="andere"
            aria-label="Fahrzeit in Minuten"
            className="w-24 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-teal-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={laeuft}
            className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:opacity-50"
          >
            Start
          </button>
        </form>
        <button
          type="button"
          onClick={() => setOffen(false)}
          className="rounded-lg px-2 py-2 text-sm font-medium text-white/60 transition hover:text-white"
        >
          Abbrechen
        </button>
      </div>
      {fehler && <p className="mt-2 text-sm text-red-300">{fehler}</p>}
    </div>
  );
}

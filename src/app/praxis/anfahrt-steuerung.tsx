"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  fahrtAbbrechen,
  fahrtBeenden,
  fahrtStarten,
  fahrzeitVorschlag,
  verspaetungMelden,
} from "./actions";
import type { Appointment } from "@/lib/types";
import { formatTime, restMinuten } from "@/lib/types";

const SCHNELLWAHL = [15, 20, 30, 45];
const VERSPAETUNGEN = [5, 10, 15];

/**
 * Einmalige Standortabfrage; schlägt sie fehl, wird ohne Startpunkt gerechnet.
 * Der eigene Zeitgeber ist nötig, weil `timeout` erst nach der Freigabe greift –
 * eine unbeantwortete Berechtigungsabfrage würde die Anzeige sonst blockieren.
 */
function standort(): Promise<{ lat: number; lng: number } | undefined> {
  return new Promise((fertig) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return fertig(undefined);
    let erledigt = false;
    const abschliessen = (wert?: { lat: number; lng: number }) => {
      if (erledigt) return;
      erledigt = true;
      fertig(wert);
    };
    setTimeout(() => abschliessen(undefined), 5000);
    navigator.geolocation.getCurrentPosition(
      (p) => abschliessen({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => abschliessen(undefined),
      { timeout: 5000, maximumAge: 60_000 }
    );
  });
}

/**
 * „Bin unterwegs" – startet beim Patienten die Live-Anzeige mit Countdown.
 * Ist eine Fahrzeit-Berechnung eingerichtet, wird sie einmalig beim Öffnen
 * abgefragt und als Vorschlag angeboten; sonst bleibt es bei der Auswahl.
 */
export function AnfahrtSteuerung({ termin }: { termin: Appointment }) {
  const [offen, setOffen] = useState(false);
  const [verspaetungOffen, setVerspaetungOffen] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const [jetzt, setJetzt] = useState(() => Date.now());
  const [vorschlag, setVorschlag] = useState<number | null>(null);
  const [vorschlagLaeuft, setVorschlagLaeuft] = useState(false);
  const router = useRouter();

  const unterwegs = Boolean(termin.enroute_at && termin.eta_minutes && !termin.arrived_at);

  useEffect(() => {
    if (!unterwegs) return;
    const timer = setInterval(() => setJetzt(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, [unterwegs]);

  // Fahrzeit-Vorschlag holen, sobald die Auswahl geöffnet wird
  useEffect(() => {
    if (!offen) return;
    let abgebrochen = false;
    (async () => {
      const von = await standort();
      const ergebnis = await fahrzeitVorschlag(termin.id, von);
      if (abgebrochen) return;
      setVorschlag(ergebnis.minuten);
      setVorschlagLaeuft(false);
    })();
    return () => {
      abgebrochen = true;
    };
  }, [offen, termin.id]);

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
      if (ergebnis?.fehler) {
        setFehler(ergebnis.fehler);
      } else {
        setOffen(false);
        setVerspaetungOffen(false);
        router.refresh();
      }
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
      <div className="space-y-2">
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
          {!verspaetungOffen && (
            <button
              onClick={() => setVerspaetungOffen(true)}
              disabled={laeuft}
              className="rounded-lg bg-amber-400/20 px-3 py-1.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/30 disabled:opacity-50"
            >
              Verspätung melden
            </button>
          )}
          <button
            onClick={() => ausfuehren(fahrtAbbrechen)}
            disabled={laeuft}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-white/60 transition hover:text-white disabled:opacity-50"
          >
            Abbrechen
          </button>
        </div>

        {verspaetungOffen && (
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-sm font-semibold text-white">Wie viel später wird es?</p>
            <p className="mt-0.5 text-xs text-white/60">
              Der Patient sieht sofort die neue Ankunftszeit.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {VERSPAETUNGEN.map((min) => (
                <button
                  key={min}
                  onClick={() => ausfuehren(verspaetungMelden, { zusatz_minuten: String(min) })}
                  disabled={laeuft}
                  className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-400 hover:text-navy-900 disabled:opacity-50"
                >
                  +{min} Min.
                </button>
              ))}
              <form
                action={(fd) =>
                  ausfuehren(verspaetungMelden, {
                    zusatz_minuten: String(fd.get("zusatz_minuten") ?? ""),
                    grund: String(fd.get("grund") ?? ""),
                  })
                }
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  name="zusatz_minuten"
                  type="number"
                  min={1}
                  max={120}
                  placeholder="andere"
                  aria-label="Verspätung in Minuten"
                  className="w-24 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-teal-400 focus:outline-none"
                />
                <input
                  name="grund"
                  placeholder="Grund (optional)"
                  aria-label="Grund der Verspätung"
                  className="w-40 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-teal-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={laeuft}
                  className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-400 hover:text-navy-900 disabled:opacity-50"
                >
                  Melden
                </button>
              </form>
              <button
                type="button"
                onClick={() => setVerspaetungOffen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-white/60 transition hover:text-white"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {termin.eta_updated_at && (
          <p className="text-xs text-amber-200/80">
            Verspätung gemeldet um {formatTime(termin.eta_updated_at)} Uhr
            {termin.delay_note ? ` · ${termin.delay_note}` : ""}
          </p>
        )}
        {fehler && <p className="text-sm text-red-300">{fehler}</p>}
      </div>
    );
  }

  if (!offen) {
    return (
      <button
        onClick={() => {
          setVorschlag(null);
          setVorschlagLaeuft(true);
          setOffen(true);
        }}
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

      {vorschlagLaeuft && (
        <p className="mt-3 text-sm text-white/70">Fahrzeit wird berechnet …</p>
      )}
      {!vorschlagLaeuft && vorschlag !== null && (
        <button
          onClick={() => ausfuehren(fahrtStarten, { eta_minutes: String(vorschlag), quelle: "verkehr" })}
          disabled={laeuft}
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg bg-teal-500 px-4 py-3 text-left font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
        >
          <span>
            Vorschlag: {vorschlag} Min.
            <span className="block text-xs font-medium text-white/80">
              Mit aktueller Verkehrslage berechnet
            </span>
          </span>
          <span aria-hidden>→</span>
        </button>
      )}

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

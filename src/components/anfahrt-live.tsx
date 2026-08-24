"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CuramusVan } from "@/components/curamus-van";
import type { Appointment } from "@/lib/types";
import { fahrtFortschritt, formatTime, restMinuten } from "@/lib/types";

/** Ab dieser Restzeit wird auf „Ankunft in Kürze" gewechselt. */
const KURZ_VOR_ANKUNFT_MIN = 5;

/**
 * Live-Anzeige der Anfahrt: Der Therapeut startet die Fahrt selbst, der Patient
 * sieht Countdown und animierten Fortschritt. Bewusst ohne Standortfreigabe –
 * angezeigt wird nur eine Prognose (Projektprotokoll 24.08.2026, Kapitel 05).
 */
export function AnfahrtLive({
  termin,
  therapeutName,
}: {
  termin: Appointment;
  therapeutName: string;
}) {
  const [aktuell, setAktuell] = useState<Appointment>(termin);
  const [jetzt, setJetzt] = useState(() => Date.now());

  // Sekundentakt für Countdown und Fortschritt
  useEffect(() => {
    const timer = setInterval(() => setJetzt(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Echtzeit: Start, Ankunft oder Abbruch durch den Therapeuten.
  // Zusätzlich ein regelmäßiger Abruf als Rückfalllösung – in manchen Netzen
  // (Klinik-WLAN, restriktive Mobilfunknetze) kommt keine Echtzeitverbindung
  // zustande, die Anzeige darf dann trotzdem nicht stehenbleiben.
  useEffect(() => {
    const supabase = createClient();
    const kanal = supabase
      .channel(`termin-${termin.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "appointments", filter: `id=eq.${termin.id}` },
        (payload) => setAktuell(payload.new as Appointment)
      )
      .subscribe();

    async function abrufen() {
      if (document.visibilityState === "hidden") return;
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", termin.id)
        .maybeSingle();
      if (data) setAktuell(data as Appointment);
    }
    const abrufTimer = setInterval(abrufen, 15_000);
    document.addEventListener("visibilitychange", abrufen);

    return () => {
      supabase.removeChannel(kanal);
      clearInterval(abrufTimer);
      document.removeEventListener("visibilitychange", abrufen);
    };
  }, [termin.id]);

  if (!aktuell.enroute_at || !aktuell.eta_minutes) return null;

  const angekommen = Boolean(aktuell.arrived_at);
  const rest = restMinuten(aktuell.enroute_at, aktuell.eta_minutes, jetzt);
  const fortschritt = angekommen ? 1 : fahrtFortschritt(aktuell.enroute_at, aktuell.eta_minutes, jetzt);
  const ankunft = new Date(new Date(aktuell.enroute_at).getTime() + aktuell.eta_minutes * 60_000);
  // Nur bei einem echten Namen den Vornamen abtrennen – sonst bliebe vom
  // Platzhalter „Ihr Therapeut" nur „Ihr" übrig.
  const vorname = therapeutName.trim() ? therapeutName.trim().split(" ")[0] : "Ihr Therapeut";
  const kurzVorAnkunft = !angekommen && rest <= KURZ_VOR_ANKUNFT_MIN;

  return (
    <section
      className="card-dark overflow-hidden"
      aria-live="polite"
      aria-label="Anfahrt Ihres Therapeuten"
    >
      <div className="flex items-center gap-2">
        <span className="live-dot" aria-hidden />
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal-400">
          {angekommen ? "Angekommen" : kurzVorAnkunft ? "Ankunft in Kürze" : "Auf dem Weg zu Ihnen"}
        </span>
      </div>

      {angekommen ? (
        <>
          <p className="mt-3 text-2xl font-bold">{vorname} ist da. 🎉</p>
          <p className="mt-1 text-white/70">Angekommen um {formatTime(aktuell.arrived_at!)} Uhr.</p>
        </>
      ) : (
        <>
          <p className="mt-3 text-2xl font-bold">{vorname} ist unterwegs zu Ihnen.</p>
          <p className="mt-1 text-4xl font-bold text-teal-400 tabular-nums">
            {rest > 0 ? (
              <>
                noch ca. {rest} <span className="text-2xl">{rest === 1 ? "Minute" : "Minuten"}</span>
              </>
            ) : (
              "Jeden Moment da"
            )}
          </p>
          <p className="mt-1 text-white/70">
            Voraussichtliche Ankunft gegen {formatTime(ankunft.toISOString())} Uhr
          </p>
        </>
      )}

      {/* Fortschrittsstrecke mit fahrendem Curamus-Van */}
      <div className="mt-6">
        <div className="relative h-16">
          {/* Strecke */}
          <div className="absolute inset-x-0 bottom-3 h-1.5 rounded-full bg-white/15" />
          <div
            className="absolute left-0 bottom-3 h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-[width] duration-1000 ease-linear"
            style={{ width: `${fortschritt * 100}%` }}
          />
          {/* Start- und Zielpunkt */}
          <span
            className="absolute left-0 bottom-[0.42rem] h-4 w-4 rounded-full border-2 border-teal-400 bg-navy-900"
            aria-hidden
          />
          <span
            className={`absolute right-0 bottom-[0.42rem] h-4 w-4 rounded-full border-2 ${
              angekommen ? "border-teal-400 bg-teal-400" : "border-white/40 bg-navy-900"
            }`}
            aria-hidden
          />
          {/* Fahrzeug */}
          <div
            className="absolute bottom-2 transition-[left] duration-1000 ease-linear"
            style={{ left: `calc(${fortschritt * 100}% - 2.25rem)` }}
          >
            <CuramusVan className={`w-[4.5rem] ${angekommen ? "" : "animate-fahrt-bob"}`} />
          </div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-white/60">
          <span>Losgefahren {formatTime(aktuell.enroute_at)} Uhr</span>
          <span>Ihr Zuhause</span>
        </div>
      </div>

      {!angekommen && (
        <p className="mt-4 rounded-lg bg-white/10 px-4 py-3 text-sm text-white/80">
          {kurzVorAnkunft
            ? `Ankunft in Kürze – bitte halten Sie den Zugang bereit. ${vorname} klingelt gleich.`
            : "Die Zeitangabe ist eine Prognose und kann sich durch Verkehr verschieben – sie aktualisiert sich automatisch."}
        </p>
      )}
    </section>
  );
}

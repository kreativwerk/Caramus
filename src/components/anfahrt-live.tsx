"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Appointment } from "@/lib/types";
import { fahrtFortschritt, formatTime, restMinuten } from "@/lib/types";

/**
 * Live-Anzeige der Anfahrt („wie bei DHL"): Der Therapeut startet die Fahrt,
 * der Patient sieht Countdown und animierten Fortschritt in Echtzeit.
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

  return (
    <section
      className="card-dark overflow-hidden"
      aria-live="polite"
      aria-label="Anfahrt Ihres Therapeuten"
    >
      <div className="flex items-center gap-2">
        <span className="live-dot" aria-hidden />
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal-400">
          {angekommen ? "Angekommen" : "Live – Anfahrt"}
        </span>
      </div>

      {angekommen ? (
        <>
          <p className="mt-3 text-2xl font-bold">{vorname} ist da. 🎉</p>
          <p className="mt-1 text-white/70">
            Angekommen um {formatTime(aktuell.arrived_at!)} Uhr.
          </p>
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

      {/* Fortschrittsstrecke mit fahrendem Auto */}
      <div className="mt-6 pb-1">
        <div className="relative h-12">
          {/* Strecke */}
          <div className="absolute inset-x-0 top-8 h-1.5 rounded-full bg-white/15" />
          <div
            className="absolute left-0 top-8 h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-[width] duration-1000 ease-linear"
            style={{ width: `${fortschritt * 100}%` }}
          />
          {/* Auto */}
          <div
            className="absolute top-0 transition-[left] duration-1000 ease-linear"
            style={{ left: `calc(${fortschritt * 100}% - 1.25rem)` }}
          >
            <span className={angekommen ? "block" : "block animate-fahrt-bob"} aria-hidden>
              <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
                <path
                  d="M4 20h32M8 20v-4l3-5h14l4 5h3v4"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="rgba(255,255,255,0.12)"
                />
                <circle cx="13" cy="21" r="3" fill="#34b8be" />
                <circle cx="29" cy="21" r="3" fill="#34b8be" />
              </svg>
            </span>
          </div>
          {/* Start- und Zielpunkt */}
          <span className="absolute left-0 top-[1.6rem] h-4 w-4 rounded-full border-2 border-teal-400 bg-navy-900" aria-hidden />
          <span
            className={`absolute right-0 top-[1.6rem] flex h-4 w-4 items-center justify-center rounded-full border-2 ${
              angekommen ? "border-teal-400 bg-teal-400" : "border-white/40 bg-navy-900"
            }`}
            aria-hidden
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-white/60">
          <span>Losgefahren {formatTime(aktuell.enroute_at)} Uhr</span>
          <span>Ihr Zuhause</span>
        </div>
      </div>

      {!angekommen && (
        <p className="mt-4 rounded-lg bg-white/10 px-4 py-3 text-sm text-white/80">
          Bitte halten Sie den Zugang frei – {vorname} klingelt gleich. Die Zeit ist eine Schätzung
          und kann sich durch Verkehr verschieben.
        </p>
      )}
    </section>
  );
}

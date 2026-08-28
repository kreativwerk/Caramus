"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BaumReihe } from "@/components/baum-reihe";
import { CuramusWagen } from "@/components/curamus-wagen";
import type { Appointment } from "@/lib/types";
import { fahrtFortschritt, formatTime, restMinuten } from "@/lib/types";
import { MIcon } from "@/components/m-icon";

/** Ab dieser Restzeit wird auf „Ankunft in Kürze" gewechselt. */
const KURZ_VOR_ANKUNFT_MIN = 5;

/*
 * Maße der Fahrszene. Die Strecke läuft über die volle Breite, von Rand zu
 * Rand. Die Mitte des Wagens sitzt dabei immer genau auf dem Ende des
 * Fortschritts – ganz am Anfang und ganz am Ende steht er deshalb mit einem
 * Stück über der Bildkante.
 */
const WAGEN_BREITE = "6rem";
const HALBER_WAGEN = "3rem";
/** Abstand der Strecke zum Bildrand. */
const BAHN_RAND = "1rem";
/** Weg, den das Ende des Fortschritts zurücklegt. */
const WEG = "calc(100% - 2rem)";

/**
 * Live-Anzeige der Anfahrt: Der Therapeut startet die Fahrt selbst, der Patient
 * sieht Countdown und animierten Fortschritt. Bewusst ohne Standortfreigabe –
 * angezeigt wird nur eine Prognose (Projektprotokoll 24.08.2026, Kapitel 05).
 */
export function AnfahrtLive({
  termin,
  therapeutName,
  livedaten = true,
}: {
  termin: Appointment;
  therapeutName: string;
  /**
   * Aus für die Vorführseite: Dort gibt es keinen Termin in der Datenbank,
   * die Anzeige folgt allein dem übergebenen Stand.
   */
  livedaten?: boolean;
}) {
  const [ausDerDatenbank, setAusDerDatenbank] = useState<Appointment | null>(null);
  const [jetzt, setJetzt] = useState(() => Date.now());
  const aktuell = livedaten ? (ausDerDatenbank ?? termin) : termin;

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
    if (!livedaten) return;
    const supabase = createClient();
    const kanal = supabase
      .channel(`termin-${termin.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "appointments", filter: `id=eq.${termin.id}` },
        (payload) => setAusDerDatenbank(payload.new as Appointment)
      )
      .subscribe();

    async function abrufen() {
      if (document.visibilityState === "hidden") return;
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", termin.id)
        .maybeSingle();
      if (data) setAusDerDatenbank(data as Appointment);
    }
    const abrufTimer = setInterval(abrufen, 15_000);
    document.addEventListener("visibilitychange", abrufen);

    return () => {
      supabase.removeChannel(kanal);
      clearInterval(abrufTimer);
      document.removeEventListener("visibilitychange", abrufen);
    };
  }, [termin.id, livedaten]);

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
          <p className="mt-3 flex items-center gap-2 text-2xl font-bold">
            <MIcon name="feier" className="text-teal-400" /> {vorname} ist da.
          </p>
          <p className="mt-1 text-white/70">Angekommen um {formatTime(aktuell.arrived_at!)} Uhr.</p>
        </>
      ) : (
        <>
          <p className="mt-3 text-2xl font-bold">{vorname} ist unterwegs zu Ihnen.</p>
          <p className="mt-1 whitespace-nowrap text-3xl font-bold text-teal-400 tabular-nums sm:text-4xl">
            {rest > 0 ? (
              <>
                noch ca. {rest} <span className="text-2xl sm:text-3xl">Min.</span>
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

      {/* Fahrszene: vorbeiziehende Kulisse, Strecke und fahrender Curamus-Van */}
      <div className="mt-6">
        <div className="relative h-28 overflow-hidden rounded-xl bg-navy-950/45">
          {/* Hintere Baumreihe (langsamer) */}
          <div className="absolute inset-x-0 bottom-[2.05rem] h-10 overflow-hidden">
            <div className={`flex h-full w-[200%] ${angekommen ? "" : "animate-baeume-fern"}`}>
              <BaumReihe tiefe="fern" className="h-full w-1/2 shrink-0" />
              <BaumReihe tiefe="fern" className="h-full w-1/2 shrink-0" />
            </div>
          </div>
          {/* Vordere Baumreihe (schneller) */}
          <div className="absolute inset-x-0 bottom-[1.9rem] h-14 overflow-hidden">
            <div className={`flex h-full w-[200%] ${angekommen ? "" : "animate-baeume-nah"}`}>
              <BaumReihe className="h-full w-1/2 shrink-0" />
              <BaumReihe className="h-full w-1/2 shrink-0" />
            </div>
          </div>

          {/* Straßenband */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-navy-950/70" />

          {/* Strecke über die volle Breite */}
          <div
            className="absolute bottom-5 h-1.5 rounded-full bg-white/15"
            style={{ left: BAHN_RAND, right: BAHN_RAND }}
          />
          <div
            className="absolute bottom-5 h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-[width] duration-1000 ease-linear"
            style={{ left: BAHN_RAND, width: `calc(${WEG} * ${fortschritt})` }}
          />
          {/* Start- und Zielpunkt */}
          <span
            className="absolute bottom-[0.95rem] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-teal-400 bg-navy-950"
            style={{ left: BAHN_RAND }}
            aria-hidden
          />
          <span
            className={`absolute bottom-[0.95rem] h-4 w-4 translate-x-1/2 rounded-full border-2 ${
              angekommen ? "border-teal-400 bg-teal-400" : "border-white/40 bg-navy-950"
            }`}
            style={{ right: BAHN_RAND }}
            aria-hidden
          />
          {/* Fahrzeug – seine Mitte sitzt auf dem Ende des Fortschritts */}
          <div
            className="absolute bottom-[1.4rem] transition-[left] duration-1000 ease-linear"
            style={{
              width: WAGEN_BREITE,
              left: `calc(${BAHN_RAND} + ${WEG} * ${fortschritt} - ${HALBER_WAGEN})`,
            }}
          >
            <CuramusWagen className="w-full" raederDrehen={!angekommen} />
          </div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-white/60">
          <span>Losgefahren {formatTime(aktuell.enroute_at)} Uhr</span>
          <span>Ihr Zuhause</span>
        </div>
      </div>

      {!angekommen && aktuell.eta_updated_at && (
        <p className="mt-4 rounded-lg bg-amber-400/15 px-4 py-3 text-sm text-amber-100">
          <strong>Es dauert etwas länger.</strong>{" "}
          {aktuell.delay_note
            ? `${aktuell.delay_note} – die Ankunftszeit oben ist bereits aktualisiert.`
            : "Die Ankunftszeit oben ist bereits aktualisiert."}
        </p>
      )}

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

"use client";

import { useState } from "react";
import { AnfahrtLive } from "@/components/anfahrt-live";
import { MIcon, type MIconName } from "@/components/m-icon";
import type { Appointment } from "@/lib/types";

const THERAPEUT = "Charles Mba";

/** Grundgerüst eines Termins – nur die Anfahrt-Felder werden je Szene gesetzt. */
function termin(felder: Partial<Appointment>): Appointment {
  return {
    id: "vorschau",
    patient_id: "vorschau",
    starts_at: new Date().toISOString(),
    duration_min: 60,
    address: "Beispielstraße 12, 90411 Nürnberg",
    travel_note: null,
    status: "geplant",
    notes: null,
    enroute_at: null,
    eta_minutes: null,
    arrived_at: null,
    eta_updated_at: null,
    delay_note: null,
    eta_quelle: "manuell",
    ...felder,
  };
}

/** Zeitpunkt vor n Minuten, als ISO-Zeichenkette. */
function vorMinuten(n: number) {
  return new Date(Date.now() - n * 60_000).toISOString();
}

type Szene = {
  schluessel: string;
  knopf: string;
  icon: MIconName;
  erklaerung: string;
  bauen: () => Appointment;
};

const SZENEN: Szene[] = [
  {
    schluessel: "start",
    knopf: "Gerade losgefahren",
    icon: "auto",
    erklaerung:
      "Charles tippt in seinem Bereich auf „Bin unterwegs“ und wählt 20 Minuten. In diesem Moment erscheint die Karte beim Patienten – ohne dass er die Seite neu laden muss.",
    bauen: () => termin({ enroute_at: vorMinuten(0), eta_minutes: 20 }),
  },
  {
    schluessel: "haelfte",
    knopf: "Halbe Strecke",
    icon: "ort",
    erklaerung:
      "Der Countdown zählt herunter, der Wagen wandert über die Strecke. Die Zeitangabe ist eine Prognose, kein GPS-Signal.",
    bauen: () => termin({ enroute_at: vorMinuten(10), eta_minutes: 20 }),
  },
  {
    schluessel: "verspaetung",
    knopf: "Verspätung gemeldet",
    icon: "uhr",
    erklaerung:
      "Charles steht im Stau und meldet mit einem Tipp +10 Minuten. Der Patient sieht sofort die neue Ankunftszeit und den Grund – er muss nicht anrufen und nicht warten.",
    bauen: () =>
      termin({
        enroute_at: vorMinuten(10),
        eta_minutes: 30,
        eta_updated_at: vorMinuten(1),
        delay_note: "Stau auf der Südwesttangente",
      }),
  },
  {
    schluessel: "kurzvor",
    knopf: "Kurz vor der Tür",
    icon: "klingel",
    erklaerung:
      "Unter fünf Minuten wechselt die Anzeige auf „Ankunft in Kürze“ und bittet darum, den Zugang bereitzuhalten. Gerade bei älteren Menschen, die zur Tür etwas brauchen, macht das den Unterschied.",
    bauen: () => termin({ enroute_at: vorMinuten(17), eta_minutes: 20 }),
  },
  {
    schluessel: "da",
    knopf: "Angekommen",
    icon: "feier",
    erklaerung:
      "Charles tippt auf „Bin da“. Die Fahrt endet, der Wagen steht am Ziel, die Ankunftszeit ist festgehalten.",
    bauen: () =>
      termin({
        enroute_at: vorMinuten(20),
        eta_minutes: 20,
        arrived_at: vorMinuten(0),
      }),
  },
  {
    schluessel: "raffer",
    knopf: "Im Zeitraffer ansehen",
    icon: "tempo",
    erklaerung:
      "Dieselbe Anzeige, nur mit zwei Minuten Fahrzeit – so sehen Sie die Bewegung, ohne zwanzig Minuten zu warten. Alles andere ist unverändert.",
    bauen: () => termin({ enroute_at: vorMinuten(0), eta_minutes: 2 }),
  },
];

/**
 * Vorführseite für die Live-Anfahrt. Zeigt dieselbe Anzeige, die Patientinnen
 * und Patienten sehen – aber mit erfundenen Zeiten, ohne Anmeldung und ohne
 * einen echten Termin anzulegen.
 */
export function AnfahrtVorschau() {
  const [szene, setSzene] = useState(SZENEN[0]);
  // Neu aufbauen bei jedem Klick: „Gerade losgefahren“ soll wirklich jetzt sein
  const [stand, setStand] = useState<Appointment>(() => SZENEN[0].bauen());

  function waehlen(s: Szene) {
    setSzene(s);
    setStand(s.bauen());
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-start">
      {/* Steuerung */}
      <div className="order-2 space-y-3 lg:order-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-navy-600/70">
          Wählen Sie einen Moment
        </p>
        {SZENEN.map((s) => {
          const aktiv = szene.schluessel === s.schluessel;
          return (
            <button
              key={s.schluessel}
              onClick={() => waehlen(s)}
              aria-pressed={aktiv}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                aktiv
                  ? "border-teal-500 bg-teal-50/70 shadow-sm"
                  : "border-mist-200 bg-white hover:border-teal-500 hover:bg-teal-50/30"
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
                  aktiv ? "bg-teal-500 text-white" : "bg-mist-100 text-navy-600/70"
                }`}
                aria-hidden
              >
                <MIcon name={s.icon} groesse="1.35rem" />
              </span>
              <span className="font-bold text-navy-800">{s.knopf}</span>
            </button>
          );
        })}
      </div>

      {/* Anzeige im Handyrahmen */}
      <div className="order-1 lg:order-2">
        <div className="mx-auto w-full max-w-sm rounded-[2.2rem] border-8 border-navy-800 bg-mist-50 p-3 shadow-2xl">
          <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-navy-800/20" aria-hidden />
          <div key={szene.schluessel} className="animate-schritt">
            <AnfahrtLive termin={stand} therapeutName={THERAPEUT} livedaten={false} />
          </div>
        </div>

        <p key={`text-${szene.schluessel}`} className="animate-schritt mx-auto mt-5 max-w-sm text-navy-600/80">
          {szene.erklaerung}
        </p>

        <button
          onClick={() => waehlen(szene)}
          className="btn-secondary mx-auto mt-4 flex"
        >
          <MIcon name="pfeilLinks" /> Von vorn abspielen
        </button>
      </div>
    </div>
  );
}

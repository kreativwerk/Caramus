"use client";

import { useEffect, useRef } from "react";

const MONATE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/** Voreinstellung des Jahresrads. Ältere Jahrgänge erreicht man durch Scrollen. */
const START_JAHR = 1970;
const FRUEHESTES_JAHR = 1915;
/** Höhe einer Zeile im Rad, in Pixeln. Drei Zeilen sind sichtbar. */
const ZEILE = 44;

function tageImMonat(monat: number, jahr: number) {
  return new Date(jahr, monat, 0).getDate();
}

function zerlegen(wert: string) {
  const treffer = /^(\d{4})-(\d{2})-(\d{2})$/.exec(wert);
  if (!treffer) return { jahr: START_JAHR, monat: 1, tag: 1 };
  return { jahr: +treffer[1], monat: +treffer[2], tag: +treffer[3] };
}

function zusammensetzen(tag: number, monat: number, jahr: number) {
  const gekappt = Math.min(tag, tageImMonat(monat, jahr));
  return `${jahr}-${String(monat).padStart(2, "0")}-${String(gekappt).padStart(2, "0")}`;
}

/** Eine Spalte des Rads: rastet beim Scrollen auf dem mittleren Eintrag ein. */
function Rad({
  werte,
  auswahl,
  gesetzt,
  aendern,
  beschriftung,
}: {
  werte: { wert: number; label: string }[];
  auswahl: number;
  gesetzt: boolean;
  aendern: (wert: number) => void;
  beschriftung: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Das Rad springt beim Öffnen selbst an die richtige Stelle. Dieses Springen
  // löst ebenfalls ein Scroll-Ereignis aus – ohne diese Sperre würde das Feld
  // ungefragt ein Datum eintragen, obwohl die Angabe freiwillig ist.
  const vomFinger = useRef(false);
  const laenge = werte.length;

  // Beim Öffnen und wenn sich die Liste ändert auf den gewählten Eintrag springen.
  useEffect(() => {
    const stelle = werte.findIndex((w) => w.wert === auswahl);
    if (ref.current && stelle >= 0) ref.current.scrollTop = stelle * ZEILE;
    // Absichtlich nicht bei jeder Auswahl – sonst kämpft der Sprung mit dem Finger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laenge]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function gescrollt() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const stelle = Math.round(ref.current.scrollTop / ZEILE);
      const eintrag = werte[Math.max(0, Math.min(werte.length - 1, stelle))];
      if (!vomFinger.current) return;
      if (eintrag && (eintrag.wert !== auswahl || !gesetzt)) aendern(eintrag.wert);
    }, 120);
  }

  return (
    <div
      ref={ref}
      onScroll={gescrollt}
      onPointerDown={() => (vomFinger.current = true)}
      onTouchStart={() => (vomFinger.current = true)}
      onWheel={() => (vomFinger.current = true)}
      onKeyDown={() => (vomFinger.current = true)}
      role="listbox"
      aria-label={beschriftung}
      className="h-[132px] flex-1 snap-y snap-mandatory overflow-y-scroll overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      // Eine Leerzeile oben und unten, damit der erste und letzte Eintrag in die Mitte rutschen können.
      style={{ paddingTop: ZEILE, paddingBottom: ZEILE }}
    >
      {werte.map((w) => {
        const aktiv = gesetzt && w.wert === auswahl;
        return (
          <button
            key={w.wert}
            type="button"
            role="option"
            aria-selected={aktiv}
            onClick={() => {
              aendern(w.wert);
              const stelle = werte.findIndex((x) => x.wert === w.wert);
              ref.current?.scrollTo({ top: stelle * ZEILE, behavior: "smooth" });
            }}
            className={`flex w-full snap-center items-center justify-center px-1 text-center text-[1.05rem] leading-tight tabular-nums transition-colors ${
              aktiv ? "font-bold text-navy-800" : "text-navy-600/45"
            }`}
            style={{ height: ZEILE }}
          >
            {w.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Geburtsdatum als drei Räder – Tag, Monat, Jahr – nach dem Vorbild der
 * iOS-Auswahl. Das native Datumsfeld ist auf dem Handy unberechenbar breit und
 * lief aus der Karte heraus; außerdem ist Drehen für ältere Menschen leichter
 * als eine Kalenderansicht mit kleinen Zahlen.
 *
 * Auf großen Bildschirmen stehen stattdessen drei gewöhnliche Auswahlfelder –
 * dort gibt es Maus und Tastatur, ein Rad wäre dort umständlich.
 */
export function GeburtsdatumFeld({
  wert,
  setWert,
  kennung = "geburtsdatum",
}: {
  wert: string;
  setWert: (wert: string) => void;
  kennung?: string;
}) {
  const gesetzt = /^\d{4}-\d{2}-\d{2}$/.test(wert);
  const { tag, monat, jahr } = zerlegen(wert);
  const jetzt = new Date().getFullYear();

  // Neueste Jahrgänge oben; das Rad steht beim Öffnen auf 1970.
  const jahre = Array.from({ length: jetzt - FRUEHESTES_JAHR + 1 }, (_, i) => ({
    wert: jetzt - i,
    label: String(jetzt - i),
  }));
  const monate = MONATE.map((m, i) => ({ wert: i + 1, label: m }));
  const tage = Array.from({ length: tageImMonat(monat, jahr) }, (_, i) => ({
    wert: i + 1,
    label: String(i + 1),
  }));
  const tagSicher = Math.min(tag, tage.length);

  function setzen(t: number, m: number, j: number) {
    setWert(zusammensetzen(t, m, j));
  }

  return (
    <>
      {/* Handy: Räder mit Rastung, wie man es vom iPhone kennt */}
      <div className="sm:hidden">
        <div className="overflow-hidden rounded-xl border border-mist-200 bg-white">
          <div className="flex border-b border-mist-100 bg-mist-100/60 text-center text-[0.7rem] font-semibold uppercase tracking-wider text-navy-600/70">
            <span className="flex-1 py-1.5">Tag</span>
            <span className="flex-1 py-1.5">Monat</span>
            <span className="flex-1 py-1.5">Jahr</span>
          </div>
          <div className="relative">
          {/* Auswahlband in der Mitte */}
          <div
            className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-teal-50"
            style={{ height: ZEILE }}
            aria-hidden
          />
          <div className="relative flex">
            <Rad
              werte={tage}
              auswahl={tagSicher}
              gesetzt={gesetzt}
              aendern={(t) => setzen(t, monat, jahr)}
              beschriftung="Tag"
            />
            <Rad
              werte={monate}
              auswahl={monat}
              gesetzt={gesetzt}
              aendern={(m) => setzen(tagSicher, m, jahr)}
              beschriftung="Monat"
            />
            <Rad
              werte={jahre}
              auswahl={jahr}
              gesetzt={gesetzt}
              aendern={(j) => setzen(tagSicher, monat, j)}
              beschriftung="Jahr"
            />
          </div>
          {/* Weiche Kanten oben und unten */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-11 bg-gradient-to-b from-white to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-11 bg-gradient-to-t from-white to-transparent"
            aria-hidden
          />
          </div>
        </div>
        <p className="mt-1 text-xs text-navy-600/70">
          {gesetzt ? "Drehen Sie die Räder, um das Datum zu ändern." : "Drehen Sie die Räder, um Ihr Geburtsdatum zu wählen."}
        </p>
      </div>

      {/* Größere Bildschirme: drei gewöhnliche Auswahlfelder */}
      <div className="hidden gap-2 sm:grid sm:grid-cols-[7rem_1fr_8rem]">
        <select
          id={kennung}
          aria-label="Tag"
          value={gesetzt ? tagSicher : ""}
          onChange={(e) => setzen(+e.target.value, monat, jahr)}
          className="input-base"
        >
          <option value="" disabled>
            Tag
          </option>
          {tage.map((t) => (
            <option key={t.wert} value={t.wert}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Monat"
          value={gesetzt ? monat : ""}
          onChange={(e) => setzen(tagSicher, +e.target.value, jahr)}
          className="input-base"
        >
          <option value="" disabled>
            Monat
          </option>
          {monate.map((m) => (
            <option key={m.wert} value={m.wert}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Jahr"
          value={gesetzt ? jahr : ""}
          onChange={(e) => setzen(tagSicher, monat, +e.target.value)}
          className="input-base"
        >
          <option value="" disabled>
            Jahr
          </option>
          {jahre.map((j) => (
            <option key={j.wert} value={j.wert}>
              {j.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

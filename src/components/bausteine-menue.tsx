"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MIcon } from "@/components/m-icon";
import type { Baustein } from "@/lib/types";

/** Ab dieser Länge zeigt die Übersicht nur den Anfang. */
const VORSCHAU_ZEICHEN = 110;

function vorschau(text: string) {
  const einzeilig = text.replace(/\s+/g, " ").trim();
  return einzeilig.length > VORSCHAU_ZEICHEN
    ? `${einzeilig.slice(0, VORSCHAU_ZEICHEN).trimEnd()} …`
    : einzeilig;
}

/**
 * Zwischenablage der Praxis: Sätze, Hinweise und Links, die Charles immer
 * wieder braucht. Ein Tipp auf den Eintrag legt ihn in die Zwischenablage –
 * gedacht für die Momente, in denen er unterwegs schnell etwas einfügen will.
 */
export function BausteineMenue({ bausteine }: { bausteine: Baustein[] }) {
  const [offen, setOffen] = useState(false);
  const [kopiert, setKopiert] = useState<string | null>(null);
  const bereichRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!offen) return;
    function klick(e: MouseEvent) {
      if (!bereichRef.current?.contains(e.target as Node)) setOffen(false);
    }
    function taste(e: KeyboardEvent) {
      if (e.key === "Escape") setOffen(false);
    }
    document.addEventListener("mousedown", klick);
    document.addEventListener("keydown", taste);
    return () => {
      document.removeEventListener("mousedown", klick);
      document.removeEventListener("keydown", taste);
    };
  }, [offen]);

  async function kopieren(b: Baustein) {
    try {
      await navigator.clipboard.writeText(b.body);
      setKopiert(b.id);
      setTimeout(() => setKopiert((k) => (k === b.id ? null : k)), 1800);
    } catch {
      setKopiert("fehler");
      setTimeout(() => setKopiert(null), 2500);
    }
  }

  return (
    <div className="relative" ref={bereichRef}>
      <button
        onClick={() => setOffen((o) => !o)}
        aria-label="Zwischenablage"
        aria-expanded={offen}
        className="grid h-10 w-10 place-items-center rounded-full text-navy-700 transition hover:bg-mist-100"
      >
        <MIcon name="klammer" groesse="1.5rem" />
      </button>

      {offen && (
        <div className="fixed right-3 top-[4.1rem] z-40 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-xl sm:absolute sm:right-0 sm:top-auto sm:mt-2 sm:w-80">
          <div className="flex items-center justify-between gap-2 border-b border-mist-100 px-4 py-3">
            <p className="font-bold text-navy-800">Zwischenablage</p>
            <Link
              href="/praxis/bausteine"
              onClick={() => setOffen(false)}
              className="text-sm font-semibold text-teal-600 hover:underline"
            >
              Verwalten
            </Link>
          </div>

          {bausteine.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-navy-600/80">
                Noch nichts hinterlegt. Legen Sie Sätze und Links an, die Sie oft brauchen.
              </p>
              <Link
                href="/praxis/bausteine"
                onClick={() => setOffen(false)}
                className="btn-primary mt-4 w-full"
              >
                <MIcon name="plus" /> Ersten Baustein anlegen
              </Link>
            </div>
          ) : (
            <ul className="max-h-[65dvh] divide-y divide-mist-100 overflow-y-auto">
              {bausteine.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => kopieren(b)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-mist-100"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-navy-800">{b.title}</span>
                      <span className="mt-0.5 block text-sm text-navy-600/80">
                        {vorschau(b.body)}
                      </span>
                    </span>
                    <span
                      className={`mt-0.5 shrink-0 text-sm font-semibold ${
                        kopiert === b.id ? "text-teal-600" : "text-navy-600/50"
                      }`}
                    >
                      {kopiert === b.id ? (
                        <>
                          <MIcon name="haken" /> Kopiert
                        </>
                      ) : (
                        <MIcon name="kopieren" groesse="1.25rem" />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {kopiert === "fehler" && (
            <p className="border-t border-mist-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Kopieren hat nicht geklappt. Bitte markieren Sie den Text unter „Verwalten“ von Hand.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

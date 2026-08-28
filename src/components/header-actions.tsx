"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Benachrichtigung } from "@/lib/benachrichtigungen";
import type { Baustein } from "@/lib/types";
import { BausteineMenue } from "@/components/bausteine-menue";
import { MIcon } from "@/components/m-icon";

function initialen(name: string) {
  const teile = name.trim().split(/\s+/).filter(Boolean);
  if (!teile.length) return "?";
  return (teile[0][0] + (teile[1]?.[0] ?? "")).toUpperCase();
}

/** Glocke mit Hinweisliste und Profil-Knopf in der Kopfzeile. */
export function HeaderActions({
  profilHref,
  nutzerName,
  benachrichtigungen,
  bausteine,
}: {
  profilHref: string;
  nutzerName: string;
  benachrichtigungen: Benachrichtigung[];
  /** Nur im Praxisbereich gesetzt – Patienten haben keine Zwischenablage. */
  bausteine?: Baustein[];
}) {
  const [offen, setOffen] = useState(false);
  const bereichRef = useRef<HTMLDivElement>(null);
  const anzahl = benachrichtigungen.length;

  // Schließen bei Klick außerhalb oder Escape
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

  return (
    <div className="flex items-center gap-2">
      {bausteine && <BausteineMenue bausteine={bausteine} />}
      <div ref={bereichRef} className="relative">
        <button
          type="button"
          onClick={() => setOffen((o) => !o)}
          aria-expanded={offen}
          aria-label={anzahl ? `${anzahl} neue Hinweise` : "Keine neuen Hinweise"}
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-navy-700 transition hover:bg-mist-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        >
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5Z" />
            <path d="M10.5 20a2 2 0 0 0 3 0" />
          </svg>
          {anzahl > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-500 px-1 text-[0.65rem] font-bold text-white">
              {anzahl}
            </span>
          )}
        </button>

        {offen && (
          <div className="fixed right-3 top-[4.1rem] z-40 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-mist-100 bg-white shadow-card sm:absolute sm:right-0 sm:top-auto sm:mt-2">
            <p className="border-b border-mist-100 px-4 py-3 font-bold text-navy-800">
              Neues für Sie
            </p>
            {anzahl === 0 ? (
              <p className="px-4 py-6 text-center text-navy-600/70">
                <MIcon name="erledigt" className="mr-1.5 text-teal-500" />Alles erledigt – nichts Neues.
              </p>
            ) : (
              <ul className="max-h-[60vh] divide-y divide-mist-100 overflow-y-auto">
                {benachrichtigungen.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={b.href}
                      onClick={() => setOffen(false)}
                      className="block px-4 py-3 transition hover:bg-mist-50"
                    >
                      <p className="font-semibold text-navy-800">{b.titel}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-navy-600/85">{b.text}</p>
                      {b.zeit && <p className="mt-1 text-xs text-navy-600/60">{b.zeit}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <Link
        href={profilHref}
        aria-label={`Profil von ${nutzerName}`}
        title={nutzerName}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-teal-500 to-teal-600 font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
      >
        {initialen(nutzerName)}
      </Link>
    </div>
  );
}

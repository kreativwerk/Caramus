"use client";

import { useCallback, useEffect, useState } from "react";

const GELADEN = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
const PARAM = "aktualisiert";
/** Höchstens alle fünf Minuten nachfragen – öfter bringt nichts */
const MINDESTABSTAND = 5 * 60_000;

/**
 * Erzwingt eine frische Fassung der App: Zwischenspeicher leeren, Service
 * Worker nach Neuem fragen, Seite mit Zeitstempel neu laden. Der Zeitstempel
 * sorgt dafür, dass wirklich der Server antwortet und nicht der Browser aus
 * dem Gedächtnis – gerade als App auf dem Home-Bildschirm hängt sonst gern
 * eine alte Fassung fest.
 */
export async function hartNeuLaden() {
  try {
    if ("caches" in window) {
      const namen = await caches.keys();
      await Promise.all(namen.map((n) => caches.delete(n)));
    }
  } catch {
    // Ohne Cache-Zugriff geht es trotzdem weiter
  }
  try {
    const registrierung = await navigator.serviceWorker?.getRegistration();
    await registrierung?.update();
  } catch {
    // Der Service Worker ist nur für Benachrichtigungen da – nicht entscheidend
  }
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, String(Date.now()));
  window.location.replace(url.toString());
}

/**
 * Knopf in der Kopfzeile, immer da. Meldet sich mit einem Punkt, sobald auf
 * dem Server eine neuere Fassung liegt als die, die der Browser gerade zeigt.
 */
export function UpdateKnopf() {
  const [neuDa, setNeuDa] = useState(false);
  const [laeuft, setLaeuft] = useState(false);

  // Den Zeitstempel aus der Adresse wieder entfernen, damit er nicht in
  // Lesezeichen oder beim Teilen landet
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has(PARAM)) {
      url.searchParams.delete(PARAM);
      window.history.replaceState(window.history.state, "", url.toString());
    }
  }, []);

  const pruefen = useCallback(async () => {
    try {
      const antwort = await fetch("/api/version", { cache: "no-store" });
      if (!antwort.ok) return;
      const { version } = (await antwort.json()) as { version?: string };
      if (version && version !== GELADEN) setNeuDa(true);
    } catch {
      // Offline oder Server nicht erreichbar – dann eben beim nächsten Mal
    }
  }, []);

  useEffect(() => {
    let zuletzt = 0;
    const vielleicht = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - zuletzt < MINDESTABSTAND) return;
      zuletzt = Date.now();
      pruefen();
    };
    vielleicht();
    document.addEventListener("visibilitychange", vielleicht);
    window.addEventListener("focus", vielleicht);
    return () => {
      document.removeEventListener("visibilitychange", vielleicht);
      window.removeEventListener("focus", vielleicht);
    };
  }, [pruefen]);

  function klick() {
    setLaeuft(true);
    hartNeuLaden();
  }

  return (
    <button
      type="button"
      onClick={klick}
      disabled={laeuft}
      aria-label={neuDa ? "Neue Version verfügbar – jetzt aktualisieren" : "App aktualisieren"}
      title={neuDa ? "Neue Version verfügbar – jetzt aktualisieren" : "App aktualisieren"}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-mist-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-60 ${
        neuDa ? "text-teal-600" : "text-navy-700"
      }`}
    >
      <svg
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={laeuft ? "animate-spin" : ""}
        aria-hidden
      >
        <path d="M20 12a8 8 0 1 1-2.34-5.66" />
        <path d="M20 4v5h-5" />
      </svg>
      {neuDa && (
        <span
          className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-teal-500 ring-2 ring-white"
          aria-hidden
        />
      )}
    </button>
  );
}

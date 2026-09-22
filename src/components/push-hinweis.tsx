"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MIcon } from "@/components/m-icon";

const MERKER = "push-hinweis-weg";
const PAUSE_TAGE = 30;

function alsAppGeoeffnet() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function istIPhone() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Kleine Karte auf der Startseite: Wer noch keine Benachrichtigungen aufs
 * Handy bekommt, erfährt hier, dass es sie gibt – und wo sie sich einschalten
 * lassen. Ist der Schalter im Profil schon an, bleibt die Karte weg.
 *
 * Auf dem iPhone gibt es die Benachrichtigungen nur, wenn die App auf dem
 * Home-Bildschirm liegt; die Anleitung dazu steht im Profil.
 */
export function PushHinweis({ oeffentlicherSchluessel }: { oeffentlicherSchluessel: string }) {
  const [zeigen, setZeigen] = useState(false);

  useEffect(() => {
    let aktiv = true;
    (async () => {
      if (!oeffentlicherSchluessel) return;
      try {
        const weg = Number(localStorage.getItem(MERKER) ?? 0);
        if (Date.now() - weg < PAUSE_TAGE * 24 * 3600_000) return;
      } catch {
        // Ohne Speicher zeigen wir die Karte einfach
      }

      // iPhone im Browser: Der Schalter ginge noch nicht, die Anleitung schon
      if (istIPhone() && !alsAppGeoeffnet()) {
        if (aktiv) setZeigen(true);
        return;
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      if (Notification.permission === "denied") return;
      try {
        const registrierung = await navigator.serviceWorker.getRegistration();
        const abo = await registrierung?.pushManager.getSubscription();
        if (aktiv && !abo) setZeigen(true);
      } catch {
        // Dann eben kein Hinweis – die App läuft auch ohne
      }
    })();
    return () => {
      aktiv = false;
    };
  }, [oeffentlicherSchluessel]);

  if (!zeigen) return null;

  function spaeter() {
    try {
      localStorage.setItem(MERKER, String(Date.now()));
    } catch {
      // egal
    }
    setZeigen(false);
  }

  return (
    <div className="card border-teal-500/40 bg-teal-50">
      <p className="flex items-center gap-2 font-semibold text-navy-800">
        <MIcon name="klingel" className="text-teal-600" /> Nichts mehr verpassen
      </p>
      <p className="mt-1 text-sm text-navy-600/90">
        Ihr Handy kann Ihnen Bescheid sagen, wenn eine Nachricht kommt oder ein Termin bestätigt
        wird – auch wenn die App gerade zu ist.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/app/profil" className="btn-primary">
          Benachrichtigungen einschalten
        </Link>
        <button type="button" onClick={spaeter} className="btn-secondary">
          Später
        </button>
      </div>
    </div>
  );
}

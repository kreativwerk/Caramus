"use client";

import { useEffect, useState } from "react";
import { pushAbmelden, pushAnmelden, pushProbe } from "@/lib/push-actions";

type Zustand = "laedt" | "aus" | "an" | "blockiert" | "geht-nicht" | "iphone";

/** Base64 (URL-sicher) in das Format bringen, das der Browser erwartet. */
function schluesselUmwandeln(base64: string) {
  const gefuellt = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const roh = atob(gefuellt);
  return Uint8Array.from([...roh].map((z) => z.charCodeAt(0)));
}

/**
 * Bricht ab, wenn der Push-Dienst des Browsers nicht antwortet. Ohne das
 * bliebe der Knopf bei schlechter Verbindung endlos auf „Einen Moment".
 */
function mitZeitlimit<T>(versprechen: Promise<T>, ms = 20_000) {
  return Promise.race([
    versprechen,
    new Promise<never>((_, ablehnen) => setTimeout(() => ablehnen(new Error("Zeit abgelaufen")), ms)),
  ]);
}

function istIPhone() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function alsAppGeoeffnet() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Ein Schalter für Benachrichtigungen aufs Handy. Auf dem iPhone lässt Apple
 * das nur zu, wenn die App vorher auf den Home-Bildschirm gelegt wurde –
 * deshalb steht dort die Anleitung statt eines Schalters, der nichts tut.
 */
export function PushSchalter({ oeffentlicherSchluessel }: { oeffentlicherSchluessel: string }) {
  const [zustand, setZustand] = useState<Zustand>("laedt");
  const [meldung, setMeldung] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    (async () => {
      if (!oeffentlicherSchluessel) return setZustand("geht-nicht");
      if (istIPhone() && !alsAppGeoeffnet()) return setZustand("iphone");
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return setZustand("geht-nicht");
      }
      if (Notification.permission === "denied") return setZustand("blockiert");

      try {
        const registrierung = await mitZeitlimit(navigator.serviceWorker.register("/sw.js"), 8000);
        const abo = await mitZeitlimit(registrierung.pushManager.getSubscription(), 8000);
        setZustand(abo ? "an" : "aus");
      } catch {
        setZustand("geht-nicht");
      }
    })();
  }, [oeffentlicherSchluessel]);

  async function einschalten() {
    setLaeuft(true);
    setMeldung(null);
    try {
      const erlaubnis = await Notification.requestPermission();
      if (erlaubnis !== "granted") {
        setZustand(erlaubnis === "denied" ? "blockiert" : "aus");
        return;
      }
      const registrierung = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const abo = await mitZeitlimit(
        registrierung.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: schluesselUmwandeln(oeffentlicherSchluessel),
        })
      );
      const roh = abo.toJSON();
      const ergebnis = await pushAnmelden({
        endpoint: abo.endpoint,
        p256dh: roh.keys?.p256dh ?? "",
        auth: roh.keys?.auth ?? "",
        geraet: navigator.userAgent,
      });
      if (ergebnis?.fehler) {
        setMeldung(ergebnis.fehler);
        await abo.unsubscribe();
        return;
      }
      setZustand("an");
      setMeldung("Benachrichtigungen sind eingeschaltet.");
    } catch {
      setMeldung(
        "Das hat gerade nicht geklappt. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es noch einmal."
      );
    } finally {
      setLaeuft(false);
    }
  }

  async function ausschalten() {
    setLaeuft(true);
    setMeldung(null);
    try {
      const registrierung = await navigator.serviceWorker.getRegistration();
      const abo = await registrierung?.pushManager.getSubscription();
      if (abo) {
        await pushAbmelden(abo.endpoint);
        await abo.unsubscribe();
      }
      setZustand("aus");
      setMeldung("Benachrichtigungen sind ausgeschaltet.");
    } catch {
      setMeldung("Das hat gerade nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal.");
    } finally {
      setLaeuft(false);
    }
  }

  async function probe() {
    setLaeuft(true);
    setMeldung(null);
    const ergebnis = await pushProbe();
    setMeldung(ergebnis?.fehler ?? "Die Probe ist unterwegs – schauen Sie auf Ihren Bildschirm.");
    setLaeuft(false);
  }

  return (
    <section className="card">
      <h2 className="text-lg font-bold text-navy-800">Benachrichtigungen</h2>
      <p className="mt-1 text-navy-600/80">
        Ein kurzer Hinweis aufs Handy, wenn eine Nachricht ankommt, ein Termin bestätigt wird oder
        die Anfahrt startet – auch wenn die App gerade geschlossen ist.
      </p>

      {zustand === "laedt" && <p className="mt-4 text-navy-600/70">Einen Moment …</p>}

      {zustand === "iphone" && (
        <div className="mt-4 rounded-lg bg-mist-100 px-4 py-3 text-navy-700">
          <p className="font-semibold">Auf dem iPhone einmal einrichten</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            <li>Unten in Safari auf das Teilen-Symbol tippen (Quadrat mit Pfeil nach oben)</li>
            <li>„Zum Home-Bildschirm“ wählen und bestätigen</li>
            <li>Die App vom Home-Bildschirm aus öffnen – hier steht dann der Schalter</li>
          </ol>
          <p className="mt-2 text-sm text-navy-600/80">
            Apple lässt Benachrichtigungen nur so zu. Auf Android und am Computer geht es direkt.
          </p>
        </div>
      )}

      {zustand === "blockiert" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Benachrichtigungen sind für diese Seite im Browser gesperrt. Sie lassen sich in den
          Einstellungen des Browsers wieder erlauben – tippen Sie dazu in der Adresszeile auf das
          Schloss-Symbol.
        </p>
      )}

      {zustand === "geht-nicht" && (
        <p className="mt-4 rounded-lg bg-mist-100 px-4 py-3 text-sm text-navy-700">
          Dieser Browser kann keine Benachrichtigungen anzeigen. Sie sehen alles Neue weiterhin in
          der App.
        </p>
      )}

      {(zustand === "an" || zustand === "aus") && (
        <div className="mt-4 flex flex-wrap gap-2">
          {zustand === "aus" ? (
            <button onClick={einschalten} disabled={laeuft} className="btn-primary disabled:opacity-60">
              {laeuft ? "Einen Moment …" : "Benachrichtigungen einschalten"}
            </button>
          ) : (
            <>
              <button onClick={probe} disabled={laeuft} className="btn-primary disabled:opacity-60">
                Probe senden
              </button>
              <button onClick={ausschalten} disabled={laeuft} className="btn-secondary">
                Ausschalten
              </button>
            </>
          )}
        </div>
      )}

      {zustand === "an" && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-600">
          <span className="live-dot" aria-hidden /> Auf diesem Gerät eingeschaltet
        </p>
      )}

      {meldung && <p className="mt-3 text-sm font-medium text-navy-700">{meldung}</p>}
    </section>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MIcon } from "@/components/m-icon";
import { patientEinladen } from "../actions";

/**
 * Zugang für eine neue Patientin oder einen neuen Patienten anlegen.
 * Zwei Wege, weil beide im Alltag vorkommen: per E-Mail von unterwegs, oder
 * als Link, den Charles beim Hausbesuch direkt weitergibt.
 */
export function Einladen({ moeglich }: { moeglich: boolean }) {
  const [offen, setOffen] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState(false);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();

  function absenden(formData: FormData, weg: "mail" | "link") {
    formData.set("weg", weg);
    setFehler(null);
    setErfolg(null);
    setLink(null);
    setKopiert(false);
    startTransition(async () => {
      const ergebnis = await patientEinladen(formData);
      if (ergebnis?.fehler) return setFehler(ergebnis.fehler);
      if (ergebnis?.link) {
        setLink(ergebnis.link);
        setErfolg("Zugang angelegt. Geben Sie diesen Link weiter – er gilt 24 Stunden.");
      } else {
        setErfolg(
          `Einladung ist unterwegs an ${formData.get("email")}. Sobald sie darauf tippt, vergibt sie ihr Passwort selbst.`
        );
        setOffen(false);
      }
      router.refresh();
    });
  }

  if (!moeglich) {
    return (
      <p className="card text-sm text-navy-600/80">
        Einladungen sind noch nicht eingerichtet. Solange können sich neue Patientinnen und
        Patienten selbst unter <strong>/registrieren</strong> anmelden.
      </p>
    );
  }

  if (!offen && !link) {
    return (
      <div className="card">
        <h2 className="text-lg font-bold text-navy-800">Neue Patientin oder neuer Patient</h2>
        <p className="mt-1 text-navy-600/80">
          Legen Sie einen Zugang an – per E-Mail oder als Link zum Weitergeben.
        </p>
        {erfolg && (
          <p className="mt-4 rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
            {erfolg}
          </p>
        )}
        <button onClick={() => setOffen(true)} className="btn-primary mt-4 w-full sm:w-auto">
          Einladen
        </button>
      </div>
    );
  }

  return (
    <form className="card space-y-4">
      <h2 className="text-lg font-bold text-navy-800">Einladen</h2>

      <div>
        <label htmlFor="name" className="label-base">
          Vor- und Nachname
        </label>
        <input id="name" name="name" required className="input-base" placeholder="Maria Mustermann" />
      </div>
      <div>
        <label htmlFor="email" className="label-base">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input-base"
          placeholder="maria.mustermann@beispiel.de"
        />
        <p className="mt-1 text-xs text-navy-600/70">
          Auch für den Link nötig – der Zugang gehört zu dieser Adresse.
        </p>
      </div>

      {fehler && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{fehler}</p>
      )}
      {erfolg && (
        <p className="rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">{erfolg}</p>
      )}

      {link && (
        <div className="rounded-lg bg-mist-100 p-3">
          <p className="break-all text-xs text-navy-700">{link}</p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setKopiert(true);
              } catch {
                setKopiert(false);
              }
            }}
            className="btn-secondary mt-3 w-full sm:w-auto"
          >
            <MIcon name="dokument" /> {kopiert ? "Kopiert" : "Link kopieren"}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          formAction={(fd) => absenden(fd, "mail")}
          disabled={laeuft}
          className="btn-primary disabled:opacity-60"
        >
          <MIcon name="mail" /> {laeuft ? "Einen Moment …" : "Per E-Mail einladen"}
        </button>
        <button
          type="submit"
          formAction={(fd) => absenden(fd, "link")}
          disabled={laeuft}
          className="btn-secondary disabled:opacity-60"
        >
          Nur Link erzeugen
        </button>
        <button
          type="button"
          onClick={() => {
            setOffen(false);
            setLink(null);
            setFehler(null);
          }}
          className="rounded-lg px-3 py-3 font-medium text-navy-600/70 transition hover:text-navy-800"
        >
          Schließen
        </button>
      </div>
    </form>
  );
}

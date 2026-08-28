import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { MIcon } from "@/components/m-icon";
import { AnfahrtVorschau } from "./anfahrt-vorschau";

export const metadata: Metadata = {
  title: "Live-Anfahrt ansehen",
  description:
    "So sehen Patientinnen und Patienten, wann ihr Therapeut zum Hausbesuch eintrifft.",
  // Eine Vorführseite gehört nicht in die Suchergebnisse
  robots: { index: false, follow: false },
};

/**
 * Öffentliche Vorführseite. Zeigt die Live-Anfahrt mit erfundenen Zeiten, damit
 * man sie jemandem zeigen kann, ohne einen echten Termin anzulegen. Hier werden
 * keine Daten gelesen und keine geschrieben.
 */
export default function AnfahrtVorschauSeite() {
  return (
    <div className="min-h-dvh bg-mist-50">
      <header className="border-b border-mist-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Logo />
          <span className="rounded-full bg-mist-100 px-3 py-1.5 text-xs font-semibold text-navy-600/80">
            Vorführung
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <span className="badge-pill">Live-Anfahrt</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800 sm:text-4xl">
          Nie wieder <span className="text-teal-500">am Fenster warten</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-navy-600/80">
          Wenn Charles zum Hausbesuch losfährt, sieht die Patientin auf ihrem Handy, wann er
          eintrifft – ohne Anruf, ohne Nachfragen. Klicken Sie sich hier durch die Momente einer
          Fahrt.
        </p>

        <div className="mt-10">
          <AnfahrtVorschau />
        </div>

        <section className="card mt-12">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-800">
            <MIcon name="tipp" className="text-teal-600" />
            Kein Standort-Tracking
          </h2>
          <p className="mt-2 text-navy-600/80">
            Bewusst wird nicht laufend übertragen, wo sich der Therapeut befindet. Er tippt beim
            Losfahren einmal auf „Bin unterwegs“ und wählt die Fahrzeit – daraus entsteht die
            Prognose. Der Wagen auf der Strecke ist eine Fortschrittsanzeige, keine Position auf
            einer Landkarte. So erfährt die Patientin, was sie wissen will, und der Therapeut gibt
            seinen Aufenthaltsort nicht den ganzen Tag preis.
          </p>
        </section>

        <p className="mt-10 text-sm text-navy-600/70">
          Alle Zeiten und Namen auf dieser Seite sind erfunden. Es wird kein Termin angelegt und
          keine Patientendaten geladen.{" "}
          <Link href="/login" className="font-semibold text-teal-600 hover:underline">
            Zur Anmeldung
          </Link>
        </p>
      </main>
    </div>
  );
}

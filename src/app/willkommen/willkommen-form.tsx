"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { MIcon, type MIconName } from "@/components/m-icon";
import { GeburtsdatumFeld } from "@/components/geburtsdatum-feld";
import { onboardingSpeichern } from "@/app/app/actions";

type Werte = {
  anrede: "" | "herr" | "frau";
  vorname: string;
  nachname: string;
  street: string;
  zip: string;
  city: string;
  phone: string;
  birth_date: string;
};

const FUNKTIONEN: { icon: MIconName; titel: string; text: string }[] = [
  {
    icon: "kalender",
    titel: "Termine anfragen",
    text: "Wunschzeiten nennen, den Rest übernimmt die Praxis.",
  },
  {
    icon: "training",
    titel: "Ihr Trainingsplan",
    text: "Übungen mit Video-Anleitung, jederzeit zum Nachschauen.",
  },
  {
    icon: "sprechblase",
    titel: "Direkter Draht",
    text: "Fragen zwischendurch – ohne Telefonat, ohne Warteschleife.",
  },
  {
    icon: "auto",
    titel: "Anfahrt live",
    text: "Sie sehen, wann Ihr Therapeut bei Ihnen ankommt.",
  },
];

const LETZTER_SCHRITT = 4;

/**
 * Willkommen beim ersten Anmelden.
 *
 * Bewusst in kleinen Schritten: Die Zielgruppe ist oft über 70 und füllt das
 * auf dem Handy aus. Ein Formular mit acht Feldern schreckt ab, vier kurze
 * Fragen nacheinander nicht. Die E-Mail-Adresse ist schon bekannt und wird
 * gar nicht erst gefragt.
 */
export function WillkommenForm({ vorschlagName }: { vorschlagName: string }) {
  const teile = vorschlagName.trim().split(/\s+/).filter(Boolean);
  const [schritt, setSchritt] = useState(0);
  const [werte, setWerte] = useState<Werte>({
    anrede: "",
    vorname: teile.length > 1 ? teile[0] : "",
    nachname: teile.length > 1 ? teile.slice(1).join(" ") : "",
    street: "",
    zip: "",
    city: "",
    phone: "",
    birth_date: "",
  });
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();

  function setze<K extends keyof Werte>(feld: K, wert: Werte[K]) {
    setWerte((alt) => ({ ...alt, [feld]: wert }));
  }

  function weiter() {
    setFehler(null);
    if (schritt === 1 && !werte.vorname.trim()) {
      return setFehler("Bitte tragen Sie Ihren Vornamen ein.");
    }
    if (schritt === 2) {
      if (!werte.street.trim() || !werte.city.trim()) {
        return setFehler("Bitte tragen Sie Straße und Ort ein – dorthin kommt Ihr Therapeut.");
      }
      if (werte.zip.trim() && !/^\d{5}$/.test(werte.zip.trim())) {
        return setFehler("Die Postleitzahl hat fünf Ziffern.");
      }
    }
    setSchritt((s) => s + 1);
  }

  function abschliessen() {
    setFehler(null);
    const fd = new FormData();
    fd.set("anrede", werte.anrede);
    fd.set("full_name", `${werte.vorname.trim()} ${werte.nachname.trim()}`.trim());
    fd.set("street", werte.street.trim());
    fd.set("zip", werte.zip.trim());
    fd.set("city", werte.city.trim());
    fd.set("phone", werte.phone.trim());
    fd.set("birth_date", werte.birth_date);

    startTransition(async () => {
      const ergebnis = await onboardingSpeichern(fd);
      if (ergebnis?.fehler) return setFehler(ergebnis.fehler);
      setSchritt(LETZTER_SCHRITT);
      setTimeout(() => router.push("/app"), 2200);
    });
  }

  const fortschritt = Math.min(100, (schritt / LETZTER_SCHRITT) * 100);

  return (
    <main className="flex min-h-dvh flex-col bg-navy-900 px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="mb-6 flex justify-center">
          <Logo dark />
        </div>

        {/* Fortschritt über alle Schritte */}
        <div
          className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/15"
          role="progressbar"
          aria-valuenow={schritt}
          aria-valuemin={0}
          aria-valuemax={LETZTER_SCHRITT}
          aria-label="Fortschritt der Einrichtung"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500 transition-[width] duration-500 ease-out"
            style={{ width: `${fortschritt}%` }}
          />
        </div>

        <div className="card flex-1">
          {/* key sorgt dafür, dass die Animation bei jedem Schritt neu läuft */}
          <div key={schritt} className="animate-schritt">
            {schritt === 0 && (
              <>
                <span className="badge-pill">Willkommen</span>
                <h1 className="mt-3 text-2xl font-bold text-navy-800">
                  Schön, dass Sie <span className="text-teal-500">da sind</span>.
                </h1>
                <p className="mt-2 text-navy-600/80">
                  Das hier ist Ihr persönlicher Bereich bei Curamus Medical. Kurz, was Sie darin
                  finden:
                </p>

                <ul className="mt-5 space-y-3">
                  {FUNKTIONEN.map((f, i) => (
                    <li
                      key={f.titel}
                      className="animate-punkt flex items-start gap-3"
                      style={{ animationDelay: `${120 + i * 90}ms` }}
                    >
                      <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600">
                        <MIcon name={f.icon} groesse="1.35rem" />
                      </span>
                      <span>
                        <span className="block font-semibold text-navy-800">{f.titel}</span>
                        <span className="block text-sm text-navy-600/80">{f.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div
                  className="animate-punkt mt-6 rounded-xl border border-teal-500/25 bg-teal-50/60 p-4"
                  style={{ animationDelay: "520ms" }}
                >
                  <p className="flex items-center gap-2 font-semibold text-navy-800">
                    <MIcon name="erledigt" className="text-teal-600" /> Ihre Daten bleiben bei Ihnen
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-navy-700">
                    {[
                      "Alles liegt auf Servern in Deutschland, verschlüsselt übertragen.",
                      "Nur Sie und Ihre Praxis sehen Ihre Daten – niemand sonst.",
                      "Keine Werbung, keine Weitergabe, kein Mitlesen durch Dritte.",
                      "Sie können Ihren Zugang jederzeit löschen lassen.",
                    ].map((z) => (
                      <li key={z} className="flex items-start gap-1.5">
                        <MIcon name="haken_klein" className="mt-0.5 shrink-0 text-teal-600" />
                        <span>{z}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-navy-600/70">
                    Ausführlich in der{" "}
                    <Link href="/datenschutz" target="_blank" className="font-semibold text-teal-600 underline">
                      Datenschutzerklärung
                    </Link>
                    .
                  </p>
                </div>
              </>
            )}

            {schritt === 1 && (
              <>
                <span className="badge-pill">Schritt 1 von 3</span>
                <h1 className="mt-3 text-2xl font-bold text-navy-800">
                  Wie dürfen wir Sie <span className="text-teal-500">ansprechen</span>?
                </h1>
                <p className="mt-2 text-navy-600/80">
                  Ihre Praxis spricht Sie damit persönlich an.
                </p>
                <div className="mt-6 space-y-4">
                  <div>
                    <span className="label-base">Anrede</span>
                    <div className="flex gap-2">
                      {([
                        ["frau", "Frau"],
                        ["herr", "Herr"],
                        ["", "Ohne Anrede"],
                      ] as const).map(([wert, label]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setze("anrede", wert)}
                          className={`flex-1 rounded-xl border px-3 py-3 font-semibold transition ${
                            werte.anrede === wert
                              ? "border-teal-500 bg-teal-500 text-white"
                              : "border-mist-200 text-navy-800 hover:border-teal-500"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="vorname" className="label-base">
                      Vorname
                    </label>
                    <input
                      id="vorname"
                      autoFocus
                      autoComplete="given-name"
                      value={werte.vorname}
                      onChange={(e) => setze("vorname", e.target.value)}
                      className="input-base"
                      placeholder="Maria"
                    />
                  </div>
                  <div>
                    <label htmlFor="nachname" className="label-base">
                      Nachname
                    </label>
                    <input
                      id="nachname"
                      autoComplete="family-name"
                      value={werte.nachname}
                      onChange={(e) => setze("nachname", e.target.value)}
                      className="input-base"
                      placeholder="Mustermann"
                    />
                  </div>
                </div>
              </>
            )}

            {schritt === 2 && (
              <>
                <span className="badge-pill">Schritt 2 von 3</span>
                <h1 className="mt-3 text-2xl font-bold text-navy-800">
                  Wo dürfen wir Sie <span className="text-teal-500">besuchen</span>?
                </h1>
                <p className="mt-2 text-navy-600/80">
                  Ihre Anschrift sieht nur Ihre Praxis – sie braucht sie für den Hausbesuch.
                </p>
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="street" className="label-base">
                      Straße und Hausnummer
                    </label>
                    <input
                      id="street"
                      autoFocus
                      autoComplete="street-address"
                      value={werte.street}
                      onChange={(e) => setze("street", e.target.value)}
                      className="input-base"
                      placeholder="Musterstraße 12"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-32">
                      <label htmlFor="zip" className="label-base">
                        PLZ
                      </label>
                      <input
                        id="zip"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        value={werte.zip}
                        onChange={(e) => setze("zip", e.target.value)}
                        className="input-base"
                        placeholder="90402"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="city" className="label-base">
                        Ort
                      </label>
                      <input
                        id="city"
                        autoComplete="address-level2"
                        value={werte.city}
                        onChange={(e) => setze("city", e.target.value)}
                        className="input-base"
                        placeholder="Nürnberg"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {schritt === 3 && (
              <>
                <span className="badge-pill">Schritt 3 von 3</span>
                <h1 className="mt-3 text-2xl font-bold text-navy-800">
                  Fast <span className="text-teal-500">geschafft</span>.
                </h1>
                <p className="mt-2 text-navy-600/80">
                  Beides ist freiwillig. Die Telefonnummer hilft, wenn sich kurzfristig etwas
                  verschiebt.
                </p>
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="phone" className="label-base">
                      Telefon <span className="font-normal text-navy-600/60">(optional)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={werte.phone}
                      onChange={(e) => setze("phone", e.target.value)}
                      className="input-base"
                      placeholder="0911 1234567"
                    />
                  </div>
                  <div>
                    <label htmlFor="birth_date" className="label-base">
                      Geburtsdatum <span className="font-normal text-navy-600/60">(optional)</span>
                    </label>
                    <GeburtsdatumFeld
                      kennung="birth_date"
                      wert={werte.birth_date}
                      setWert={(v) => setze("birth_date", v)}
                    />
                  </div>
                </div>
              </>
            )}

            {schritt === LETZTER_SCHRITT && (
              <div className="py-6 text-center">
                <svg viewBox="0 0 80 80" width="88" height="88" className="mx-auto" aria-hidden>
                  <circle
                    cx="40"
                    cy="40"
                    r="33"
                    fill="none"
                    stroke="#34b8be"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="animate-kreis"
                    transform="rotate(-90 40 40)"
                  />
                  <path
                    d="M26 41.5 36 51 55 31"
                    fill="none"
                    stroke="#34b8be"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-haken"
                  />
                </svg>
                <h1 className="mt-5 text-2xl font-bold text-navy-800">
                  Alles bereit, {werte.vorname || "willkommen"}.
                </h1>
                <p className="mt-2 text-navy-600/80">Wir bringen Sie in Ihren Bereich.</p>
              </div>
            )}
          </div>

          {fehler && schritt !== LETZTER_SCHRITT && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {fehler}
            </p>
          )}

          {schritt !== LETZTER_SCHRITT && (
            <div className="mt-6 flex items-center gap-2">
              {schritt > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFehler(null);
                    setSchritt((s) => s - 1);
                  }}
                  className="rounded-lg px-3 py-3 font-semibold text-navy-600/70 transition hover:text-navy-800"
                >
                  <MIcon name="pfeilLinks" className="mr-1" />
                  Zurück
                </button>
              )}
              <button
                type="button"
                onClick={schritt === 3 ? abschliessen : weiter}
                disabled={laeuft}
                className="btn-primary flex-1 disabled:opacity-60"
              >
                {laeuft
                  ? "Einen Moment …"
                  : schritt === 0
                    ? "Los geht’s"
                    : schritt === 3
                      ? "Fertig"
                      : "Weiter"}
                {!laeuft && schritt !== 3 && <MIcon name="pfeilRechts" />}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Kein Notfallkanal – wählen Sie bei medizinischen Notfällen die 112.
        </p>
      </div>
    </main>
  );
}

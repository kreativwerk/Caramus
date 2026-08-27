"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswortFelder, passwortPruefen } from "@/components/passwort-felder";

/**
 * Passwort im laufenden Betrieb ändern. Bewusst hinter einem Knopf, damit die
 * Profilseite nicht wie ein Formularberg aussieht.
 */
export function PasswortAendern() {
  const [offen, setOffen] = useState(false);
  const [passwort, setPasswort] = useState("");
  const [wiederholung, setWiederholung] = useState("");
  const [meldung, setMeldung] = useState<{ typ: "ok" | "fehler"; text: string } | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    const beanstandung = passwortPruefen(passwort, wiederholung);
    if (beanstandung) return setMeldung({ typ: "fehler", text: beanstandung });

    setMeldung(null);
    setLaeuft(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwort });
    setLaeuft(false);

    if (error) {
      const text = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
      setMeldung({
        typ: "fehler",
        text:
          text.includes("weak") || text.includes("at least")
            ? "Bitte wählen Sie ein längeres Passwort – mindestens 6 Zeichen."
            : text.includes("same")
              ? "Das ist Ihr bisheriges Passwort. Bitte wählen Sie ein anderes."
              : text.includes("reauthentication") || text.includes("session")
                ? "Bitte melden Sie sich noch einmal an und versuchen Sie es dann erneut."
                : "Das hat gerade nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal.",
      });
      return;
    }

    setPasswort("");
    setWiederholung("");
    setOffen(false);
    setMeldung({ typ: "ok", text: "Ihr neues Passwort ist gespeichert." });
  }

  return (
    <section className="card">
      <h2 className="text-lg font-bold text-navy-800">Passwort</h2>
      <p className="mt-1 text-navy-600/80">
        Sie können sich jederzeit auch ohne Passwort anmelden – über einen Link per E-Mail.
      </p>

      {meldung && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
            meldung.typ === "ok" ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
          }`}
        >
          {meldung.text}
        </p>
      )}

      {offen ? (
        <form onSubmit={absenden} className="mt-4 space-y-4">
          <PasswortFelder
            passwort={passwort}
            wiederholung={wiederholung}
            setPasswort={setPasswort}
            setWiederholung={setWiederholung}
            kennung="neues-passwort"
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
              {laeuft ? "Einen Moment …" : "Passwort speichern"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOffen(false);
                setMeldung(null);
              }}
              className="btn-secondary"
            >
              Abbrechen
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setOffen(true)} className="btn-secondary mt-4 w-full sm:w-auto">
          Passwort ändern
        </button>
      )}
    </section>
  );
}

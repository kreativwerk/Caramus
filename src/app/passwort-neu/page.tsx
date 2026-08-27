"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { PasswortFelder, passwortPruefen } from "@/components/passwort-felder";

/**
 * Neues Passwort vergeben, nachdem der Link aus der E-Mail angeklickt wurde.
 * Der Link hat die Anmeldung schon hergestellt – hier wird nur noch das
 * Passwort gesetzt.
 */
export default function PasswortNeuPage() {
  const [bereit, setBereit] = useState<"prueft" | "ja" | "nein">("prueft");
  const [passwort, setPasswort] = useState("");
  const [wiederholung, setWiederholung] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const [fertig, setFertig] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setBereit(user ? "ja" : "nein");
    })();
  }, []);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    const beanstandung = passwortPruefen(passwort, wiederholung);
    if (beanstandung) return setFehler(beanstandung);

    setFehler(null);
    setLaeuft(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwort });
    setLaeuft(false);

    if (error) {
      const text = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
      setFehler(
        text.includes("weak") || text.includes("at least")
          ? "Bitte wählen Sie ein längeres Passwort – mindestens 6 Zeichen."
          : text.includes("same")
            ? "Das ist Ihr bisheriges Passwort. Bitte wählen Sie ein anderes."
            : "Das hat gerade nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal."
      );
      return;
    }
    setFertig(true);
    setTimeout(() => router.push("/"), 2500);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo dark />
        </div>
        <div className="card">
          <span className="badge-pill">Passwort</span>
          <h1 className="mt-3 text-2xl font-bold text-navy-800">
            Neues <span className="text-teal-500">Passwort</span> vergeben
          </h1>

          {bereit === "prueft" && <p className="mt-4 text-navy-600/70">Einen Moment …</p>}

          {bereit === "nein" && (
            <>
              <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-amber-800">
                Dieser Link ist nicht mehr gültig – er gilt nur eine Stunde. Fordern Sie sich bitte
                einen neuen an.
              </p>
              <Link href="/passwort-vergessen" className="btn-primary mt-4 w-full">
                Neuen Link anfordern
              </Link>
            </>
          )}

          {bereit === "ja" && fertig && (
            <p className="mt-4 rounded-lg bg-teal-50 p-4 text-navy-800">
              <strong className="block">Geschafft. ✓</strong>
              <span className="mt-1 block text-sm">
                Ihr neues Passwort ist gespeichert. Wir bringen Sie gleich in Ihren Bereich.
              </span>
            </p>
          )}

          {bereit === "ja" && !fertig && (
            <>
              <p className="mt-1 text-navy-600/80">
                Wählen Sie ein Passwort, das Sie sich gut merken können.
              </p>
              <form onSubmit={absenden} className="mt-6 space-y-4">
                <PasswortFelder
                  passwort={passwort}
                  wiederholung={wiederholung}
                  setPasswort={setPasswort}
                  setWiederholung={setWiederholung}
                />
                {fehler && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {fehler}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={laeuft}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {laeuft ? "Einen Moment …" : "Passwort speichern"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

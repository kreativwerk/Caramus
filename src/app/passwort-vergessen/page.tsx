"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { MIcon } from "@/components/m-icon";

/**
 * Neues Passwort anfordern. Ob es die Adresse gibt, verrät die Seite bewusst
 * nicht – sonst könnte man damit ausprobieren, wer hier Patient ist.
 */
export default function PasswortVergessenPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "laden" | "gesendet">("idle");
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    setStatus("laden");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${location.origin}/auth/callback?weiter=${encodeURIComponent("/passwort-neu")}`,
    });

    if (error) {
      const text = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
      setFehler(
        text.includes("rate limit")
          ? "Sie haben es gerade schon mehrmals versucht. Bitte warten Sie einen Moment."
          : "Das hat gerade nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal."
      );
      setStatus("idle");
      return;
    }
    setStatus("gesendet");
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
            Passwort <span className="text-teal-500">vergessen</span>?
          </h1>

          {status === "gesendet" ? (
            <>
              <p className="mt-4 rounded-lg bg-teal-50 p-4 text-navy-800">
                <strong className="flex items-center gap-2">
                  <MIcon name="mail" className="text-teal-600" /> Schauen Sie in Ihr Postfach.
                </strong>
                <span className="mt-1 block text-sm">
                  Falls es für <strong>{email}</strong> einen Zugang gibt, haben wir eine E-Mail
                  geschickt. Darin ist ein Link, mit dem Sie ein neues Passwort vergeben können. Er
                  gilt eine Stunde.
                </span>
              </p>
              <p className="mt-4 text-sm text-navy-600/80">
                Nichts angekommen? Schauen Sie bitte auch im Spam-Ordner nach.
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-navy-600/80">
                Kein Problem. Tragen Sie Ihre E-Mail-Adresse ein, dann schicken wir Ihnen einen
                Link, mit dem Sie ein neues vergeben können.
              </p>
              <form onSubmit={absenden} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="label-base">
                    E-Mail-Adresse
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maria.mustermann@beispiel.de"
                    className="input-base"
                  />
                </div>
                {fehler && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {fehler}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "laden"}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {status === "laden" ? "Einen Moment …" : "Link zum Zurücksetzen senden"}
                </button>
              </form>
              <p className="mt-4 text-sm text-navy-600/80">
                Übrigens: Sie können sich auch ganz ohne Passwort anmelden – über einen Link per
                E-Mail.
              </p>
            </>
          )}

          <p className="mt-6 border-t border-mist-100 pt-4 text-center text-sm text-navy-600/80">
            <Link href="/login" className="font-semibold text-teal-600 hover:underline">
              Zurück zur Anmeldung
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

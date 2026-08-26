"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

type Variante = {
  badge: string;
  titel: React.ReactNode;
  beschreibung: string;
  weiterDefault: string;
  zeigeRegistrierung: boolean;
  fussHinweis?: React.ReactNode;
};

function Formular({ variante }: { variante: Variante }) {
  const router = useRouter();
  const params = useSearchParams();
  const weiter = params.get("weiter") ?? variante.weiterDefault;
  const linkFehler = params.get("fehler") === "link";

  const [modus, setModus] = useState<"link" | "passwort">("link");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [status, setStatus] = useState<"idle" | "laden" | "linkGesendet">("idle");
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    setStatus("laden");
    const supabase = createClient();

    if (modus === "passwort") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });
      if (error) {
        setFehler("Das hat nicht gepasst. Bitte prüfen Sie E-Mail-Adresse und Passwort – oder melden Sie sich ohne Passwort per E-Mail an.");
        setStatus("idle");
        return;
      }
      router.push(weiter);
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback?weiter=${encodeURIComponent(weiter)}`,
        },
      });
      if (error) {
        setFehler("Wir konnten Ihnen gerade keine E-Mail schicken. Bitte prüfen Sie Ihre E-Mail-Adresse und versuchen Sie es noch einmal.");
        setStatus("idle");
        return;
      }
      setStatus("linkGesendet");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo dark />
        </div>
        <div className="card">
          <span className="badge-pill">{variante.badge}</span>
          <h1 className="mt-3 text-2xl font-bold text-navy-800">{variante.titel}</h1>
          <p className="mt-1 text-navy-600/80">{variante.beschreibung}</p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-mist-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setModus("link")}
              className={`rounded-md px-3 py-2.5 transition ${modus === "link" ? "bg-white text-teal-600 shadow-sm" : "text-navy-700"}`}
            >
              Ohne Passwort
            </button>
            <button
              type="button"
              onClick={() => setModus("passwort")}
              className={`rounded-md px-3 py-2.5 transition ${modus === "passwort" ? "bg-white text-teal-600 shadow-sm" : "text-navy-700"}`}
            >
              Mit Passwort
            </button>
          </div>

          {status === "linkGesendet" ? (
            <div className="mt-6 rounded-lg bg-teal-50 p-4 text-navy-800">
              <p className="font-semibold">Ihr Anmelde-Link ist unterwegs. ✉️</p>
              <p className="mt-1 text-sm">
                Bitte öffnen Sie die E-Mail an <strong>{email}</strong> und tippen Sie auf den Link –
                Sie werden dann automatisch angemeldet.
              </p>
            </div>
          ) : (
            <form onSubmit={absenden} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="label-base">E-Mail-Adresse</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base"
                  placeholder="ihre.name@beispiel.de"
                />
              </div>
              {modus === "passwort" && (
                <div>
                  <label htmlFor="passwort" className="label-base">Passwort</label>
                  <input
                    id="passwort"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={passwort}
                    onChange={(e) => setPasswort(e.target.value)}
                    className="input-base"
                  />
                </div>
              )}
              {(fehler || linkFehler) && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {fehler ?? "Dieser Anmelde-Link ist nicht mehr gültig – er gilt nur eine Stunde. Bitte fordern Sie sich einen neuen an."}
                </p>
              )}
              <button type="submit" disabled={status === "laden"} className="btn-primary w-full disabled:opacity-60">
                {status === "laden"
                  ? "Einen Moment …"
                  : modus === "link"
                    ? "Anmelde-Link per E-Mail senden"
                    : "Anmelden"}
              </button>
            </form>
          )}

          {variante.zeigeRegistrierung && (
            <p className="mt-6 border-t border-mist-100 pt-4 text-center text-sm text-navy-600/80">
              Noch kein Zugang?{" "}
              <Link href="/registrieren" className="font-semibold text-teal-600 hover:underline">
                Zugang einrichten
              </Link>
            </p>
          )}
          {variante.fussHinweis}
        </div>
        <p className="mt-6 text-center text-xs text-white/50">
          Kein Notfallkanal – wählen Sie bei medizinischen Notfällen die 112.
        </p>
        <p className="mt-2 text-center text-xs text-white/50">
          <Link href="/impressum" className="hover:text-white">Impressum</Link>
          {" · "}
          <Link href="/datenschutz" className="hover:text-white">Datenschutz</Link>
          {" · "}
          <Link href="/agb" className="hover:text-white">AGB</Link>
          {" · "}
          <Link href="/widerruf" className="hover:text-white">Widerruf</Link>
        </p>
      </div>
    </main>
  );
}

export function LoginSeite({ variante }: { variante: Variante }) {
  return (
    <Suspense>
      <Formular variante={variante} />
    </Suspense>
  );
}

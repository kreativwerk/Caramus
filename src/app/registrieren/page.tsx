"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

export default function RegistrierenPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [status, setStatus] = useState<"idle" | "laden" | "fertig">("idle");
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    setStatus("laden");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: passwort,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setFehler(
        error.message.includes("already registered")
          ? "Für diese E-Mail-Adresse gibt es bereits einen Zugang. Bitte melden Sie sich an."
          : "Der Zugang konnte nicht eingerichtet werden. Bitte prüfen Sie Ihre Angaben (Passwort: mindestens 6 Zeichen)."
      );
      setStatus("idle");
      return;
    }
    setStatus("fertig");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo dark />
        </div>
        <div className="card">
          <span className="badge-pill">Zugang einrichten</span>
          <h1 className="mt-3 text-2xl font-bold text-navy-800">
            Ihr persönlicher <span className="text-teal-500">Bereich</span>.
          </h1>
          <p className="mt-1 text-navy-600/80">
            Richten Sie Ihren Zugang mit der E-Mail-Adresse ein, die Sie mit Ihrem Therapeuten
            besprochen haben.
          </p>

          {status === "fertig" ? (
            <div className="mt-6 rounded-lg bg-teal-50 p-4 text-navy-800">
              <p className="font-semibold">Fast geschafft! ✉️</p>
              <p className="mt-1 text-sm">
                Wir haben Ihnen eine E-Mail an <strong>{email}</strong> gesendet. Bitte bestätigen
                Sie dort Ihre Adresse – danach können Sie sich anmelden.
              </p>
            </div>
          ) : (
            <form onSubmit={absenden} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="label-base">Vor- und Nachname</label>
                <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="input-base" placeholder="Maria Mustermann" />
              </div>
              <div>
                <label htmlFor="email" className="label-base">E-Mail-Adresse</label>
                <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" placeholder="ihre.name@beispiel.de" />
              </div>
              <div>
                <label htmlFor="passwort" className="label-base">Passwort wählen</label>
                <input id="passwort" type="password" required minLength={6} autoComplete="new-password" value={passwort} onChange={(e) => setPasswort(e.target.value)} className="input-base" />
                <p className="mt-1 text-xs text-navy-600/70">Mindestens 6 Zeichen. Sie können sich später auch ohne Passwort per E-Mail-Link anmelden.</p>
              </div>
              {fehler && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{fehler}</p>}
              <button type="submit" disabled={status === "laden"} className="btn-primary w-full disabled:opacity-60">
                {status === "laden" ? "Einen Moment …" : "Zugang einrichten"}
              </button>
            </form>
          )}

          <p className="mt-6 border-t border-mist-100 pt-4 text-center text-sm text-navy-600/80">
            Bereits einen Zugang?{" "}
            <Link href="/login" className="font-semibold text-teal-600 hover:underline">
              Zur Anmeldung
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

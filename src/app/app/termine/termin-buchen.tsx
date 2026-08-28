"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DateiFeld } from "@/components/datei-feld";
import { MIcon } from "@/components/m-icon";
import { DOCS_BUCKET } from "@/lib/media";
import { dokumentSpeichern } from "../actions";
import { formatTime, tagesSchluessel, ZEITZONE } from "@/lib/types";

const MAX_DATEIEN = 3;
/** Schritt der Bestätigung; danach folgt nur noch die Erfolgsmeldung. */
const LETZTER_SCHRITT = 4;
const MAX_GROESSE = 10 * 1024 * 1024;
const ERLAUBTE_TYPEN = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"];

type Tag = { datum: string; zeiten: string[] };

/** Wie die Verordnung zur Praxis kommt. */
type RezeptWeg = "" | "datei" | "liegtVor" | "selbstzahler";

const REZEPT_WAHL: { wert: Exclude<RezeptWeg, "">; titel: string; text: string }[] = [
  {
    wert: "datei",
    titel: "Ich hänge es jetzt an",
    text: "Ein Foto der Vorder- und Rückseite genügt, ein PDF geht auch.",
  },
  {
    wert: "liegtVor",
    titel: "Die Praxis hat es schon",
    text: "Sie haben es bereits abgegeben oder geschickt.",
  },
  {
    wert: "selbstzahler",
    titel: "Ich zahle selbst",
    text: "Ohne Verordnung – die Kosten tragen Sie privat.",
  },
];

function tagLabel(datum: string) {
  const heuteDe = new Date().toLocaleDateString("sv-SE", { timeZone: ZEITZONE });
  const morgen = new Date();
  morgen.setDate(morgen.getDate() + 1);
  const morgenDe = morgen.toLocaleDateString("sv-SE", { timeZone: ZEITZONE });
  if (datum === heuteDe) return "Heute";
  if (datum === morgenDe) return "Morgen";
  return new Date(`${datum}T12:00:00`).toLocaleDateString("de-DE", { weekday: "long" });
}

function datumLang(datum: string) {
  return new Date(`${datum}T12:00:00`).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
  });
}

const uhrzeit = formatTime;

/**
 * Terminbuchung in vier Schritten: Tag, Uhrzeit, Angaben, Bestätigung.
 *
 * Die freien Zeiten kommen aus der Datenbank – dort ist hinterlegt, wann die
 * Praxis arbeitet, wie lange ein Termin dauert und wie viel Fahrzeit zwischen
 * zwei Hausbesuchen bleiben muss. Was hier angeboten wird, ist also wirklich
 * buchbar.
 */
export function TerminBuchen({
  slotMinuten,
  autoBestaetigen,
  startTage,
}: {
  slotMinuten: number;
  autoBestaetigen: boolean;
  /** Vom Server vorberechnet, damit die Liste sofort dasteht */
  startTage: Tag[];
}) {
  const [schritt, setSchritt] = useState(0);
  const [tage, setTage] = useState<Tag[]>(startTage);
  const [tag, setTag] = useState<string | null>(null);
  const [zeit, setZeit] = useState<string | null>(null);
  const [nachricht, setNachricht] = useState("");
  const [rezeptWeg, setRezeptWeg] = useState<RezeptWeg>("");
  const [rezeptDateien, setRezeptDateien] = useState<string[]>([]);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const dateiRef = useRef<HTMLInputElement>(null);
  // Nach einem missglückten Buchungsversuch soll dieselbe Datei nicht erneut
  // im Speicher landen.
  const hochgeladen = useRef(false);
  const router = useRouter();

  const rezeptFertig =
    rezeptWeg === "liegtVor" ||
    rezeptWeg === "selbstzahler" ||
    (rezeptWeg === "datei" && rezeptDateien.length > 0);

  const laden = useCallback(async () => {
    setFehler(null);
    const supabase = createClient();
    const heute = new Date();
    const bis = new Date(heute);
    bis.setDate(heute.getDate() + 56);
    const { data, error } = await supabase.rpc("freie_termine", {
      p_von: heute.toISOString().slice(0, 10),
      p_bis: bis.toISOString().slice(0, 10),
    });

    if (error) {
      setFehler("Die freien Zeiten lassen sich gerade nicht laden. Bitte versuchen Sie es gleich noch einmal.");
      return;
    }

    // Nach Tagen bündeln – der Kalender fragt in Ortszeit, die Liste zeigt Ortszeit
    const nachTag = new Map<string, string[]>();
    for (const zeile of (data ?? []) as { beginn: string }[]) {
      const schluessel = tagesSchluessel(zeile.beginn);
      nachTag.set(schluessel, [...(nachTag.get(schluessel) ?? []), zeile.beginn]);
    }
    setTage([...nachTag.entries()].map(([datum, zeiten]) => ({ datum, zeiten })));
  }, []);

  /**
   * Legt das Rezept ab. Das geschieht vor der Buchung: ein Hausbesuch ohne
   * Verordnung darf gar nicht erst zustande kommen. Meldet zurück, ob es
   * geklappt hat – bei einem Fehler bleibt der Termin ungebucht.
   */
  async function rezeptAblegen(supabase: ReturnType<typeof createClient>) {
    if (rezeptWeg !== "datei" || hochgeladen.current) return true;

    const dateien = [...(dateiRef.current?.files ?? [])].slice(0, MAX_DATEIEN);
    if (dateien.length === 0) {
      setFehler("Bitte wählen Sie zuerst Ihr Rezept aus.");
      setSchritt(2);
      return false;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    for (const d of dateien) {
      if (d.size > MAX_GROESSE) {
        setFehler(`„${d.name}“ ist größer als 10 MB. Bitte fotografieren Sie das Rezept noch einmal in kleinerer Auflösung.`);
        setSchritt(2);
        return false;
      }
      if (d.type && !ERLAUBTE_TYPEN.includes(d.type)) {
        setFehler(`„${d.name}“ können wir leider nicht lesen. Bitte schicken Sie ein Foto oder ein PDF.`);
        setSchritt(2);
        return false;
      }
      const endung = d.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const pfad = `${user!.id}/${crypto.randomUUID()}.${endung}`;
      const { error: hochFehler } = await supabase.storage
        .from(DOCS_BUCKET)
        .upload(pfad, d, { contentType: d.type || undefined });
      if (hochFehler) {
        setFehler("Ihr Rezept ließ sich gerade nicht übertragen. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es noch einmal.");
        setSchritt(2);
        return false;
      }
      const fd = new FormData();
      fd.set("file_path", pfad);
      fd.set("file_name", d.name);
      fd.set("content_type", d.type);
      fd.set("size_bytes", String(d.size));
      fd.set("kind", "rezept");
      await dokumentSpeichern(fd);
    }
    hochgeladen.current = true;
    return true;
  }

  async function buchen() {
    if (!zeit || !rezeptFertig) return;
    setFehler(null);
    setLaeuft(true);
    const supabase = createClient();

    if (!(await rezeptAblegen(supabase))) {
      setLaeuft(false);
      return;
    }

    // Damit die Praxis gleich sieht, woran sie beim Rezept ist
    const hinweis =
      rezeptWeg === "liegtVor"
        ? "Rezept liegt der Praxis bereits vor."
        : rezeptWeg === "selbstzahler"
          ? "Ohne Rezept – zahlt selbst."
          : "";
    const text = [nachricht.trim(), hinweis].filter(Boolean).join("\n\n");

    const { data: neueId, error } = await supabase.rpc("termin_buchen", {
      p_beginn: zeit,
      p_nachricht: text || null,
    });

    if (error) {
      setLaeuft(false);
      if (String(error.message).includes("termin_vergeben")) {
        setFehler("Dieser Termin wurde eben vergeben. Bitte wählen Sie eine andere Zeit. Ihr Rezept ist bereits bei uns.");
        setZeit(null);
        setSchritt(1);
        laden();
        return;
      }
      setFehler("Die Buchung hat gerade nicht geklappt. Bitte versuchen Sie es in einem Moment noch einmal.");
      return;
    }

    setLaeuft(false);
    if (neueId) {
      setSchritt(5);
      setTimeout(() => router.refresh(), 1800);
    }
  }

  const gewaehlterTag = tage.find((t) => t.datum === tag);
  const gesamt = tage.reduce((n, t) => n + t.zeiten.length, 0);

  return (
    <section className="card">
      {/* Fortschritt */}
      {schritt <= LETZTER_SCHRITT && (
        <div className="mb-5 flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= schritt ? "bg-teal-500" : "bg-mist-200"
              }`}
            />
          ))}
        </div>
      )}

      <div key={schritt} className="animate-schritt">
        {schritt === 0 && (
          <>
            <h2 className="text-xl font-bold text-navy-800">Wann passt es Ihnen?</h2>
            <p className="mt-1 text-navy-600/80">
              Wählen Sie einen Tag. Angezeigt werden nur Zeiten, die wirklich frei sind.
            </p>

            {gesamt === 0 && (
              <div className="mt-6 rounded-xl bg-mist-100 p-4">
                <p className="font-semibold text-navy-800">Gerade ist nichts frei.</p>
                <p className="mt-1 text-sm text-navy-600/80">
                  Schreiben Sie Ihrer Praxis kurz eine Nachricht – gemeinsam findet sich meist doch
                  ein Weg.
                </p>
              </div>
            )}

            {gesamt > 0 && (
              <ul className="mt-5 space-y-2">
                {tage.map((t) => (
                  <li key={t.datum}>
                    <button
                      onClick={() => {
                        setTag(t.datum);
                        setZeit(null);
                        setSchritt(1);
                      }}
                      className="flex w-full items-center gap-4 rounded-2xl border border-mist-200 px-4 py-3.5 text-left transition hover:border-teal-500 hover:bg-teal-50/40"
                    >
                      <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-mist-100">
                        <span className="text-lg font-bold text-navy-800">
                          {new Date(`${t.datum}T12:00:00`).getDate()}
                        </span>
                        <span className="text-[0.65rem] font-semibold uppercase text-navy-600/70">
                          {new Date(`${t.datum}T12:00:00`).toLocaleDateString("de-DE", {
                            month: "short",
                          })}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-navy-800">{tagLabel(t.datum)}</span>
                        <span className="block text-sm text-navy-600/80">
                          {t.zeiten.length} {t.zeiten.length === 1 ? "freie Zeit" : "freie Zeiten"}
                        </span>
                      </span>
                      <MIcon name="pfeilRechts" className="shrink-0 text-navy-600/40" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {schritt === 1 && gewaehlterTag && (
          <>
            <h2 className="text-xl font-bold text-navy-800">
              {tagLabel(gewaehlterTag.datum)}, {datumLang(gewaehlterTag.datum)}
            </h2>
            <p className="mt-1 text-navy-600/80">
              Jeder Termin dauert etwa {slotMinuten} Minuten.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {gewaehlterTag.zeiten.map((z) => (
                <button
                  key={z}
                  onClick={() => {
                    setZeit(z);
                    setSchritt(2);
                  }}
                  className={`rounded-xl border px-2 py-3.5 text-base font-semibold transition ${
                    zeit === z
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-mist-200 text-navy-800 hover:border-teal-500 hover:bg-teal-50/50"
                  }`}
                >
                  {uhrzeit(z)}
                </button>
              ))}
            </div>
          </>
        )}

        {schritt === 2 && (
          <>
            <h2 className="text-xl font-bold text-navy-800">Ihr Rezept</h2>
            <p className="mt-1 text-navy-600/80">
              Für einen Hausbesuch braucht Ihre Praxis eine ärztliche Verordnung mit dem Vermerk
              „Hausbesuch“. Ohne sie darf die Krankenkasse den Termin nicht übernehmen.
            </p>

            <div className="mt-5 space-y-2">
              {REZEPT_WAHL.map((w) => {
                const gewaehlt = rezeptWeg === w.wert;
                return (
                  <button
                    key={w.wert}
                    onClick={() => {
                      setRezeptWeg(w.wert);
                      setFehler(null);
                    }}
                    aria-pressed={gewaehlt}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                      gewaehlt
                        ? "border-teal-500 bg-teal-50/60"
                        : "border-mist-200 hover:border-teal-500 hover:bg-teal-50/30"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                        gewaehlt ? "border-teal-500 bg-teal-500" : "border-mist-200"
                      }`}
                      aria-hidden
                    >
                      {gewaehlt && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-navy-800">{w.titel}</span>
                      <span className="block text-sm text-navy-600/80">{w.text}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {rezeptWeg === "datei" && (
              <div className="mt-4 animate-schritt">
                <label htmlFor="dateien" className="label-base">
                  <MIcon name="rezept" className="mr-1.5 text-teal-600" />
                  Rezept auswählen
                </label>
                <DateiFeld
                  id="dateien"
                  feldRef={dateiRef}
                  accept="application/pdf,image/*"
                  multiple
                  knopfText="Dateien wählen"
                  onAuswahl={(namen) => {
                    setRezeptDateien(namen);
                    hochgeladen.current = false;
                    setFehler(null);
                  }}
                />
                <p className="mt-1 text-xs text-navy-600/70">
                  PDF oder Foto, bis zu {MAX_DATEIEN} Dateien, je höchstens 10 MB. Ihre Unterlagen
                  liegen verschlüsselt und sind nur für Ihre Praxis sichtbar.
                </p>
              </div>
            )}

            {rezeptWeg === "selbstzahler" && (
              <p className="mt-4 animate-schritt rounded-xl bg-mist-100 p-4 text-sm text-navy-700">
                Alles klar. Ihre Praxis meldet sich vor dem Termin mit den Kosten bei Ihnen.
              </p>
            )}
          </>
        )}

        {schritt === 3 && (
          <>
            <h2 className="text-xl font-bold text-navy-800">Möchten Sie uns noch etwas mitgeben?</h2>
            <p className="mt-1 text-navy-600/80">Freiwillig – Sie können den Schritt überspringen.</p>

            <div className="mt-5">
              <label htmlFor="nachricht" className="label-base">
                Nachricht an Ihre Praxis
              </label>
              <textarea
                id="nachricht"
                rows={5}
                value={nachricht}
                onChange={(e) => setNachricht(e.target.value)}
                placeholder="z. B. Anlass des Besuchs, Besonderheiten beim Zugang zur Wohnung"
                className="input-base"
              />
            </div>
          </>
        )}

        {schritt === LETZTER_SCHRITT && zeit && (
          <>
            <h2 className="text-xl font-bold text-navy-800">Passt das so?</h2>
            <div className="mt-5 rounded-2xl bg-mist-100 p-4">
              <p className="text-lg font-bold text-navy-800">
                {tagLabel(tagesSchluessel(zeit))}, {datumLang(tagesSchluessel(zeit))}
              </p>
              <p className="mt-1 text-2xl font-bold text-teal-600">{uhrzeit(zeit)} Uhr</p>
              <p className="mt-2 text-sm text-navy-600/80">
                Hausbesuch bei Ihnen zu Hause, etwa {slotMinuten} Minuten.
              </p>
              <p className="mt-3 flex items-start gap-2 border-t border-mist-200 pt-3 text-sm text-navy-700">
                <MIcon name="rezept" className="mt-0.5 shrink-0 text-teal-600" />
                <span>
                  {rezeptWeg === "datei"
                    ? `Rezept angehängt (${rezeptDateien.length} ${rezeptDateien.length === 1 ? "Datei" : "Dateien"})`
                    : rezeptWeg === "liegtVor"
                      ? "Rezept liegt der Praxis bereits vor"
                      : "Ohne Rezept – Sie zahlen selbst"}
                </span>
              </p>
              {nachricht.trim() && (
                <p className="mt-3 border-t border-mist-200 pt-3 text-sm text-navy-700">
                  „{nachricht.trim()}“
                </p>
              )}
            </div>
            <p className="mt-4 text-sm text-navy-600/80">
              {autoBestaetigen
                ? "Mit dem Tippen auf „Termin buchen“ steht der Termin fest. Sie können ihn jederzeit über den Chat wieder absagen."
                : "Ihre Praxis schaut sich den Wunsch an und bestätigt ihn – Sie bekommen Bescheid."}
            </p>
          </>
        )}

        {schritt > LETZTER_SCHRITT && zeit && (
          <div className="py-6 text-center">
            <svg viewBox="0 0 80 80" width="84" height="84" className="mx-auto" aria-hidden>
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
            <h2 className="mt-5 text-xl font-bold text-navy-800">Ihr Termin steht.</h2>
            <p className="mt-2 text-navy-600/80">
              {tagLabel(tagesSchluessel(zeit))}, {datumLang(tagesSchluessel(zeit))} um {uhrzeit(zeit)} Uhr.
            </p>
          </div>
        )}
      </div>

      {fehler && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {fehler}
        </p>
      )}

      {schritt > 0 && schritt <= LETZTER_SCHRITT && (
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => setSchritt((s) => s - 1)}
            className="rounded-lg px-3 py-3 font-semibold text-navy-600/70 transition hover:text-navy-800"
          >
            <MIcon name="pfeilLinks" className="mr-1" />
            Zurück
          </button>
          {schritt === 2 && (
            <button
              onClick={() => setSchritt(3)}
              disabled={!rezeptFertig}
              className="btn-primary flex-1 disabled:opacity-40"
            >
              Weiter <MIcon name="pfeilRechts" />
            </button>
          )}
          {schritt === 3 && (
            <button onClick={() => setSchritt(LETZTER_SCHRITT)} className="btn-primary flex-1">
              {nachricht.trim() ? "Weiter" : "Überspringen"} <MIcon name="pfeilRechts" />
            </button>
          )}
          {schritt === LETZTER_SCHRITT && (
            <button onClick={buchen} disabled={laeuft} className="btn-primary flex-1 disabled:opacity-60">
              {laeuft ? "Einen Moment …" : autoBestaetigen ? "Termin buchen" : "Wunsch senden"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

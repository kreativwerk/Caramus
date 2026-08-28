"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { pushNeueNachricht } from "@/lib/push-actions";
import { MIcon } from "@/components/m-icon";
import type { Message } from "@/lib/types";
import { ZEITZONE } from "@/lib/types";

/**
 * Höhe, ab der das Eingabefeld nicht weiter mitwächst. Bewusst knapp gehalten:
 * Auf dem Handy nimmt jedes zusätzliche Pixel im Feld dem Verlauf darüber Platz.
 */
const MAX_HOEHE = 120;

/** Uhrzeit; bei älteren Nachrichten zusätzlich der Tag. */
function zeitstempel(iso: string) {
  const wann = new Date(iso);
  const heute = new Date().toLocaleDateString("sv-SE", { timeZone: ZEITZONE });
  const tag = wann.toLocaleDateString("sv-SE", { timeZone: ZEITZONE });
  const uhr = wann.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZEITZONE,
  });
  if (tag === heute) return `${uhr} Uhr`;
  return `${wann.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", timeZone: ZEITZONE })}, ${uhr} Uhr`;
}

/** Trennlinie über dem ersten Beitrag eines Tages. */
function tagesTrenner(iso: string) {
  const wann = new Date(iso);
  const tag = wann.toLocaleDateString("sv-SE", { timeZone: ZEITZONE });
  const heute = new Date().toLocaleDateString("sv-SE", { timeZone: ZEITZONE });
  const gesternDatum = new Date();
  gesternDatum.setDate(gesternDatum.getDate() - 1);
  const gestern = gesternDatum.toLocaleDateString("sv-SE", { timeZone: ZEITZONE });
  if (tag === heute) return "Heute";
  if (tag === gestern) return "Gestern";
  return wann.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ZEITZONE,
  });
}

export function Chat({
  patientId,
  meId,
  initialMessages,
  empfaengerName,
  meinName,
}: {
  patientId: string;
  meId: string;
  initialMessages: Message[];
  empfaengerName: string;
  /** Steht unter den eigenen Beiträgen */
  meinName: string;
}) {
  const [nachrichten, setNachrichten] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sendet, setSendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const endeRef = useRef<HTMLDivElement>(null);
  const feldRef = useRef<HTMLTextAreaElement>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    const kanal = supabase
      .channel(`chat-${patientId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `patient_id=eq.${patientId}` },
        (payload) => {
          const neu = payload.new as Message;
          setNachrichten((alt) => (alt.some((m) => m.id === neu.id) ? alt : [...alt, neu]));
        }
      )
      .subscribe();

    // Rückfalllösung, falls keine Echtzeitverbindung zustande kommt
    async function abrufen() {
      if (document.visibilityState === "hidden") return;
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at")
        .limit(200);
      if (data) {
        setNachrichten((alt) => (data.length === alt.length ? alt : (data as Message[])));
      }
    }
    const abrufTimer = setInterval(abrufen, 15_000);
    document.addEventListener("visibilitychange", abrufen);

    return () => {
      supabase.removeChannel(kanal);
      clearInterval(abrufTimer);
      document.removeEventListener("visibilitychange", abrufen);
    };
  }, [patientId]);

  useEffect(() => {
    endeRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [nachrichten.length]);

  useEffect(() => {
    // Eingehende Nachrichten als gelesen markieren
    supabaseRef.current
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("patient_id", patientId)
      .neq("sender_id", meId)
      .is("read_at", null)
      .then();
  }, [patientId, meId, nachrichten.length]);

  /** Das Feld wächst mit dem Text, bis zur festgelegten Höhe. */
  function hoeheAnpassen() {
    const feld = feldRef.current;
    if (!feld) return;
    feld.style.height = "auto";
    feld.style.height = `${Math.min(feld.scrollHeight, MAX_HOEHE)}px`;
    // Der Verlauf wird dabei kürzer – die letzte Nachricht soll sichtbar bleiben
    endeRef.current?.scrollIntoView({ block: "end" });
  }

  async function senden(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sendet) return;
    setSendet(true);
    setFehler(null);
    const { data, error } = await supabaseRef.current
      .from("messages")
      .insert({ patient_id: patientId, sender_id: meId, body })
      .select()
      .single();
    if (!error && data) {
      setNachrichten((alt) => (alt.some((m) => m.id === data.id) ? alt : [...alt, data as Message]));
      setText("");
      if (feldRef.current) feldRef.current.style.height = "auto";
      // Hinweis aufs Handy anstoßen; klappt das nicht, bleibt die Nachricht trotzdem stehen
      pushNeueNachricht(patientId).catch(() => {});
    } else {
      // Der Text bleibt im Feld stehen, damit nichts verlorengeht
      setFehler("Ihre Nachricht ist nicht angekommen. Bitte tippen Sie noch einmal auf Senden.");
    }
    setSendet(false);
  }

  // Auf dem Handy bleibt unten Platz für die Menüleiste, am Rechner gibt es keine.
  return (
    <div className="card flex h-[60dvh] flex-col p-0 sm:h-[68dvh] sm:p-0">
      <div className="border-b border-mist-100 px-5 py-4">
        <p className="font-semibold text-navy-800">{empfaengerName}</p>
        <p className="text-xs text-navy-600/70">
          Kein Notfallkanal – bei akuten Beschwerden wenden Sie sich an Arzt oder Notruf 112.
        </p>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {nachrichten.length === 0 && (
          <p className="pt-8 text-center text-navy-600/60">
            Noch keine Nachrichten. Schreiben Sie die erste!
          </p>
        )}
        {nachrichten.map((m, i) => {
          const vonMir = m.sender_id === meId;
          const vorherige = nachrichten[i - 1];
          const naechste = nachrichten[i + 1];
          // Name und Uhrzeit stehen nur unter dem letzten Beitrag einer Folge –
          // sonst wiederholt sich der Name bei jeder einzelnen Zeile.
          const letzterDerFolge = !naechste || naechste.sender_id !== m.sender_id;
          const neuerTag =
            !vorherige ||
            new Date(vorherige.created_at).toLocaleDateString("sv-SE", { timeZone: ZEITZONE }) !==
              new Date(m.created_at).toLocaleDateString("sv-SE", { timeZone: ZEITZONE });

          return (
            <div key={m.id}>
              {neuerTag && (
                <p className="py-3 text-center text-xs font-semibold text-navy-600/60">
                  {tagesTrenner(m.created_at)}
                </p>
              )}
              <div className={`flex ${vonMir ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] ${vonMir ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block rounded-2xl px-4 py-2.5 text-left ${
                      vonMir
                        ? "rounded-br-md bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                        : "rounded-bl-md bg-mist-100 text-navy-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                  {letzterDerFolge && (
                    <p className="mt-1 px-1 text-xs text-navy-600/70">
                      <span className="font-semibold">{vonMir ? meinName : empfaengerName}</span>
                      <span className="text-navy-600/50"> · {zeitstempel(m.created_at)}</span>
                    </p>
                  )}
                </div>
              </div>
              {letzterDerFolge && <div className="h-2" />}
            </div>
          );
        })}
        <div ref={endeRef} />
      </div>

      {fehler && (
        <p
          role="status"
          className="border-t border-mist-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-700"
        >
          {fehler}
        </p>
      )}

      <form onSubmit={senden} className="flex items-end gap-2 border-t border-mist-100 p-3">
        <textarea
          ref={feldRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            hoeheAnpassen();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              senden(e);
            }
          }}
          rows={2}
          placeholder="Nachricht schreiben …"
          aria-label="Nachricht schreiben"
          className="flex-1 resize-none rounded-2xl border border-mist-200 bg-mist-100/60 px-4 py-3 text-base leading-relaxed text-navy-900 outline-none transition placeholder:text-navy-600/50 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/25"
        />
        <button
          type="submit"
          disabled={sendet || !text.trim()}
          aria-label="Senden"
          title="Senden"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MIcon name="pfeilHoch" groesse="1.4rem" />
        </button>
      </form>
    </div>
  );
}

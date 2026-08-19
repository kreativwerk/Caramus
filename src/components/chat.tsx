"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";
import { formatDateTime } from "@/lib/types";

export function Chat({
  patientId,
  meId,
  initialMessages,
  empfaengerName,
}: {
  patientId: string;
  meId: string;
  initialMessages: Message[];
  empfaengerName: string;
}) {
  const [nachrichten, setNachrichten] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sendet, setSendet] = useState(false);
  const endeRef = useRef<HTMLDivElement>(null);
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
    return () => {
      supabase.removeChannel(kanal);
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

  async function senden(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sendet) return;
    setSendet(true);
    const { data, error } = await supabaseRef.current
      .from("messages")
      .insert({ patient_id: patientId, sender_id: meId, body })
      .select()
      .single();
    if (!error && data) {
      setNachrichten((alt) => (alt.some((m) => m.id === data.id) ? alt : [...alt, data as Message]));
      setText("");
    }
    setSendet(false);
  }

  return (
    <div className="card flex h-[65dvh] flex-col p-0 sm:p-0">
      <div className="border-b border-mist-100 px-5 py-4">
        <p className="font-semibold text-navy-800">{empfaengerName}</p>
        <p className="text-xs text-navy-600/70">
          Kein Notfallkanal – bei akuten Beschwerden wenden Sie sich an Arzt oder Notruf 112.
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {nachrichten.length === 0 && (
          <p className="pt-8 text-center text-navy-600/60">
            Noch keine Nachrichten. Schreiben Sie die erste! 👋
          </p>
        )}
        {nachrichten.map((m) => {
          const vonMir = m.sender_id === meId;
          return (
            <div key={m.id} className={`flex ${vonMir ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%] ${
                  vonMir
                    ? "rounded-br-md bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                    : "rounded-bl-md bg-mist-100 text-navy-900"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[0.65rem] ${vonMir ? "text-white/70" : "text-navy-600/60"}`}>
                  {formatDateTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endeRef} />
      </div>
      <form onSubmit={senden} className="flex items-end gap-2 border-t border-mist-100 p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              senden(e);
            }
          }}
          rows={1}
          placeholder="Nachricht schreiben …"
          className="input-base max-h-32 min-h-12 flex-1 resize-y"
        />
        <button type="submit" disabled={sendet || !text.trim()} className="btn-primary shrink-0 disabled:opacity-50">
          Senden
        </button>
      </form>
    </div>
  );
}

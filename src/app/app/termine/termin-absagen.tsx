"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MIcon } from "@/components/m-icon";
import { stornoFrist } from "@/lib/types";
import { terminAbsagen } from "../actions";

/**
 * Absage-Knopf an einem geplanten Termin. Ob er angeboten wird, hängt an der
 * Frist der Praxis; die endgültige Prüfung macht die Datenbank – hier geht es
 * nur darum, keinen Knopf zu zeigen, der ohnehin abgewiesen würde.
 */
export function TerminAbsagen({
  terminId,
  startsAt,
  stornoStunden,
}: {
  terminId: string;
  startsAt: string;
  /** null = Absagen in der App ist aus */
  stornoStunden: number | null;
}) {
  const [jetzt] = useState(() => Date.now());
  const [nachfrage, setNachfrage] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();

  if (stornoStunden === null) {
    return (
      <p className="text-sm text-navy-600/70">
        Absagen bitte telefonisch oder über die Nachrichten.
      </p>
    );
  }

  const frist = stornoFrist(stornoStunden);
  const rechtzeitig = new Date(startsAt).getTime() - jetzt >= stornoStunden * 3_600_000;

  if (!rechtzeitig) {
    return (
      <p className="text-sm text-navy-600/70">
        Absagen war bis {frist} vorher möglich. Kommt etwas dazwischen, rufen Sie bitte kurz an.
      </p>
    );
  }

  function absagen() {
    setFehler(null);
    const fd = new FormData();
    fd.set("termin_id", terminId);
    startTransition(async () => {
      const ergebnis = await terminAbsagen(fd);
      if (ergebnis?.fehler) {
        setFehler(ergebnis.fehler);
        setNachfrage(false);
        return;
      }
      router.refresh();
    });
  }

  if (!nachfrage) {
    return (
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={() => setNachfrage(true)}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-600/70 transition hover:bg-red-50 hover:text-red-700"
        >
          Termin absagen
        </button>
        {fehler && <p className="text-sm font-medium text-red-700">{fehler}</p>}
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl bg-mist-100 p-4 sm:w-auto">
      <p className="font-semibold text-navy-800">Diesen Termin wirklich absagen?</p>
      <p className="mt-1 text-sm text-navy-600/80">
        Das ist kostenfrei. Einen neuen Termin können Sie jederzeit wieder buchen.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={absagen}
          disabled={laeuft}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {laeuft ? "Einen Moment …" : "Ja, absagen"}
        </button>
        <button
          type="button"
          onClick={() => setNachfrage(false)}
          disabled={laeuft}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-navy-700 transition hover:bg-white"
        >
          <MIcon name="pfeilLinks" className="mr-1" />
          Termin behalten
        </button>
      </div>
    </div>
  );
}

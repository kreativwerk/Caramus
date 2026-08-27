"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DOKUMENT_STATUS, dokumentArtLabel, formatDate } from "@/lib/types";
import type { PatientDocument } from "@/lib/types";
import { dokumentLoeschen } from "../actions";
import { MIcon } from "@/components/m-icon";

export function DokumentKarte({
  dokument,
  url,
}: {
  dokument: PatientDocument;
  url: string | null;
}) {
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();
  const status = DOKUMENT_STATUS[dokument.status];
  // Bereits weitergeleitete Unterlagen nicht mehr löschbar
  const loeschbar = dokument.status === "eingegangen" || dokument.status === "unvollstaendig";

  function entfernen() {
    if (!confirm(`„${dokument.file_name}" wirklich entfernen?`)) return;
    const fd = new FormData();
    fd.set("id", dokument.id);
    startTransition(async () => {
      const ergebnis = await dokumentLoeschen(fd);
      if (ergebnis?.fehler) alert(ergebnis.fehler);
      else router.refresh();
    });
  }

  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-navy-800">
            <MIcon name="dokument" className="mr-1.5 text-navy-600/70" />{dokumentArtLabel(dokument.kind)}
          </p>
          <p className="truncate text-sm text-navy-600/80">{dokument.file_name}</p>
          <p className="mt-1 text-xs text-navy-600/60">
            Übermittelt am {formatDate(dokument.created_at)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.klasse}`}>
          {status.label}
        </span>
      </div>

      <p className="mt-3 rounded-lg bg-mist-50 px-4 py-3 text-sm text-navy-800">
        {status.patientText}
        {dokument.status_note && (
          <>
            <br />
            <span className="font-semibold">Hinweis: </span>
            {dokument.status_note}
          </>
        )}
      </p>

      <div className="mt-3 flex gap-4 text-sm font-semibold">
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
            Ansehen
          </a>
        )}
        {loeschbar && (
          <button onClick={entfernen} disabled={laeuft} className="text-red-600 hover:underline disabled:opacity-50">
            Entfernen
          </button>
        )}
      </div>
    </li>
  );
}

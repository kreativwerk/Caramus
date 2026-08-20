"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/media";
import { uebungLoeschen, uebungSpeichern } from "../actions";
import type { Exercise } from "@/lib/types";

export function UebungForm({ uebung, onFertig }: { uebung?: Exercise; onFertig?: () => void }) {
  const [meldung, setMeldung] = useState<string | null>(null);
  const [laeuft, startTransition] = useTransition();
  const dateiRef = useRef<HTMLInputElement>(null);

  function absenden(fd: FormData) {
    if (uebung) fd.set("id", uebung.id);
    startTransition(async () => {
      // Falls eine Datei gewählt wurde: erst in den geschützten Speicher hochladen
      const datei = dateiRef.current?.files?.[0];
      if (datei) {
        if (datei.size > 45 * 1024 * 1024) {
          setMeldung("Die Datei ist größer als 45 MB. Bitte Video kürzen oder komprimieren (1080p reicht).");
          return;
        }
        const supabase = createClient();
        const endung = datei.name.split(".").pop()?.toLowerCase() ?? "bin";
        const pfad = `${crypto.randomUUID()}.${endung}`;
        const { error: uploadFehler } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(pfad, datei, { contentType: datei.type || undefined });
        if (uploadFehler) {
          setMeldung("Der Upload ist fehlgeschlagen. Bitte erneut versuchen.");
          return;
        }
        fd.set("media_url", pfad);
        fd.set("media_type", datei.type.startsWith("video") ? "video" : "image");
      }

      const ergebnis = await uebungSpeichern(fd);
      if (ergebnis?.fehler) setMeldung(ergebnis.fehler);
      else {
        setMeldung(null);
        onFertig?.();
      }
    });
  }

  return (
    <form action={absenden} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label-base">Titel</label>
        <input name="title" required defaultValue={uebung?.title ?? ""} className="input-base" placeholder="z. B. Wandkniebeuge" />
      </div>
      <div className="sm:col-span-2">
        <label className="label-base">Beschreibung / Ausführung</label>
        <textarea name="description" rows={3} defaultValue={uebung?.description ?? ""} className="input-base" />
      </div>
      <div>
        <label className="label-base">Kategorie</label>
        <input name="category" defaultValue={uebung?.category ?? ""} className="input-base" placeholder="z. B. Gleichgewicht" />
      </div>
      <div>
        <label className="label-base">Art des Mediums</label>
        <select name="media_type" defaultValue={uebung?.media_type ?? "image"} className="input-base">
          <option value="image">Bild</option>
          <option value="video">Video</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label-base">Bild oder Video hochladen (optional)</label>
        <input
          ref={dateiRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime,video/webm"
          className="input-base file:mr-3 file:rounded-md file:border-0 file:bg-teal-100 file:px-3 file:py-1.5 file:font-semibold file:text-teal-600"
        />
        <p className="mt-1 text-xs text-navy-600/70">
          Videos ideal in 1080p, 30–90 Sekunden, MP4 (max. 45 MB). Die Datei ist nur für
          angemeldete Nutzer sichtbar.
        </p>
      </div>
      <div className="sm:col-span-2">
        <label className="label-base">… oder Link einfügen (URL, optional)</label>
        <input
          name="media_url"
          defaultValue={uebung?.media_url ?? ""}
          className="input-base"
          placeholder="https://…"
        />
        <p className="mt-1 text-xs text-navy-600/70">
          Link zu einem Bild oder Video, z. B. aus Ihrem Übungsportal (Nutzungsrechte beachten).
          Eine hochgeladene Datei hat Vorrang.
        </p>
      </div>
      {meldung && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:col-span-2">{meldung}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
          {laeuft ? "Wird gespeichert …" : uebung ? "Änderungen speichern" : "Übung anlegen"}
        </button>
        {onFertig && (
          <button type="button" onClick={onFertig} className="btn-secondary">Abbrechen</button>
        )}
      </div>
    </form>
  );
}

export function UebungKarte({ uebung, anzeigeUrl }: { uebung: Exercise; anzeigeUrl: string | null }) {
  const [bearbeiten, setBearbeiten] = useState(false);
  const [laeuft, startTransition] = useTransition();

  function loeschen() {
    if (!confirm(`Übung „${uebung.title}“ wirklich löschen?`)) return;
    const fd = new FormData();
    fd.set("id", uebung.id);
    startTransition(async () => {
      const ergebnis = await uebungLoeschen(fd);
      if (ergebnis?.fehler) alert(ergebnis.fehler);
    });
  }

  if (bearbeiten) {
    return (
      <div className="card sm:col-span-2">
        <p className="mb-3 text-lg font-bold text-navy-800">Übung bearbeiten</p>
        <UebungForm uebung={uebung} onFertig={() => setBearbeiten(false)} />
      </div>
    );
  }

  return (
    <div className="card flex flex-col">
      <div className="mb-3 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-mist-100">
        {anzeigeUrl ? (
          uebung.media_type === "video" ? (
            <video src={anzeigeUrl} preload="metadata" controls className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={anzeigeUrl} alt={uebung.title} className="h-full w-full object-cover" />
          )
        ) : (
          <span className="text-3xl" aria-hidden>🏋️</span>
        )}
      </div>
      {uebung.category && <span className="badge-pill self-start">{uebung.category}</span>}
      <p className="mt-2 font-bold text-navy-800">{uebung.title}</p>
      {uebung.description && (
        <p className="mt-1 line-clamp-3 text-sm text-navy-600/80">{uebung.description}</p>
      )}
      <div className="mt-3 flex gap-3 border-t border-mist-100 pt-3 text-sm font-semibold">
        <button onClick={() => setBearbeiten(true)} className="text-teal-600 hover:underline">
          Bearbeiten
        </button>
        <button onClick={loeschen} disabled={laeuft} className="text-red-600 hover:underline disabled:opacity-50">
          Löschen
        </button>
      </div>
    </div>
  );
}

export function NeueUebung() {
  const [offen, setOffen] = useState(false);

  if (!offen) {
    return (
      <button
        onClick={() => setOffen(true)}
        className="card flex min-h-40 items-center justify-center border-2 border-dashed border-mist-200 bg-transparent text-lg font-semibold text-teal-600 shadow-none transition hover:border-teal-500"
      >
        + Neue Übung anlegen
      </button>
    );
  }

  return (
    <div className="card sm:col-span-2">
      <p className="mb-3 text-lg font-bold text-navy-800">Neue Übung</p>
      <UebungForm onFertig={() => setOffen(false)} />
    </div>
  );
}

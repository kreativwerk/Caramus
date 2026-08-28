"use client";

import { useState, type RefObject } from "react";

/**
 * Dateiauswahl mit deutscher Beschriftung. Das native Feld zeigt je nach
 * Browsersprache „Choose File / No file chosen"; hier ist die Beschriftung
 * unabhängig davon immer deutsch.
 */
export function DateiFeld({
  id,
  feldRef,
  accept,
  multiple = false,
  required = false,
  knopfText = "Datei wählen",
  onAuswahl,
}: {
  id: string;
  feldRef: RefObject<HTMLInputElement | null>;
  accept: string;
  multiple?: boolean;
  required?: boolean;
  knopfText?: string;
  /** Meldet dem Formular, was ausgewählt wurde – etwa für Pflichtangaben. */
  onAuswahl?: (namen: string[]) => void;
}) {
  const [namen, setNamen] = useState<string[]>([]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-mist-200 bg-white p-2">
      <label
        htmlFor={id}
        className="shrink-0 cursor-pointer rounded-md bg-teal-100 px-3.5 py-2 text-sm font-semibold text-teal-600 transition hover:bg-teal-500 hover:text-white focus-within:ring-2 focus-within:ring-teal-500 sm:text-base"
      >
        {knopfText}
      </label>
      <span className="min-w-0 flex-1 truncate text-sm text-navy-600/80 sm:text-base">
        {namen.length === 0
          ? "Noch keine Datei"
          : namen.length === 1
            ? namen[0]
            : `${namen.length} Dateien ausgewählt`}
      </span>
      <input
        id={id}
        ref={feldRef}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        onChange={(e) => {
          const gewaehlt = [...(e.target.files ?? [])].map((f) => f.name);
          setNamen(gewaehlt);
          onAuswahl?.(gewaehlt);
        }}
        className="sr-only"
      />
    </div>
  );
}

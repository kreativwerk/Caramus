"use client";

import { useState, useTransition } from "react";
import { profilSpeichern } from "../actions";
import type { Profile } from "@/lib/types";

export function ProfilForm({ profil }: { profil: Profile }) {
  const [meldung, setMeldung] = useState<{ typ: "ok" | "fehler"; text: string } | null>(null);
  const [laeuft, startTransition] = useTransition();

  function absenden(formData: FormData) {
    startTransition(async () => {
      const ergebnis = await profilSpeichern(formData);
      setMeldung(
        ergebnis?.fehler
          ? { typ: "fehler", text: ergebnis.fehler }
          : { typ: "ok", text: "Ihre Angaben wurden gespeichert. Vielen Dank!" }
      );
    });
  }

  return (
    <form action={absenden} className="card space-y-4">
      <div>
        <label htmlFor="anrede" className="label-base">Anrede</label>
        <select id="anrede" name="anrede" defaultValue={profil.anrede ?? ""} className="input-base">
          <option value="">Ohne Anrede</option>
          <option value="frau">Frau</option>
          <option value="herr">Herr</option>
        </select>
        <p className="mt-1 mb-4 text-xs text-navy-600/70">
          So spricht die App Sie an, zum Beispiel „Guten Tag, Frau Mustermann“.
        </p>

        <label htmlFor="full_name" className="label-base">Vor- und Nachname</label>
        <input id="full_name" name="full_name" required defaultValue={profil.full_name} className="input-base" />
      </div>
      <div>
        <label htmlFor="phone" className="label-base">Telefonnummer</label>
        <input id="phone" name="phone" type="tel" defaultValue={profil.phone ?? ""} className="input-base" placeholder="z. B. 0911 1234567" />
      </div>
      <div>
        <label htmlFor="street" className="label-base">Straße und Hausnummer</label>
        <input id="street" name="street" defaultValue={profil.street ?? ""} className="input-base" placeholder="Musterstraße 12" />
      </div>
      <div className="grid grid-cols-[7rem_1fr] gap-3">
        <div>
          <label htmlFor="zip" className="label-base">PLZ</label>
          <input id="zip" name="zip" defaultValue={profil.zip ?? ""} className="input-base" placeholder="90402" />
        </div>
        <div>
          <label htmlFor="city" className="label-base">Ort</label>
          <input id="city" name="city" defaultValue={profil.city ?? ""} className="input-base" placeholder="Nürnberg" />
        </div>
      </div>
      {meldung && (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            meldung.typ === "ok" ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-700"
          }`}
        >
          {meldung.text}
        </p>
      )}
      <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
        {laeuft ? "Wird gespeichert …" : "Speichern"}
      </button>
    </form>
  );
}

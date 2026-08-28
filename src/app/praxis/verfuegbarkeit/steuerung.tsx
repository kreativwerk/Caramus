"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MIcon } from "@/components/m-icon";
import { WOCHENTAGE } from "@/lib/types";
import type { PraxisEinstellungen, Sperrzeit, Verfuegbarkeit } from "@/lib/types";
import {
  einstellungenSpeichern,
  sperrzeitAnlegen,
  sperrzeitLoeschen,
  sprechzeitAendern,
  sprechzeitAnlegen,
} from "../actions";

type Ergebnis = { ok?: boolean; fehler?: string | null };

function kurz(zeit: string) {
  return zeit.slice(0, 5);
}

/** Alles, was die Terminbuchung steuert – an einer Stelle. */
export function Steuerung({
  einstellungen,
  sprechzeiten,
  sperrzeiten,
}: {
  einstellungen: PraxisEinstellungen;
  sprechzeiten: Verfuegbarkeit[];
  sperrzeiten: Sperrzeit[];
}) {
  const [meldung, setMeldung] = useState<{ typ: "ok" | "fehler"; text: string } | null>(null);
  const [ganztags, setGanztags] = useState(true);
  const [laeuft, startTransition] = useTransition();
  const router = useRouter();

  function ausfuehren(
    aktion: (fd: FormData) => Promise<Ergebnis>,
    formData: FormData,
    erfolg: string,
    form?: HTMLFormElement
  ) {
    setMeldung(null);
    startTransition(async () => {
      const ergebnis = await aktion(formData);
      if (ergebnis?.fehler) return setMeldung({ typ: "fehler", text: ergebnis.fehler });
      setMeldung({ typ: "ok", text: erfolg });
      form?.reset();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {meldung && (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            meldung.typ === "ok" ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
          }`}
        >
          {meldung.text}
        </p>
      )}

      {/* Grundeinstellungen */}
      <form
        action={(fd) => ausfuehren(einstellungenSpeichern, fd, "Einstellungen gespeichert.")}
        className="card space-y-4"
      >
        <div>
          <h2 className="text-lg font-bold text-navy-800">Wie Ihre Termine getaktet sind</h2>
          <p className="mt-1 text-navy-600/80">
            Danach richtet sich, welche Zeiten Ihren Patientinnen und Patienten angeboten werden.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="slot_minuten" className="label-base">
              Dauer eines Termins
            </label>
            <div className="flex items-center gap-2">
              <input
                id="slot_minuten"
                name="slot_minuten"
                type="number"
                min={15}
                max={240}
                step={5}
                defaultValue={einstellungen.slot_minuten}
                className="input-base"
              />
              <span className="shrink-0 text-navy-600/80">Minuten</span>
            </div>
          </div>

          <div>
            <label htmlFor="puffer_minuten" className="label-base">
              Fahrzeit zwischen zwei Besuchen
            </label>
            <div className="flex items-center gap-2">
              <input
                id="puffer_minuten"
                name="puffer_minuten"
                type="number"
                min={0}
                max={180}
                step={5}
                defaultValue={einstellungen.puffer_minuten}
                className="input-base"
              />
              <span className="shrink-0 text-navy-600/80">Minuten</span>
            </div>
            <p className="mt-1 text-xs text-navy-600/70">
              Wird vor und nach jedem Termin freigehalten.
            </p>
          </div>

          <div>
            <label htmlFor="vorlauf_stunden" className="label-base">
              Frühestens buchbar in
            </label>
            <div className="flex items-center gap-2">
              <input
                id="vorlauf_stunden"
                name="vorlauf_stunden"
                type="number"
                min={0}
                max={336}
                defaultValue={einstellungen.vorlauf_stunden}
                className="input-base"
              />
              <span className="shrink-0 text-navy-600/80">Stunden</span>
            </div>
            <p className="mt-1 text-xs text-navy-600/70">Schützt Sie vor Buchungen für gleich.</p>
          </div>

          <div>
            <label htmlFor="horizont_tage" className="label-base">
              Buchbar bis
            </label>
            <div className="flex items-center gap-2">
              <input
                id="horizont_tage"
                name="horizont_tage"
                type="number"
                min={1}
                max={180}
                defaultValue={einstellungen.horizont_tage}
                className="input-base"
              />
              <span className="shrink-0 text-navy-600/80">Tage im Voraus</span>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl bg-mist-100 p-4">
          <input
            type="checkbox"
            name="auto_bestaetigen"
            defaultChecked={einstellungen.auto_bestaetigen}
            className="mt-1 h-5 w-5 shrink-0 accent-teal-500"
          />
          <span>
            <span className="block font-semibold text-navy-800">Termine stehen sofort fest</span>
            <span className="block text-sm text-navy-600/80">
              Ohne Haken landet jede Buchung erst als Wunsch bei Ihnen und Sie bestätigen von Hand.
            </span>
          </span>
        </label>

        <button type="submit" disabled={laeuft} className="btn-primary disabled:opacity-60">
          {laeuft ? "Einen Moment …" : "Einstellungen speichern"}
        </button>
      </form>

      {/* Sprechzeiten */}
      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-bold text-navy-800">Ihre Sprechzeiten</h2>
          <p className="mt-1 text-navy-600/80">
            Wann Sie grundsätzlich Hausbesuche machen. Mehrere Zeitspannen pro Tag sind möglich.
          </p>
        </div>

        {sprechzeiten.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Noch keine Sprechzeiten hinterlegt – solange kann niemand einen Termin buchen.
          </p>
        ) : (
          <ul className="divide-y divide-mist-100">
            {sprechzeiten.map((z) => (
              <li key={z.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="w-28 shrink-0 font-semibold text-navy-800">
                  {WOCHENTAGE[z.wochentag]}
                </span>
                <span className={`flex-1 ${z.aktiv ? "text-navy-700" : "text-navy-600/40 line-through"}`}>
                  {kurz(z.von)} – {kurz(z.bis)} Uhr
                </span>
                <button
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("id", z.id);
                    fd.set("aktion", z.aktiv ? "aus" : "an");
                    ausfuehren(sprechzeitAendern, fd, z.aktiv ? "Zeit pausiert." : "Zeit wieder aktiv.");
                  }}
                  disabled={laeuft}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 transition hover:bg-mist-100 disabled:opacity-50"
                >
                  {z.aktiv ? "Pausieren" : "Aktivieren"}
                </button>
                <button
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("id", z.id);
                    fd.set("aktion", "loeschen");
                    ausfuehren(sprechzeitAendern, fd, "Zeit entfernt.");
                  }}
                  disabled={laeuft}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-navy-600/70 transition hover:text-red-700 disabled:opacity-50"
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          action={(fd) => ausfuehren(sprechzeitAnlegen, fd, "Sprechzeit hinzugefügt.")}
          className="flex flex-wrap items-end gap-3 border-t border-mist-100 pt-4"
        >
          <div>
            <label htmlFor="wochentag" className="label-base">
              Tag
            </label>
            <select id="wochentag" name="wochentag" defaultValue="1" className="input-base w-40">
              {WOCHENTAGE.map((tag, i) => (
                <option key={tag} value={i}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="von" className="label-base">
              Von
            </label>
            <input id="von" name="von" type="time" defaultValue="08:00" className="input-base w-32" />
          </div>
          <div>
            <label htmlFor="bis" className="label-base">
              Bis
            </label>
            <input id="bis" name="bis" type="time" defaultValue="18:00" className="input-base w-32" />
          </div>
          <button type="submit" disabled={laeuft} className="btn-secondary disabled:opacity-60">
            <MIcon name="plus" /> Hinzufügen
          </button>
        </form>
      </section>

      {/* Sperrzeiten */}
      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-bold text-navy-800">Urlaub und freie Zeiten</h2>
          <p className="mt-1 text-navy-600/80">
            Einzelne Tage oder Stunden, an denen trotz Sprechzeit nichts gebucht werden kann.
          </p>
        </div>

        {sperrzeiten.length > 0 && (
          <ul className="divide-y divide-mist-100">
            {sperrzeiten.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="w-32 shrink-0 font-semibold text-navy-800">
                  {new Date(`${s.datum}T12:00:00`).toLocaleDateString("de-DE", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
                <span className="flex-1 text-navy-700">
                  {s.von ? `${kurz(s.von)} – ${kurz(s.bis!)} Uhr` : "ganzer Tag"}
                  {s.grund ? ` · ${s.grund}` : ""}
                </span>
                <button
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("id", s.id);
                    ausfuehren(sperrzeitLoeschen, fd, "Eintrag aufgehoben.");
                  }}
                  disabled={laeuft}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-navy-600/70 transition hover:text-red-700 disabled:opacity-50"
                >
                  Aufheben
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          action={(fd) => ausfuehren(sperrzeitAnlegen, fd, "Freie Zeit eingetragen.")}
          className="space-y-3 border-t border-mist-100 pt-4"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="datum" className="label-base">
                Datum
              </label>
              <input id="datum" name="datum" type="date" required className="input-base w-44" />
            </div>
            <label className="flex items-center gap-2 pb-3 font-medium text-navy-800">
              <input
                type="checkbox"
                name="ganztags"
                checked={ganztags}
                onChange={(e) => setGanztags(e.target.checked)}
                className="h-5 w-5 accent-teal-500"
              />
              Ganzer Tag
            </label>
          </div>

          {!ganztags && (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="sperr-von" className="label-base">
                  Von
                </label>
                <input id="sperr-von" name="von" type="time" className="input-base w-32" />
              </div>
              <div>
                <label htmlFor="sperr-bis" className="label-base">
                  Bis
                </label>
                <input id="sperr-bis" name="bis" type="time" className="input-base w-32" />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1">
              <label htmlFor="grund" className="label-base">
                Grund <span className="font-normal text-navy-600/60">(optional, nur für Sie)</span>
              </label>
              <input id="grund" name="grund" placeholder="Urlaub" className="input-base" />
            </div>
            <button type="submit" disabled={laeuft} className="btn-secondary disabled:opacity-60">
              <MIcon name="plus" /> Eintragen
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

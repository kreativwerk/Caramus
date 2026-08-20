import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum" };

/*
 * PLATZHALTER: Vor dem Go-Live mit den echten Angaben des Kunden füllen
 * (Praxisinhaber, Anschrift, Berufsbezeichnung, Kammer, Aufsichtsbehörde).
 */
export default function ImpressumPage() {
  return (
    <article className="card space-y-4">
      <h1 className="text-3xl font-bold text-navy-800">Impressum</h1>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Angaben gemäß § 5 DDG</h2>
        <p className="mt-1 text-navy-700">
          [Vorname Nachname]<br />
          Curamus Medical – Mobile Physiotherapie<br />
          [Straße Hausnummer]<br />
          [PLZ Ort]
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Kontakt</h2>
        <p className="mt-1 text-navy-700">
          Telefon: [Telefonnummer]<br />
          E-Mail: [E-Mail-Adresse]
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Berufsbezeichnung</h2>
        <p className="mt-1 text-navy-700">
          Physiotherapeut (verliehen in der Bundesrepublik Deutschland).<br />
          Zuständige Aufsichtsbehörde: [Gesundheitsamt / Behörde eintragen]<br />
          Es gelten die berufsrechtlichen Regelungen nach dem Masseur- und
          Physiotherapeutengesetz (MPhG).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Umsatzsteuer</h2>
        <p className="mt-1 text-navy-700">
          [USt-IdNr. bzw. Hinweis auf umsatzsteuerfreie Heilbehandlungen nach § 4 Nr. 14 UStG]
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Verantwortlich für den Inhalt</h2>
        <p className="mt-1 text-navy-700">[Vorname Nachname, Anschrift wie oben]</p>
      </section>
    </article>
  );
}

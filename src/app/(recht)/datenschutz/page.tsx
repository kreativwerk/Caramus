import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

/*
 * PLATZHALTER-ENTWURF: Vor dem Go-Live vom Kunden bzw. juristisch prüfen lassen
 * und die [Angaben] vervollständigen.
 */
export default function DatenschutzPage() {
  return (
    <article className="card space-y-5">
      <h1 className="text-3xl font-bold text-navy-800">Datenschutzerklärung</h1>

      <section>
        <h2 className="text-lg font-bold text-navy-800">1. Verantwortlicher</h2>
        <p className="mt-1 text-navy-700">
          [Vorname Nachname], Curamus Medical – Mobile Physiotherapie, [Anschrift],
          E-Mail: [E-Mail-Adresse], Telefon: [Telefonnummer].
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">2. Zweck dieser Anwendung</h2>
        <p className="mt-1 text-navy-700">
          Diese Anwendung dient der Betreuung von Patientinnen und Patienten: Terminanfragen und
          Terminverwaltung für Hausbesuche, persönliche Trainingspläne mit Übungen und
          Rückmeldungen sowie direkte Nachrichten zwischen Ihnen und Ihrem Therapeuten.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">3. Verarbeitete Daten</h2>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-navy-700">
          <li>Stammdaten: Name, E-Mail-Adresse, Telefonnummer, Anschrift (für Hausbesuche)</li>
          <li>Termindaten: Wunschzeiten, bestätigte Termine, Besuchsnotizen</li>
          <li>
            Gesundheitsbezogene Daten (Art. 9 DSGVO): Trainingspläne, Übungsrückmeldungen
            (z. B. Schmerzangaben), Inhalte Ihrer Nachrichten
          </li>
          <li>Technische Daten: Anmeldezeitpunkte, technisch notwendige Cookies (Sitzung)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">4. Rechtsgrundlagen</h2>
        <p className="mt-1 text-navy-700">
          Die Verarbeitung erfolgt zur Durchführung des Behandlungsverhältnisses
          (Art. 6 Abs. 1 lit. b DSGVO) sowie – für gesundheitsbezogene Daten – auf Grundlage
          Ihrer ausdrücklichen Einwilligung bzw. zur Gesundheitsversorgung
          (Art. 9 Abs. 2 lit. a und h DSGVO). Sie können Ihre Einwilligung jederzeit mit Wirkung
          für die Zukunft widerrufen.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">5. Speicherung und Auftragsverarbeiter</h2>
        <p className="mt-1 text-navy-700">
          Die Daten werden verschlüsselt übertragen und in einem Rechenzentrum in
          Frankfurt am Main (EU) gespeichert (Supabase, Region eu-central-1). Das Hosting der
          Anwendung erfolgt bei Vercel. Mit den eingesetzten Dienstleistern bestehen Verträge
          zur Auftragsverarbeitung nach Art. 28 DSGVO. Eine Weitergabe an Dritte zu Werbezwecken
          findet nicht statt.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">6. Speicherdauer</h2>
        <p className="mt-1 text-navy-700">
          Behandlungsbezogene Daten werden entsprechend den gesetzlichen Aufbewahrungspflichten
          (in der Regel 10 Jahre) gespeichert und danach gelöscht. Ihr Nutzerkonto wird auf
          Wunsch gelöscht, soweit keine Aufbewahrungspflichten entgegenstehen.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">7. Ihre Rechte</h2>
        <p className="mt-1 text-navy-700">
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
          Verarbeitung, Datenübertragbarkeit sowie Widerspruch (Art. 15–21 DSGVO). Wenden Sie
          sich dazu an die oben genannten Kontaktdaten. Außerdem besteht ein Beschwerderecht bei
          der zuständigen Aufsichtsbehörde: [Landesbeauftragte/r für Datenschutz eintragen,
          z. B. Bayerisches Landesamt für Datenschutzaufsicht].
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">8. Cookies und Schriften</h2>
        <p className="mt-1 text-navy-700">
          Diese Anwendung verwendet ausschließlich technisch notwendige Cookies für die
          Anmeldung. Schriftarten werden lokal ausgeliefert; es werden keine Verbindungen zu
          Drittanbietern für Analyse- oder Werbezwecke aufgebaut.
        </p>
      </section>
    </article>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default function DatenschutzPage() {
  return (
    <article className="card space-y-5">
      <h1 className="text-3xl font-bold text-navy-800">Datenschutzerklärung</h1>
      <p className="text-sm text-navy-600/80">für den Patientenbereich app.curamus-medical.de</p>

      <section>
        <h2 className="text-lg font-bold text-navy-800">1. Verantwortlicher</h2>
        <p className="mt-1 text-navy-700">
          Curamus Medical, Inhaber: Charles Obinna Mba<br />
          Ernst-Heinkel-Weg 3, 90411 Nürnberg, Deutschland<br />
          Telefon: +49 171 4234483 · E-Mail: kontakt@curamus-medical.de
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">2. Zweck dieser Anwendung</h2>
        <p className="mt-1 text-navy-700">
          Diese Anwendung dient der Betreuung von Patientinnen und Patienten von Curamus Medical:
          Terminanfragen und Terminverwaltung für Hausbesuche, persönliche Trainingspläne mit
          Übungen und Rückmeldungen sowie direkte Nachrichten zwischen Ihnen und Ihrem
          Therapeuten.
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
        <h2 className="text-lg font-bold text-navy-800">4. Rechtsgrundlagen und Schweigepflicht</h2>
        <p className="mt-1 text-navy-700">
          Die Verarbeitung erfolgt zur Durchführung des Behandlungsverhältnisses
          (Art. 6 Abs. 1 lit. b DSGVO) sowie – für gesundheitsbezogene Daten – auf Grundlage
          Ihrer ausdrücklichen Einwilligung bzw. zur Gesundheitsversorgung
          (Art. 9 Abs. 2 lit. a und h DSGVO). Sie können Ihre Einwilligung jederzeit mit Wirkung
          für die Zukunft widerrufen. Curamus Medical unterliegt der therapeutischen
          Schweigepflicht; Gesundheitsdaten werden vertraulich behandelt. Eine Weitergabe an
          Dritte erfolgt nur, soweit eine gesetzliche Grundlage besteht, dies zur Durchführung
          des Vertrags erforderlich ist oder Sie ausdrücklich eingewilligt haben.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">5. Speicherung und Auftragsverarbeiter</h2>
        <p className="mt-1 text-navy-700">
          Die Daten dieser Anwendung werden verschlüsselt übertragen und in einem Rechenzentrum
          in Frankfurt am Main (EU) gespeichert (Supabase, Region eu-central-1). Das Hosting der
          Anwendung erfolgt bei Vercel. Für die Terminorganisation kann Google Kalender, für die
          Rechnungsstellung Lexware eingesetzt werden. Mit den eingesetzten Dienstleistern
          bestehen bzw. werden Verträge zur Auftragsverarbeitung nach Art. 28 DSGVO geschlossen.
          Eine Weitergabe an Dritte zu Werbezwecken findet nicht statt.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">6. Speicherdauer</h2>
        <p className="mt-1 text-navy-700">
          Behandlungsbezogene Daten und die Behandlungsdokumentation werden entsprechend den
          gesetzlichen Aufbewahrungspflichten grundsätzlich zehn Jahre nach Abschluss der
          Behandlung aufbewahrt und danach gelöscht. Ihr Nutzerkonto wird auf Wunsch gelöscht,
          soweit keine Aufbewahrungspflichten entgegenstehen.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">7. Ihre Rechte</h2>
        <p className="mt-1 text-navy-700">
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
          Verarbeitung, Datenübertragbarkeit sowie Widerspruch (Art. 15–21 DSGVO). Außerdem haben
          Sie nach den gesetzlichen Vorschriften das Recht auf Einsicht in Ihre Behandlungsakte.
          Wenden Sie sich dazu an die oben genannten Kontaktdaten.
        </p>
        <p className="mt-2 text-navy-700">
          Beschwerderecht: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA),
          Promenade 18, 91522 Ansbach, www.lda.bayern.de.
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

      <section>
        <h2 className="text-lg font-bold text-navy-800">9. Hinweis zu E-Mails und Nachrichten</h2>
        <p className="mt-1 text-navy-700">
          Bei der Nutzung digitaler Kommunikationswege, insbesondere E-Mail, können trotz
          üblicher technischer Schutzmaßnahmen Risiken bestehen. Benachrichtigungs-E-Mails dieser
          Anwendung enthalten deshalb keine Gesundheitsinformationen, sondern nur den Hinweis,
          dass eine neue Nachricht vorliegt. Sie können uns jederzeit mitteilen, wenn bestimmte
          Informationen nicht per E-Mail übermittelt werden sollen.
        </p>
      </section>
    </article>
  );
}

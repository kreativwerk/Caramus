import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <article className="card space-y-5">
      <h1 className="text-3xl font-bold text-navy-800">Impressum</h1>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Angaben gemäß § 5 Digitale-Dienste-Gesetz</h2>
        <p className="mt-1 text-navy-700">
          Curamus Medical<br />
          Inhaber: Charles Obinna Mba<br />
          Ernst-Heinkel-Weg 3<br />
          90411 Nürnberg<br />
          Deutschland
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Kontakt</h2>
        <p className="mt-1 text-navy-700">
          Telefon: +49 171 4234483<br />
          E-Mail: kontakt@curamus-medical.de<br />
          Webseite: www.curamus-medical.de
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Berufsbezeichnung und berufsrechtliche Angaben</h2>
        <p className="mt-1 text-navy-700">
          Charles Obinna Mba ist berechtigt, die gesetzliche Berufsbezeichnung Physiotherapeut zu
          führen.<br />
          Berufsbezeichnung: Physiotherapeut · Verliehen in: Bundesrepublik Deutschland
        </p>
        <p className="mt-2 text-navy-700">
          Die Tätigkeit erfolgt als mobile physiotherapeutische, präventive und trainingsbezogene
          Dienstleistung. Curamus Medical verfügt nicht über eine Kassenzulassung zur direkten
          Abrechnung mit gesetzlichen Krankenkassen. Eine direkte Abrechnung mit gesetzlichen
          Krankenkassen erfolgt nicht.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Zuständige Aufsichtsbehörde</h2>
        <p className="mt-1 text-navy-700">
          Stadt Nürnberg – Gesundheitsamt<br />
          Burgstraße 4, 90403 Nürnberg, Deutschland<br />
          Telefon: 0911 / 231-2295 · Webseite: www.nuernberg.de
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Berufsrechtliche Regelungen</h2>
        <p className="mt-1 text-navy-700">
          Gesetz über die Berufe in der Physiotherapie (Masseur- und Physiotherapeutengesetz –
          MPhG) sowie Ausbildungs- und Prüfungsverordnung für Physiotherapeuten (PhysTh-APrV).
          Abrufbar unter www.gesetze-im-internet.de.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Umsatzsteuer</h2>
        <p className="mt-1 text-navy-700">
          Umsatzsteuer wird, soweit gesetzlich erforderlich, ausgewiesen.
          Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: Es wird keine
          Umsatzsteuer-Identifikationsnummer geführt.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Verantwortlich für den Inhalt</h2>
        <p className="mt-1 text-navy-700">
          Charles Obinna Mba, Ernst-Heinkel-Weg 3, 90411 Nürnberg, Deutschland
        </p>
        <p className="mt-2 text-navy-700">
          Verantwortlich für journalistisch-redaktionelle Inhalte im Sinne von § 18 Abs. 2
          Medienstaatsvertrag, soweit solche Inhalte veröffentlicht werden: Charles Obinna Mba,
          Anschrift wie oben.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Verbraucherstreitbeilegung</h2>
        <p className="mt-1 text-navy-700">
          Curamus Medical ist nicht verpflichtet und nicht bereit, an einem
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Die
          frühere EU-Plattform zur Online-Streitbeilegung wurde eingestellt; ein Link wird daher
          nicht bereitgestellt.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Medizinischer Hinweis</h2>
        <p className="mt-1 text-navy-700">
          Die Inhalte dieser Anwendung dienen der allgemeinen Information über Curamus Medical
          sowie über mobile Physiotherapie, Training und Prävention. Sie ersetzen keine ärztliche
          Diagnose, keine medizinische Notfallversorgung und keine individuelle medizinische
          Beratung durch einen Arzt. Bei akuten Beschwerden, medizinischen Notfällen, Atemnot,
          Brustschmerzen, neurologischen Ausfällen, schweren Verletzungen oder Verdacht auf einen
          Notfall ist unverzüglich der ärztliche Notdienst, der Rettungsdienst oder der Notruf 112
          zu kontaktieren.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Haftung für eigene Inhalte</h2>
        <p className="mt-1 text-navy-700">
          Die Inhalte wurden mit größter Sorgfalt erstellt. Als Diensteanbieter ist Curamus
          Medical für eigene Inhalte nach den allgemeinen gesetzlichen Vorschriften
          verantwortlich. Eine Gewähr für Richtigkeit, Vollständigkeit und Aktualität wird nicht
          übernommen, soweit gesetzlich zulässig. Gesetzliche Ansprüche bleiben unberührt.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Haftung für externe Links</h2>
        <p className="mt-1 text-navy-700">
          Diese Anwendung kann Links zu externen Webseiten Dritter enthalten. Auf deren Inhalte
          hat Curamus Medical keinen Einfluss; verantwortlich ist stets der jeweilige Anbieter
          oder Betreiber. Zum Zeitpunkt der Verlinkung waren keine rechtswidrigen Inhalte
          erkennbar. Bei Bekanntwerden von Rechtsverletzungen werden entsprechende Links
          unverzüglich entfernt.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Urheberrecht</h2>
        <p className="mt-1 text-navy-700">
          Die erstellten Inhalte, Texte, Bilder, Grafiken, Markenbestandteile und sonstigen Werke
          unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung oder
          sonstige Verwendung außerhalb der Grenzen des Urheberrechts bedürfen der vorherigen
          schriftlichen Zustimmung des jeweiligen Rechteinhabers, soweit gesetzlich erforderlich.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Hinweis zur Nutzung von Kontaktdaten</h2>
        <p className="mt-1 text-navy-700">
          Der Nutzung der veröffentlichten Kontaktdaten zur Übersendung nicht ausdrücklich
          angeforderter Werbung, Informationsmaterialien oder Spam wird ausdrücklich
          widersprochen. Curamus Medical behält sich rechtliche Schritte im Falle unverlangter
          Zusendung von Werbeinformationen vor.
        </p>
      </section>
    </article>
  );
}

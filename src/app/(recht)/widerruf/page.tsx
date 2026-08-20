import type { Metadata } from "next";

export const metadata: Metadata = { title: "Widerrufsbelehrung" };

export default function WiderrufPage() {
  return (
    <article className="card space-y-5">
      <h1 className="text-3xl font-bold text-navy-800">Widerrufsbelehrung</h1>
      <p className="text-sm text-navy-600/80">für Verbraucher</p>

      <section className="space-y-2 text-navy-700">
        <p>
          Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen
          Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des
          Vertragsschlusses.
        </p>
        <p>
          Um das Widerrufsrecht auszuüben, müssen Sie Curamus Medical mittels einer eindeutigen
          Erklärung über Ihren Entschluss informieren, diesen Vertrag zu widerrufen.
        </p>
        <p className="rounded-lg bg-mist-50 px-4 py-3">
          Der Widerruf ist zu richten an:<br />
          <strong>Curamus Medical</strong><br />
          Inhaber: Charles Mba<br />
          Ernst-Heinkel-Weg 3, 90411 Nürnberg<br />
          E-Mail: kontakt@curamus-medical.de · Telefon: +49 171 4234483
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass die Mitteilung über die Ausübung des
          Widerrufsrechts vor Ablauf der Widerrufsfrist abgesendet wird.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Folgen des Widerrufs</h2>
        <div className="mt-2 space-y-2 text-navy-700">
          <p>
            Wenn Sie diesen Vertrag widerrufen, hat Curamus Medical Ihnen alle Zahlungen, die
            Curamus Medical von Ihnen erhalten hat, unverzüglich und spätestens binnen vierzehn
            Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei
            Curamus Medical eingegangen ist. Für diese Rückzahlung wird dasselbe Zahlungsmittel
            verwendet, das Sie bei der ursprünglichen Zahlung eingesetzt haben, es sei denn, es
            wurde ausdrücklich etwas anderes vereinbart.
          </p>
          <p>
            Haben Sie verlangt, dass die Leistung während der Widerrufsfrist beginnen soll, so
            haben Sie Curamus Medical einen angemessenen Betrag zu zahlen, der dem Anteil der bis
            zu dem Zeitpunkt, zu dem Sie Curamus Medical über die Ausübung des Widerrufsrechts
            unterrichten, bereits erbrachten Leistungen im Vergleich zum Gesamtumfang der
            vereinbarten Leistungen entspricht.
          </p>
          <p>
            Das Widerrufsrecht kann bei vollständiger Erbringung der Dienstleistung erlöschen,
            wenn Sie vor Beginn der Leistung ausdrücklich zugestimmt haben, dass Curamus Medical
            vor Ablauf der Widerrufsfrist mit der Leistung beginnt, und Sie Ihre Kenntnis davon
            bestätigt haben, dass Ihr Widerrufsrecht bei vollständiger Vertragserfüllung
            erlöschen kann.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy-800">Muster-Widerrufsformular</h2>
        <p className="mt-1 text-sm text-navy-600/80">
          Wenn Sie den Vertrag widerrufen wollen, können Sie dieses Formular ausfüllen und an uns
          zurücksenden.
        </p>
        <div className="mt-3 space-y-3 rounded-lg border border-mist-200 bg-mist-50 p-4 text-navy-700">
          <p>
            An:<br />
            Curamus Medical, Inhaber: Charles Mba<br />
            Ernst-Heinkel-Weg 3, 90411 Nürnberg<br />
            E-Mail: kontakt@curamus-medical.de
          </p>
          <p>Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über folgende Leistung:</p>
          <p>_______________________________________________</p>
          <p>Termin / Leistungsdatum: _______________________</p>
          <p>Name des Patienten: ____________________________</p>
          <p>Anschrift des Patienten: _______________________</p>
          <p>Datum: _________________________________________</p>
          <p>Unterschrift des Patienten (nur bei Mitteilung auf Papier): ____________________</p>
        </div>
      </section>
    </article>
  );
}

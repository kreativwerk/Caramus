const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, LevelFormat, convertMillimetersToTwip, Table, TableRow, TableCell, WidthType, ShadingType,
} = require('docx');
const fs = require('fs');

const GRAY = '666666';
const ACCENT = '1F6F5C';

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 120 },
  children: [new TextRun({ text, bold: true, size: 28, color: ACCENT })],
});

const p = (text, opts = {}) => new Paragraph({
  spacing: { before: 80, after: 80 },
  children: [new TextRun({ text, size: 22, ...opts })],
});

const bullet = (lead, text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { before: 50, after: 50 },
  children: lead
    ? [new TextRun({ text: lead + ' ', bold: true, size: 22 }), new TextRun({ text, size: 22 })]
    : [new TextRun({ text, size: 22 })],
});

const doc = new Document({
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: convertMillimetersToTwip(8), hanging: convertMillimetersToTwip(4) } } },
      }],
    }],
  },
  styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1361, right: 1361 } } },
    children: [
      p('[Ihr Firmenname · Straße · PLZ Ort · Telefon · E-Mail]', { size: 18, color: GRAY }),
      new Paragraph({ spacing: { after: 200 }, children: [] }),
      p('[Name des Kunden]', {}),
      p('[Curamus Medical / Praxisname]', {}),
      p('[Straße, PLZ Ort]', {}),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: '[Ort], den [Datum]', size: 22 })],
      }),
      new Paragraph({
        spacing: { before: 240, after: 60 },
        children: [new TextRun({ text: 'Angebot: Ihre persönliche Patienten-App „Curamus“', bold: true, size: 32, color: ACCENT })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT } },
        children: [new TextRun({ text: 'Angebots-Nr. [___] · gültig bis [Datum]', size: 20, color: GRAY })],
      }),

      p('Sehr geehrter Herr [Name],'),
      p('herzlichen Dank für den ausgefüllten Fragebogen und Ihr Vertrauen. Auf dieser Grundlage bieten wir Ihnen die Entwicklung Ihrer eigenen Patienten-App an – zugeschnitten auf Ihre mobile Arbeitsweise als Physiotherapeut im Raum Nürnberg, Fürth und Erlangen. Ihre Patienten erreichen die App bequem über die Adresse mein.curamus-medical.de – auf dem Handy, dem Tablet und dem Computer, ohne etwas installieren zu müssen. Gestaltung und Farben folgen Ihrer vorliegenden Design-Vorlage.'),

      h1('Was Ihre App können wird'),

      p('1. Terminplanung für Ihre Hausbesuche', { bold: true }),
      bullet(null, 'Ihre Patienten senden Ihnen Terminanfragen mit Wunschzeiten. Sie bestätigen mit einem Fingertipp oder schlagen eine andere Zeit vor – zusätzlich können Sie Termine jederzeit selbst eintragen.'),
      bullet(null, 'Bei jeder Anfrage sehen Sie sofort die Anschrift des Patienten und die voraussichtliche Fahrzeit vom vorherigen Termin aus – so planen Sie Ihre Tagestour realistisch, mit ausreichend Pufferzeit zwischen den Besuchen.'),
      bullet(null, 'Ihre Behandlungszeiten (Montag bis Freitag 8–18 Uhr, Samstag 9–14 Uhr) sind fest hinterlegt; außerhalb dieser Zeiten sind keine Anfragen möglich.'),
      bullet(null, 'Ihr Google-Kalender bleibt automatisch auf dem Laufenden: Bestätigte Termine erscheinen dort von selbst, und Zeiten, die dort bereits belegt sind, werden Patienten gar nicht erst angeboten.'),

      p('2. Persönliche Trainingspläne mit Übungen', { bold: true }),
      bullet(null, 'Sie pflegen einmalig Ihre Übungssammlung mit Bildern und Videos – auf Wunsch übernehmen wir Ihre vorhandenen Inhalte (z. B. aus Physiotec oder Wibbi, sofern deren Nutzungsbedingungen das erlauben – das klären wir gemeinsam vor dem Start).'),
      bullet(null, 'Für jeden Patienten stellen Sie daraus in wenigen Minuten einen persönlichen Trainingsplan zusammen – mit Sätzen, Wiederholungen und Ihren Hinweisen.'),
      bullet(null, 'Ihre Patienten haken erledigte Übungen ab, geben ihr Schmerzempfinden auf einer Skala an und können Notizen hinterlassen. Sie sehen den Verlauf vor jedem Hausbesuch – und kommen bestens vorbereitet an.'),

      p('3. Direkter Draht zu Ihren Patienten', { bold: true }),
      bullet(null, 'Nachrichtenbereich zwischen Ihnen und jedem Patienten – Fragen zur Übung, Terminänderungen, kurze Rückmeldungen.'),
      bullet(null, 'Über neue Nachrichten werden Sie und Ihre Patienten per E-Mail und per Mitteilung auf dem Handy informiert.'),
      bullet(null, 'Ein deutlicher Hinweis in der App stellt klar, dass es sich nicht um einen Notfallkanal handelt.'),

      p('4. Einfach für jedes Alter', { bold: true }),
      bullet(null, 'Da viele Ihrer Patienten 70 Jahre und älter sind, legen wir besonderen Wert auf große Schrift, klare Symbole und wenige, eindeutige Schritte.'),
      bullet(null, 'Die Anmeldung ist bewusst einfach: wahlweise klassisch mit E-Mail-Adresse und Passwort – oder ganz ohne Passwort über einen persönlichen Link, den der Patient per E-Mail erhält. Sie laden Ihre Patienten dazu persönlich ein; eine Anmeldung fremder Personen ist nicht möglich.'),

      p('5. Sicherheit und Datenschutz', { bold: true }),
      bullet(null, 'Alle Daten werden verschlüsselt übertragen und ausschließlich auf Servern in Deutschland bzw. der EU gespeichert.'),
      bullet(null, 'Die App wird nach den Vorgaben der Datenschutz-Grundverordnung umgesetzt; die erforderlichen Verträge zur Auftragsverarbeitung schließen wir mit den beteiligten Dienstleistern ab.'),
      bullet(null, 'Übungsvideos und -bilder sind nur für angemeldete Patienten sichtbar – nichts ist öffentlich zugänglich.'),

      h1('Was bewusst nicht enthalten ist'),
      p('Abrechnung, Rezeptverwaltung und Behandlungsdokumentation bleiben in Ihrer Praxissoftware (z. B. TheVea oder medattix) – die App ergänzt diese, ersetzt sie aber nicht. Ebenfalls nicht enthalten sind Videosprechstunden sowie eine vollautomatische Tourenberechnung; beides lässt sich bei Bedarf später ergänzen.'),

      h1('Kosten'),
      p('Einmalige Entwicklung, Einrichtung und Einweisung:', { bold: true }),
      p('[Betrag] € zzgl. gesetzlicher Umsatzsteuer, zahlbar in [z. B. drei] Raten nach Projektfortschritt.'),
      p('Laufender Betrieb (Server, Datenspeicherung, Bereitstellung der Übungsinhalte):', { bold: true }),
      p('ca. 45–55 € pro Monat, abhängig von der Nutzung. Diese Kosten fallen direkt bei den Betreiber-Diensten an; auf Wunsch übernehmen wir die Verwaltung für Sie. Wartung und Weiterentwicklung nach der Einführung bieten wir separat an: [Betrag] € pro Monat / nach Aufwand.'),

      h1('So geht es weiter'),
      bullet('1.', 'Sie bestätigen dieses Angebot – per Unterschrift oder formlos per E-Mail.'),
      bullet('2.', 'Gemeinsamer Startpunkt: Wir gehen die Gestaltungsvorlage durch und klären die Übernahme Ihrer Übungsinhalte.'),
      bullet('3.', 'Umsetzung in ca. [Anzahl] Wochen – Sie sehen regelmäßig Zwischenstände und können jederzeit Rückmeldung geben.'),
      bullet('4.', 'Persönliche Einweisung, Start mit ersten Patienten, danach schrittweise Einladung aller weiteren.'),

      p('Wir freuen uns auf die Zusammenarbeit und stehen für Rückfragen jederzeit gern zur Verfügung.', {}),
      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Mit freundlichen Grüßen', size: 22 })] }),
      new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: '[Name, Firma]', size: 22 })] }),

      new Paragraph({
        spacing: { before: 500 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
        children: [new TextRun({ text: 'Angebot angenommen:  Ort, Datum ____________________  Unterschrift ____________________', size: 20, color: GRAY })],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(process.argv[2] || 'angebot-patienten-app.docx', buf);
  console.log('OK');
});

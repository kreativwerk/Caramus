const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, LevelFormat, convertMillimetersToTwip,
} = require('docx');
const fs = require('fs');

const GRAY = '666666';
const ACCENT = '1F6F5C'; // ruhiges Grün, passend zu Physio/Gesundheit

const answerBox = (lines = 3) => {
  const out = [];
  for (let i = 0; i < lines; i++) {
    out.push(new Paragraph({
      spacing: { before: 200, after: 0 },
      border: { bottom: { style: BorderStyle.DOTTED, size: 4, color: '999999' } },
      children: [new TextRun({ text: i === 0 ? 'Ihre Antwort: ' : '', color: GRAY, size: 20 })],
    }));
  }
  out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  return out;
};

const checkbox = (text) => new Paragraph({
  spacing: { before: 60, after: 60 },
  indent: { left: convertMillimetersToTwip(6) },
  children: [
    new TextRun({ text: '☐  ', size: 24 }),
    new TextRun({ text, size: 22 }),
  ],
});

const question = (num, title, body) => {
  const children = [
    new TextRun({ text: `${num}. `, bold: true, size: 24, color: ACCENT }),
    new TextRun({ text: title, bold: true, size: 24 }),
  ];
  const paras = [new Paragraph({ spacing: { before: 280, after: 80 }, children })];
  if (body) {
    paras.push(new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: body, size: 22 })],
    }));
  }
  return paras;
};

const hint = (text) => new Paragraph({
  spacing: { before: 80, after: 80 },
  indent: { left: convertMillimetersToTwip(6) },
  children: [new TextRun({ text: `Hinweis: ${text}`, italics: true, size: 20, color: GRAY })],
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 120 },
  children: [new TextRun({ text, bold: true, size: 30, color: ACCENT })],
});

const bullet = (text, bold) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { before: 40, after: 40 },
  children: bold
    ? [new TextRun({ text: bold + ' ', bold: true, size: 22 }), new TextRun({ text, size: 22 })]
    : [new TextRun({ text, size: 22 })],
});

const p = (text, opts = {}) => new Paragraph({
  spacing: { before: 80, after: 80 },
  children: [new TextRun({ text, size: 22, ...opts })],
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
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } },
  },
  sections: [{
    properties: {
      page: { margin: { top: 1134, bottom: 1134, left: 1361, right: 1361 } },
    },
    children: [
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Ihre Patienten-App', bold: true, size: 48, color: ACCENT })],
      }),
      new Paragraph({
        spacing: { after: 240 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT } },
        children: [new TextRun({ text: 'Fragebogen zur Vorbereitung – Chat, Terminplanung und Trainingspläne mit Videos', size: 26, color: GRAY })],
      }),
      p('Damit die App von Anfang an zu Ihrem Arbeitsalltag passt, bitten wir Sie, die folgenden Fragen zu beantworten. Kreuzen Sie Zutreffendes an (☐) und ergänzen Sie Ihre Antworten direkt in diesem Dokument. Es gibt kein Richtig oder Falsch – je genauer Ihre Angaben, desto besser können wir planen. Bei einigen Fragen finden Sie eine kurze Empfehlung von uns als Orientierung.'),

      // A
      h1('A. Praxis und Hausbesuche'),
      ...question('1', 'Haben Sie eine feste Praxis?'),
      checkbox('Ja, ich habe eine feste Praxis und mache zusätzlich Hausbesuche.'),
      checkbox('Nein, ich bin ausschließlich mobil unterwegs (kein fester Behandlungsort).'),
      checkbox('Sonstiges (bitte unten beschreiben):'),
      ...answerBox(2),

      ...question('2', 'Von wo aus soll die Entfernung zum Patienten gerechnet werden?', 'Wichtig für die Terminplanung: Sollen Anfahrtswege immer von Ihrer Praxis (bzw. Ihrem Wohnort) aus betrachtet werden – oder von Ihrem jeweils vorherigen Termin aus, so wie Sie tatsächlich fahren?'),
      checkbox('Immer von der Praxis / von meinem festen Standort aus.'),
      checkbox('Vom jeweils vorherigen Termin aus (Tourenplanung).'),
      checkbox('Die Entfernung muss die App nicht berechnen – das plane ich selbst.'),
      hint('Für die erste Version empfehlen wir: Patienten geben ihre Adresse an, Sie sehen sie bei jeder Terminanfrage und entscheiden selbst. Eine automatische Routen-/Tourenplanung ist deutlich aufwändiger und kann später ergänzt werden.'),

      ...question('3', 'Wie groß ist Ihr Einzugsgebiet?', 'Bis zu welcher Entfernung (km oder Fahrminuten) besuchen Sie Patienten zu Hause? Gibt es bestimmte Orte oder Postleitzahlen, die Sie bedienen – oder ausschließen? Berechnen Sie eine Anfahrtspauschale?'),
      ...answerBox(3),

      ...question('4', 'Wie viel Pufferzeit brauchen Sie zwischen zwei Terminen?', 'Z. B. 15, 20 oder 30 Minuten Fahrzeit zwischen zwei Hausbesuchen – damit die App keine Termine direkt hintereinander legt.'),
      ...answerBox(2),

      // B
      h1('B. Terminplanung und Kalender'),
      ...question('5', 'Welchen Kalender nutzen Sie heute für Ihre Termine?'),
      checkbox('Google Kalender'),
      checkbox('Outlook / Microsoft 365'),
      checkbox('Apple Kalender (iPhone/iCloud)'),
      checkbox('Praxissoftware (welche? Bitte unten eintragen)'),
      checkbox('Papierkalender / Terminbuch'),
      ...answerBox(2),

      ...question('6', 'Soll die App Termine mit diesem Kalender abgleichen?', 'Also: Termine aus der App erscheinen automatisch in Ihrem Kalender – und Zeiten, die dort schon belegt sind, werden in der App nicht angeboten?'),
      checkbox('Ja, bitte automatisch abgleichen.'),
      checkbox('Nein, die App darf ein eigener, separater Kalender sein.'),
      checkbox('Später – für den Start nicht nötig.'),

      ...question('7', 'Wie sollen Ihre Patienten an Termine kommen?'),
      checkbox('A – Patienten buchen selbstständig aus freien Zeiten (wie beim Friseur online).'),
      checkbox('B – Patienten stellen eine Terminanfrage mit Wunschzeiten, ich bestätige oder schlage etwas anderes vor.'),
      checkbox('C – Termine vergebe nur ich; Patienten sehen ihre Termine in der App nur ein.'),
      hint('Unsere Empfehlung für den Start ist B: Bei Hausbesuchen hängt die Machbarkeit von Anfahrt und Route ab – mit Anfrage und Bestätigung behalten Sie die Kontrolle.'),

      ...question('8', 'Zu welchen Zeiten behandeln Sie?', 'Ihre üblichen Arbeitstage und -zeiten – ggf. getrennt nach Praxis- und Hausbesuchszeiten.'),
      ...answerBox(3),

      // C
      h1('C. Patienten und Zugang'),
      ...question('9', 'Wie viele Patienten sollen die App nutzen – und wie viele Behandler gibt es?', 'Grobe Schätzung reicht: Wie viele aktive Patienten betreuen Sie derzeit? Arbeiten Sie allein oder mit Kolleginnen/Kollegen?'),
      ...answerBox(2),

      ...question('10', 'Wie sollen sich Patienten anmelden?'),
      checkbox('Ich lade Patienten persönlich ein; Anmeldung per Link in einer E-Mail – ohne Passwort (Empfehlung: besonders einfach, auch für ältere Patienten).'),
      checkbox('Klassisch mit E-Mail-Adresse und Passwort.'),
      checkbox('Beides anbieten.'),

      ...question('11', 'Wie technikvertraut sind Ihre Patienten?', 'Eher jüngere, smartphone-gewohnte Patienten – oder viele ältere Patienten, für die alles besonders groß, einfach und selbsterklärend sein muss?'),
      ...answerBox(2),

      // D
      h1('D. Trainingspläne und Übungsvideos'),
      ...question('12', 'Woher kommen die Übungsvideos?'),
      checkbox('Ich produziere sie selbst (bzw. möchte das tun) – siehe dazu unsere Anleitung im Anhang.'),
      checkbox('Es gibt bereits fertiges Videomaterial (bitte unten angeben, woher und mit welchen Nutzungsrechten).'),
      checkbox('Eine Mischung aus beidem.'),
      ...answerBox(2),

      ...question('13', 'Wie viele Videos werden es ungefähr – und wie lang sind sie?', 'Z. B. „ca. 80 Übungen, je 1–2 Minuten“. Falls schon Videos existieren: Wie groß sind die Dateien ungefähr (MB pro Video), und womit wurden sie aufgenommen (Smartphone, Kamera)?'),
      ...answerBox(3),

      ...question('14', 'Wie sollen Trainingspläne aufgebaut sein?'),
      checkbox('Zentrale Übungsbibliothek: Ich stelle pro Patient einen Plan aus vorhandenen Übungen zusammen, mit Sätzen/Wiederholungen/Hinweisen (Empfehlung – einmal drehen, immer wieder verwenden).'),
      checkbox('Individuelle Videos speziell für einzelne Patienten.'),
      checkbox('Beides.'),

      ...question('15', 'Sollen Patienten ihr Training zurückmelden?', 'Z. B. Übung abhaken, Schmerz auf einer Skala angeben oder eine kurze Notiz hinterlassen – damit Sie den Fortschritt vor dem nächsten Hausbesuch sehen.'),
      checkbox('Ja, einfaches Abhaken reicht.'),
      checkbox('Ja, mit Schmerzskala und Notizen.'),
      checkbox('Nein, nicht nötig.'),

      // E
      h1('E. Chat und Kommunikation'),
      ...question('16', 'Was soll der Chat können?'),
      checkbox('Textnachrichten zwischen Patient und mir.'),
      checkbox('Zusätzlich Fotos senden (z. B. Übungsausführung, Schwellung).'),
      checkbox('Benachrichtigung per E-Mail, wenn eine neue Nachricht da ist.'),
      checkbox('Push-Mitteilung auf dem Handy.'),
      hint('Der Chat ist kein Notfallkanal – das machen wir in der App auch deutlich. Für Videosprechstunden gelten in Deutschland besondere Regeln; die klammern wir zunächst aus.'),

      // F
      h1('F. Design, Internetadresse und Abgrenzung'),
      ...question('17', 'Unter welcher Adresse soll die App erreichbar sein?', 'Wie lautet Ihre Haupt-Internetadresse (z. B. www.physio-mustermann.de), und welche Unteradresse wünschen Sie sich für die App (z. B. app.physio-mustermann.de oder portal.physio-mustermann.de)? Bei welchem Anbieter liegt Ihre Domain (z. B. Strato, IONOS, GoDaddy)?'),
      ...answerBox(3),

      ...question('18', 'Ist das Design in Figma final?', 'Gibt es darüber hinaus Logo-Dateien, festgelegte Farben oder Schriften, die wir verwenden sollen? Bitte senden Sie uns die Figma-Screens zusätzlich als PNG-Export oder PDF.'),
      ...answerBox(2),

      ...question('19', 'Was soll die App ausdrücklich NICHT übernehmen?', 'Z. B. Abrechnung, Rezeptverwaltung, Behandlungsdokumentation. Welche Praxissoftware nutzen Sie dafür heute – und muss die App damit zusammenspielen?'),
      ...answerBox(3),

      ...question('20', 'Laufende Kosten', 'Für Betrieb der App (Server, Datenbank, Video-Bereitstellung) fallen laufende Kosten an – nach unserer Schätzung für Ihre Praxisgröße ca. 45–55 € pro Monat. Ist das für Sie in Ordnung? Gibt es eine Obergrenze?'),
      ...answerBox(2),

      // Anhang
      h1('Anhang: So produzieren Sie optimale Übungsvideos'),
      p('Gute Nachricht vorweg: Ein aktuelles Smartphone reicht völlig aus. Die App wandelt Ihre Videos automatisch in streamingfähige Größen um – Sie müssen also nichts komprimieren. Wichtig ist nur, wie Sie aufnehmen:'),
      bullet('Full HD (1080p) bei 30 Bildern/Sekunde genügt. Bitte kein 4K – das vervierfacht die Dateigröße ohne sichtbaren Vorteil in der App.', 'Auflösung:'),
      bullet('Querformat (Handy quer halten). So ist das Video auf Handy, Tablet und PC gleichermaßen gut sichtbar. Wichtig: bei allen Videos gleich verfahren.', 'Format:'),
      bullet('Eine Übung pro Video, ideal 30–90 Sekunden. Kurze Videos laden schneller und Patienten finden die richtige Stelle sofort.', 'Länge:'),
      bullet('Stativ oder feste Auflage verwenden, den ganzen Körper ins Bild nehmen, heller Raum (Tageslicht), ruhiger einfarbiger Hintergrund, keine Gegenlicht-Fenster.', 'Bild:'),
      bullet('Kurze Ansage zu Beginn genügt („Kniebeuge an der Wand, langsam ausführen“). Sätze und Wiederholungen pflegen wir als Text im Trainingsplan – so bleibt das Video wiederverwendbar.', 'Ton:'),
      bullet('MP4 (H.264) – das ist bei iPhone und Android die Standardeinstellung. Bei iPhone bitte in den Kamera-Einstellungen „Maximale Kompatibilität“ wählen.', 'Dateiformat:'),
      bullet('Bei 1080p entstehen ca. 60–150 MB pro Minute – das ist normal und völlig in Ordnung. Der Upload erfolgt einmalig, danach kümmert sich die Plattform um alles.', 'Dateigröße:'),
      bullet('Den Übungsnamen in den Dateinamen schreiben, z. B. „kniebeuge-wand.mp4“ – das erleichtert die Zuordnung erheblich.', 'Benennung:'),

      new Paragraph({
        spacing: { before: 400 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
        children: [new TextRun({ text: 'Vielen Dank! Senden Sie den ausgefüllten Fragebogen einfach zurück – bei Unklarheiten rufen wir Sie gern an.', italics: true, size: 20, color: GRAY })],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(process.argv[2] || 'fragebogen-patienten-app.docx', buf);
  console.log('OK');
});

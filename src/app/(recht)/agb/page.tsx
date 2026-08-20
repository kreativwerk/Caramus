import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "AGB" };

const paragraphen: { titel: string; absaetze: string[] }[] = [
  {
    titel: "§ 1 Geltungsbereich und Vertragspartner",
    absaetze: [
      "Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge, Leistungen, Terminvereinbarungen und sonstigen Geschäftsbeziehungen zwischen Curamus Medical, Inhaber Charles Mba, nachfolgend „Curamus Medical“ oder „Anbieter“ genannt, und den jeweiligen Patienten, Kunden oder gesetzlichen Vertretern, nachfolgend „Patient“ genannt.",
      "Die AGB gelten insbesondere für mobile physiotherapeutische Leistungen, therapeutische Hausbesuche, private physiotherapeutische Behandlungen, präventive Leistungen, aktive Trainingsleistungen, Mobilitätsaufbau, Sturzprävention, gesundheitsorientierte Bewegungsangebote, alltagsbezogene Trainingsbegleitung sowie damit verbundene Dienstleistungen.",
      "Die Leistungen werden grundsätzlich als mobile Dienstleistung im Rahmen von Hausbesuchen erbracht. Behandlungs- und Leistungsorte sind insbesondere die Wohnung des Patienten, Pflegeeinrichtungen, betreute Wohnformen oder ein anderer ausdrücklich vereinbarter und geeigneter Ort im Raum Nürnberg, Fürth, Erlangen und Umgebung.",
      "Vertragspartner ist grundsätzlich der Patient selbst. Dies gilt auch dann, wenn eine private Krankenversicherung, Beihilfestelle, Zusatzversicherung, gesetzliche Krankenkasse oder ein sonstiger Kostenträger eine Erstattung ganz oder teilweise ablehnt, kürzt, verzögert oder von weiteren Voraussetzungen abhängig macht.",
      "Bei minderjährigen oder nicht geschäftsfähigen Patienten wird der Vertrag durch den gesetzlichen Vertreter geschlossen.",
      "Individuelle Vereinbarungen zwischen Curamus Medical und dem Patienten gehen diesen AGB vor.",
    ],
  },
  {
    titel: "§ 2 Leistungsbereiche und rechtliche Abgrenzung",
    absaetze: [
      "Curamus Medical bietet Leistungen in den Bereichen mobile Physiotherapie, Training und Prävention an.",
      "Zu den therapeutischen Leistungen können insbesondere gehören: Physiotherapeutische Behandlungen, Krankengymnastik, aktive Rehabilitation, postoperative Nachbehandlung, Mobilisation, Gangschule, Gleichgewichtstraining, Bewegungsübungen, Funktionsverbesserung, Mobilitätsaufbau und sonstige physiotherapeutische Maßnahmen.",
      "Zu den präventiven und trainingsbezogenen Leistungen können insbesondere gehören: Aktives Training, Bewegungsförderung, Sturzprävention, gesundheitsorientiertes Alltagstraining, Mobilitätsaufbau, Kräftigung, Koordinationstraining, Gleichgewichtstraining, präventive Bewegungsberatung und individuelle Trainingsbegleitung.",
      "Therapeutische Heilbehandlungen erfolgen ausschließlich auf Grundlage einer gültigen ärztlichen Verordnung, eines Privatrezepts oder einer sonst rechtlich zulässigen Behandlungsgrundlage. Liegt keine solche Grundlage vor, werden ausschließlich nicht-therapeutische Präventions-, Trainings-, Bewegungs- oder Beratungsleistungen erbracht, soweit diese rechtlich zulässig sind.",
      "Curamus Medical erbringt keine ärztliche Diagnostik, keine ärztliche Behandlung, keine Notfallversorgung und keine Leistungen, die Ärzten, Heilpraktikern oder anderen Berufsgruppen vorbehalten sind.",
      "Bei akuten medizinischen Notfällen, starken akuten Beschwerden, Atemnot, Brustschmerzen, neurologischen Ausfällen, Verdacht auf Schlaganfall, schweren Verletzungen, akuten Infektionszeichen oder anderen dringenden medizinischen Situationen ist unverzüglich der ärztliche Notdienst, der Rettungsdienst oder der Notruf 112 zu kontaktieren.",
    ],
  },
  {
    titel: "§ 3 Kein Heilversprechen und keine Erfolgsgarantie",
    absaetze: [
      "Curamus Medical schuldet eine fachgerechte, sorgfältige und patientenorientierte Behandlung, Betreuung oder Trainingsleistung nach dem jeweiligen fachlichen Standard.",
      "Ein bestimmter medizinischer Erfolg, Heilungserfolg, Schmerzfreiheit, Beschwerdefreiheit, Mobilitätsgewinn, Trainingsfortschritt, Präventionserfolg oder sonstiger Behandlungserfolg wird nicht garantiert.",
      "Aussagen auf der Webseite, in Informationsmaterialien, in Gesprächen oder im Rahmen der Behandlung dienen der Beschreibung möglicher Ziele, Erfahrungswerte, therapeutischer Ansätze oder präventiver Maßnahmen. Sie ersetzen keine individuelle ärztliche Diagnose, Prognose oder medizinische Abklärung.",
    ],
  },
  {
    titel: "§ 4 Vertragsschluss und Terminvereinbarung",
    absaetze: [
      "Ein Vertrag kommt zustande, wenn der Patient eine Leistung oder einen Termin bei Curamus Medical anfragt und Curamus Medical diesen Termin oder diese Leistung ausdrücklich bestätigt.",
      "Die Terminvereinbarung kann telefonisch, per E-Mail, über ein Kontaktformular, persönlich oder über ein digitales Termin- oder Kalendersystem erfolgen.",
      "Eine bloße Anfrage über die Webseite, ein Kontaktformular, per E-Mail oder telefonisch stellt noch keinen kostenpflichtigen Vertrag dar. Ein kostenpflichtiger Vertrag kommt erst zustande, wenn Curamus Medical den Termin oder die Leistung ausdrücklich bestätigt und dem Patienten die wesentlichen Kosteninformationen mitgeteilt wurden.",
      "Zu den wesentlichen Kosteninformationen gehören insbesondere: Art der Leistung, voraussichtliche Dauer der Leistung, Honorar, mögliche Anfahrtspauschale, Zahlungsziel, Zahlungsart sowie der Hinweis auf eine mögliche Nicht- oder Teilerstattung durch Kostenträger.",
      "Ein Termin gilt erst dann als verbindlich vereinbart, wenn Curamus Medical ihn ausdrücklich bestätigt hat.",
      "Der Patient ist verpflichtet, bei der Terminvereinbarung alle für die Durchführung relevanten Informationen vollständig und wahrheitsgemäß mitzuteilen. Dazu gehören insbesondere Name, Anschrift, Telefonnummer, E-Mail-Adresse, Behandlungsort, vorhandene ärztliche Verordnungen oder Privatrezept, relevante Einschränkungen, Mobilitätsstatus, Zugangssituation zum Gebäude sowie besondere gesundheitliche Hinweise, soweit diese für die sichere Durchführung der Leistung erforderlich sind.",
    ],
  },
  {
    titel: "§ 5 Mitwirkungspflichten des Patienten",
    absaetze: [
      "Der Patient ist verpflichtet, Curamus Medical vor Beginn der Behandlung oder Leistung über alle Umstände zu informieren, die für die sichere, fachgerechte und ordnungsgemäße Durchführung relevant sind.",
      "Hierzu gehören insbesondere bestehende Diagnosen, Operationen, akute Beschwerden, Schmerzen, Vorerkrankungen, Allergien, Medikamente, ärztliche Belastungsgrenzen, Kontraindikationen, Sturzereignisse, Schwindel, Herz-Kreislauf-Erkrankungen, neurologische Erkrankungen, Infektionen, Fieber, offene Wunden sowie sonstige gesundheitliche Veränderungen.",
      "Der Patient ist verpflichtet, Curamus Medical auch während einer laufenden Behandlungsserie unverzüglich über gesundheitliche Veränderungen zu informieren.",
      "Liegt eine ärztliche Verordnung, ein Privatrezept, ein Arztbericht oder eine sonstige Behandlungsgrundlage vor, ist diese spätestens zum ersten Behandlungstermin vorzulegen, soweit sie für die jeweilige Leistung erforderlich ist.",
      "Curamus Medical ist berechtigt, die Durchführung einer Behandlung abzulehnen, abzubrechen oder zu verschieben, wenn medizinische Bedenken bestehen, erforderliche Informationen fehlen, eine sichere Durchführung nicht gewährleistet ist oder die Behandlung aus fachlicher Sicht nicht verantwortbar erscheint.",
    ],
  },
  {
    titel: "§ 6 Keine Kassenzulassung und keine Direktabrechnung mit gesetzlichen Krankenkassen",
    absaetze: [
      "Curamus Medical verfügt nicht über eine Kassenzulassung zur direkten Abrechnung mit gesetzlichen Krankenkassen. Eine direkte Abrechnung mit gesetzlichen Krankenkassen erfolgt nicht.",
      "Gesetzlich versicherte Patienten können Leistungen von Curamus Medical ausschließlich als private Selbstzahlerleistung beauftragen. Der Patient wird ausdrücklich darauf hingewiesen, dass Curamus Medical keine Leistungen unmittelbar gegenüber gesetzlichen Krankenkassen abrechnet.",
      "Der Patient ist selbst dafür verantwortlich, vor Beginn der Leistung mit seiner gesetzlichen Krankenkasse oder einem sonstigen Kostenträger zu klären, ob eine freiwillige Erstattung, Bezuschussung oder Kostenübernahme im Einzelfall möglich ist.",
      "Eine Ablehnung, Kürzung, teilweise Erstattung oder verzögerte Erstattung durch eine gesetzliche Krankenkasse oder einen sonstigen Kostenträger entbindet den Patienten nicht von der Pflicht zur vollständigen Zahlung der vereinbarten Vergütung gegenüber Curamus Medical.",
      "Curamus Medical übernimmt keine Garantie und keine Gewähr dafür, dass Leistungen durch gesetzliche Krankenkassen erstattet, bezuschusst oder übernommen werden.",
    ],
  },
  {
    titel: "§ 7 Privatpatienten, Beihilfe, Zusatzversicherung und sonstige Kostenträger",
    absaetze: [
      "Privatpatienten, beihilfeberechtigte Patienten und Patienten mit Zusatzversicherung schließen mit Curamus Medical einen privaten Behandlungs- oder Dienstleistungsvertrag.",
      "Die Abrechnung erfolgt gegenüber dem Patienten auf Grundlage der vereinbarten Honorare, der Honorarvereinbarung, der gültigen Preisliste oder einer individuell bestätigten Leistungsvereinbarung.",
      "Die vereinbarten Honorare können von den Erstattungssätzen privater Krankenversicherungen, Beihilfestellen, Zusatzversicherungen oder sonstiger Kostenträger abweichen. Der Patient bleibt unabhängig von der Erstattungshöhe seines Kostenträgers zur vollständigen Zahlung der vereinbarten Vergütung verpflichtet.",
      "Curamus Medical ist nicht verpflichtet, Honorare an die Erstattungssätze einzelner privater Krankenversicherungen, Beihilfestellen, Zusatzversicherungen oder sonstiger Kostenträger anzupassen.",
      "Der Patient ist selbst dafür verantwortlich, vor Behandlungsbeginn mit seiner privaten Krankenversicherung, Beihilfestelle, Zusatzversicherung oder einem sonstigen Kostenträger zu klären, ob und in welcher Höhe die Leistungen erstattet werden.",
      "Eine Beratung zu individuellen Versicherungsbedingungen, Tarifen, Beihilfevorschriften, Erstattungsansprüchen oder Kostenübernahmeentscheidungen ist nicht Bestandteil der regulären Behandlung oder Leistung. Wünscht der Patient eine gesonderte Unterstützung bei der Zusammenstellung von Unterlagen, Rückfragen zur Rechnung oder Kommunikation mit einem Kostenträger, kann hierfür eine separate Vergütung vereinbart werden.",
    ],
  },
  {
    titel: "§ 8 Selbstzahlerleistungen, Prävention und Training",
    absaetze: [
      "Selbstzahlerleistungen, präventive Leistungen, private Trainingsleistungen, Mobilitätsaufbau, Sturzprävention, gesundheitsorientierte Bewegungsangebote und nicht ärztlich verordnete Leistungen werden unmittelbar zwischen Curamus Medical und dem Patienten vereinbart und abgerechnet.",
      "Diese Leistungen sind privat zu zahlen, sofern keine ausdrückliche Kostenübernahme durch einen Kostenträger vorliegt.",
      "Bei präventiven, trainingsbezogenen oder beratenden Leistungen wird kein Heilbehandlungsversprechen abgegeben. Ziel dieser Leistungen ist die gesundheitsorientierte Unterstützung, Bewegungsförderung, Mobilitätsverbesserung, Prävention oder alltagsbezogene Begleitung im Rahmen der vereinbarten Leistung.",
      "Diese Leistungen ersetzen keine ärztliche Untersuchung, Diagnose oder medizinisch notwendige Behandlung.",
    ],
  },
  {
    titel: "§ 9 Vergütung, Preise und Honorarvereinbarung",
    absaetze: [
      "Die Vergütung richtet sich nach der jeweils vereinbarten Honorarvereinbarung, der gültigen Preisliste oder der individuell bestätigten Leistungsvereinbarung.",
      "Vor Beginn der Leistung erhält der Patient die wesentlichen Kosteninformationen. Hierzu gehören insbesondere Art der Leistung, Dauer der Leistung, Honorar, mögliche Anfahrtspauschale, Zahlungsziel und Zahlungsart.",
      "Die von Curamus Medical berechneten Honorare bestehen unabhängig von einer möglichen Erstattung oder Kostenübernahme durch private Krankenversicherungen, Beihilfestellen, Zusatzversicherungen, gesetzliche Krankenkassen oder sonstige Kostenträger. Eine Kürzung, Ablehnung, teilweise Erstattung oder verzögerte Erstattung durch einen Kostenträger entbindet den Patienten nicht von der Verpflichtung zur vollständigen Zahlung der Rechnung.",
      "Soweit Leistungen umsatzsteuerpflichtig sind, wird die gesetzliche Umsatzsteuer in der Rechnung ausgewiesen. Soweit Leistungen umsatzsteuerfrei sind, erfolgt die Rechnung ohne Umsatzsteuerausweis mit entsprechendem steuerlichem Hinweis.",
      "Die steuerliche Einordnung richtet sich nach der jeweiligen Leistung und den gesetzlichen Vorgaben. Steuerpflichtige Umsätze unterliegen grundsätzlich dem gesetzlichen Umsatzsteuersatz von 19 %, während bestimmte Heilbehandlungen im Bereich der Humanmedizin durch Physiotherapeuten unter den gesetzlichen Voraussetzungen umsatzsteuerfrei sein können.",
    ],
  },
  {
    titel: "§ 10 Rechnungsstellung und Zahlungsbedingungen",
    absaetze: [
      "Die Rechnungsstellung erfolgt nach erbrachter Behandlung oder Leistung, nach Abschluss einer Behandlungsserie, monatlich oder nach individueller Vereinbarung. Die Rechnung wird mit Lexware erstellt.",
      "Die Rechnung wird dem Patienten per E-Mail, postalisch oder persönlich übergeben, sofern nichts anderes vereinbart wurde.",
      "Das Zahlungsziel beträgt 14 Tage ab Rechnungsdatum. Die Zahlung erfolgt ausschließlich per Überweisung auf das in der Rechnung angegebene Bankkonto, sofern nicht ausdrücklich eine andere Zahlungsart vereinbart wurde. Rechnungsbeträge sind ohne Abzug zu zahlen.",
      "Gerät der Patient in Zahlungsverzug, ist Curamus Medical berechtigt, gesetzliche Verzugszinsen sowie gesetzlich zulässige Mahn- und Verzugskosten geltend zu machen.",
    ],
  },
  {
    titel: "§ 11 Hausbesuche, Anfahrt und Behandlungszeit",
    absaetze: [
      "Curamus Medical erbringt die Leistungen mobil beim Patienten oder an einem vorher ausdrücklich vereinbarten Ort.",
      "Der Patient ist verpflichtet, sicherzustellen, dass der Behandlungsort zum vereinbarten Termin erreichbar, zugänglich, ausreichend beleuchtet, hygienisch geeignet, angemessen beheizt und für die Behandlung sicher nutzbar ist. Der Patient stellt einen ausreichend großen Bereich zur Verfügung, in dem eine mobile Behandlung, therapeutische Hilfsmittel und aktive Übungen sicher durchgeführt werden können.",
      "Für die Terminplanung wird je Hausbesuch eine Anfahrts- und Organisationszeit von circa 45 Minuten berücksichtigt. Diese Zeit dient der realistischen Planung im Großraum Nürnberg, Fürth, Erlangen und Umgebung, insbesondere wegen Verkehr, Parkplatzsuche, Gebäudezugang, Aufzugssituation, Klingelsituation, Zugang zum Behandlungsort und sonstigen örtlichen Gegebenheiten.",
      "Die Anfahrts- und Organisationszeit wird nicht auf die reguläre Behandlungszeit angerechnet. Die vereinbarte Behandlungsdauer beginnt grundsätzlich mit Beginn der therapeutischen, präventiven oder trainingsbezogenen Leistung beim Patienten.",
      "Eine gesonderte Anfahrtspauschale kann gemäß Honorarvereinbarung, Preisliste oder individueller Vereinbarung berechnet werden.",
    ],
  },
  {
    titel: "§ 12 Zugang zum Behandlungsort und Wartezeit",
    absaetze: [
      "Der Patient hat dafür Sorge zu tragen, dass Curamus Medical zum vereinbarten Zeitpunkt Zugang zum Behandlungsort erhält.",
      "Ist der Patient zum vereinbarten Termin nicht erreichbar, nicht anwesend oder wird der Zugang zum Behandlungsort nicht ermöglicht, gilt der Termin als ausgefallen, sofern Curamus Medical die Leistung deshalb nicht oder nicht vollständig erbringen kann.",
      "Wartezeiten, die durch fehlenden Zugang, verspätete Anwesenheit, unklare Gebäudesituation, fehlende Klingelbeschriftung, fehlende Parkmöglichkeit oder vergleichbare Umstände aus dem Verantwortungsbereich des Patienten entstehen, können die verfügbare Behandlungszeit verkürzen, sofern Curamus Medical aus organisatorischen Gründen den nachfolgenden Zeitplan einhalten muss.",
      "Ein Anspruch auf Verlängerung oder Nachholung der verlorenen Zeit besteht nicht, wenn die Verzögerung aus dem Verantwortungsbereich des Patienten stammt. Die volle Vergütung bleibt in diesem Fall geschuldet, soweit Curamus Medical zur Leistung bereit war und die Verzögerung oder Nichtdurchführung aus dem Verantwortungsbereich des Patienten stammt.",
    ],
  },
  {
    titel: "§ 13 Terminabsage, Terminverschiebung und Ausfallhonorar",
    absaetze: [
      "Die vereinbarten Termine sind Exklusivtermine. Für jeden Termin werden Behandlungszeit, Anfahrtszeit und organisatorische Kapazitäten fest für den Patienten reserviert.",
      "Terminabsagen oder Terminverschiebungen müssen spätestens 24 Stunden vor dem vereinbarten Termin erfolgen. Maßgeblich ist die konkrete Uhrzeit des vereinbarten Termins. Findet der Termin beispielsweise am Dienstag um 09:00 Uhr statt, muss die Absage spätestens am Montag um 09:00 Uhr bei Curamus Medical eingehen.",
      "Die Absage muss telefonisch oder in Textform per E-Mail erfolgen. Eine Absage über andere Kommunikationswege ist nur wirksam, wenn Curamus Medical den Zugang ausdrücklich bestätigt.",
      "Sagt der Patient einen Termin weniger als 24 Stunden vorher ab, erscheint er nicht zum Termin oder wird der Zugang zum Behandlungsort nicht ermöglicht, kann Curamus Medical ein Ausfallhonorar bis zur Höhe des vereinbarten Behandlungshonorars berechnen. Ersparte Aufwendungen werden berücksichtigt.",
      "Eine vereinbarte Anfahrtspauschale kann zusätzlich berechnet werden, wenn sie ausdrücklich vereinbart wurde und Curamus Medical die Anfahrt bereits begonnen hat oder die Anfahrt aufgrund der kurzfristigen Absage nicht mehr vermieden werden konnte.",
      "Dem Patienten bleibt ausdrücklich der Nachweis gestattet, dass Curamus Medical kein Schaden oder ein wesentlich geringerer Schaden entstanden ist. Ein Anspruch auf Nachholung eines kurzfristig abgesagten, versäumten oder nicht durchführbaren Termins besteht nicht.",
    ],
  },
  {
    titel: "§ 14 Verspätung des Patienten",
    absaetze: [
      "Verspätet sich der Patient oder kann die Behandlung aus Gründen, die im Verantwortungsbereich des Patienten liegen, nicht pünktlich beginnen, verkürzt sich die Behandlungszeit entsprechend, sofern Curamus Medical aus organisatorischen Gründen den nachfolgenden Zeitplan einhalten muss. Die volle Vergütung bleibt in diesem Fall geschuldet.",
      "Dies gilt insbesondere bei verspätetem Zugang, verspäteter Anwesenheit, nicht vorbereitetem Behandlungsort, fehlenden erforderlichen Unterlagen oder sonstigen Umständen, die der Patient zu vertreten hat.",
    ],
  },
  {
    titel: "§ 15 Absage, Ablehnung oder Abbruch durch Curamus Medical",
    absaetze: [
      "Curamus Medical ist berechtigt, Termine aus wichtigem Grund abzusagen, zu verschieben, abzulehnen oder abzubrechen.",
      "Ein wichtiger Grund liegt insbesondere vor bei Krankheit, Unfall, höherer Gewalt, unvorhersehbaren Verkehrsproblemen, gefährlichen Wetterlagen, medizinischen Bedenken, fehlender Behandlungssicherheit, fehlenden erforderlichen Informationen, fehlender Mitwirkung des Patienten, hygienisch oder sicherheitstechnisch ungeeigneten Bedingungen am Behandlungsort oder sonstigen Umständen, die eine ordnungsgemäße Durchführung unmöglich oder unzumutbar machen.",
      "In diesem Fall wird nach Möglichkeit ein Ersatztermin angeboten. Gesetzliche Ansprüche des Patienten bleiben unberührt.",
    ],
  },
  {
    titel: "§ 16 Hygienische und sichere Behandlungsbedingungen",
    absaetze: [
      "Der Patient ist verpflichtet, für hygienisch geeignete und sichere Bedingungen am Behandlungsort zu sorgen. Der Behandlungsort muss so beschaffen sein, dass Curamus Medical die vereinbarte Leistung ohne unverhältnismäßige Risiken für Patient, Anbieter oder Dritte durchführen kann.",
      "Curamus Medical ist berechtigt, eine Behandlung abzulehnen, zu verschieben oder abzubrechen, wenn der Behandlungsort unhygienisch, unsicher, nicht zugänglich oder für die geplante Leistung ungeeignet ist. Dies gilt insbesondere bei erheblichen Stolpergefahren, fehlendem Platz, aggressiven Tieren, akuten Infektionsrisiken, gefährlichen Umgebungsbedingungen, fehlender Beleuchtung oder sonstigen Umständen, die die sichere Durchführung gefährden.",
    ],
  },
  {
    titel: "§ 17 Dokumentation, Aufklärung und Einwilligung",
    absaetze: [
      "Curamus Medical führt eine Behandlungsdokumentation über die durchgeführten therapeutischen Maßnahmen und sonstigen relevanten Leistungen. Dokumentiert werden insbesondere relevante Patientendaten, Anamnese, Behandlungsziele, Befunde, Therapieverlauf, durchgeführte Maßnahmen, Reaktionen auf die Behandlung, Aufklärungen, Einwilligungen und sonstige für die Behandlung wesentliche Informationen.",
      "Die Dokumentation erfolgt in unmittelbarem zeitlichem Zusammenhang mit der Behandlung. Die Behandlungsdokumentation wird grundsätzlich für die Dauer von zehn Jahren nach Abschluss der Behandlung aufbewahrt, soweit keine längeren gesetzlichen Aufbewahrungsfristen gelten.",
      "Der Patient hat nach den gesetzlichen Vorschriften das Recht auf Einsicht in seine Behandlungsakte.",
      "Vor Beginn und während der Behandlung werden dem Patienten die wesentlichen Umstände der Behandlung verständlich erläutert, soweit dies therapeutisch erforderlich ist. Der Patient wirkt an der Behandlung mit und erteilt die erforderlichen Informationen vollständig und wahrheitsgemäß.",
    ],
  },
  {
    titel: "§ 18 Datenschutz und Schweigepflicht",
    absaetze: [
      "Curamus Medical verarbeitet personenbezogene Daten und Gesundheitsdaten ausschließlich im Rahmen der gesetzlichen Vorgaben. Die Verarbeitung erfolgt insbesondere zur Terminvereinbarung, Durchführung der Behandlung oder Leistung, Dokumentation, Abrechnung, Kommunikation, Erfüllung gesetzlicher Pflichten und Organisation des Praxisbetriebs.",
      "Gesundheitsdaten werden vertraulich behandelt. Curamus Medical unterliegt der therapeutischen Schweigepflicht. Eine Weitergabe von Daten, Behandlungsberichten oder Informationen an Dritte erfolgt nur, soweit hierfür eine gesetzliche Grundlage besteht, dies zur Durchführung des Vertrags erforderlich ist oder der Patient zuvor ausdrücklich eingewilligt beziehungsweise Curamus Medical von der Schweigepflicht entbunden hat.",
      "Die näheren Informationen zur Datenverarbeitung werden in einer separaten Datenschutzerklärung bereitgestellt.",
      "Bei der Nutzung digitaler Kommunikationswege, insbesondere E-Mail, können trotz üblicher technischer Schutzmaßnahmen Risiken bestehen. Der Patient kann Curamus Medical jederzeit mitteilen, wenn bestimmte Informationen nicht per E-Mail übermittelt werden sollen.",
    ],
  },
  {
    titel: "§ 19 Kommunikation und digitale Organisation",
    absaetze: [
      "Die Kommunikation zwischen Curamus Medical und dem Patienten kann telefonisch, per E-Mail, postalisch, persönlich oder über digitale Kontakt- und Terminwege erfolgen.",
      "Für die Webseite wird Webflow eingesetzt. Die Domain und technische Domainverwaltung erfolgen über All-Inkl. Für die Terminorganisation kann Google Kalender eingesetzt werden. Für Rechnungsstellung und buchhalterische Prozesse wird Lexware eingesetzt.",
      "Curamus Medical achtet darauf, nur solche Daten zu verarbeiten, die für den jeweiligen Zweck erforderlich sind. Medizinische Diagnosen, ausführliche Befunde oder besonders sensible Gesundheitsinformationen sollen nicht unnötig über einfache Kontaktformulare oder ungeschützte Kommunikationswege übermittelt werden.",
      "Der Patient wird gebeten, über Kontaktformulare keine ausführlichen medizinischen Befunde, Diagnosen oder besonders sensiblen Gesundheitsdaten zu übermitteln. Medizinische Details werden persönlich, telefonisch oder über einen geeigneten Kommunikationsweg besprochen.",
    ],
  },
  {
    titel: "§ 20 Haftung",
    absaetze: [
      "Curamus Medical haftet nach den gesetzlichen Vorschriften für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit. Für sonstige Schäden haftet Curamus Medical bei Vorsatz und grober Fahrlässigkeit.",
      "Bei leichter Fahrlässigkeit haftet Curamus Medical nur bei Verletzung wesentlicher Vertragspflichten. Wesentliche Vertragspflichten sind solche Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Patient regelmäßig vertrauen darf. Die Haftung ist in diesem Fall auf den vertragstypischen und vorhersehbaren Schaden begrenzt, soweit keine Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit betroffen sind.",
      "Der Patient ist verpflichtet, Curamus Medical vollständig und rechtzeitig über medizinisch relevante Umstände zu informieren. Für Schäden, die dadurch entstehen, dass der Patient wesentliche medizinische Informationen verschweigt, unzutreffend mitteilt, ärztliche Einschränkungen nicht beachtet oder Mitwirkungspflichten verletzt, haftet Curamus Medical nicht, soweit der Schaden hierauf beruht und Curamus Medical kein eigenes Verschulden trifft.",
      "Die Haftung nach zwingenden gesetzlichen Vorschriften bleibt unberührt.",
    ],
  },
  {
    titel: "§ 21 Webseite, Kontaktformular und Online-Terminvereinbarung",
    absaetze: [
      "Sofern über die Webseite lediglich eine unverbindliche Anfrage gestellt wird, kommt dadurch noch kein kostenpflichtiger Vertrag zustande. Ein kostenpflichtiger Vertrag kommt erst zustande, wenn Curamus Medical den Termin oder die Leistung ausdrücklich bestätigt und der Patient die wesentlichen Kosteninformationen erhalten hat.",
      "Kontaktformulare dienen ausschließlich der Kontaktaufnahme, Terminabstimmung oder Rückrufanfrage, sofern sie nicht ausdrücklich anders gekennzeichnet sind.",
      "Der Patient wird darauf hingewiesen, über Kontaktformulare keine ausführlichen medizinischen Befunde, Diagnosen oder besonders sensiblen Gesundheitsdaten zu übermitteln.",
    ],
  },
  {
    titel: "§ 22 Widerruf und Verbraucherinformationen",
    absaetze: [
      "Soweit der Patient Verbraucher ist und der Vertrag im Fernabsatz oder außerhalb von Geschäftsräumen geschlossen wird, können gesetzliche Widerrufsrechte bestehen. Curamus Medical stellt dem Patienten die gesetzlich erforderlichen Verbraucherinformationen rechtzeitig zur Verfügung, soweit diese im Einzelfall erforderlich sind.",
      "Soll eine Leistung auf ausdrücklichen Wunsch des Patienten vor Ablauf einer möglichen Widerrufsfrist beginnen, kann eine gesonderte Erklärung des Patienten erforderlich sein. Der Patient kann in diesem Fall aufgefordert werden, ausdrücklich zuzustimmen, dass Curamus Medical vor Ablauf der Widerrufsfrist mit der Leistung beginnt, und zu bestätigen, dass ihm bekannt ist, dass ein Widerrufsrecht bei vollständiger Vertragserfüllung unter den gesetzlichen Voraussetzungen erlöschen kann.",
      "Gesetzliche Widerrufsrechte und zwingende Verbraucherrechte bleiben unberührt.",
    ],
  },
  {
    titel: "§ 23 Barrierearme Kommunikation und digitale Zugänglichkeit",
    absaetze: [
      "Curamus Medical bemüht sich um eine möglichst verständliche, zugängliche und barrierearme Kommunikation. Die Webseite und digitalen Kontaktmöglichkeiten sollen klar strukturiert, gut lesbar und möglichst einfach bedienbar sein.",
      "Hierzu gehören insbesondere klare Überschriften, verständliche Texte, gut erkennbare Buttons, ausreichende Kontraste, Tastaturbedienbarkeit, sichtbare Fokuszustände, aussagekräftige Linktexte, Alternativtexte für relevante Bilder, verständliche Formularfelder, klare Fehlermeldungen und eine gut auffindbare Kontaktmöglichkeit.",
      "Patienten, die aufgrund körperlicher, sprachlicher, visueller, kognitiver oder technischer Einschränkungen Unterstützung benötigen, können Curamus Medical telefonisch oder per E-Mail kontaktieren. Curamus Medical bemüht sich, im Rahmen der organisatorischen Möglichkeiten eine geeignete Kommunikationsform zu finden.",
    ],
  },
  {
    titel: "§ 24 Änderungen und Ergänzungen",
    absaetze: [
      "Änderungen oder Ergänzungen individueller Vereinbarungen bedürfen mindestens der Textform, soweit gesetzlich nichts anderes vorgeschrieben ist.",
      "Individuelle Vereinbarungen zwischen Curamus Medical und dem Patienten haben Vorrang vor diesen AGB. Zwingende gesetzliche Rechte des Patienten bleiben unberührt.",
    ],
  },
  {
    titel: "§ 25 Anwendbares Recht und Gerichtsstand",
    absaetze: [
      "Es gilt das Recht der Bundesrepublik Deutschland. Es gelten die gesetzlichen Gerichtsstände.",
      "Soweit der Patient Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist, ist Gerichtsstand Nürnberg. Gegenüber Verbrauchern gilt ein besonderer Gerichtsstand nur, soweit dies gesetzlich zulässig ist. Zwingende gesetzliche Verbraucherrechte bleiben unberührt.",
    ],
  },
  {
    titel: "§ 26 Salvatorische Klausel",
    absaetze: [
      "Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen oder nicht einbezogenen Bestimmung treten die gesetzlichen Vorschriften. Gleiches gilt im Falle einer Regelungslücke.",
    ],
  },
];

export default function AgbPage() {
  return (
    <article className="card space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-800">Allgemeine Geschäftsbedingungen</h1>
        <p className="mt-1 text-navy-600/80">
          Curamus Medical – Mobile Physiotherapie, Training &amp; Prävention · Stand: 28.06.2026
        </p>
        <p className="mt-3 text-navy-700">
          Anbieter: Curamus Medical, Inhaber: Charles Mba, Ernst-Heinkel-Weg 3, 90411 Nürnberg<br />
          E-Mail: kontakt@curamus-medical.de · Telefon: +49 171 4234483 · Webseite:
          www.curamus-medical.de
        </p>
      </div>

      {paragraphen.map((p) => (
        <section key={p.titel}>
          <h2 className="text-lg font-bold text-navy-800">{p.titel}</h2>
          {p.absaetze.map((a, i) => (
            <p key={i} className="mt-2 text-navy-700">{a}</p>
          ))}
        </section>
      ))}

      <p className="rounded-lg bg-teal-50 px-4 py-3 text-navy-800">
        Hinweis für Verbraucher: Die{" "}
        <Link href="/widerruf" className="font-semibold text-teal-600 hover:underline">
          Widerrufsbelehrung mit Muster-Widerrufsformular
        </Link>{" "}
        finden Sie auf einer separaten Seite.
      </p>
    </article>
  );
}

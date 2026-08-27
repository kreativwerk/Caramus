# Projektplan Curamus Medical – Patienten-App

Stand: 19.08.2026 · Angebot angenommen, Umsetzung V1 begonnen.

## Erledigt (V1-Grundgerüst)

- [x] Supabase-Projekt „Curamus Medical" (`jiixpoyxctohzagldcel`, Frankfurt/eu-central-1, Free-Plan)
- [x] Datenbankschema mit Row Level Security (Patienten sehen nur eigene Daten) + Storage-Bucket für Übungsmedien
- [x] Next.js-App im Curamus-Design (Navy/Petrol, Poppins, Karten, Pill-Badges), responsiv, große Schrift (Zielgruppe 70+)
- [x] Login: E-Mail-Link ohne Passwort **und** klassisch mit Passwort (beides, wie im Fragebogen gewünscht)
- [x] Patientenbereich: Übersicht, Terminanfrage mit Wunschzeiten, Termine, Trainingsplan mit Abhaken + Schmerzskala + Notiz, Chat (Echtzeit), Profil mit Adresse
- [x] Praxisbereich: Tagesübersicht mit Tour, Anfragen bestätigen (Adresse wird übernommen, Fahrhinweis-Feld) / Alternative vorschlagen / ablehnen, Termine anlegen und abschließen, Patientenliste + Detail mit Plan-Editor und Rückmeldungen, Übungsbibliothek (6 Beispiel-Übungen angelegt), Chat mit Ungelesen-Zähler
- [x] Produktions-Build grün
- [x] Sicherheitscheck (Supabase Advisors) durchgeführt, Funktionsrechte eingeschränkt
- [x] Foto-/Video-Upload in der Übungsbibliothek (privater Speicher, signierte URLs, max. 45 MB)
- [x] Impressum + Datenschutzerklärung als Entwurf mit Platzhaltern, überall verlinkt
- [x] PWA: App-Icons + Manifest – „Zum Startbildschirm hinzufügen" auf dem Handy
- [x] Poppins-Schrift wird lokal eingebettet (kein Google-Fonts-Aufruf zur Laufzeit, DSGVO)
- [x] Deutsche E-Mail-Vorlagen (`docs/email-vorlagen.md`) und Deployment-Checkliste (`docs/deployment.md`)
- [x] Edge-Function-Gerüst für E-Mail-Benachrichtigung bei neuen Nachrichten (`supabase/functions/notify-message/`)
- [x] Rückmeldungs-Bereich für die Praxis: Tickets mit Screenshots, Stand und Antwort (`/praxis/feedback`) samt Abhol-Skript `scripts/tickets.js`

## Nächste Schritte (Reihenfolge empfohlen)

1. **Vercel-Deployment**: Repo verbinden, Env-Variablen aus `.env.example`, Domain `app.curamus-medical.de` als CNAME. Danach in Supabase (Auth → URL Configuration) Site-URL + Redirect-URL auf die Domain stellen, sonst funktionieren die E-Mail-Links nur lokal.
2. **Therapeuten-Konto** anlegen und per SQL auf `therapist` setzen (siehe README). Öffentliche Registrierung optional abschalten (Supabase Auth → „Allow new users to sign up"), sobald alle Patienten eingeladen sind.
3. **E-Mail-Absender**: Eigene SMTP-Domain in Supabase hinterlegen (z. B. mail@curamus-medical.de), damit Anmelde-Links nicht als Spam landen. E-Mail-Vorlagen auf Deutsch anpassen.
4. **Design-Feinschliff** anhand der finalen Figma-Screens (Screenshots liegen vor; Logo-Datei vom Kunden anfordern und `src/components/logo.tsx` ersetzen).
5. **Übungsinhalte**: Klären, ob Physiotec/Wibbi-Material verlinkt werden darf (Lizenz!). Alternativ eigene Fotos/Videos in den Storage-Bucket `exercise-media` laden (Upload-Maske in der Übungsbibliothek ergänzen, signierte URLs).
6. **Benachrichtigungen** (Fragebogen: E-Mail + Push): E-Mail bei neuer Nachricht/Anfrage über Supabase Edge Function, Versand per SMTP über das eigene Postfach – kein Drittanbieter; Web-Push als PWA-Ausbau.
7. **Google-Kalender-Abgleich** (fest zugesagt): Google Cloud OAuth einrichten, bestätigte Termine in den Kalender schreiben, Belegtzeiten beim Bestätigen anzeigen. Aufwandstreiber – als eigenes Arbeitspaket planen.
8. **DSGVO-Unterlagen**: AV-Verträge (Supabase, Vercel), Datenschutzerklärung + Impressum in die App, Verzeichnis der Verarbeitungstätigkeiten.

## Offene Punkte / Entscheidungen des Kunden

- Figma: nur Screenshots der Marketing-Website vorhanden – finale App-Screens oder Freigabe „nach Website-Design" bestätigen lassen.
- Physiotec/Wibbi-Nutzungsrechte (Kunde nutzt laut Fragebogen v. a. Bilder von dort).
- Logo-Dateien, Impressums- und Datenschutzangaben.
- Laufende Kosten aktuell 0 € (Free-Tier); vor Go-Live auf Supabase Pro (~25 $) + Vercel Pro (~20 $) upgraden.

## Zugangsdaten / Infrastruktur

- Supabase-Projekt: `jiixpoyxctohzagldcel` (Org „Kreativwerk Agentur", Region eu-central-1)
- Client-Konfiguration: `.env.example` (öffentliche Schlüssel, kein Geheimnis)
- Schema-Referenz: `supabase/migrations/0001_curamus_core_schema.sql`

## Rückmeldungen aus der Praxis (Tickets)

Charles meldet Fehler, Wünsche und Fragen direkt in der App unter
**Praxis → Rückmeldung**: Überschrift, Beschreibung, bis zu fünf Screenshots.
Die Bilder liegen im privaten Speicher `feedback-media` und sind nur mit
Anmeldung über eine signierte Adresse abrufbar.

Für die Bearbeitung mit Claude Code gibt es `scripts/tickets.js`:

```bash
TICKET_EMAIL=kontakt@curamus-medical.de TICKET_PASSWORT=… \
  node scripts/tickets.js holen        # offene Tickets + Screenshots nach ./tickets/
node scripts/tickets.js status <id> in_arbeit
node scripts/tickets.js antwort <id> "Ist behoben, bitte einmal ansehen."
```

`holen` schreibt `tickets/OFFEN.md` – eine Sitzung kann direkt damit anfangen.
Das Skript meldet sich mit dem Praxiskonto an, ein Service-Schlüssel ist nicht
nötig. Der Ordner `tickets/` bleibt aus dem Repo heraus.

Stand und Antwort sieht Charles sofort in der App. Er selbst kann eine Sache als
erledigt abhaken oder wieder öffnen, wenn sie erneut auftritt.

## Sprache der Meldungen

Alles, was Patientinnen, Patienten und das Praxisteam zu sehen bekommen, ist in
normaler Sprache geschrieben: keine Fehlernummern, keine Fachbegriffe wie
„Upload", „Server" oder „Session", und immer ein Hinweis, was jetzt zu tun ist.

- Bausteine und Regeln: `src/lib/meldungen.ts`
- Freundliche Hinweisseiten: `src/app/error.tsx` (Seite lädt nicht),
  `src/app/not-found.tsx` (Adresse gibt es nicht), `src/app/global-error.tsx`
  (letztes Auffangnetz, bringt eigene Farben mit)
- Technische Angaben landen ausschließlich in der Entwicklerkonsole
- Zwei Prüfungen im QA-Lauf achten darauf, dass keine Fachbegriffe durchrutschen

## Umsetzung Meeting-Protokoll vom 24.08.2026

| Protokollpunkt | Stand |
|---|---|
| Web-App statt Store-App (Kapitel 01/06) | ✅ von Anfang an webbasiert, responsiv; PWA-Installation optional möglich |
| A. Rezept/Verordnung übermitteln (Kapitel 03) | ✅ Upload im Dokumentenbereich **und** direkt an der Terminanfrage, mit Auswahl der Unterlagenart |
| B. Dokumentenbereich mit Status (Kapitel 03/04) | ✅ `/app/dokumente` (Patient) und `/praxis/dokumente` (strukturierter Eingang) mit Ablauf Eingegangen → In Prüfung → Weitergeleitet, dazu „Unvollständig" mit Hinweistext an den Patienten |
| C. Direkte Kommunikation | ✅ Chat je Patient, mit Rückfalllösung bei fehlender Echtzeitverbindung |
| D. Termine & Fortschritt | ✅ Terminanfrage/Bestätigung, Tagestour, Trainingsplan mit Rückmeldung |
| E. Video-/Therapieinhalte | ⏳ Charles klärt Rechte (Wibbi/Physiotec). App unterstützt heute eigene Uploads und externe Links; Einbettung des Anbieterportals ist der empfohlene Weg |
| Anfahrtsstatus ohne Live-Ortung (Kapitel 05) | ✅ Therapeut startet die Fahrt selbst und wählt die Fahrzeit; Patient sieht Countdown, Prognose-Hinweis, Phase „Ankunft in Kürze" und einen animierten Curamus-Van. Keine GPS-Position, keine Karte. Optional einmaliger Fahrzeit-Vorschlag mit Verkehrslage beim Losfahren (`FAHRZEIT_ANBIETER`), plus „Verspätung melden" in der Praxis-App |
| Login, Rollen, Zugriffsschutz (Kapitel 06) | ✅ getrennte Anmeldung Patient/Praxis, Rollenweiche, Zugriffsregeln auf Datenbankebene geprüft |
| Prototyp/Testzugang (Kapitel 07) | ✅ Zugang für Charles eingerichtet (`kontakt@curamus-medical.de`), QA-Konten für Testläufe |

### Offen aus dem Protokoll (nicht Aufgabe der App-Entwicklung)

- Abrechnungsstellen kontaktieren und Schnittstellen klären (Charles). Bis dahin bleibt der
  Ablauf „Weitergeleitet" ein manueller Übergabepunkt – die Vorarbeit (Zuordnung, Prüfstatus)
  ist in der App bereits erledigt.
- App-Store-/Google-Play-Badges im Webflow-Entwurf entfernen (Kapitel 01).
- Datenschutz-/Security-Konzept fachlich prüfen lassen; Datenschutzerklärung ist als Entwurf
  vorhanden.

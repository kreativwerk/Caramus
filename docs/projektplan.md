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

## Nächste Schritte (Reihenfolge empfohlen)

1. **Vercel-Deployment**: Repo verbinden, Env-Variablen aus `.env.example`, Domain `mein.curamus-medical.de` als CNAME. Danach in Supabase (Auth → URL Configuration) Site-URL + Redirect-URL auf die Domain stellen, sonst funktionieren die E-Mail-Links nur lokal.
2. **Therapeuten-Konto** anlegen und per SQL auf `therapist` setzen (siehe README). Öffentliche Registrierung optional abschalten (Supabase Auth → „Allow new users to sign up"), sobald alle Patienten eingeladen sind.
3. **E-Mail-Absender**: Eigene SMTP-Domain in Supabase hinterlegen (z. B. mail@curamus-medical.de), damit Anmelde-Links nicht als Spam landen. E-Mail-Vorlagen auf Deutsch anpassen.
4. **Design-Feinschliff** anhand der finalen Figma-Screens (Screenshots liegen vor; Logo-Datei vom Kunden anfordern und `src/components/logo.tsx` ersetzen).
5. **Übungsinhalte**: Klären, ob Physiotec/Wibbi-Material verlinkt werden darf (Lizenz!). Alternativ eigene Fotos/Videos in den Storage-Bucket `exercise-media` laden (Upload-Maske in der Übungsbibliothek ergänzen, signierte URLs).
6. **Benachrichtigungen** (Fragebogen: E-Mail + Push): E-Mail bei neuer Nachricht/Anfrage über Supabase Edge Function + Resend; Web-Push als PWA-Ausbau.
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

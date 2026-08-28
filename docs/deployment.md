# Deployment-Checkliste – app.curamus-medical.de

Reihenfolge einhalten; Punkte mit 👤 brauchen Zugänge/Entscheidungen des Kunden oder der Agentur.

## 1. Vercel einrichten

1. 👤 Vercel-Konto der Agentur → „Add New Project" → GitHub-Repo `kreativwerk/Caramus` importieren
   (Branch `claude/physio-app-development-cw6ant` mergen oder als Production-Branch wählen).
2. Framework „Next.js" wird automatisch erkannt, Root Directory = Repo-Root, keine Sondereinstellungen.
3. Environment Variables (aus `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jiixpoyxctohzagldcel.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_13ckYlrXxzhgICMDH-Rkrg_WG7m2Sv6`
4. **Region auf Frankfurt stellen** – Settings → Functions → Region = `fra1`.
   `vercel.json` gibt das bereits vor; im Dashboard bitte gegenprüfen. Steht die
   App in den USA (Standard `iad1`), geht jeder Seitenaufruf mehrfach über den
   Atlantik: spürbar langsam, und Patientendaten würden auf US-Servern
   verarbeitet. Prüfen lässt sich das an der Antwort des Servers – im Kopf
   `x-vercel-id` muss `fra1` stehen:

   ```bash
   curl -sI https://app.curamus-medical.de/login | grep x-vercel-id
   ```
5. Optional (Fahrzeit mit Verkehrslage, siehe Abschnitt „Fahrzeit-Berechnung"):
   - `FAHRZEIT_ANBIETER` = `here` (oder `google` / `openrouteservice`)
   - `FAHRZEIT_SCHLUESSEL` = API-Schlüssel des Anbieters
   Ohne diese beiden Variablen läuft die App vollständig – Charles wählt die Fahrzeit dann selbst.
6. Deploy ausführen → Vorschau-URL testen (Login-Seite muss erscheinen).

## 2. Domain verbinden

1. In Vercel: Project → Settings → Domains → `app.curamus-medical.de` hinzufügen.
2. 👤 Beim Domain-Anbieter von curamus-medical.de einen CNAME-Eintrag setzen:
   `mein` → `cname.vercel-dns.com` (Vercel zeigt den exakten Wert an).
3. Warten bis Zertifikat aktiv (automatisch), dann `https://app.curamus-medical.de` testen.

## 3. Supabase auf die Domain umstellen

Dashboard Projekt `jiixpoyxctohzagldcel`:

1. **Authentication → URL Configuration**: Site URL `https://app.curamus-medical.de`,
   Redirect URL `https://app.curamus-medical.de/auth/callback` hinzufügen.
2. **Authentication → Emails**: deutsche Vorlagen aus `docs/email-vorlagen.md` einfügen.
3. 👤 Eigenes Postfach als Absender hinterlegen – siehe Abschnitt
   „E-Mail-Versand über das eigene Postfach". Ohne diesen Schritt stellt Supabase
   nur an Adressen der eigenen Organisation zu, Patienten bekommen also nichts.

## 4. Therapeuten-Konto

1. 👤 Kunde registriert sich unter `https://app.curamus-medical.de/registrieren`.
2. SQL-Editor im Supabase-Dashboard:
   ```sql
   update public.profiles set role = 'therapist'
   where id = (select id from auth.users where email = 'KUNDEN@EMAIL.DE');
   ```
3. Kunde meldet sich neu an → landet automatisch im Praxisbereich `/praxis`.

## 5. Probelauf (Ende-zu-Ende)

- [ ] Test-Patient registrieren (zweite E-Mail-Adresse), Adresse im Profil hinterlegen
- [ ] Terminanfrage stellen → im Praxisbereich bestätigen → erscheint beim Patienten
- [ ] Übung mit Foto/Video hochladen → Trainingsplan zusammenstellen → beim Patienten prüfen
- [ ] Rückmeldung mit Schmerzskala abgeben → im Patientendetail sichtbar
- [ ] Chat in beide Richtungen, auf Handy und Desktop
- [ ] „Zum Startbildschirm hinzufügen" auf iPhone/Android testen (PWA-Icon erscheint)

## 6. Vor dem echten Patientenbetrieb

- [ ] Impressum und Datenschutzerklärung: Platzhalter in
      `src/app/(recht)/impressum/page.tsx` und `src/app/(recht)/datenschutz/page.tsx` füllen,
      juristisch prüfen lassen
- [ ] 👤 AV-Verträge abschließen: Supabase (Dashboard → Legal Documents / DPA) und Vercel (DPA)
- [ ] Öffentliche Registrierung abschalten, sobald alle Patienten angelegt sind
      (Supabase → Authentication → Sign In / Up → „Allow new users to sign up" aus)
- [ ] Upgrade auf Supabase Pro (~25 $/Monat: tägliche Backups, kein Auto-Pausieren)
      und Vercel Pro (~20 $/Monat, kommerzielle Nutzung)
- [ ] Benachrichtigungs-Funktion aktivieren: `supabase/functions/notify-message/` deployen,
      SMTP-Secrets setzen, Database-Webhook auf `messages` INSERT anlegen (siehe „E-Mail-Versand")

## E-Mail-Versand über das eigene Postfach

Kein Drittanbieter nötig: Supabase versendet über jeden SMTP-Server. Die Domain
curamus-medical.de liegt bei All-Inkl (Mailserver `w021b7b7.kasserver.com`), das
eigene Postfach genügt also.

**1. Postfach vorbereiten (👤 in der KAS-Verwaltung von All-Inkl)**

- Eigenes Postfach für die App anlegen, z. B. `app@curamus-medical.de` – nicht das
  Postfach verwenden, das Charles täglich liest. Grund: Das Passwort wird bei
  Supabase hinterlegt, und ein eigenes Postfach lässt sich jederzeit tauschen,
  ohne dass der Posteingang der Praxis betroffen ist.
- DKIM für die Domain einschalten. Aktuell zeigt der Eintrag
  `default._domainkey.curamus-medical.de` auf einen Namen ohne Schlüssel –
  die Signatur greift also nicht. SPF (`include:spf.kasserver.com`) und DMARC
  (`p=none`) sind bereits gesetzt.
- Sendelimit des Tarifs erfragen (Mails pro Stunde/Tag) und im Blick behalten.

**2. In Supabase eintragen** (Dashboard → Authentication → Emails → SMTP Settings):

| Feld | Wert |
|---|---|
| Host | `w021b7b7.kasserver.com` |
| Port | `465` (SSL) oder `587` (STARTTLS) |
| Username | die vollständige Adresse, z. B. `app@curamus-medical.de` |
| Password | Passwort dieses Postfachs |
| Sender email | dieselbe Adresse (All-Inkl versendet nur unter dem angemeldeten Postfach) |
| Sender name | Curamus Medical |

Danach unter Authentication → Rate Limits das Kontingent anheben: Mit eigenem
SMTP liegt die Voreinstellung bei 30 neuen Nutzern pro Stunde.

**3. Vorlagen hinterlegen** – die deutschen Texte stehen in `docs/email-vorlagen.md`
(Authentication → Emails → Templates).

**4. Chat-Benachrichtigung** – `supabase/functions/notify-message/` ist
deployt (Stand 27.08.2026) und versendet per SMTP (denomailer). Es fehlen noch:

- 👤 Secrets unter Edge Functions → Secrets: `SMTP_HOST` = `w021b7b7.kasserver.com`,
  `SMTP_PORT` = `465`, `SMTP_USER` und `NOTIFY_FROM` = `kontakt@curamus-medical.de`,
  `SMTP_PASS` = Postfach-Passwort, `APP_URL` = `https://app.curamus-medical.de`
- 👤 Database → Webhooks: Tabelle `public.messages`, Ereignis INSERT,
  Ziel = die Funktion `notify-message`

Schlägt der Versand fehl, bleibt die Nachricht selbst davon unberührt – sie
steht ohnehin sofort in der App.

**5. Probelauf** – Registrierung mit einer echten Adresse, Anmelde-Link,
Passwort zurücksetzen, Chat-Benachrichtigung. Danach im Postfach prüfen, ob die
Mails im Posteingang und nicht im Spam landen.

## Terminbuchung einrichten

Unter **Praxis → Verfügbarkeit** stellt Charles alles selbst ein:

- Sprechzeiten je Wochentag (voreingestellt Mo–Fr 8–18 Uhr, Sa 9–14 Uhr)
- Dauer eines Termins, Fahrzeit zwischen zwei Hausbesuchen
- Wie kurzfristig gebucht werden darf und wie weit im Voraus
- Urlaub und einzelne freie Stunden
- Ob Buchungen sofort gelten oder er sie erst bestätigt

Die freien Zeiten berechnet die Datenbank (`freie_termine`) aus diesen Angaben
und den bereits vergebenen Terminen. Patientinnen und Patienten sehen dadurch
nur Zeiten, die wirklich buchbar sind – ohne die Termine anderer einsehen zu
können. Gebucht wird über `termin_buchen`, das den Platz im selben Aufruf noch
einmal prüft; zwei Personen können denselben Platz also nicht gleichzeitig
nehmen.

Alle Zeiten laufen in `Europe/Berlin`, unabhängig davon, wie das Gerät der
Patientin oder des Patienten eingestellt ist.

## Beispielübungen

Die Bibliothek enthält drei illustrierte Beispiele aus dem Otago-Übungsprogramm
(Sturzprävention im häuslichen Umfeld): Aufstehen vom Stuhl, Wadenheben im
Stand, Einbeinstand am Tresen. Die Bilder wurden für dieses Projekt erzeugt und
sind rechtefrei nutzbar – sie sind als Platzhalter gedacht, bis Charles eigene
Aufnahmen macht. Die Anleitungen sind fachlich üblich, sollten von ihm aber vor
dem Einsatz gegengelesen werden.

## Einladungen aus der Praxis

Unter **Praxis → Patienten** legt Charles Zugänge an: per E-Mail (Supabase
verschickt die Einladung über das eigene Postfach) oder als Link zum Weitergeben,
etwa direkt beim Hausbesuch. Beides braucht `SUPABASE_SERVICE_ROLE_KEY` in
Vercel – ohne den Schlüssel steht dort ein Hinweis und die Selbstregistrierung
bleibt der Weg.

Die eingeladene Person landet nach dem Klick auf `/passwort-neu` und vergibt ihr
Passwort selbst. Der Einladungslink gilt 24 Stunden.

Vorlage dafür: **Authentication → Emails → Invite user**, Text in
`docs/email-vorlagen.md`.

## Benachrichtigungen aufs Handy (Web Push)

Ein kurzer Hinweis auf dem Sperrbildschirm, wenn eine Nachricht ankommt, ein
Termin bestätigt wird, die Anfahrt startet oder sich verspätet. Ein- und
ausschalten kann das jede und jeder selbst im Profil, pro Gerät.

Einrichtung in Vercel (Environment Variables):

1. Schlüsselpaar erzeugen: `npx web-push generate-vapid-keys`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = der öffentliche Schlüssel
   - `VAPID_PRIVATE_KEY` = der private Schlüssel (geheim halten)
   - `VAPID_SUBJECT` = `mailto:kontakt@curamus-medical.de`
2. `SUPABASE_SERVICE_ROLE_KEY` aus dem Supabase-Dashboard (Settings → API).
   Nur damit kann der Server die Geräte des Empfängers nachschlagen. Dieser
   Schlüssel gehört ausschließlich in die Server-Variablen, niemals in eine
   Variable mit `NEXT_PUBLIC_`.

Fehlt eine dieser Angaben, wird still nichts versendet – die App läuft normal
weiter und zeigt alles Neue wie bisher beim nächsten Öffnen.

**iPhone:** Apple erlaubt Benachrichtigungen nur, wenn die App vorher über
„Teilen → Zum Home-Bildschirm" abgelegt wurde. Solange das nicht passiert ist,
zeigt das Profil dort die Anleitung statt eines Schalters. Auf Android und am
Computer geht es sofort.

Datenschutz: In der Benachrichtigung steht nie der Inhalt einer Nachricht,
sondern nur, dass es etwas Neues gibt – auf einem gesperrten Bildschirm hat
Gesundheitliches nichts zu suchen.

## Fahrzeit-Berechnung (optional, jederzeit nachrüstbar)

Standard ohne Konfiguration: Charles tippt beim Losfahren auf „Bin unterwegs" und wählt
15/20/30/45 Minuten oder gibt eine eigene Zahl ein. Das funktioniert immer und kostet nichts.

Mit hinterlegtem Anbieter kommt zusätzlich ein Vorschlag „Mit aktueller Verkehrslage berechnet".
Wichtig: Es wird **einmalig beim Losfahren** gerechnet, keine laufende Überwachung, kein
Standort-Tracking während der Fahrt. Verzögert sich etwas, meldet Charles das über
„Verspätung melden" (+5/+10/+15 Min. oder freie Eingabe mit optionalem Grund).

Einrichtung:

1. 👤 Konto beim Anbieter anlegen und API-Schlüssel erzeugen
   (empfohlen: HERE Routing v8 – EU-Anbieter, Echtzeitverkehr, im erwarteten Volumen kostenfrei).
2. In Vercel `FAHRZEIT_ANBIETER` und `FAHRZEIT_SCHLUESSEL` setzen, neu deployen.
3. 👤 Auftragsverarbeitungsvertrag (AVV) des Anbieters abschließen und in der
   Datenschutzerklärung als Empfänger ergänzen – übertragen wird nur die Zieladresse.

Sicherheitsnetz im Code (`src/lib/fahrzeit.ts`):

- 4 Sekunden Zeitlimit pro Abfrage, danach wird ohne Vorschlag weitergearbeitet
- unplausible Werte (< 1 oder > 240 Minuten) werden verworfen
- jeder Fehler (Kontingent aufgebraucht, Schlüssel falsch, Anbieter offline) endet still –
  angezeigt wird dann einfach die manuelle Auswahl
- Adresse wird nur einmal in Koordinaten übersetzt und im Profil zwischengespeichert

## Phase 2 (nach Go-Live, eigenes Arbeitspaket)

- Google-Kalender-Abgleich (OAuth in Google Cloud Console, Termine schreiben/Belegtzeiten lesen)
- Web-Push-Benachrichtigungen (PWA-Ausbau)
- Physiotec/Wibbi-Inhalte, sobald Nutzungsrechte geklärt sind

## Vorführseite für die Live-Anfahrt

`https://app.curamus-medical.de/vorschau/anfahrt`

Öffentlich erreichbar, ohne Anmeldung, nicht verlinkt und für Suchmaschinen
gesperrt (`robots: noindex`). Zeigt dieselbe Anzeige wie beim Patienten, aber
mit erfundenen Zeiten – gedacht, um die Live-Anfahrt jemandem zu zeigen, ohne
einen echten Termin anzulegen.

Sechs Momente per Klick: gerade losgefahren, halbe Strecke, Verspätung
gemeldet, kurz vor der Tür, angekommen, und ein Zeitraffer mit zwei Minuten
Fahrzeit, in dem man den Wagen wirklich fahren sieht.

Die Seite liest und schreibt nichts: `AnfahrtLive` bekommt `livedaten={false}`
und lässt die Echtzeitverbindung zur Datenbank dann aus.

## QA-Testkonten (nach Abnahme löschen!)

Für Tests wurden zwei Konten mit bestätigter E-Mail angelegt (Passwort jeweils `QaTest!2026`):

- `qa-patient@curamus-test.de` (Patientenansicht)
- `qa-therapeut@curamus-test.de` (Praxisansicht)

Vor dem echten Patientenbetrieb im Supabase-Dashboard (Authentication → Users) löschen
oder per SQL: `delete from auth.users where email like 'qa-%@curamus-test.de';`

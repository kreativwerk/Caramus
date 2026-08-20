# Deployment-Checkliste – mein.curamus-medical.de

Reihenfolge einhalten; Punkte mit 👤 brauchen Zugänge/Entscheidungen des Kunden oder der Agentur.

## 1. Vercel einrichten

1. 👤 Vercel-Konto der Agentur → „Add New Project" → GitHub-Repo `kreativwerk/Caramus` importieren
   (Branch `claude/physio-app-development-cw6ant` mergen oder als Production-Branch wählen).
2. Framework „Next.js" wird automatisch erkannt, Root Directory = Repo-Root, keine Sondereinstellungen.
3. Environment Variables (aus `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jiixpoyxctohzagldcel.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_13ckYlrXxzhgICMDH-Rkrg_WG7m2Sv6`
4. Deploy ausführen → Vorschau-URL testen (Login-Seite muss erscheinen).

## 2. Domain verbinden

1. In Vercel: Project → Settings → Domains → `mein.curamus-medical.de` hinzufügen.
2. 👤 Beim Domain-Anbieter von curamus-medical.de einen CNAME-Eintrag setzen:
   `mein` → `cname.vercel-dns.com` (Vercel zeigt den exakten Wert an).
3. Warten bis Zertifikat aktiv (automatisch), dann `https://mein.curamus-medical.de` testen.

## 3. Supabase auf die Domain umstellen

Dashboard Projekt `jiixpoyxctohzagldcel`:

1. **Authentication → URL Configuration**: Site URL `https://mein.curamus-medical.de`,
   Redirect URL `https://mein.curamus-medical.de/auth/callback` hinzufügen.
2. **Authentication → Emails**: deutsche Vorlagen aus `docs/email-vorlagen.md` einfügen.
3. 👤 Eigenen SMTP-Absender hinterlegen (siehe `docs/email-vorlagen.md`, sonst greift das
   niedrige Standard-Versandlimit von Supabase).

## 4. Therapeuten-Konto

1. 👤 Kunde registriert sich unter `https://mein.curamus-medical.de/registrieren`.
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
      Secrets setzen (Resend-API-Key), Database-Webhook auf `messages` INSERT anlegen

## Phase 2 (nach Go-Live, eigenes Arbeitspaket)

- Google-Kalender-Abgleich (OAuth in Google Cloud Console, Termine schreiben/Belegtzeiten lesen)
- Web-Push-Benachrichtigungen (PWA-Ausbau)
- Physiotec/Wibbi-Inhalte, sobald Nutzungsrechte geklärt sind

## QA-Testkonten (nach Abnahme löschen!)

Für Tests wurden zwei Konten mit bestätigter E-Mail angelegt (Passwort jeweils `QaTest!2026`):

- `qa-patient@curamus-test.de` (Patientenansicht)
- `qa-therapeut@curamus-test.de` (Praxisansicht)

Vor dem echten Patientenbetrieb im Supabase-Dashboard (Authentication → Users) löschen
oder per SQL: `delete from auth.users where email like 'qa-%@curamus-test.de';`

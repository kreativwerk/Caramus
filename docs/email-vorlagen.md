# Deutsche E-Mail-Vorlagen für Supabase Auth

Einzutragen im Supabase-Dashboard unter **Authentication → Emails → Templates**
(Projekt `jiixpoyxctohzagldcel`). Betreffzeilen jeweils darüber angegeben.

Vorher unter **Authentication → URL Configuration**:
- Site URL: `https://mein.curamus-medical.de`
- Redirect URLs: `https://mein.curamus-medical.de/auth/callback`

## Magic Link (Anmelde-Link)

**Betreff:** Ihr Anmelde-Link für Curamus Medical

```html
<h2>Guten Tag,</h2>
<p>mit einem Klick auf den folgenden Knopf melden Sie sich sicher in Ihrem
persönlichen Bereich bei Curamus Medical an:</p>
<p><a href="{{ .ConfirmationURL }}"
  style="display:inline-block;background:#2fb5b3;color:#ffffff;padding:12px 24px;
  border-radius:8px;text-decoration:none;font-weight:bold">Jetzt anmelden</a></p>
<p>Der Link ist eine Stunde gültig und kann nur einmal verwendet werden.
Falls Sie diese E-Mail nicht angefordert haben, können Sie sie einfach ignorieren.</p>
<p>Herzliche Grüße<br>Ihr Team von Curamus Medical</p>
```

## Confirm signup (Registrierung bestätigen)

**Betreff:** Bitte bestätigen Sie Ihre E-Mail-Adresse

```html
<h2>Willkommen bei Curamus Medical!</h2>
<p>Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihren Zugang zu aktivieren:</p>
<p><a href="{{ .ConfirmationURL }}"
  style="display:inline-block;background:#2fb5b3;color:#ffffff;padding:12px 24px;
  border-radius:8px;text-decoration:none;font-weight:bold">E-Mail-Adresse bestätigen</a></p>
<p>Danach können Sie sich jederzeit anmelden – wahlweise mit Passwort oder
bequem per Anmelde-Link.</p>
<p>Herzliche Grüße<br>Ihr Team von Curamus Medical</p>
```

## Reset password (Passwort zurücksetzen)

**Betreff:** Neues Passwort für Curamus Medical festlegen

```html
<h2>Guten Tag,</h2>
<p>Sie möchten Ihr Passwort neu festlegen? Klicken Sie dazu hier:</p>
<p><a href="{{ .ConfirmationURL }}"
  style="display:inline-block;background:#2fb5b3;color:#ffffff;padding:12px 24px;
  border-radius:8px;text-decoration:none;font-weight:bold">Neues Passwort festlegen</a></p>
<p>Tipp: Sie können sich auch ganz ohne Passwort anmelden – wählen Sie auf der
Anmeldeseite einfach „Ohne Passwort“.</p>
<p>Falls Sie das nicht angefordert haben, ignorieren Sie diese E-Mail bitte.</p>
<p>Herzliche Grüße<br>Ihr Team von Curamus Medical</p>
```

## Eigener Absender (empfohlen vor Go-Live)

Standardmäßig versendet Supabase über eine allgemeine Absenderadresse mit
niedrigem Stundenlimit. Unter **Authentication → Emails → SMTP Settings** eigenen
SMTP-Server hinterlegen (z. B. Resend, Postmark oder der Mailserver der Domain), Absender
`mail@curamus-medical.de`. Dafür beim Domain-Anbieter SPF/DKIM-Einträge setzen.

# E-Mail-Vorlagen für Supabase

Einzutragen unter **Authentication → Emails**. Für jede Vorlage den Betreff in
das Feld „Subject" und den HTML-Block in das Feld darunter kopieren.

Alle Vorlagen teilen sich dasselbe Gerüst: Navy-Kopf mit Wortmarke, weiße Karte,
ein Petrol-Knopf, darunter die Adresse zum Kopieren (manche Mailprogramme
zeigen keine Knöpfe), Fußzeile mit Notfallhinweis, Impressum und Datenschutz.

Technisch bewusst schlicht gehalten: Tabellen statt moderner Layouts, alle
Farben direkt am Element. Nur so sieht es auch in Outlook, GMX und Web.de
richtig aus. Umlaute stehen als HTML-Zeichen, damit nichts verrutscht.

Die Platzhalter in doppelten geschweiften Klammern füllt Supabase beim Versand.

## Confirm sign up

**Betreff:** Bitte best&auml;tigen Sie Ihre E-Mail-Adresse

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="background:#1f315b;padding:24px 32px">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px">CURAMUS</span>
          <span style="color:#34b8be;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">&nbsp;Medical</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1f315b">Willkommen bei Curamus Medical</h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3c4a6b">Sch&ouml;n, dass Sie da sind. Bitte best&auml;tigen Sie einmal Ihre E-Mail-Adresse &ndash; danach steht Ihnen Ihr pers&ouml;nlicher Bereich offen: Termine anfragen, Trainingsplan ansehen und Nachrichten an Ihre Praxis schreiben.</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#34b8be">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">E-Mail-Adresse best&auml;tigen</a>
          </td></tr></table>
          <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b7796">Falls der Knopf nicht funktioniert, kopieren Sie diese Adresse in Ihren Browser:<br><span style="word-break:break-all;color:#10568e">{{ .ConfirmationURL }}</span></p>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b7796">Der Link gilt eine Stunde. Falls Sie sich nicht angemeldet haben, k&ouml;nnen Sie diese E-Mail einfach l&ouml;schen.</p>
          <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#3c4a6b">Herzliche Gr&uuml;&szlig;e<br>Ihr Team von Curamus Medical</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f4f6fa;padding:20px 32px">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7796">
            Curamus Medical &middot; Charles Obinna Mba &middot; N&uuml;rnberg<br>
            Kein Notfallkanal &ndash; w&auml;hlen Sie bei medizinischen Notf&auml;llen die 112.<br>
            <a href="https://app.curamus-medical.de/impressum" style="color:#10568e">Impressum</a> &middot;
            <a href="https://app.curamus-medical.de/datenschutz" style="color:#10568e">Datenschutz</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
```

## Invite user

**Betreff:** Ihr Zugang zu Curamus Medical

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="background:#1f315b;padding:24px 32px">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px">CURAMUS</span>
          <span style="color:#34b8be;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">&nbsp;Medical</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1f315b">Ihre Praxis hat einen Zugang f&uuml;r Sie eingerichtet</h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3c4a6b">&Uuml;ber Ihren pers&ouml;nlichen Bereich sehen Sie Ihre Termine, Ihren Trainingsplan mit Video-Anleitungen und k&ouml;nnen direkt Nachrichten an Ihre Praxis schreiben. Beim ersten &Ouml;ffnen vergeben Sie Ihr eigenes Passwort.</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#34b8be">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">Zugang einrichten</a>
          </td></tr></table>
          <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b7796">Falls der Knopf nicht funktioniert, kopieren Sie diese Adresse in Ihren Browser:<br><span style="word-break:break-all;color:#10568e">{{ .ConfirmationURL }}</span></p>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b7796">Der Link gilt 24 Stunden. Sie brauchen nichts zu installieren &ndash; die Seite l&auml;uft im Browser, auf dem Handy genauso wie am Computer.</p>
          <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#3c4a6b">Herzliche Gr&uuml;&szlig;e<br>Ihr Team von Curamus Medical</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f4f6fa;padding:20px 32px">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7796">
            Curamus Medical &middot; Charles Obinna Mba &middot; N&uuml;rnberg<br>
            Kein Notfallkanal &ndash; w&auml;hlen Sie bei medizinischen Notf&auml;llen die 112.<br>
            <a href="https://app.curamus-medical.de/impressum" style="color:#10568e">Impressum</a> &middot;
            <a href="https://app.curamus-medical.de/datenschutz" style="color:#10568e">Datenschutz</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
```

## Magic link or OTP

**Betreff:** Ihr Anmelde-Link f&uuml;r Curamus Medical

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="background:#1f315b;padding:24px 32px">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px">CURAMUS</span>
          <span style="color:#34b8be;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">&nbsp;Medical</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1f315b">Hier ist Ihr Anmelde-Link</h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3c4a6b">Tippen Sie auf den Knopf, dann sind Sie angemeldet &ndash; ganz ohne Passwort.</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#34b8be">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">Jetzt anmelden</a>
          </td></tr></table>
          <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b7796">Falls der Knopf nicht funktioniert, kopieren Sie diese Adresse in Ihren Browser:<br><span style="word-break:break-all;color:#10568e">{{ .ConfirmationURL }}</span></p>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b7796">Der Link gilt eine Stunde und funktioniert nur einmal. Falls Sie ihn nicht angefordert haben, k&ouml;nnen Sie diese E-Mail einfach l&ouml;schen.</p>
          <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#3c4a6b">Herzliche Gr&uuml;&szlig;e<br>Ihr Team von Curamus Medical</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f4f6fa;padding:20px 32px">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7796">
            Curamus Medical &middot; Charles Obinna Mba &middot; N&uuml;rnberg<br>
            Kein Notfallkanal &ndash; w&auml;hlen Sie bei medizinischen Notf&auml;llen die 112.<br>
            <a href="https://app.curamus-medical.de/impressum" style="color:#10568e">Impressum</a> &middot;
            <a href="https://app.curamus-medical.de/datenschutz" style="color:#10568e">Datenschutz</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
```

## Change email address

**Betreff:** Bitte best&auml;tigen Sie Ihre neue E-Mail-Adresse

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="background:#1f315b;padding:24px 32px">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px">CURAMUS</span>
          <span style="color:#34b8be;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">&nbsp;Medical</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1f315b">Neue E-Mail-Adresse best&auml;tigen</h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3c4a6b">Sie m&ouml;chten k&uuml;nftig eine andere Adresse verwenden. Bitte best&auml;tigen Sie sie einmal &ndash; danach gilt sie f&uuml;r Anmeldung und Benachrichtigungen.</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#34b8be">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">Neue Adresse best&auml;tigen</a>
          </td></tr></table>
          <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b7796">Falls der Knopf nicht funktioniert, kopieren Sie diese Adresse in Ihren Browser:<br><span style="word-break:break-all;color:#10568e">{{ .ConfirmationURL }}</span></p>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b7796">Der Link gilt eine Stunde. Haben Sie das nicht veranlasst, wenden Sie sich bitte an Ihre Praxis.</p>
          <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#3c4a6b">Herzliche Gr&uuml;&szlig;e<br>Ihr Team von Curamus Medical</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f4f6fa;padding:20px 32px">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7796">
            Curamus Medical &middot; Charles Obinna Mba &middot; N&uuml;rnberg<br>
            Kein Notfallkanal &ndash; w&auml;hlen Sie bei medizinischen Notf&auml;llen die 112.<br>
            <a href="https://app.curamus-medical.de/impressum" style="color:#10568e">Impressum</a> &middot;
            <a href="https://app.curamus-medical.de/datenschutz" style="color:#10568e">Datenschutz</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
```

## Reset password

**Betreff:** Neues Passwort f&uuml;r Curamus Medical

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="background:#1f315b;padding:24px 32px">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px">CURAMUS</span>
          <span style="color:#34b8be;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">&nbsp;Medical</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1f315b">Neues Passwort vergeben</h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3c4a6b">Kein Problem, das passiert. Tippen Sie auf den Knopf, dann k&ouml;nnen Sie sich ein neues Passwort aussuchen.</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#34b8be">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">Neues Passwort vergeben</a>
          </td></tr></table>
          <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b7796">Falls der Knopf nicht funktioniert, kopieren Sie diese Adresse in Ihren Browser:<br><span style="word-break:break-all;color:#10568e">{{ .ConfirmationURL }}</span></p>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b7796">Der Link gilt eine Stunde. Haben Sie das nicht angefordert, k&ouml;nnen Sie diese E-Mail l&ouml;schen &ndash; Ihr bisheriges Passwort bleibt dann unver&auml;ndert. &Uuml;brigens: Sie k&ouml;nnen sich auch ganz ohne Passwort anmelden, &uuml;ber einen Link per E-Mail.</p>
          <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#3c4a6b">Herzliche Gr&uuml;&szlig;e<br>Ihr Team von Curamus Medical</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f4f6fa;padding:20px 32px">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7796">
            Curamus Medical &middot; Charles Obinna Mba &middot; N&uuml;rnberg<br>
            Kein Notfallkanal &ndash; w&auml;hlen Sie bei medizinischen Notf&auml;llen die 112.<br>
            <a href="https://app.curamus-medical.de/impressum" style="color:#10568e">Impressum</a> &middot;
            <a href="https://app.curamus-medical.de/datenschutz" style="color:#10568e">Datenschutz</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
```

## Reauthentication

**Betreff:** Ihr Best&auml;tigungscode

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="background:#1f315b;padding:24px 32px">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px">CURAMUS</span>
          <span style="color:#34b8be;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">&nbsp;Medical</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1f315b">Ihr Best&auml;tigungscode</h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3c4a6b">Bitte geben Sie diesen Code in der App ein:</p>
          <p style="margin:0;padding:18px 24px;background:#f4f6fa;border-radius:12px;text-align:center;font-size:30px;font-weight:700;letter-spacing:6px;color:#1f315b">{{ .Token }}</p>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b7796">Der Code gilt eine Stunde. Geben Sie ihn niemals an andere weiter &ndash; auch nicht an uns.</p>
          <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#3c4a6b">Herzliche Gr&uuml;&szlig;e<br>Ihr Team von Curamus Medical</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f4f6fa;padding:20px 32px">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7796">
            Curamus Medical &middot; Charles Obinna Mba &middot; N&uuml;rnberg<br>
            Kein Notfallkanal &ndash; w&auml;hlen Sie bei medizinischen Notf&auml;llen die 112.<br>
            <a href="https://app.curamus-medical.de/impressum" style="color:#10568e">Impressum</a> &middot;
            <a href="https://app.curamus-medical.de/datenschutz" style="color:#10568e">Datenschutz</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
```

## Security-Vorlagen (optional)

Unter **Authentication → Emails → Security** lassen sich zusätzlich Hinweise
einschalten, etwa „Password changed". Für eine Praxis mit Gesundheitsdaten ist
mindestens **Password changed** und **Email address changed** sinnvoll: Wer eine
solche Mail bekommt, ohne es selbst veranlasst zu haben, merkt sofort, dass
etwas nicht stimmt. Vorlage nach demselben Muster:

**Betreff:** Ihr Passwort wurde geändert

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr>
        <td style="background:#1f315b;padding:24px 32px">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px">CURAMUS</span>
          <span style="color:#34b8be;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">&nbsp;Medical</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1f315b">Ihr Passwort wurde ge&auml;ndert</h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3c4a6b">Wir haben soeben ein neues Passwort f&uuml;r Ihren Zugang gespeichert. Wenn Sie das selbst waren, ist alles in Ordnung und Sie brauchen nichts zu tun.</p>
          <p style="margin:0;padding:16px 20px;background:#fff7ed;border-radius:12px;font-size:15px;line-height:1.6;color:#7c4a10">Waren Sie das <strong>nicht</strong>? Dann melden Sie sich bitte umgehend bei Ihrer Praxis.</p>
          <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#3c4a6b">Herzliche Gr&uuml;&szlig;e<br>Ihr Team von Curamus Medical</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f4f6fa;padding:20px 32px">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7796">
            Curamus Medical &middot; Charles Obinna Mba &middot; N&uuml;rnberg<br>
            Kein Notfallkanal &ndash; w&auml;hlen Sie bei medizinischen Notf&auml;llen die 112.<br>
            <a href="https://app.curamus-medical.de/impressum" style="color:#10568e">Impressum</a> &middot;
            <a href="https://app.curamus-medical.de/datenschutz" style="color:#10568e">Datenschutz</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
```

## Eigener Absender

Steht bereits: SMTP über das Postfach `kontakt@curamus-medical.de` bei All-Inkl,
Einrichtung siehe `docs/deployment.md`.

# Curamus Medical – Patienten-App

Webapp für die mobile Physiotherapie-Praxis Curamus Medical (`app.curamus-medical.de`):
Terminanfragen für Hausbesuche, persönliche Trainingspläne mit Übungen und Rückmeldung,
Chat zwischen Patient und Therapeut. Responsiv für Handy, Tablet und Desktop,
seniorenfreundliche Bedienung.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS 4**
- **Supabase** (Postgres, Auth, Realtime, Storage) – Projekt `jiixpoyxctohzagldcel`, Region `eu-central-1` (Frankfurt)
- Design nach der Curamus-Medical-Website (Navy `#0c1f3f`, Petrol `#2fb5b3`, Poppins)

## Lokale Entwicklung

```bash
npm install
cp .env.example .env.local   # Werte sind bereits eingetragen (öffentliche Client-Schlüssel)
npm run dev
```

## Bereiche

| Route | Wer | Inhalt |
|---|---|---|
| `/login`, `/registrieren` | alle | Anmeldung per E-Mail-Link (ohne Passwort) oder Passwort |
| `/app/…` | Patienten | Übersicht, Termine + Anfrage, Trainingsplan mit Rückmeldung (Abhaken, Schmerzskala, Notiz), Chat, Profil/Adresse |
| `/praxis/…` | Therapeut | Tagesübersicht/Tour, Terminanfragen bestätigen/Alternative/ablehnen, Termine, Patienten + Plan-Editor, Übungsbibliothek, Chat |

## Therapeuten-Konto einrichten

Der Therapeut registriert sich normal über `/registrieren`; danach einmalig in Supabase
(SQL-Editor) freischalten:

```sql
update public.profiles set role = 'therapist'
where id = (select id from auth.users where email = 'THERAPEUT@EMAIL.DE');
```

## Datenbank

Schema und Zugriffsregeln (Row Level Security): `supabase/migrations/0001_curamus_core_schema.sql`.
Patienten sehen ausschließlich ihre eigenen Daten; der Therapeut sieht alle.

## Deployment (geplant)

Vercel, Root des Repos, Umgebungsvariablen aus `.env.example`; Subdomain
`app.curamus-medical.de` per CNAME. Details und offene Punkte: `docs/projektplan.md`.

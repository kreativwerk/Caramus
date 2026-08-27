-- Push-Benachrichtigungen: ein Eintrag pro Gerät und Konto.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  geraet text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Jeder verwaltet nur die eigenen Geräte. Der Versand läuft serverseitig
-- mit erhöhten Rechten, deshalb braucht es hier keine Leseregel für andere.
create policy "Eigene Geräte lesen" on public.push_subscriptions for select
  using (user_id = (select auth.uid()));
create policy "Eigenes Gerät anmelden" on public.push_subscriptions for insert
  with check (user_id = (select auth.uid()));
create policy "Eigenes Gerät abmelden" on public.push_subscriptions for delete
  using (user_id = (select auth.uid()));

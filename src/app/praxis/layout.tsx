import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { aktuellerNutzer, aktuellesProfil } from "@/lib/sitzung";
import { AppShell } from "@/components/app-shell";
import { praxisBenachrichtigungen } from "@/lib/benachrichtigungen";
import type { Baustein } from "@/lib/types";

export default async function PraxisLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // Beides kommt aus dem Zwischenspeicher, wenn die Seite darunter es auch braucht
  const user = await aktuellerNutzer();
  if (!user) redirect("/login");

  const profile = await aktuellesProfil();
  if (profile?.role !== "therapist") redirect("/app");

  // Reihenfolge nach Arbeitsalltag: erst der Tag, dann die Menschen, dann die
  // Inhalte. Die ersten fünf stehen auf dem Handy in der unteren Leiste.
  const items = [
    { href: "/praxis", label: "Übersicht", icon: "home", gruppe: "Mein Tag" },
    { href: "/praxis/anfragen", label: "Anfragen", icon: "anfrage", gruppe: "Mein Tag" },
    { href: "/praxis/termine", label: "Termine", icon: "kalender", gruppe: "Mein Tag" },
    { href: "/praxis/verfuegbarkeit", label: "Verfügbarkeit", icon: "uhr", gruppe: "Mein Tag" },
    { href: "/praxis/patienten", label: "Patienten", icon: "personen", gruppe: "Betreuung" },
    { href: "/praxis/chat", label: "Chat", icon: "chat", gruppe: "Betreuung" },
    { href: "/praxis/dokumente", label: "Dokumente", icon: "dokument", gruppe: "Betreuung" },
    { href: "/praxis/uebungen", label: "Übungen", icon: "plan", gruppe: "Inhalte" },
    { href: "/praxis/bausteine", label: "Zwischenablage", icon: "klammer", gruppe: "Inhalte" },
    { href: "/praxis/feedback", label: "Rückmeldung", icon: "feedback", gruppe: "Inhalte" },
  ] as const;

  const [benachrichtigungen, { data: bausteine }] = await Promise.all([
    praxisBenachrichtigungen(supabase),
    supabase.from("snippets").select("*").order("position").order("created_at").limit(30),
  ]);

  return (
    <AppShell
      items={[...items]}
      basis="/praxis"
      nutzerName={profile.full_name}
      nutzerEmail={user.email ?? ""}
      bereich="Praxisbereich"
      profilHref="/praxis/profil"
      benachrichtigungen={benachrichtigungen}
      bausteine={(bausteine ?? []) as Baustein[]}
    >
      {children}
    </AppShell>
  );
}

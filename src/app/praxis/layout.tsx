import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { aktuellerNutzer, aktuellesProfil } from "@/lib/sitzung";
import { AppShell } from "@/components/app-shell";
import { praxisBenachrichtigungen } from "@/lib/benachrichtigungen";

export default async function PraxisLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // Beides kommt aus dem Zwischenspeicher, wenn die Seite darunter es auch braucht
  const user = await aktuellerNutzer();
  if (!user) redirect("/login");

  const profile = await aktuellesProfil();
  if (profile?.role !== "therapist") redirect("/app");

  const items = [
    { href: "/praxis", label: "Übersicht", icon: "home" },
    { href: "/praxis/anfragen", label: "Anfragen", icon: "anfrage" },
    { href: "/praxis/dokumente", label: "Dokumente", icon: "dokument" },
    { href: "/praxis/termine", label: "Termine", icon: "kalender" },
    { href: "/praxis/patienten", label: "Patienten", icon: "personen" },
    { href: "/praxis/uebungen", label: "Übungen", icon: "plan" },
    { href: "/praxis/chat", label: "Chat", icon: "chat" },
    { href: "/praxis/feedback", label: "Rückmeldung", icon: "feedback" },
  ] as const;

  const benachrichtigungen = await praxisBenachrichtigungen(supabase);

  return (
    <AppShell
      items={[...items]}
      basis="/praxis"
      nutzerName={profile.full_name}
      nutzerEmail={user.email ?? ""}
      bereich="Praxisbereich"
      profilHref="/praxis/profil"
      benachrichtigungen={benachrichtigungen}
    >
      {children}
    </AppShell>
  );
}

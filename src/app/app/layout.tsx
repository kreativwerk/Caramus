import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { aktuellerNutzer, aktuellesProfil } from "@/lib/sitzung";
import { AppShell } from "@/components/app-shell";
import { patientenBenachrichtigungen } from "@/lib/benachrichtigungen";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // Beides kommt aus dem Zwischenspeicher, wenn die Seite darunter es auch braucht
  const user = await aktuellerNutzer();
  if (!user) redirect("/login");

  const profile = await aktuellesProfil();
  if (profile?.role === "therapist") redirect("/praxis");
  // Beim ersten Mal zuerst durch das Willkommen – dort werden Name und
  // Anschrift erfasst, ohne die ein Hausbesuch nicht planbar ist.
  if (!profile?.onboarding_at) redirect("/willkommen");

  const items = [
    { href: "/app", label: "Übersicht", icon: "home" },
    { href: "/app/termine", label: "Termine", icon: "kalender" },
    { href: "/app/dokumente", label: "Unterlagen", icon: "dokument" },
    { href: "/app/plan", label: "Training", icon: "plan" },
    { href: "/app/chat", label: "Nachrichten", icon: "chat" },
  ] as const;

  const benachrichtigungen = await patientenBenachrichtigungen(supabase, user.id);

  return (
    <AppShell
      items={[...items]}
      basis="/app"
      nutzerName={profile?.full_name ?? ""}
      nutzerEmail={user.email ?? ""}
      bereich="Patientenbereich"
      profilHref="/app/profil"
      benachrichtigungen={benachrichtigungen}
    >
      {children}
    </AppShell>
  );
}

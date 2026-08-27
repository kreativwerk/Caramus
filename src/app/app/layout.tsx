import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { patientenBenachrichtigungen } from "@/lib/benachrichtigungen";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role === "therapist") redirect("/praxis");

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

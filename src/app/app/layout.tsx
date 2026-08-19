import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell, Icons } from "@/components/app-shell";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role === "therapist") redirect("/praxis");

  const items = [
    { href: "/app", label: "Übersicht", icon: Icons.home },
    { href: "/app/termine", label: "Termine", icon: Icons.kalender },
    { href: "/app/plan", label: "Training", icon: Icons.plan },
    { href: "/app/chat", label: "Nachrichten", icon: Icons.chat },
    { href: "/app/profil", label: "Profil", icon: Icons.person },
  ];

  return (
    <AppShell items={items} basis="/app" nutzerName={profile?.full_name ?? ""} bereich="Patientenbereich">
      {children}
    </AppShell>
  );
}

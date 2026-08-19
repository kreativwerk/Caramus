import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell, Icons } from "@/components/app-shell";

export default async function PraxisLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "therapist") redirect("/app");

  const items = [
    { href: "/praxis", label: "Übersicht", icon: Icons.home },
    { href: "/praxis/anfragen", label: "Anfragen", icon: Icons.anfrage },
    { href: "/praxis/termine", label: "Termine", icon: Icons.kalender },
    { href: "/praxis/patienten", label: "Patienten", icon: Icons.personen },
    { href: "/praxis/uebungen", label: "Übungen", icon: Icons.plan },
    { href: "/praxis/chat", label: "Chat", icon: Icons.chat },
  ];

  return (
    <AppShell items={items} basis="/praxis" nutzerName={profile.full_name} bereich="Praxisbereich">
      {children}
    </AppShell>
  );
}

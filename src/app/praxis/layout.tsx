import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

export default async function PraxisLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "therapist") redirect("/app");

  const items = [
    { href: "/praxis", label: "Übersicht", icon: "home" },
    { href: "/praxis/anfragen", label: "Anfragen", icon: "anfrage" },
    { href: "/praxis/dokumente", label: "Dokumente", icon: "dokument" },
    { href: "/praxis/termine", label: "Termine", icon: "kalender" },
    { href: "/praxis/patienten", label: "Patienten", icon: "personen" },
    { href: "/praxis/uebungen", label: "Übungen", icon: "plan" },
    { href: "/praxis/chat", label: "Chat", icon: "chat" },
  ] as const;

  return (
    <AppShell items={[...items]} basis="/praxis" nutzerName={profile.full_name} bereich="Praxisbereich">
      {children}
    </AppShell>
  );
}

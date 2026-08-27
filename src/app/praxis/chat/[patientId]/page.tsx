import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Chat } from "@/components/chat";
import type { Message } from "@/lib/types";
import { MIcon } from "@/components/m-icon";

export default async function PraxisChatPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: patient }, { data: nachrichten }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", patientId).single(),
    supabase.from("messages").select("*").eq("patient_id", patientId).order("created_at").limit(200),
  ]);
  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/praxis/chat" className="text-sm font-semibold text-teal-600 hover:underline">
          <MIcon name="pfeilLinks" className="mr-1.5" />Alle Unterhaltungen
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy-800">{patient.full_name}</h1>
      </div>
      <Chat
        patientId={patientId}
        meId={user!.id}
        initialMessages={(nachrichten ?? []) as Message[]}
        empfaengerName={patient.full_name}
      />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Chat } from "@/components/chat";
import type { Message } from "@/lib/types";

export default async function PatientChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: therapeutName }, { data: nachrichten }] = await Promise.all([
    supabase.rpc("therapeut_name"),
    supabase
      .from("messages")
      .select("*")
      .eq("patient_id", user!.id)
      .order("created_at")
      .limit(200),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Nachrichten</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Ihr direkter <span className="text-teal-500">Draht</span>.
        </h1>
      </div>
      <Chat
        patientId={user!.id}
        meId={user!.id}
        initialMessages={(nachrichten ?? []) as Message[]}
        empfaengerName={therapeutName ?? "Ihr Therapeut"}
      />
    </div>
  );
}

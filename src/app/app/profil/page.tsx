import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { AbmeldenKnopf } from "@/components/abmelden-knopf";
import { PushSchalter } from "@/components/push-schalter";
import { ProfilForm } from "./profil-form";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profil } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Ihr Profil</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Ihre <span className="text-teal-500">Angaben</span>.
        </h1>
        <p className="mt-1 text-navy-600/80">
          Ihre Anschrift brauchen wir für die Hausbesuche – sie ist nur für Ihren Therapeuten sichtbar.
        </p>
      </div>
      <ProfilForm profil={profil as Profile} />

      <PushSchalter oeffentlicherSchluessel={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""} />

      <div className="card">
        <p className="text-lg font-bold text-navy-800">Abmelden</p>
        <p className="mt-1 mb-4 text-sm text-navy-600/80">
          Sie werden abgemeldet und kommen zur Anmeldeseite zurück.
        </p>
        <AbmeldenKnopf />
      </div>
    </div>
  );
}

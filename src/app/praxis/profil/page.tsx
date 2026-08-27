import { createClient } from "@/lib/supabase/server";
import { AbmeldenKnopf } from "@/components/abmelden-knopf";
import { PushSchalter } from "@/components/push-schalter";
import { PasswortAendern } from "@/components/passwort-aendern";
import { formatDate } from "@/lib/types";
import { aktuellerNutzer } from "@/lib/sitzung";

export const metadata = { title: "Profil" };

export default async function PraxisProfilPage() {
  const supabase = await createClient();
  const user = await aktuellerNutzer();

  const { data: profil } = await supabase
    .from("profiles")
    .select("full_name, phone, created_at")
    .eq("id", user!.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Profil</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Ihr <span className="text-teal-500">Zugang</span>.
        </h1>
      </div>

      <div className="card space-y-3">
        <div>
          <p className="text-sm font-semibold text-navy-700">Name</p>
          <p className="text-navy-800">{profil?.full_name}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-navy-700">E-Mail-Adresse</p>
          <p className="text-navy-800">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-navy-700">Rolle</p>
          <p className="text-navy-800">Praxis – Zugriff auf alle Patientendaten</p>
        </div>
        {profil?.created_at && (
          <div>
            <p className="text-sm font-semibold text-navy-700">Zugang seit</p>
            <p className="text-navy-800">{formatDate(profil.created_at)}</p>
          </div>
        )}
      </div>

      <PasswortAendern />

      <PushSchalter oeffentlicherSchluessel={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""} />

      <div className="card">
        <p className="text-lg font-bold text-navy-800">Sitzung beenden</p>
        <p className="mt-1 mb-4 text-sm text-navy-600/80">
          Melden Sie sich ab, wenn Sie das Gerät aus der Hand geben.
        </p>
        <AbmeldenKnopf />
      </div>
    </div>
  );
}

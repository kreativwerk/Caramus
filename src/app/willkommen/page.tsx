import { redirect } from "next/navigation";
import { aktuellerNutzer, aktuellesProfil } from "@/lib/sitzung";
import { WillkommenForm } from "./willkommen-form";

export const metadata = { title: "Willkommen" };

export default async function WillkommenPage() {
  const user = await aktuellerNutzer();
  if (!user) redirect("/login");

  const profil = await aktuellesProfil();
  // Das Praxisteam braucht kein Willkommen, und wer es hinter sich hat, auch nicht
  if (profil?.role === "therapist") redirect("/praxis");
  if (profil?.onboarding_at) redirect("/app");

  // Bei der Selbstregistrierung kommt der Name aus dem Formular, bei einer
  // Einladung aus dem Profil – sonst steht dort der Teil vor dem @.
  const vorschlag = profil?.full_name?.includes(" ") ? profil.full_name : "";

  return <WillkommenForm vorschlagName={vorschlag} />;
}

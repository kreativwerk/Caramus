import Link from "next/link";
import { LoginSeite } from "@/components/login-form";

export default function LoginPage() {
  return (
    <LoginSeite
      variante={{
        badge: "Patientenbereich",
        titel: (
          <>
            Willkommen <span className="text-teal-500">zurück</span>.
          </>
        ),
        beschreibung: "Melden Sie sich an, um Termine, Trainingsplan und Nachrichten zu sehen.",
        weiterDefault: "/",
        zeigeRegistrierung: true,
        fussHinweis: (
          <p className="mt-2 text-center text-xs text-navy-600/60">
            Praxis-Team?{" "}
            <Link href="/praxis-login" className="font-semibold text-teal-600 hover:underline">
              Zur Praxis-Anmeldung
            </Link>
          </p>
        ),
      }}
    />
  );
}

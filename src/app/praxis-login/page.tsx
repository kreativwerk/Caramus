import type { Metadata } from "next";
import Link from "next/link";
import { LoginSeite } from "@/components/login-form";

export const metadata: Metadata = { title: "Praxis-Anmeldung" };

export default function PraxisLoginPage() {
  return (
    <LoginSeite
      variante={{
        badge: "Praxisbereich",
        titel: (
          <>
            Anmeldung für die <span className="text-teal-500">Praxis</span>.
          </>
        ),
        beschreibung:
          "Zugang für das Praxis-Team von Curamus Medical: Terminanfragen, Tagestour, Trainingspläne und Nachrichten verwalten.",
        weiterDefault: "/praxis",
        zeigeRegistrierung: false,
        fussHinweis: (
          <p className="mt-6 border-t border-mist-100 pt-4 text-center text-sm text-navy-600/80">
            Sie sind Patientin oder Patient?{" "}
            <Link href="/login" className="font-semibold text-teal-600 hover:underline">
              Zur Patienten-Anmeldung
            </Link>
          </p>
        ),
      }}
    />
  );
}

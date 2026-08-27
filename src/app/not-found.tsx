import Link from "next/link";
import { HinweisSeite } from "@/components/hinweis-seite";

/** Aufgerufene Adresse gibt es nicht – z. B. nach einem alten Lesezeichen. */
export default function NichtGefunden() {
  return (
    <HinweisSeite
      symbol="suche"
      titel="Diese Seite gibt es nicht."
      text="Vielleicht hat sich ein Tippfehler in die Adresse geschlichen, oder der Link ist schon älter."
    >
      <Link href="/" className="btn-primary">
        Zur Startseite
      </Link>
    </HinweisSeite>
  );
}

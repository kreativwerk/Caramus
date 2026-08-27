"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HinweisSeite } from "@/components/hinweis-seite";

/**
 * Auffangnetz für alles, was beim Laden einer Seite unerwartet schiefgeht.
 * Technische Angaben landen nur in der Entwicklerkonsole, nie auf dem Bildschirm.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <HinweisSeite
      symbol="verletzt"
      titel="Da ist uns etwas dazwischengekommen."
      text="Diese Seite lässt sich gerade nicht anzeigen. Das liegt nicht an Ihnen – bitte versuchen Sie es einfach noch einmal."
    >
      <button onClick={() => retry()} className="btn-primary">
        Noch einmal versuchen
      </button>
      <Link href="/" className="btn-secondary">
        Zur Startseite
      </Link>
    </HinweisSeite>
  );
}

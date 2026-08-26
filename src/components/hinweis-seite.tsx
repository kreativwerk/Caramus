import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

/**
 * Ganzseitiger, freundlicher Hinweis für Fälle, in denen eine Seite nicht
 * angezeigt werden kann. Bewusst ohne technische Angaben – wer hier landet,
 * soll nur wissen, was los ist und wie es weitergeht.
 */
export function HinweisSeite({
  symbol,
  titel,
  text,
  children,
}: {
  symbol: string;
  titel: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo dark />
        </div>
        <div className="card text-center">
          <span className="text-4xl" aria-hidden>
            {symbol}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-navy-800">{titel}</h1>
          <p className="mt-2 text-navy-600/80">{text}</p>
          {children && <div className="mt-6 flex flex-col gap-2">{children}</div>}
        </div>
        <p className="mt-6 text-center text-xs text-white/50">
          Kein Notfallkanal – wählen Sie bei medizinischen Notfällen die 112.
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Icons, type IconName } from "@/components/app-shell";

const KACHELN: { href: string; label: string; icon: IconName }[] = [
  { href: "/app/plan", label: "Übungen", icon: "plan" },
  { href: "/app/dokumente", label: "Dokumente", icon: "dokument" },
  { href: "/app/chat", label: "Nachrichten", icon: "chat" },
  { href: "/app/termine", label: "Termine", icon: "kalender" },
];

/** Schnellzugriff-Kacheln wie in der Kundenvorstellung. */
export function Schnellzugriff() {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-navy-800">Schnellzugriff</h2>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {KACHELN.map((k) => (
          <Link
            key={k.href}
            href={k.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-mist-100 bg-white px-1 py-4 text-center shadow-card transition hover:border-teal-500 active:scale-95"
          >
            <span className="text-teal-500">{Icons[k.icon]}</span>
            <span className="text-xs font-semibold text-navy-700 sm:text-sm">{k.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

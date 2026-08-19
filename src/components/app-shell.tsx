"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

export type NavItem = { href: string; label: string; icon: React.ReactNode };

function istAktiv(pathname: string, href: string, basis: string) {
  if (href === basis) return pathname === basis;
  return pathname.startsWith(href);
}

export function AppShell({
  items,
  basis,
  nutzerName,
  bereich,
  children,
}: {
  items: NavItem[];
  basis: string;
  nutzerName: string;
  bereich: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop-Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-900 px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo dark />
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-teal-400">
            {bereich}
          </p>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const aktiv = istAktiv(pathname, item.href, basis);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition ${
                  aktiv ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={aktiv ? "text-teal-400" : ""}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 pt-4">
          <p className="truncate px-3 text-sm font-medium text-white/80">{nutzerName}</p>
          <form action="/auth/signout" method="post">
            <button className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              Abmelden
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile-Kopfzeile */}
      <div className="flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-mist-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <Logo />
          <form action="/auth/signout" method="post">
            <button className="text-sm font-semibold text-navy-600/80">Abmelden</button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-10">
          {children}
        </main>
      </div>

      {/* Mobile-Tab-Leiste */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-mist-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="mx-auto grid max-w-lg grid-flow-col auto-cols-fr">
          {items.map((item) => {
            const aktiv = istAktiv(pathname, item.href, basis);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[0.7rem] font-semibold ${
                  aktiv ? "text-teal-600" : "text-navy-600/60"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export const Icons = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  kalender: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  ),
  plan: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 6.5 4 9l3 3-3 3 2.5 2.5" /><path d="M17.5 6.5 20 9l-3 3 3 3-2.5 2.5" /><path d="M9 12h6" />
    </svg>
  ),
  chat: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a8 8 0 0 1-8 8H4l2.4-2.9A8 8 0 1 1 21 12Z" />
    </svg>
  ),
  personen: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17.5" cy="9.5" r="2.5" /><path d="M15.5 14.5a5 5 0 0 1 6 4.9" />
    </svg>
  ),
  person: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  ),
  anfrage: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="M10 15.5l1.8 1.8 3.2-3.6" />
    </svg>
  ),
};

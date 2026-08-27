"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderActions } from "@/components/header-actions";
import { Logo } from "@/components/logo";
import type { Benachrichtigung } from "@/lib/benachrichtigungen";

export type IconName = keyof typeof Icons;
export type NavItem = { href: string; label: string; icon: IconName };

/** Erste Buchstaben von Vor- und Nachname, wie im Kopfbereich. */
function initialen(name: string) {
  const teile = name.trim().split(/\s+/).filter(Boolean);
  if (teile.length === 0) return "?";
  return (teile[0][0] + (teile.at(-1)?.[0] ?? "")).toUpperCase();
}

function istAktiv(pathname: string, href: string, basis: string) {
  if (href === basis) return pathname === basis;
  return pathname.startsWith(href);
}

export function AppShell({
  items,
  basis,
  nutzerName,
  nutzerEmail,
  bereich,
  profilHref,
  benachrichtigungen,
  children,
}: {
  items: NavItem[];
  basis: string;
  nutzerName: string;
  nutzerEmail: string;
  bereich: string;
  profilHref: string;
  benachrichtigungen: Benachrichtigung[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop-Sidebar: bleibt beim Scrollen stehen */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-navy-900 px-4 py-6">
        <div className="px-2">
          <Logo dark />
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-teal-400">
            {bereich}
          </p>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
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
                <span className={aktiv ? "text-teal-400" : ""}>{Icons[item.icon]}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Profilkasten unten – etwas heller abgesetzt */}
        <Link
          href={profilHref}
          className="mt-4 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 transition hover:bg-white/15"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-500 text-sm font-bold text-white">
            {initialen(nutzerName)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">{nutzerName}</span>
            <span className="block truncate text-xs text-white/60">{nutzerEmail}</span>
          </span>
        </Link>
        </div>
      </aside>

      {/* Mobile-Kopfzeile */}
      <div className="flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-mist-100 bg-white/90 px-4 py-2.5 backdrop-blur">
          <span className="lg:hidden">
            <Logo />
          </span>
          <span className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-navy-600/60 lg:block">
            {bereich}
          </span>
          <HeaderActions
            profilHref={profilHref}
            nutzerName={nutzerName}
            benachrichtigungen={benachrichtigungen}
          />
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
          {children}
          <footer className="mt-12 border-t border-mist-100 pt-4 text-center text-xs text-navy-600/60">
            <Link href="/impressum" className="hover:text-teal-600">Impressum</Link>
            {" · "}
            <Link href="/datenschutz" className="hover:text-teal-600">Datenschutz</Link>
            {" · "}
            <Link href="/agb" className="hover:text-teal-600">AGB</Link>
            {" · "}
            <Link href="/widerruf" className="hover:text-teal-600">Widerruf</Link>
          </footer>
        </main>
      </div>

      {/* Schwebende Mobile-Navigation im Liquid-Glass-Stil */}
      <nav
        className="fixed inset-x-0 z-20 flex justify-center px-4 lg:hidden"
        style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="glass-bar flex items-center rounded-full px-1.5 py-1.5">
          {items.map((item) => {
            const aktiv = istAktiv(pathname, item.href, basis);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktiv ? "page" : undefined}
                className={`flex min-w-[2.6rem] flex-col items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-1.5 text-[0.58rem] font-semibold transition-all ${
                  aktiv ? "text-teal-600" : "text-navy-700/75 active:scale-95"
                }`}
              >
                {Icons[item.icon]}
                {item.label}
                <span
                  className={`h-1 w-6 rounded-full transition-all ${
                    aktiv ? "bg-teal-600" : "bg-transparent"
                  }`}
                  aria-hidden
                />
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
  dokument: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" />
    </svg>
  ),
  anfrage: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="M10 15.5l1.8 1.8 3.2-3.6" />
    </svg>
  ),
  feedback: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-12.6 8.3L3 21l.8-5A9 9 0 0 1 12 3Z" /><path d="M12 8.5v4" /><path d="M12 15.6h.01" />
    </svg>
  ),
};

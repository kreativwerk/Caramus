import Link from "next/link";
import { Logo } from "@/components/logo";

export default function RechtLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-mist-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/"><Logo /></Link>
          <Link href="/login" className="text-sm font-semibold text-teal-600 hover:underline">
            Zur Anmeldung
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  );
}

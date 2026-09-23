import { NextResponse } from "next/server";

/**
 * Welche Fassung der App gerade auf dem Server läuft. Der Browser vergleicht
 * das mit der Fassung, die er selbst geladen hat (siehe update-knopf.tsx).
 * Darf nie aus einem Zwischenspeicher kommen – sonst wäre der Vergleich witzlos.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { version: process.env.NEXT_PUBLIC_APP_VERSION ?? "dev" },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

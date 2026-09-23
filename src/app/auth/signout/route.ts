import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITZUNG_COOKIE } from "@/lib/sitzungsdauer";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 302 });
  // Die Wahl „nur für diese Sitzung“ gilt bis zur nächsten Anmeldung
  response.cookies.set(SITZUNG_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

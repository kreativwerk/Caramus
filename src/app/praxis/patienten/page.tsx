import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { einladungMoeglich } from "@/lib/einladung";
import { Einladen } from "./einladen";

export default async function PatientenPage() {
  const supabase = await createClient();
  const { data: patienten } = await supabase
    .from("profiles")
    .select("id, full_name, city, phone")
    .eq("role", "patient")
    .order("full_name");

  return (
    <div className="space-y-6">
      <div>
        <span className="badge-pill">Patienten</span>
        <h1 className="mt-3 text-3xl font-bold text-navy-800">
          Ihre <span className="text-teal-500">Patientinnen und Patienten</span>.
        </h1>
        <p className="mt-1 text-navy-600/80">
          Laden Sie neue Patientinnen und Patienten ein – oder sie richten ihren Zugang selbst unter
          „Zugang einrichten“ ein.
        </p>
      </div>

      <Einladen moeglich={einladungMoeglich()} />

      {patienten?.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {patienten.map((p) => (
            <Link key={p.id} href={`/praxis/patienten/${p.id}`} className="card transition hover:border-teal-500">
              <p className="text-lg font-bold text-navy-800">{p.full_name}</p>
              <p className="text-sm text-navy-600/80">
                {p.city ?? "Ort nicht hinterlegt"}
                {p.phone ? ` · ${p.phone}` : ""}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="card text-navy-600/80">Noch keine Patienten registriert.</p>
      )}
    </div>
  );
}

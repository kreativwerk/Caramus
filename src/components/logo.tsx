/* Offizielles Logo aus der Markenvorlage (public/logo.png, public/logo-mark.png).
   Auf dunklen Flächen: Bildmarke + heller Schriftzug (die Wortmarken-Datei
   liegt nur auf Schwarz vor).

   Für dunkle Flächen gibt es eine eigene Datei: Im Original ist der unterste
   Bogen fast genau so dunkel wie unser Navy und verschwindet darin. In
   logo-mark-hell.png sind die beiden blauen Bögen weiß, der Petrol-Bogen
   bleibt. */
export function Logo({ dark = false }: { dark?: boolean }) {
  if (dark) {
    return (
      <span className="inline-flex items-center gap-2 select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark-hell.png" alt="" className="h-5 w-auto" />
        <span className="text-lg font-bold tracking-wide text-white">CURAMUS</span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-teal-400">
          Medical
        </span>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="Curamus Medical" className="h-7 w-auto select-none" />
  );
}

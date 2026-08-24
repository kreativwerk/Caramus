/**
 * Fortschrittskarte im Stil der Kundenvorstellung: großer Prozentwert und
 * eine weiche Verlaufskurve der letzten Tage.
 */
function glattePfade(werte: number[], breite: number, hoehe: number) {
  if (werte.length < 2) return { linie: "", flaeche: "", ende: { x: 0, y: hoehe / 2 } };
  // Rand lassen, damit Linienstärke und Endpunkt nicht abgeschnitten werden
  const links = 4;
  const rechts = breite - 5;
  const oben = 6;
  const unten = hoehe - 6;
  const schritt = (rechts - links) / (werte.length - 1);
  const punkte = werte.map((w, i) => ({
    x: links + i * schritt,
    y: unten - w * (unten - oben),
  }));

  const grenze = (y: number) => Math.min(unten, Math.max(oben, y));

  let linie = `M${punkte[0].x} ${punkte[0].y}`;
  for (let i = 0; i < punkte.length - 1; i++) {
    const p0 = punkte[Math.max(0, i - 1)];
    const p1 = punkte[i];
    const p2 = punkte[i + 1];
    const p3 = punkte[Math.min(punkte.length - 1, i + 2)];
    // Schwache Spannung (/8): verhindert, dass die Kurve über die Werte hinausschießt
    const c1x = p1.x + (p2.x - p0.x) / 8;
    const c1y = grenze(p1.y + (p2.y - p0.y) / 8);
    const c2x = p2.x - (p3.x - p1.x) / 8;
    const c2y = grenze(p2.y - (p3.y - p1.y) / 8);
    linie += ` C${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  const flaeche = `${linie} L${rechts} ${hoehe} L${links} ${hoehe} Z`;
  return { linie, flaeche, ende: punkte[punkte.length - 1] };
}

export function FortschrittKarte({
  prozent,
  verlauf,
  text,
}: {
  prozent: number;
  verlauf: number[];
  text: string;
}) {
  const { linie, flaeche, ende } = glattePfade(verlauf, 100, 46);

  return (
    <div className="card">
      <p className="text-lg font-bold text-navy-800">Ihr Fortschritt</p>
      <div className="mt-2 flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-5xl font-bold leading-none text-teal-500">{prozent}%</p>
          <p className="mt-3 text-navy-700">{text}</p>
        </div>
        <svg viewBox="0 0 100 46" className="h-24 w-1/2 shrink-0" aria-hidden>
          <defs>
            <linearGradient id="fortschritt-flaeche" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34b8be" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34b8be" stopOpacity="0" />
            </linearGradient>
          </defs>
          {flaeche && <path d={flaeche} fill="url(#fortschritt-flaeche)" />}
          {linie && (
            <path d={linie} fill="none" stroke="#34b8be" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {linie && <circle cx={ende.x} cy={ende.y} r="3.2" fill="#10568e" />}
        </svg>
      </div>
    </div>
  );
}

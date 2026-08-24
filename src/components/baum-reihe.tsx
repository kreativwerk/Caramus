/**
 * Baumkulisse für die Live-Anfahrt. Der Streifen wird zweimal nebeneinander
 * gerendert und nach links verschoben – dadurch wirkt die Fahrt endlos.
 * `tiefe` steuert Größe und Helligkeit (hintere Reihe kleiner und blasser).
 */
export function BaumReihe({
  className,
  tiefe = "nah",
}: {
  className?: string;
  tiefe?: "nah" | "fern";
}) {
  const fern = tiefe === "fern";
  const farbe = fern ? "#3a5292" : "#2a4076";
  const deckkraft = fern ? 0.55 : 0.9;
  const stamm = fern ? "#2a4076" : "#1f315b";

  // Feste Positionen, damit der Streifen beim Wiederholen nahtlos bleibt
  const baeume: { x: number; h: number; art: "nadel" | "laub" }[] = fern
    ? [
        { x: 12, h: 15, art: "nadel" },
        { x: 38, h: 12, art: "laub" },
        { x: 66, h: 16, art: "nadel" },
        { x: 96, h: 13, art: "laub" },
        { x: 126, h: 15, art: "nadel" },
        { x: 158, h: 12, art: "laub" },
        { x: 182, h: 14, art: "nadel" },
      ]
    : [
        { x: 20, h: 24, art: "nadel" },
        { x: 58, h: 20, art: "laub" },
        { x: 104, h: 26, art: "nadel" },
        { x: 148, h: 21, art: "laub" },
        { x: 182, h: 23, art: "nadel" },
      ];

  return (
    <svg viewBox="0 0 200 32" preserveAspectRatio="none" className={className} aria-hidden>
      <g opacity={deckkraft}>
        {baeume.map(({ x, h, art }) => {
          const boden = 32;
          if (art === "nadel") {
            const breite = h * 0.55;
            return (
              <g key={`${x}-${h}`}>
                <rect x={x - 0.9} y={boden - h * 0.28} width="1.8" height={h * 0.28} fill={stamm} />
                <path
                  d={`M${x} ${boden - h} L${x + breite / 2} ${boden - h * 0.24} L${x - breite / 2} ${boden - h * 0.24} Z`}
                  fill={farbe}
                />
                <path
                  d={`M${x} ${boden - h * 0.78} L${x + breite * 0.62} ${boden - h * 0.1} L${x - breite * 0.62} ${boden - h * 0.1} Z`}
                  fill={farbe}
                />
              </g>
            );
          }
          const r = h * 0.42;
          return (
            <g key={`${x}-${h}`}>
              <rect x={x - 1} y={boden - h * 0.45} width="2" height={h * 0.45} fill={stamm} />
              <circle cx={x} cy={boden - h * 0.62} r={r} fill={farbe} />
              <circle cx={x - r * 0.6} cy={boden - h * 0.44} r={r * 0.7} fill={farbe} />
              <circle cx={x + r * 0.62} cy={boden - h * 0.46} r={r * 0.66} fill={farbe} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

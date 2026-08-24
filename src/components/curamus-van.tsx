/**
 * Moderner Curamus-Van in Seitenansicht mit Logo auf der Seitenwand.
 * Fahrtrichtung rechts (Front rechts). Bei `raederDrehen` drehen sich die
 * Felgen, damit die Fahrt sichtbar wird.
 */
const SPEICHEN = [0, 72, 144, 216, 288];

function Rad({ cx, dreht }: { cx: number; dreht: boolean }) {
  const cy = 39.4;
  return (
    <g>
      {/* Reifen */}
      <circle cx={cx} cy={cy} r="7.4" fill="#16223f" />
      <circle cx={cx} cy={cy} r="6.2" fill="none" stroke="#2a4076" strokeWidth="0.7" />
      {/* Felge mit Speichen */}
      <circle cx={cx} cy={cy} r="4.5" fill="#e8f0f5" />
      <g
        className={dreht ? "animate-rad" : undefined}
        style={{ transformBox: "view-box", transformOrigin: `${cx}px ${cy}px` }}
      >
        {SPEICHEN.map((winkel, i) => (
          <rect
            key={winkel}
            x={cx - 0.65}
            y={cy - 4.1}
            width="1.3"
            height="3.3"
            rx="0.65"
            fill={i === 0 ? "#34b8be" : "#1f315b"}
            transform={`rotate(${winkel} ${cx} ${cy})`}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r="1.4" fill="#1f315b" />
    </g>
  );
}

export function CuramusVan({
  className,
  raederDrehen = false,
}: {
  className?: string;
  raederDrehen?: boolean;
}) {
  return (
    <svg viewBox="0 0 96 54" width="96" height="54" fill="none" className={className} aria-hidden>
      {/* Schatten auf der Straße */}
      <ellipse cx="48" cy="50" rx="35" ry="2.8" fill="#000000" opacity="0.25" />

      {/* Karosserie */}
      <path
        d="M10 12h63.2c2.6 0 5 1.2 6.6 3.3l6.4 8.4c1.5 2 2.3 4.4 2.3 6.9v4.6c0 2.1-1.7 3.8-3.8 3.8H9.8C7.7 39 6 37.3 6 35.2V16c0-2.2 1.8-4 4-4Z"
        fill="#ffffff"
      />
      <path d="M10 12h63.2c1.5 0 2.9.4 4.2 1.1H10c-1.1 0-2 .9-2 2v-1.1c0-1.1.9-2 2-2Z" fill="#1f315b" opacity="0.25" />
      <rect x="6" y="12" width="72" height="2.6" rx="1.3" fill="#10568e" />

      {/* Fensterband: Fahrerfenster und Windschutzscheibe */}
      <rect x="58" y="17.4" width="13.4" height="8.6" rx="1.8" fill="#1f315b" opacity="0.85" />
      <path
        d="M74.4 17.4h1.2c1.4 0 2.4.4 3.2 1.5l4.4 5.8c.5.7 0 1.3-.7 1.3h-8.1a1 1 0 0 1-1-1v-6.6c0-.6.4-1 1-1Z"
        fill="#1f315b"
        opacity="0.85"
      />

      {/* Logo auf der Seitenwand – bleibt frei vom Seitenfenster */}
      <path d="M11.6 28.4c2.6-2.8 6.2-4 9.6-4.2" stroke="#34b8be" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M11.6 30.6c2.9-3.3 6.9-4.7 10.6-4.9" stroke="#10568e" strokeWidth="1.45" strokeLinecap="round" />
      <text
        x="24.4"
        y="30.7"
        fill="#1f315b"
        fontFamily="var(--font-poppins), sans-serif"
        fontSize="5.4"
        fontWeight="700"
        letterSpacing="0.08"
      >
        CURAMUS
      </text>

      {/* Front: Scheinwerfer und Stoßfänger, hinten Rücklicht */}
      <rect x="84.4" y="27.6" width="4" height="3.4" rx="1.7" fill="#ffe9a8" />
      <path d="M82 35.4h4.6c1.4 0 2.4 1 2.4 2.4V39h-7v-3.6Z" fill="#1f315b" opacity="0.85" />
      <rect x="6" y="27.6" width="2.6" height="3.4" rx="1.3" fill="#ff8a7a" opacity="0.9" />

      {/* Radkästen und Räder */}
      <path d="M17 39a9 9 0 0 1 18 0Z" fill="#1f315b" opacity="0.12" />
      <path d="M63 39a9 9 0 0 1 18 0Z" fill="#1f315b" opacity="0.12" />
      <Rad cx={26} dreht={raederDrehen} />
      <Rad cx={72} dreht={raederDrehen} />
    </svg>
  );
}

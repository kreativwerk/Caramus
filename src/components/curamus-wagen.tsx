/**
 * Der Curamus-Wagen in Seitenansicht: eine flache Fastback-Limousine in
 * Lapizblau. Die Front zeigt nach rechts – also in die Fahrtrichtung der
 * Anfahrt-Anzeige, in der der Wagen von links nach rechts unterwegs ist.
 *
 * Auf den Türen steht die Wortmarke in Weiß. Nur der Schriftzug, ohne den
 * Bogen des Logos: bei den 72 Pixeln, mit denen der Wagen in der Anzeige
 * dargestellt wird, würde der Bogen zum Gekritzel.
 *
 * Bewusst gezeichnet statt fotografiert: ein Foto wäre auf dem dunklen
 * Untergrund schwer freizustellen, müsste bei jedem Aufruf geladen werden und
 * wirft Fragen nach Bildrechten auf.
 */
const SPEICHEN = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

const SCHRIFT = "var(--font-poppins), Poppins, system-ui, sans-serif";

function Rad({ cx, dreht }: { cx: number; dreht: boolean }) {
  const cy = 40.5;
  return (
    <g>
      {/* Reifen */}
      <circle cx={cx} cy={cy} r="6.6" fill="#0b1220" />
      {/* Felge */}
      <circle cx={cx} cy={cy} r="4.5" fill="#b9c6d4" />
      <g
        className={dreht ? "animate-rad" : undefined}
        style={{ transformBox: "view-box", transformOrigin: `${cx}px ${cy}px` }}
      >
        {/* Zehn schmale Speichen, wie bei den großen Alufelgen */}
        {SPEICHEN.map((winkel) => (
          <path
            key={winkel}
            d={`M${cx - 0.45} ${cy - 1.3} L${cx - 1.15} ${cy - 4.2} L${cx + 1.15} ${cy - 4.2} L${cx + 0.45} ${cy - 1.3} Z`}
            fill="#16233c"
            transform={`rotate(${winkel} ${cx} ${cy})`}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r="1.25" fill="#eef3f9" />
    </g>
  );
}

export function CuramusWagen({
  className,
  raederDrehen = false,
}: {
  className?: string;
  raederDrehen?: boolean;
}) {
  return (
    <svg viewBox="0 0 96 54" width="96" height="54" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="wagen-lack" x1="0" y1="19" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3f79f5" />
          <stop offset="0.45" stopColor="#2049cd" />
          <stop offset="1" stopColor="#12308f" />
        </linearGradient>
        <linearGradient id="wagen-glas" x1="18" y1="21" x2="68" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#26426f" />
          <stop offset="1" stopColor="#0c1830" />
        </linearGradient>
      </defs>

      {/* Schatten auf der Straße */}
      <ellipse cx="49" cy="47.6" rx="37" ry="2.4" fill="#000000" opacity="0.32" />

      {/* Karosserie */}
      <path
        d="M10.2 34.6
           C10.2 32.2 11 30.9 13.4 30.2
           C22 27.6 32 24 41.4 21.6
           C47 20.2 52.6 19.7 57.2 20.4
           C60.4 20.9 62.6 21.9 64.8 23.6
           L69.4 27.2
           C75.4 28.2 81 29.6 85.4 31.4
           C88.2 32.6 89.8 33.9 90.2 35.6
           C90.5 36.8 90.3 37.7 89.8 38.4
           C89.2 39 88.5 39.3 87.6 39.3
           H12
           C10.8 39.3 10.2 38.5 10.2 37.3
           Z"
        fill="url(#wagen-lack)"
      />

      {/* Lichtkanten – ohne sie wirkt der Lack flach */}
      <path
        d="M14.6 30.8C26 27.6 40 23.2 53.4 21.6c3.8-0.4 7 0.2 9.8 2"
        stroke="#9dbcff"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M13.6 33.6C32 32 60 31.4 88.4 32.4"
        stroke="#8fb0ff"
        strokeWidth="0.45"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Seitenfenster */}
      <path
        d="M18.4 29.4
           C25.6 27 34 24 42 22.2
           C47.2 21 52.4 20.7 56.6 21.4
           C59.4 21.9 61.4 22.8 63.4 24.4
           L66.8 27
           Z"
        fill="url(#wagen-glas)"
      />
      {/* Chromrahmen am Fenster */}
      <path
        d="M18.4 29.4C25.6 27 34 24 42 22.2c5.2-1.2 10.4-1.5 14.6-0.8 2.8 0.5 4.8 1.4 6.8 3l3.4 2.6"
        stroke="#dbe6f4"
        strokeWidth="0.55"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* B-Säule und Türfugen */}
      <path d="M42.2 22.1 42.6 27.2" stroke="#0b1220" strokeWidth="0.7" opacity="0.9" />
      <path d="M42.5 27.4 42.8 39" stroke="#0b1220" strokeWidth="0.4" opacity="0.4" />
      <path d="M18.9 29.6 19.6 39" stroke="#0b1220" strokeWidth="0.4" opacity="0.32" />
      <path d="M66.6 27.2 67.4 39" stroke="#0b1220" strokeWidth="0.4" opacity="0.28" />

      {/* Türgriffe, knapp unter der Fensterlinie */}
      <rect x="31.4" y="29.2" width="3.8" height="0.95" rx="0.48" fill="#dbe6f4" opacity="0.9" />
      <rect x="48.6" y="28.4" width="3.8" height="0.95" rx="0.48" fill="#dbe6f4" opacity="0.9" />

      {/* Chromleiste am Schweller */}
      <rect x="20" y="37.5" width="46" height="0.75" rx="0.38" fill="#dbe6f4" opacity="0.55" />

      {/* Wortmarke auf den Türen */}
      <text
        x="36"
        y="35.4"
        fill="#ffffff"
        fontFamily={SCHRIFT}
        fontSize="5"
        fontWeight="700"
        letterSpacing="0.2"
      >
        CURAMUS
      </text>

      {/* Front: schmales Tagfahrlicht und Lufteinlass */}
      <path
        d="M84.6 32c2.2 0.6 3.9 1.3 4.9 2.3 0.5 0.5 0.2 1.1-0.5 1.1h-4.8c-0.5 0-0.8-0.3-0.8-0.8v-1.9c0-0.5 0.5-0.8 1.2-0.7Z"
        fill="#eef6ff"
      />
      <path d="M86.2 36.6h3.4c0.4 0 0.6 0.3 0.6 0.7v0.9c0 0.6-0.4 1.1-1 1.1h-3Z" fill="#0b1220" opacity="0.65" />

      {/* Heck: schmales Rücklichtband, das der Kontur folgt */}
      <path
        d="M10.6 31.9c1.4-0.5 2.9-1 4.4-1.5l0.5 1.9c-1.5 0.5-3 1-4.4 1.5-0.4 0.1-0.6-0.1-0.6-0.5v-1c0-0.2 0.1-0.3 0.1-0.4Z"
        fill="#ff6a5e"
      />
      <path d="M10.4 36.2h3.4v3.1h-1.9c-1 0-1.5-0.6-1.5-1.5Z" fill="#0b1220" opacity="0.5" />

      {/* Radkästen: dunkle Aussparungen, aus denen die Räder ragen */}
      <path d="M15.8 39.3a8.2 8.2 0 0 1 16.4 0Z" fill="#091020" />
      <path d="M64.8 39.3a8.2 8.2 0 0 1 16.4 0Z" fill="#091020" />

      <Rad cx={24} dreht={raederDrehen} />
      <Rad cx={73} dreht={raederDrehen} />
    </svg>
  );
}

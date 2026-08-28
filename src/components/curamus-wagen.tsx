/**
 * Der Curamus-Wagen in der Anfahrt-Anzeige: eine gezeichnete Fastback-Limousine
 * in Lapizblau, freigestellt vor durchsichtigem Hintergrund. Die Front zeigt
 * nach rechts – also in die Fahrtrichtung, in der der Wagen über die Strecke
 * fährt.
 *
 * Eine detaillierte Zeichnung, kein Foto: Sie bleibt auf dem dunklen Untergrund
 * klar lesbar und passt zur übrigen Kulisse, die ebenfalls gezeichnet ist.
 *
 * Auf den Türen steht die Wortmarke in Weiß, wie eine echte Fahrzeugbeschriftung.
 * Sie liegt als Text über dem Bild und nicht darin: so bleibt sie auf jedem
 * Bildschirm scharf und lässt sich ändern, ohne die Bilddatei anzufassen.
 *
 * Die beiden Felgen liegen als eigene, kreisrund ausgeschnittene Bilder über
 * dem Wagen und drehen sich während der Fahrt. Die Reifen bleiben stehen –
 * sichtbar dreht sich bei einem Rad ohnehin nur das Muster der Felge.
 *
 * Alle drei Dateien zusammen bleiben unter 60 kB; die Anzeige lädt auch im
 * Mobilfunknetz sofort.
 */
const BILD = "/wagen.webp";
/** Seitenverhältnis der Bilddatei; hält den Platz frei, bevor das Bild da ist. */
const VERHAELTNIS = "560 / 180";

/**
 * Sitz der beiden Felgen, gemessen an der Bilddatei und in Prozent umgerechnet:
 * so sitzen sie bei jeder Größe an derselben Stelle.
 */
const FELGEN = [
  { bild: "/felge-hinten.webp", links: "21.63%", oben: "76.72%" },
  { bild: "/felge-vorne.webp", links: "82.91%", oben: "76.47%" },
];
const FELGE_BREITE = "11.72%";

export function CuramusWagen({
  className,
  raederDrehen = false,
}: {
  className?: string;
  raederDrehen?: boolean;
}) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ aspectRatio: VERHAELTNIS, containerType: "inline-size" }}
    >
      {/* Weicher Schatten – das Freistellen hat den Bodenschatten mit entfernt */}
      <span
        className="pointer-events-none absolute inset-x-[6%] bottom-[-6%] h-[16%] rounded-[50%] bg-black/45 blur-[2px]"
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BILD}
        alt=""
        className="block h-full w-full select-none"
        draggable={false}
        aria-hidden
      />

      {/* Drehende Felgen, passgenau über den stehenden Reifen */}
      {FELGEN.map((f) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f.bild}
          src={f.bild}
          alt=""
          draggable={false}
          aria-hidden
          className={`pointer-events-none absolute select-none ${raederDrehen ? "animate-rad" : ""}`}
          style={{
            left: f.links,
            top: f.oben,
            width: FELGE_BREITE,
            aspectRatio: "1",
            // Prozentwerte im Rand beziehen sich immer auf die Breite –
            // deshalb ist die Verschiebung nach oben dieselbe wie nach links.
            marginLeft: `calc(${FELGE_BREITE} / -2)`,
            marginTop: `calc(${FELGE_BREITE} / -2)`,
          }}
        />
      ))}

      {/* Beschriftung auf den vorderen und hinteren Türen */}
      <span
        className="pointer-events-none absolute select-none font-bold leading-none text-white"
        style={{
          left: "50.5%",
          top: "64%",
          transform: "translate(-50%, -50%)",
          fontSize: "5.2cqw",
          letterSpacing: "0.04em",
          textShadow: "0 0.5px 1px rgba(8, 18, 40, 0.45)",
        }}
        aria-hidden
      >
        CURAMUS
      </span>
    </div>
  );
}

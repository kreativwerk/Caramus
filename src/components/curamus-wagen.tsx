/**
 * Der Curamus-Wagen in der Anfahrt-Anzeige: eine Fastback-Limousine in
 * Lapizblau, freigestellt vor durchsichtigem Hintergrund. Die Front zeigt nach
 * rechts – also in die Fahrtrichtung, in der der Wagen über die Strecke fährt.
 *
 * Auf den Türen steht die Wortmarke in Weiß, wie eine echte Fahrzeugbeschriftung.
 * Sie liegt als Text über dem Bild und nicht darin: so bleibt sie auf jedem
 * Bildschirm scharf und lässt sich ändern, ohne die Bilddatei anzufassen.
 *
 * Die Bilddatei ist bewusst klein gehalten (WebP, rund 25 kB) – die Anzeige
 * lädt auch im Mobilfunknetz sofort.
 */
const BILD = "/wagen.webp";
/** Seitenverhältnis der Bilddatei; hält den Platz frei, bevor das Bild da ist. */
const VERHAELTNIS = "560 / 177";

export function CuramusWagen({ className }: { className?: string }) {
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
      {/* Beschriftung auf den vorderen und hinteren Türen */}
      <span
        className="pointer-events-none absolute select-none font-bold leading-none text-white"
        style={{
          left: "50.5%",
          top: "70%",
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

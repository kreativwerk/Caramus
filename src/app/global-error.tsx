"use client";

/**
 * Letztes Auffangnetz, wenn schon der Seitenrahmen selbst nicht laden konnte.
 * Diese Datei ersetzt das komplette Dokument und bekommt deshalb kein
 * Stylesheet mit – alle Farben und Abstände stehen darum direkt hier.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  console.error(error);

  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f315b",
          padding: "2rem 1rem",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <title>Curamus Medical</title>
        <div
          style={{
            width: "100%",
            maxWidth: "26rem",
            borderRadius: "1rem",
            background: "#ffffff",
            padding: "2rem",
            textAlign: "center",
            color: "#1f315b",
          }}
        >
          <svg viewBox="0 -960 960 960" width="44" height="44" fill="#34b8be" aria-hidden>
            <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Zm0 200q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Z" />
          </svg>
          <h1 style={{ margin: "0.75rem 0 0", fontSize: "1.4rem" }}>
            Da ist uns etwas dazwischengekommen.
          </h1>
          <p style={{ margin: "0.5rem 0 0", lineHeight: 1.5, opacity: 0.8 }}>
            Die App lässt sich gerade nicht laden. Das liegt nicht an Ihnen – bitte versuchen Sie es
            einfach noch einmal.
          </p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: "1.5rem",
              width: "100%",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.85rem 1.25rem",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              background: "linear-gradient(90deg, #34b8be 0%, #10568e 100%)",
            }}
          >
            Noch einmal versuchen
          </button>
        </div>
      </body>
    </html>
  );
}

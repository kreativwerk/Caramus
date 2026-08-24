import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Curamus Medical – Patientenbereich",
    short_name: "Curamus",
    description:
      "Termine anfragen, Trainingsplan ansehen und Nachrichten an Ihren Therapeuten senden.",
    start_url: "/",
    display: "standalone",
    background_color: "#1f315b",
    theme_color: "#1f315b",
    lang: "de",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      // Eigene Datei mit mehr Rand: Android beschneidet maskable-Icons rund
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

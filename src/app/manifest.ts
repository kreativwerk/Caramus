import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Curamus Medical – Patientenbereich",
    short_name: "Curamus",
    description:
      "Termine anfragen, Trainingsplan ansehen und Nachrichten an Ihren Therapeuten senden.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c1f3f",
    theme_color: "#0c1f3f",
    lang: "de",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

import type { MetadataRoute } from "next";

/**
 * Angaben für „Zum Startbildschirm hinzufügen“. Auf dem Startbildschirm soll
 * der Name der Praxis stehen, nicht der des Bereichs – deshalb „Curamus
 * Medical“ statt „Patientenbereich“.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Curamus Medical",
    short_name: "Curamus Medical",
    description:
      "Der persönliche Bereich für Patientinnen und Patienten von Curamus Medical, " +
      "der mobilen Physiotherapie in Nürnberg: Termine vereinbaren, Rezept einreichen, " +
      "Trainingsplan ansehen, mit der Praxis schreiben – und live sehen, wann der " +
      "Therapeut zum Hausbesuch eintrifft.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f7fa",
    theme_color: "#1f315b",
    lang: "de",
    dir: "ltr",
    categories: ["health", "medical", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Eigene Datei mit mehr Rand: Android beschneidet maskable-Icons rund
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Langes Drücken auf das Symbol führt direkt zum gewünschten Bereich
    shortcuts: [
      {
        name: "Termin vereinbaren",
        short_name: "Termine",
        description: "Freie Zeiten ansehen und einen Hausbesuch buchen",
        url: "/app/termine",
      },
      {
        name: "Trainingsplan",
        short_name: "Training",
        description: "Die Übungen für heute ansehen und abhaken",
        url: "/app/plan",
      },
      {
        name: "Nachricht schreiben",
        short_name: "Nachrichten",
        description: "Direkt an die Praxis schreiben",
        url: "/app/chat",
      },
    ],
  };
}

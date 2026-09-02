import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

/** Eine Stelle für die Adresse – Vorschaubilder brauchen absolute Links. */
const ADRESSE = "https://app.curamus-medical.de";

const BESCHREIBUNG =
  "Der persönliche Bereich für Patientinnen und Patienten von Curamus Medical, " +
  "der mobilen Physiotherapie in Nürnberg: Termine vereinbaren, Rezept einreichen, " +
  "Trainingsplan ansehen, mit der Praxis schreiben – und live sehen, wann der " +
  "Therapeut zum Hausbesuch eintrifft.";

export const metadata: Metadata = {
  metadataBase: new URL(ADRESSE),
  applicationName: "Curamus Medical",
  title: { default: "Curamus Medical", template: "%s · Curamus Medical" },
  description: BESCHREIBUNG,
  keywords: [
    "Physiotherapie",
    "Hausbesuch",
    "Nürnberg",
    "mobile Physiotherapie",
    "Termin vereinbaren",
    "Trainingsplan",
    "Curamus Medical",
  ],
  authors: [{ name: "Curamus Medical", url: "https://www.curamus-medical.de" }],
  creator: "Curamus Medical",
  publisher: "Curamus Medical · Charles Obinna Mba",
  category: "health",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },

  // Persönlicher Bereich mit Gesundheitsdaten: gehört nicht in Suchmaschinen.
  // Die Startseite von curamus-medical.de bleibt davon unberührt.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },

  // Telefonnummern und Adressen nicht automatisch verlinken – das zerschießt
  // sonst die Darstellung von Terminen und Anschriften auf dem iPhone.
  formatDetection: { telephone: false, email: false, address: false },

  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Curamus Medical",
    url: ADRESSE,
    title: "Curamus Medical – Physiotherapie, die zu Ihnen nach Hause kommt",
    description: BESCHREIBUNG,
    images: [
      {
        url: "/og-bild.jpg",
        width: 1200,
        height: 630,
        alt: "Curamus Medical – Physiotherapie, die zu Ihnen nach Hause kommt",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Curamus Medical – Physiotherapie, die zu Ihnen nach Hause kommt",
    description: BESCHREIBUNG,
    images: ["/og-bild.jpg"],
  },

  // Auf dem Startbildschirm steht der Name der Praxis, nicht der des Bereichs
  appleWebApp: {
    capable: true,
    title: "Curamus Medical",
    statusBarStyle: "default",
  },

  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: [{ url: "/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Kein maximumScale: Die Zielgruppe ist 70+, Zoom muss möglich bleiben.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1f315b" },
    { media: "(prefers-color-scheme: dark)", color: "#16223f" },
  ],
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}

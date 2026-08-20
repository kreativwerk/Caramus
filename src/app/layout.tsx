import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: { default: "Curamus Medical – Patientenbereich", template: "%s · Curamus Medical" },
  description:
    "Ihr persönlicher Bereich bei Curamus Medical: Termine anfragen, Trainingsplan ansehen und Nachrichten an Ihren Therapeuten senden.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-180.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c1f3f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}

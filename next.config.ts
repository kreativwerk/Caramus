import type { NextConfig } from "next";

/**
 * Kennung dieses Builds. Auf Vercel ist es der Commit, sonst der Zeitpunkt des
 * Builds. Steckt in jeder Seite und in /api/version – weichen die beiden ab,
 * läuft im Browser eine alte Fassung, und der Update-Knopf meldet sich.
 */
const APP_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? new Date().toISOString();

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_APP_VERSION: APP_VERSION },
};

export default nextConfig;

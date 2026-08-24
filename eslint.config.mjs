import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Nicht-App-Code: Agent-Skills, Doku-Generatoren, Deno-Edge-Functions
    ".agents/**",
    ".claude/**",
    "docs/**",
    "supabase/**",
    // Node-Testskripte (CommonJS, laufen ausserhalb des Next-Builds)
    "scripts/**",
  ]),
]);

export default eslintConfig;

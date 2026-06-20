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
    // Reference design prototype exported from Claude Design — not app source.
    "design-handoff/**",
    // Standalone Lambda package (its own runtime/deps) — not part of the app build.
    "infra/**",
  ]),
]);

export default eslintConfig;

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
  ]),
  {
    rules: {
      // React Compiler rule: existing forms reset RHF state in effects when a sheet opens.
      // Kept visible as a warning until those forms are migrated to key-based resets.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;

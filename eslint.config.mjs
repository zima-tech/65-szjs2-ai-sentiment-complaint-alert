import js from "@eslint/js";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigNext from "eslint-config-next";

export default tseslint.config(
  { ignores: [".next/**", "node_modules/**"] },
  {
    extends: [eslintConfigNext.styleTs.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  }
);

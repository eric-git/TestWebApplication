import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import cspellESLintPluginRecommended from "@cspell/eslint-plugin/recommended";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        appRoot: "writable",
      },
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  cspellESLintPluginRecommended,
];

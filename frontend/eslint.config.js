import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],

    plugins: {
      "react-hooks": pluginReactHooks,
      "react-refresh": pluginReactRefresh,
    },

    linterOptions: {
      // Remplace le drapeau --report-unused-disable-directives
      reportUnusedDisableDirectives: "warn",
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },

    rules: {
      // Avec Vite et React >17, il n'est plus nécessaire d'importer React dans chaque fichier JSX.
      "react/react-in-jsx-scope": "off",
      // Active les règles recommandées pour les hooks React
      ...pluginReactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
    },
  },
];

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const globals = require("globals");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".claude/**"],
  },
  {
    rules: {
      // Reanimated shared values require direct `.value =` mutation inside
      // worklets/gesture handlers -- this is the library's intended API, not
      // a hooks-purity violation.
      "react-hooks/immutability": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "jest-setup.js"],
    languageOptions: {
      globals: globals.jest,
    },
  },
]);

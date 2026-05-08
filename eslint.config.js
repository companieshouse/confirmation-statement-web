// Migrated from .eslintrc.json to Flat Config format
// See: https://eslint.org/docs/latest/use/configure/configuration-files-new

import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import stylistic from "@stylistic/eslint-plugin-ts";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 11,
        sourceType: "module",
      },
      globals: {
        // Jest globals
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly"
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "@stylistic/ts": stylistic,
    },
    rules: {
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "@stylistic/ts/semi": ["error", "always"],
      "@stylistic/ts/type-annotation-spacing": "error",
      "arrow-spacing": "error",
      "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
      "comma-spacing": ["error", { "before": false, "after": true }],
      "curly": "error",
      "eqeqeq": "error",
      "eol-last": ["warn", "always"],
      "indent": ["error", 2, {
        "FunctionExpression": { "parameters": "first" },
        "CallExpression": { "arguments": "first" },
        "outerIIFEBody": 2,
        "SwitchCase": 2
      }],
      "no-use-before-define": "off",
      "no-undef": "off",
      "key-spacing": ["error", { "afterColon": true }],
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "no-irregular-whitespace": "error",
      "no-trailing-spaces": "error",
      "no-underscore-dangle": ["error", { "allowFunctionParams": true }],
      "no-unused-vars": "off",
      "no-whitespace-before-property": "error",
      "object-curly-spacing": ["error", "always"],
      "require-await": "error",
      "space-infix-ops": "error",
      "spaced-comment": ["error", "always", { "markers": ["/", "*"] }],
    },
  },
];


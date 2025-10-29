import eslint from "@eslint/js";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      ".git/",
      ".history/",
      "**/*.d.ts",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/bench/**",
      "**/examples/**",
      "**/*.min.js",
      "node_modules/**",
      "public/",
      "test-results/",
    ],
  },

  // Group 1: Core Rules for All JavaScript and TypeScript Files
  {
    ...eslint.configs.recommended,
    files: ["**/*.{js,ts,jsx,tsx}"],
    plugins: {
      import: eslintPluginImport,
      "unused-imports": eslintPluginUnusedImports,
      prettier: eslintPluginPrettier,
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "import/first": "error",
      "import/no-amd": "error",
      "import/no-duplicates": "error",
      "import/no-extraneous-dependencies": "error",
      "import/order": [
        "error",
        {
          pathGroups: [
            {
              pattern: "~/**",
              group: "external",
              position: "after",
            },
          ],
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          "newlines-between": "never",
          named: true,
          alphabetize: {
            order: "asc",
            caseInsensitive: false,
          },
        },
      ],
      "no-unused-vars": [
        "error",
        {
          args: "none",
          ignoreRestSiblings: true,
        },
      ],
      "no-var": "error",
      "prefer-const": "error",
      "prettier/prettier": "error",
      "unused-imports/no-unused-imports": "error",
    },
  },

  // Group 2: TypeScript-Specific Rules
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        // Enable typed linting across the monorepo without listing every tsconfig
        projectService: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,

      // Always use `import type { X }` and keep type imports separate from value imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],

      // Always use `export type { X }`; avoid mixing type and value exports
      "@typescript-eslint/consistent-type-exports": [
        "error",
        {
          fixMixedExportsWithInlineTypeSpecifier: false,
        },
      ],

      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "none",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-use-before-define": [
        "error",
        {
          classes: false,
          functions: false,
          variables: false,
        },
      ],
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",

      // Prefer native public and #private over TS accessibility modifiers
      "no-restricted-syntax": [
        "error",
        {
          selector: "PropertyDefinition[accessibility]",
          message: "Use native class fields: omit 'public' and use '#private' for private state.",
        },
        {
          selector: "MethodDefinition[accessibility]",
          message:
            "Use native methods: omit 'public'; for private behavior use '#private' fields/methods.",
        },
        {
          selector: "TSParameterProperty[accessibility]",
          message:
            "Avoid TS parameter properties; declare fields explicitly and use '#private' when needed.",
        },
      ],

      "@typescript-eslint/explicit-member-accessibility": "off",
    },
  },

  // Group 3: Test-Specific Rules for Test Files
  {
    files: ["**/*.test.{js,ts,jsx,tsx}", "**/*.spec.{js,ts,jsx,tsx}"],
    rules: {
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
];

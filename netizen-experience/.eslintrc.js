/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  root: true,
  extends: ["eslint:recommended", "prettier"],
  ignorePatterns: ["**/*"],
  plugins: ["@nx"],
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      extends: ["eslint:recommended", "plugin:import/recommended", "plugin:import/typescript", "prettier"],
      plugins: ["sort-destructure-keys"],
      settings: {
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
            project: ["./apps/**/tsconfig.json", "./libs/**/tsconfig.json", "./tsconfig.base.json"],
          },
        },
      },
      rules: {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
              {
                sourceTag: "*",
                onlyDependOnLibsWithTags: ["*"],
              },
            ],
          },
        ],
        "import/order": [
          "error",
          {
            groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
            pathGroups: [
              {
                pattern: "@netizen/**",
                group: "internal",
                position: "before",
              },
              {
                pattern: "@nanikore/**",
                group: "internal",
                position: "before",
              },
              {
                pattern: "@internal/**",
                group: "internal",
                position: "before",
              },
              {
                pattern: "@/**",
                group: "internal",
              },
            ],
            distinctGroup: false,
            pathGroupsExcludedImportTypes: [],
            "newlines-between": "never",
            alphabetize: {
              order: "asc",
              orderImportKind: "asc",
              caseInsensitive: false,
            },
          },
        ],
        "padding-line-between-statements": ["error", { blankLine: "always", prev: "directive", next: "*" }],
        "sort-destructure-keys/sort-destructure-keys": "error",
      },
    },
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "plugin:@nx/typescript",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "prettier",
      ],
      plugins: ["@typescript-eslint"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./apps/**/tsconfig.json", "./libs/**/tsconfig.json", "./tsconfig.base.json"],
        tsconfigRootDir: __dirname,
      },
      rules: {
        "import/newline-after-import": ["error", { count: 1, exactCount: true, considerComments: true }],
        /**
         * @TODO:
         * This rule should left as default as it should honor the `noPropertyAccessFromIndexSignature`
         * compiler option from tsconfig. Add TODO to investigate why @typescript-eslint is not honoring
         * the correct tsconfig.
         */
        "@typescript-eslint/dot-notation": ["error", { allowIndexSignaturePropertyAccess: true }],
        "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
        // @TODO: Should not turn off the following rules
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
      },
    },
    {
      files: ["*.stories.ts", "*.stories.tsx", "*.stories.js", "*.stories.jsx"],
      rules: {
        "jsx-a11y/accessible-emoji": "off",
      },
    },
    {
      files: ["*.js", "*.jsx"],
      extends: ["plugin:@nx/javascript", "prettier"],
      rules: {},
    },
    {
      files: ["*.spec.ts", "*.spec.tsx", "*.spec.js", "*.spec.jsx"],
      extends: ["prettier"],
      env: {
        jest: true,
      },
      rules: {},
    },
  ],
};

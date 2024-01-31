/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  extends: ["../../../.eslintrc.js"],
  settings: {
    next: {
      rootDir: "apps/nanikore/formation/",
    },
  },
  ignorePatterns: ["!**/*"],
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      rules: {},
    },
    {
      files: ["*.ts", "*.tsx"],
      rules: {},
    },
    {
      files: ["*.js", "*.jsx"],
      rules: {},
    },
    {
      files: ["package.json"],
      parser: "jsonc-eslint-parser",
      rules: {
        "@nx/dependency-checks": "error",
      },
    },
  ],
};

/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  extends: ["plugin:@nx/react", "../../.eslintrc.js"],
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
    {
      files: ["*.stories.ts", "*.stories.tsx"],
      rules: {
        "react-hooks/rules-of-hooks": "off",
      },
    },
  ],
};

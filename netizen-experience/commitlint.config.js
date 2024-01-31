module.exports = {
  extends: ["@commitlint/config-nx-scopes", "@commitlint/config-conventional"],
  rules: {
    "subject-case": [2, "always", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
  },
};

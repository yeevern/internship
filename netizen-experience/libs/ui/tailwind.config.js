const path = require("path");
const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("../../tailwind.preset")],
  content: [
    path.join(__dirname, "{src,pages,components,app}/**/*!(*.spec|*.test).{ts,tsx,mdx}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};

const path = require("path");
const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("../../../tailwind.preset")], // @TODO: make this into a pacakge/lib?
  content: [
    path.join(__dirname, "{src,pages,components,app}/**/*!(*.stories|*.spec|*.test).{ts,tsx,mdx}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};

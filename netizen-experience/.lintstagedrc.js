module.exports = {
  "{apps,libs,tools}/**/*.{ts,tsx}": (files) => `nx affected --target=typecheck --files=${files.join(",")}`,
  "{apps,libs,tools}/**/*.{js,jsx,ts,tsx,md}": [
    (files) => `nx affected:lint --files=${files.join(",")}`,
    (files) => `nx format:write --files=${files.join(",")}`,
  ],
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@netizen/utils-types"],
};

module.exports = nextConfig;

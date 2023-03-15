const withTranspileModules = require("next-transpile-modules")(["ui", "role"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects() {
    return [
      {
        source: "/",
        destination: "/week",
        permanent: false,
      },
    ];
  },
  i18n: {
    locales: ["de", "en"],
    defaultLocale: "en",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withTranspileModules(nextConfig);

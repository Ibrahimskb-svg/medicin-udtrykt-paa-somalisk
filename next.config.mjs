/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        // Excludes Google site-verification files ("googleXXXX.html"), which must be
        // served as-is at their literal URL — redirecting them breaks Search Console verification.
        source: "/:slug((?!google)[^.]+)\\.html",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

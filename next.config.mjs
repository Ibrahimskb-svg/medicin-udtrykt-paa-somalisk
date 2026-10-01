/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        // somalimed.dk (uden www) svarede med en 307 (midlertidig) i stedet for en
        // permanent omdirigering til www.somalimed.dk — Google Search Console
        // markerede det som "Side med omdirigering" og nægtede at indeksere siderne,
        // fordi en midlertidig omdirigering ikke er et signal om, hvilken URL der er
        // den rigtige. Denne regel tvinger en permanent (308) omdirigering fra app-
        // laget, uanset hvad Vercels egen domæne-indstilling gør.
        source: "/:path*",
        has: [{ type: "host", value: "somalimed.dk" }],
        destination: "https://www.somalimed.dk/:path*",
        permanent: true,
      },
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

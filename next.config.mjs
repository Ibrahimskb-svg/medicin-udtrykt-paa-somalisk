/** @type {import('next').NextConfig} */
// Basale sikkerhedshoveder på alle sider. Bevidst ingen Content-Security-Policy:
// sitet bruger inline-scripts (Google Analytics og Crisp indlæses efter samtykke),
// og en for stram CSP ville bryde dem. Mikrofon og kamera begrænses heller ikke, da
// stemmesøgning og foto-knappen bruger dem.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "geolocation=(), payment=(), usb=()" },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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

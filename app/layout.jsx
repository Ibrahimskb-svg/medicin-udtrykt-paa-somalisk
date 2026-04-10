import "./globals.css";
import { AppNavbar } from "../src/components/app-navbar";

export const metadata = {
  // ── Primær titel og beskrivelse ────────────────────────────────────────
  title: {
    default: "Somalimed — Macluumaadka Daawooyinka | Lægemiddelinformation | Medicine Information | معلومات الدواء",
    template: "%s | Somalimed",
  },
  description:
    "Somalimed giver klar og pålidelig lægemiddelinformation på somali, dansk, engelsk og arabisk. Gratis og let tilgængelig for patienter og pårørende. " +
    "Somalimed waxay bixisaa macluumaad cad oo la aamin karo oo ku saabsan daawooyinka af-Soomaali, Deenish, Ingiriisi iyo Carabi. " +
    "Free medicine information in Somali, Danish, English and Arabic for patients and families. " +
    "معلومات دوائية واضحة وموثوقة باللغات الصومالية والدنماركية والإنجليزية والعربية.",

  // ── Søgeord — alle 4 sprog ─────────────────────────────────────────────
  keywords: [
    // Dansk
    "lægemiddelinformation", "medicin på somali", "medicin på arabisk",
    "somalisk medicin", "apotek somali", "blodtryksmedicin", "kolesterol medicin",
    "diabetes medicin", "farmakonom", "somalimed", "medicin information dansk",
    "lægemiddel på somalisk", "medicin forklaring",
    // Somali
    "macluumaadka daawooyinka", "daawooyinka af-soomaali", "farmashiye soomaali",
    "daawo macluumaad", "somalimed", "daawooyinka bukaanka", "kiniinnada",
    // English
    "medicine information somali", "somali medicine", "drug information somali",
    "somalimed", "pharmacy somali", "medicine in somali language",
    "medication guide somali danish arabic", "free medicine information",
    // Arabic
    "معلومات الدواء بالصومالية", "دواء بالصومالية", "معلومات دوائية",
    "صيدلية صومالية", "somalimed", "أدوية باللغة الصومالية",
  ],

  // ── Forfattere og udgiver ──────────────────────────────────────────────
  authors: [{ name: "Ibrahim Dahir Hanaf", url: "https://www.somalimed.dk" }],
  creator: "Ibrahim Dahir Hanaf",
  publisher: "Somalimed",

  // ── Kanonisk URL ───────────────────────────────────────────────────────
  metadataBase: new URL("https://www.somalimed.dk"),
  alternates: {
    canonical: "/",
    languages: {
      "so":    "/?lang=so",
      "da":    "/?lang=da",
      "en":    "/?lang=en",
      "ar":    "/?lang=ar",
    },
  },

  // ── Open Graph — til deling på Facebook, LinkedIn m.m. ────────────────
  openGraph: {
    type: "website",
    url: "https://www.somalimed.dk",
    siteName: "Somalimed",
    title: "Somalimed — Lægemiddelinformation på somali, dansk, engelsk og arabisk",
    description:
      "Gratis og pålidelig medicininformation på 4 sprog — somali, dansk, engelsk og arabisk. Skabt af en uddannet Farmakonom for patienter og pårørende.",
    images: [
      {
        url: "/somalimed-icon.svg",
        width: 512,
        height: 512,
        alt: "Somalimed logo",
      },
    ],
    locale: "so_SO",
    alternateLocale: ["da_DK", "en_GB", "ar_SA"],
  },

  // ── Twitter / X kort ──────────────────────────────────────────────────
  twitter: {
    card: "summary",
    title: "Somalimed — Lægemiddelinformation på 4 sprog",
    description:
      "Gratis medicininformation på somali, dansk, engelsk og arabisk. Skabt af en uddannet Farmakonom.",
    images: ["/somalimed-icon.svg"],
  },

  // ── Robots / indeksering ───────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // ── Diverse ───────────────────────────────────────────────────────────
  category: "health",
  classification: "Medicine Information / Healthcare",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="so">
      <head>
        {/* Struktureret data (JSON-LD) — hjælper Google med at forstå siden */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Somalimed",
              "url": "https://www.somalimed.dk",
              "description": "Free medicine information in Somali, Danish, English and Arabic",
              "inLanguage": ["so", "da", "en", "ar"],
              "author": {
                "@type": "Person",
                "name": "Ibrahim Dahir Hanaf",
                "jobTitle": "Pharmaconomist",
                "url": "https://www.somalimed.dk",
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.somalimed.dk/?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Crisp Chat Widget */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.$crisp=[];
              window.CRISP_WEBSITE_ID="7e751734-efef-40ed-9087-aaca70200a7e";
              (function(){
                var d=document;
                var s=d.createElement("script");
                s.src="https://client.crisp.chat/l.js";
                s.async=1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
            `,
          }}
        />
      </head>
      <body>
        <AppNavbar />
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import Script from "next/script";
import { LayoutShell } from "../src/components/layout-shell";
import { ConsentManager } from "../src/components/consent-manager";
import TextZoomControl from "../src/components/text-zoom-control";
import ChatBubble from "../src/components/chat-bubble";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0D9488",
};

export const metadata = {
  title: {
    default: "SomaliMed – Lægemiddelinformation på somalisk",
    template: "%s | SomaliMed",
  },
  description:
    "Somalimed giver klar og pålidelig lægemiddelinformation på somalisk, dansk, engelsk og arabisk. Gratis og let tilgængelig for patienter og pårørende. " +
    "Somalimed waxay bixisaa macluumaad cad oo la aamin karo oo ku saabsan daawooyinka af-Soomaali, Deenish, Ingiriisi iyo Carabi. " +
    "Free medicine information in Somali, Danish, English and Arabic for patients and families. " +
    "معلومات دوائية واضحة وموثوقة باللغات الصومالية والدنماركية والإنجليزية والعربية.",
  keywords: [
    "lægemiddelinformation","medicin på somali","medicin på arabisk","somalisk medicin","apotek somali","blodtryksmedicin","kolesterol medicin","diabetes medicin","farmakonom","somalimed","medicin information dansk","lægemiddel på somalisk","medicin forklaring",
    "macluumaadka daawooyinka","daawooyinka af-soomaali","farmashiye soomaali","daawo macluumaad","somalimed","daawooyinka bukaanka","kiniinnada",
    "medicine information somali","somali medicine","drug information somali","somalimed","pharmacy somali","medicine in somali language","medication guide somali danish arabic","free medicine information",
    "معلومات الدواء بالصومالية","دواء بالصومالية","معلومات دوائية","صيدلية صومالية","somalimed","أدوية باللغة الصومالية",
  ],
  authors: [{ name: "Ibrahim Dahir Hanaf", url: "https://www.somalimed.dk" }],
  creator: "Ibrahim Dahir Hanaf",
  publisher: "Somalimed",
  metadataBase: new URL("https://www.somalimed.dk"),
  alternates: {
    canonical: "/",
    languages: { so: "/?lang=so", da: "/?lang=da", en: "/?lang=en", ar: "/?lang=ar" },
  },
  openGraph: {
    type: "website",
    url: "https://www.somalimed.dk",
    siteName: "Somalimed",
    title: "Somalimed — Lægemiddelinformation på somalisk, dansk, engelsk og arabisk",
    description: "Gratis og pålidelig medicininformation på 4 sprog — somalisk, dansk, engelsk og arabisk. Skabt af en uddannet Farmakonom for patienter og pårørende.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Somalimed — lægemiddelinformation på somalisk, dansk, engelsk og arabisk" }],
    locale: "so_SO",
    alternateLocale: ["da_DK", "en_GB", "ar_SA"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Somalimed — Lægemiddelinformation på 4 sprog",
    description: "Gratis medicininformation på somalisk, dansk, engelsk og arabisk. Skabt af en uddannet Farmakonom.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  category: "health",
  classification: "Medicine Information / Healthcare",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Somalimed",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="so">
      <head>
        {/* GA4 + Crisp loaded by ConsentManager after cookie consent */}

        <Script
          id="somalimed-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Somalimed",
              url: "https://www.somalimed.dk",
              description: "Free medicine information in Somali, Danish, English and Arabic",
              inLanguage: ["so", "da", "en", "ar"],
              author: { "@type": "Person", name: "Ibrahim Dahir Hanaf", jobTitle: "Pharmaconomist", url: "https://www.somalimed.dk" },
              potentialAction: { "@type": "SearchAction", target: "https://www.somalimed.dk/?search={search_term_string}", "query-input": "required name=search_term_string" },
            }),
          }}
        />
      </head>

      <body>
        <LayoutShell>{children}</LayoutShell>
        <ConsentManager />
        <TextZoomControl />

        <ChatBubble />

        {/* Crisps eget chatikon docker altid nederst til højre med et højt
            z-index og overlapper vores mobile bundmenu (også fixed bottom-0).
            Dette er en tredjeparts-widget uden for vores kontrol, så den kan
            ikke gøres til en almindelig React-komponent som ChatBubble —
            den skal stadig findes og flyttes i selve DOM'en. */}
        <Script id="crisp-reposition-script" strategy="afterInteractive">
          {`
            (function () {
              function repositionCrisp() {
                try {
                  var root = document.getElementById("crisp-chatbox");
                  if (!root) return;
                  var navEl = document.querySelector("nav.fixed.bottom-0");
                  var navVisible = navEl && getComputedStyle(navEl).display !== "none" && navEl.offsetHeight > 0;
                  var divs = root.querySelectorAll("div");
                  for (var i = 0; i < divs.length; i++) {
                    var el = divs[i];
                    var cs = getComputedStyle(el);
                    if (
                      cs.position === "fixed" &&
                      parseInt(cs.bottom || "0", 10) < 40 &&
                      el.offsetWidth > 40 && el.offsetWidth < 80 &&
                      el.offsetHeight > 40 && el.offsetHeight < 80
                    ) {
                      if (navVisible) {
                        el.style.setProperty("bottom", (navEl.getBoundingClientRect().height + 12) + "px", "important");
                      } else {
                        el.style.removeProperty("bottom");
                      }
                      break;
                    }
                  }
                } catch (e) {}
              }
              var scheduled = false;
              function scheduleReposition() {
                if (scheduled) return;
                scheduled = true;
                requestAnimationFrame(function () {
                  scheduled = false;
                  repositionCrisp();
                });
              }
              new MutationObserver(scheduleReposition).observe(document.documentElement, { childList: true, subtree: true });
              window.addEventListener("resize", scheduleReposition);
              setInterval(scheduleReposition, 2000);
            })();
          `}
        </Script>

        <Script id="sw-register" strategy="afterInteractive">{`
          if ("serviceWorker" in navigator) {
            function registerSW() {
              navigator.serviceWorker.register("/sw.js").catch(function () {});
            }
            if (document.readyState === "complete") {
              registerSW();
            } else {
              window.addEventListener("load", registerSW);
            }
          }
        `}</Script>
      </body>
    </html>
  );
}

import "./globals.css";
import Script from "next/script";
import { AppNavbar } from "../src/components/app-navbar";

export const metadata = {
  title: {
    default: "Somalimed — Macluumaadka Daawooyinka | Lægemiddelinformation | Medicine Information | معلومات الدواء",
    template: "%s | Somalimed",
  },
  description:
    "Somalimed giver klar og pålidelig lægemiddelinformation på somali, dansk, engelsk og arabisk. Gratis og let tilgængelig for patienter og pårørende. " +
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
    title: "Somalimed — Lægemiddelinformation på somali, dansk, engelsk og arabisk",
    description: "Gratis og pålidelig medicininformation på 4 sprog — somali, dansk, engelsk og arabisk. Skabt af en uddannet Farmakonom for patienter og pårørende.",
    images: [{ url: "/somalimed-icon.svg", width: 512, height: 512, alt: "Somalimed logo" }],
    locale: "so_SO",
    alternateLocale: ["da_DK", "en_GB", "ar_SA"],
  },
  twitter: {
    card: "summary",
    title: "Somalimed — Lægemiddelinformation på 4 sprog",
    description: "Gratis medicininformation på somali, dansk, engelsk og arabisk. Skabt af en uddannet Farmakonom.",
    images: ["/somalimed-icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  category: "health",
  classification: "Medicine Information / Healthcare",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="so">
      <head>
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
        <Script id="crisp-chat" strategy="afterInteractive">
          {`
            window.$crisp = window.$crisp || [];
            window.CRISP_WEBSITE_ID = "7e751734-efef-40ed-9087-aaca70200a7e";
            (function() {
              var d = document;
              var s = d.createElement("script");
              s.src = "https://client.crisp.chat/l.js";
              s.async = 1;
              d.head.appendChild(s);
            })();
          `}
        </Script>
      </head>

      <body>
        <AppNavbar />
        {children}

        <style dangerouslySetInnerHTML={{ __html: `
          #sm-bubble {
            position: fixed;
            bottom: 86px;
            right: 16px;
            z-index: 99998;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            background: linear-gradient(135deg, #0D9488, #0284C7);
            color: #fff;
            font-size: 13px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 12px 14px 12px 12px;
            border-radius: 18px 18px 4px 18px;
            box-shadow: 0 8px 28px rgba(13,148,136,0.45), 0 2px 8px rgba(0,0,0,0.12);
            max-width: 220px;
            line-height: 1.45;
            cursor: pointer;
            animation: smPop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards,
                       smFloat 3s ease-in-out 0.5s infinite;
            border: none;
          }
          #sm-bubble::after {
            content: "";
            position: absolute;
            bottom: -7px;
            right: 22px;
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 0 solid transparent;
            border-top: 7px solid #0284C7;
          }
          #sm-bubble-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(255,255,255,0.5);
            flex-shrink: 0;
            margin-top: 1px;
          }
          #sm-bubble-avatar-fallback {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 14px;
          }
          #sm-bubble-text {
            flex: 1;
          }
          #sm-bubble-name {
            font-size: 11px;
            font-weight: 700;
            opacity: 0.85;
            margin-bottom: 2px;
            letter-spacing: 0.02em;
          }
          #sm-bubble-msg {
            font-size: 13px;
            font-weight: 600;
            line-height: 1.4;
          }
          #sm-bubble-close {
            position: absolute;
            top: -7px;
            right: -7px;
            width: 20px;
            height: 20px;
            background: #475569;
            border-radius: 50%;
            color: #fff;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 2px solid #fff;
            line-height: 1;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          }
          @keyframes smPop {
            from { opacity: 0; transform: scale(0.6) translateY(12px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes smFloat {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(-5px); }
          }
          @media (max-width: 640px) {
            #sm-bubble { right: 12px; bottom: 80px; max-width: 195px; font-size: 12px; padding: 10px 12px 10px 10px; }
          }
        ` }} />

        <Script id="sm-bubble-script" strategy="afterInteractive">
          {`
            (function () {
              var messages = {
                so: "Su'aal ma qabtaa? La sheekeyso Ibraahim.",
                da: "Har du et spørgsmål? Chat med Ibrahim.",
                en: "Do you have a question? Chat with Ibrahim.",
                ar: "هل لديك سؤال؟ تحدث مع إبراهيم."
              };
              var names = { so: "Ibraahim", da: "Ibrahim", en: "Ibrahim", ar: "إبراهيم" };
              var colors = {
                so: { bg: "linear-gradient(135deg,#0D9488,#0F766E)", tail: "#0F766E", shadow: "rgba(13,148,136,0.45)" },
                da: { bg: "linear-gradient(135deg,#2563EB,#1D4ED8)", tail: "#1D4ED8", shadow: "rgba(37,99,235,0.45)" },
                en: { bg: "linear-gradient(135deg,#92400E,#B45309)", tail: "#B45309", shadow: "rgba(146,64,14,0.45)" },
                ar: { bg: "linear-gradient(135deg,#D97706,#B45309)", tail: "#B45309", shadow: "rgba(217,119,6,0.45)" },
              };

              function getLang() {
                try {
                  var u = new URLSearchParams(window.location.search).get("lang");
                  if (u && messages[u]) return u;
                  var s = localStorage.getItem("somalimed_lang") || localStorage.getItem("lang");
                  if (s && messages[s]) return s;
                } catch (e) {}
                return "so";
              }

              function remove() {
                var el = document.getElementById("sm-bubble");
                if (el) el.remove();
              }

              function openChat() {
                try { if (window.$crisp) window.$crisp.push(["do", "chat:open"]); } catch(e) {}
              }

              function create() {
                if (!document.body || document.getElementById("sm-bubble")) return;
                var lang = getLang();
                var msg = messages[lang] || messages.so;
                var name = names[lang] || names.so;
                var color = colors[lang] || colors.so;
                var isRtl = lang === "ar";

                var bubble = document.createElement("div");
                bubble.id = "sm-bubble";
                bubble.style.direction = isRtl ? "rtl" : "ltr";
                bubble.style.background = color.bg;
                bubble.style.boxShadow = "0 8px 28px " + color.shadow + ", 0 2px 8px rgba(0,0,0,0.12)";

                // Override the ::after tail color via a style tag
                var tailStyle = document.getElementById("sm-bubble-tail-style");
                if (tailStyle) tailStyle.remove();
                var ts = document.createElement("style");
                ts.id = "sm-bubble-tail-style";
                ts.textContent = "#sm-bubble::after { border-top-color: " + color.tail + " !important; }";
                document.head.appendChild(ts);

                bubble.innerHTML =
                  '<button id="sm-bubble-close" onclick="event.stopPropagation();this.parentElement.remove()">✕</button>' +
                  '<div id="sm-bubble-avatar-fallback">💬</div>' +
                  '<div id="sm-bubble-text">' +
                    '<div id="sm-bubble-name">' + name + '</div>' +
                    '<div id="sm-bubble-msg">' + msg + '</div>' +
                  '</div>';

                bubble.addEventListener("click", function() { openChat(); remove(); });

                // Try to load Ibrahim's photo
                var img = document.createElement("img");
                img.id = "sm-bubble-avatar";
                img.src = "/Ibrahim.png";
                img.alt = name;
                img.onload = function() {
                  var fb = document.getElementById("sm-bubble-avatar-fallback");
                  if (fb) fb.replaceWith(img);
                };

                document.body.appendChild(bubble);

                setTimeout(function() {
                  var b = document.getElementById("sm-bubble");
                  if (!b) return;
                  b.style.transition = "opacity 0.5s ease";
                  b.style.opacity = "0";
                  setTimeout(remove, 500);
                }, 8000);
              }

              function schedule() { remove(); setTimeout(create, 3000); }

              if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", schedule);
              } else { schedule(); }

              window.addEventListener("popstate", function() { setTimeout(schedule, 400); });
              var oPS = history.pushState;
              history.pushState = function() { oPS.apply(this, arguments); setTimeout(schedule, 400); };
              var oRS = history.replaceState;
              history.replaceState = function() { oRS.apply(this, arguments); setTimeout(schedule, 400); };
            })();
          `}
        </Script>
      </body>
    </html>
  );
}

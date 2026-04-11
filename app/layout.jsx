import "./globals.css";
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
    languages: { "so":"/?lang=so", "da":"/?lang=da", "en":"/?lang=en", "ar":"/?lang=ar" },
  },
  openGraph: {
    type: "website",
    url: "https://www.somalimed.dk",
    siteName: "Somalimed",
    title: "Somalimed — Lægemiddelinformation på somali, dansk, engelsk og arabisk",
    description: "Gratis og pålidelig medicininformation på 4 sprog — somali, dansk, engelsk og arabisk. Skabt af en uddannet Farmakonom for patienter og pårørende.",
    images: [{ url:"/somalimed-icon.svg", width:512, height:512, alt:"Somalimed logo" }],
    locale: "so_SO",
    alternateLocale: ["da_DK","en_GB","ar_SA"],
  },
  twitter: {
    card: "summary",
    title: "Somalimed — Lægemiddelinformation på 4 sprog",
    description: "Gratis medicininformation på somali, dansk, engelsk og arabisk. Skabt af en uddannet Farmakonom.",
    images: ["/somalimed-icon.svg"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index:true, follow:true, "max-snippet":-1, "max-image-preview":"large", "max-video-preview":-1 },
  },
  category: "health",
  classification: "Medicine Information / Healthcare",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="so">
      <head>
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context":"https://schema.org",
              "@type":"WebSite",
              "name":"Somalimed",
              "url":"https://www.somalimed.dk",
              "description":"Free medicine information in Somali, Danish, English and Arabic",
              "inLanguage":["so","da","en","ar"],
              "author":{ "@type":"Person","name":"Ibrahim Dahir Hanaf","jobTitle":"Pharmaconomist","url":"https://www.somalimed.dk" },
              "potentialAction":{ "@type":"SearchAction","target":"https://www.somalimed.dk/?search={search_term_string}","query-input":"required name=search_term_string" },
            }),
          }}
        />

        {/* Crisp Chat */}
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

        {/* Animated chat bubble styles */}
        <style dangerouslySetInnerHTML={{__html:`
          #somalimed-chat-bubble {
            position: fixed;
            bottom: 90px;
            right: 20px;
            z-index: 99998;
            background: #fff;
            color: #0f172a;
            font-size: 14px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 10px 16px;
            border-radius: 20px 20px 4px 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            max-width: 200px;
            line-height: 1.4;
            animation: bubblePop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards,
                       bubbleFloat 3s ease-in-out 0.4s infinite;
            border: 1px solid #e2e8f0;
            cursor: pointer;
          }
          #somalimed-chat-bubble::after {
            content: '';
            position: absolute;
            bottom: -8px;
            right: 18px;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 0px solid transparent;
            border-top: 8px solid #fff;
            filter: drop-shadow(0 2px 1px rgba(0,0,0,0.08));
          }
          #somalimed-chat-bubble-close {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            background: #64748b;
            border-radius: 50%;
            color: #fff;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            line-height: 1;
          }
          @keyframes bubblePop {
            from { opacity:0; transform: scale(0.5) translateY(10px); }
            to   { opacity:1; transform: scale(1) translateY(0); }
          }
          @keyframes bubbleFloat {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(-4px); }
          }
        `}}/>

        {/* Chat bubble script */}
        <script dangerouslySetInnerHTML={{__html:`
          (function() {
            var messages = {
              so: "Su'aal ma qabtaa? La sheekeyso Ibraahim.",
              da: "Har du et spørgsmål? Chat med Ibraahim.",
              en: "Do you have a question? Chat with Ibraahim.",
              ar: "هل لديك سؤال؟ تحدث مع إبراهيم."
            };
            function getLang() {
              try {
                var p = new URLSearchParams(window.location.search).get('lang');
                if (p) return p;
                var s = localStorage.getItem('somalimed_lang');
                if (s) return s;
              } catch(e) {}
              return 'so';
            }
            function createBubble() {
              if (document.getElementById('somalimed-chat-bubble')) return;
              var lang = getLang();
              var msg = messages[lang] || messages['so'];
              var bubble = document.createElement('div');
              bubble.id = 'somalimed-chat-bubble';
              bubble.innerHTML =
                '<button id="somalimed-chat-bubble-close" onclick="event.stopPropagation();document.getElementById(\'somalimed-chat-bubble\').remove()">✕</button>' +
                msg;
              bubble.addEventListener('click', function() {
                if (window.$crisp) window.$crisp.push(['do', 'chat:open']);
                bubble.remove();
              });
              document.body.appendChild(bubble);
              setTimeout(function() {
                var b = document.getElementById('somalimed-chat-bubble');
                if (b) { b.style.transition = 'opacity 0.5s'; b.style.opacity = '0'; }
                setTimeout(function() {
                  var b2 = document.getElementById('somalimed-chat-bubble');
                  if (b2) b2.remove();
                }, 500);
              }, 8000);
            }
            setTimeout(createBubble, 3000);
          })();
        `}}/>
      </body>
    </html>
  );
}

"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { LANG_THEME } from "./modal-shell";

const BANNER_LANG_KEY = "cookieBannerLang";
const LANG_NAMES = { da: "Dansk", so: "Soomaali", en: "English", ar: "العربية" };
const LANG_ORDER = ["da", "so", "en", "ar"];

const TEXTS = {
  da: {
    title: "Vi bruger cookies",
    body: "Vi bruger Google Analytics til at forstå, hvordan siden bruges, og Crisp Chat til at besvare dine spørgsmål. Dine data deles ikke med tredjeparter til kommercielle formål.",
    accept: "Accepter alle",
    reject: "Kun nødvendige",
    policy: "Cookiepolitik",
    settings: "Cookie- og sprogindstillinger",
  },
  en: {
    title: "We use cookies",
    body: "We use Google Analytics to understand how the site is used, and Crisp Chat to answer your questions. Your data is not shared with third parties for commercial purposes.",
    accept: "Accept all",
    reject: "Essential only",
    policy: "Cookie policy",
    settings: "Cookie and language settings",
  },
  so: {
    title: "Waxaan isticmaalnaa cookies",
    body: "Waxaan isticmaalnaa Google Analytics si aan u fahanno sida bogga loo adeegsado, iyo Crisp Chat si aan su'aalahaaga uga jawaabno. Xogta kuma wadaagno xisbiyada saddexaad ujeedooyin ganacsiga ah.",
    accept: "Aqbal oo dhan",
    reject: "Kuwa lagama maarmaanka ah oo keliya",
    policy: "Siyaasadda cookies",
    settings: "Dejinta cookies iyo luuqadda",
  },
  ar: {
    title: "نستخدم ملفات تعريف الارتباط",
    body: "نستخدم Google Analytics لفهم كيفية استخدام الموقع، وCrisp Chat للرد على أسئلتك. لا تُشارك بياناتك مع أطراف ثالثة لأغراض تجارية.",
    accept: "قبول الكل",
    reject: "الضرورية فقط",
    policy: "سياسة الكوكيز",
    settings: "إعدادات الكوكيز واللغة",
  },
};

export function ConsentManager() {
  const pathname = usePathname();
  const [consent, setConsent] = useState(null);
  const [checked, setChecked] = useState(false);
  const [lang, setLang] = useState("da");
  const [reopened, setReopened] = useState(false);
  const [isAutomatedTraffic, setIsAutomatedTraffic] = useState(false);

  useEffect(() => {
    // Udelukker automatiserede test-browsere (bruges til at verificere ændringer
    // før udgivelse) fra at blive talt med i Google Analytics — deres user-agent
    // afslører dem (indeholder "Claude" og/eller "Electron", som en almindelig
    // besøgendes browser aldrig har).
    const ua = navigator.userAgent || "";
    setIsAutomatedTraffic(/Claude\/|Electron\//.test(ua));

    const stored = localStorage.getItem("cookieConsent");
    if (stored) setConsent(stored);
    // Banneret vælger bevidst sit eget sprog (default dansk) i stedet for
    // sitets indholdssprog ("selectedLanguage") — besøgende der ikke forstår
    // somalisk skal ikke mødes af et somalisk cookie-banner.
    const l = localStorage.getItem(BANNER_LANG_KEY);
    setLang(TEXTS[l] ? l : "da");
    setChecked(true);
  }, []);

  function changeLang(l) {
    setLang(l);
    localStorage.setItem(BANNER_LANG_KEY, l);
  }

  function accept() {
    localStorage.setItem("cookieConsent", "accepted");
    setConsent("accepted");
    setReopened(false);
  }

  function reject() {
    localStorage.setItem("cookieConsent", "rejected");
    setConsent("rejected");
    setReopened(false);
  }

  const t = TEXTS[lang] ?? TEXTS.da;
  const isRtl = lang === "ar";
  const theme = LANG_THEME[lang] ?? LANG_THEME.da;

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <>
      {consent === "accepted" && !isAutomatedTraffic && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-D69NS55FP0"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D69NS55FP0');
          `}</Script>
          <Script id="crisp-chat" strategy="afterInteractive">{`
            window.$crisp = window.$crisp || [];
            window.CRISP_WEBSITE_ID = "7e751734-efef-40ed-9087-aaca70200a7e";
            (function(){
              var d=document, s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.head.appendChild(s);
            })();
          `}</Script>
        </>
      )}

      {checked && consent !== null && !reopened && (
        <button
          onClick={() => setReopened(true)}
          aria-label={t.settings}
          title={t.settings}
          style={{
            position: "fixed", bottom: "calc(68px + env(safe-area-inset-bottom, 0px))", left: 16, zIndex: 500,
            width: 40, height: 40, borderRadius: "50%",
            background: "#ffffff", border: "1.5px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
            fontSize: "18px", lineHeight: 1, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          🍪
        </button>
      )}

      {checked && (consent === null || reopened) && (
        <div
          role="dialog"
          aria-label={t.title}
          style={{
            position: "fixed",
            bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
            left: "16px", right: "16px", zIndex: 99999,
            maxWidth: "920px", margin: "0 auto",
            background: "#ffffff", border: `2px solid ${theme.primary}`,
            borderRadius: "20px",
            padding: "18px 22px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
            boxShadow: "0 12px 36px rgba(15,23,42,0.16)",
            direction: isRtl ? "rtl" : "ltr",
          }}
        >
          <div style={{ flex: 1, minWidth: "260px", maxWidth: "680px" }}>
            <p style={{ fontWeight: 700, margin: "0 0 4px 0", color: theme.primary, fontSize: "14px" }}>
              🍪 {t.title}
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
              {t.body}{" "}
              <a href={`/cookiepolitik?lang=${lang}`} style={{ color: theme.primary, textDecoration: "underline", fontWeight: 600 }}>
                {t.policy}
              </a>
            </p>
            <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
              {LANG_ORDER.map((l) => {
                const btnTheme = LANG_THEME[l] ?? LANG_THEME.da;
                return (
                  <button
                    key={l}
                    onClick={() => changeLang(l)}
                    aria-pressed={l === lang}
                    style={{
                      padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                      border: l === lang ? `1.5px solid ${btnTheme.primary}` : "1.5px solid #e2e8f0",
                      background: l === lang ? `${btnTheme.primary}15` : "#fff",
                      color: l === lang ? btnTheme.primary : "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {LANG_NAMES[l]}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={reject}
              style={{
                padding: "9px 16px", borderRadius: "8px",
                border: "1.5px solid #cbd5e1", background: "#f8fafc",
                color: "#475569", fontWeight: 600, cursor: "pointer",
                fontSize: "13px", whiteSpace: "nowrap",
              }}
            >
              {t.reject}
            </button>
            <button
              onClick={accept}
              style={{
                padding: "9px 20px", borderRadius: "8px",
                border: "none", background: theme.primary,
                color: "#ffffff", fontWeight: 700, cursor: "pointer",
                fontSize: "13px", whiteSpace: "nowrap",
              }}
            >
              {t.accept}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

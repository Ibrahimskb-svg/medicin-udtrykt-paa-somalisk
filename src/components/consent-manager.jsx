"use client";
import { useState, useEffect } from "react";
import Script from "next/script";

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
  const [consent, setConsent] = useState(null);
  const [checked, setChecked] = useState(false);
  const [lang, setLang] = useState("da");
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
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

  return (
    <>
      {consent === "accepted" && (
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
            position: "fixed", bottom: 16, left: 16, zIndex: 99997,
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
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999,
            background: "#ffffff", borderTop: "2px solid #0D9488",
            padding: "16px 24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
            direction: isRtl ? "rtl" : "ltr",
          }}
        >
          <div style={{ flex: 1, minWidth: "260px", maxWidth: "680px" }}>
            <p style={{ fontWeight: 700, margin: "0 0 4px 0", color: "#0D9488", fontSize: "14px" }}>
              🍪 {t.title}
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
              {t.body}{" "}
              <a href="/cookiepolitik" style={{ color: "#0D9488", textDecoration: "underline", fontWeight: 600 }}>
                {t.policy}
              </a>
            </p>
            <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
              {LANG_ORDER.map((l) => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  aria-pressed={l === lang}
                  style={{
                    padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                    border: l === lang ? "1.5px solid #0D9488" : "1.5px solid #e2e8f0",
                    background: l === lang ? "#0D948815" : "#fff",
                    color: l === lang ? "#0D9488" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {LANG_NAMES[l]}
                </button>
              ))}
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
                border: "none", background: "#0D9488",
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

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Tidligere var denne side hardkodet dansk, ustylet, og lækkede intern
// migrerings-tekst ("findes ikke i den migrerede Next.js-app") direkte til
// besøgende — en sundhedsside bør aldrig vise den slags implementerings-
// detaljer. Samme sprog-genkendelse som app/error.jsx, plus nok
// top-afstand til at undgå at kollidere med zoom-widgettens faste position.
const TEXT = {
  da: { title: "Siden blev ikke fundet", body: "Den side, du leder efter, findes ikke — den kan være flyttet eller slettet.", link: "Til forsiden" },
  en: { title: "Page not found", body: "The page you're looking for doesn't exist — it may have been moved or removed.", link: "Go to homepage" },
  so: { title: "Boggan lama helin", body: "Boggaad raadinayso ma jiro — waa laga yaabaa in la beddelay ama la tirtiray.", link: "Tag bogga hore" },
  ar: { title: "الصفحة غير موجودة", body: "الصفحة التي تبحث عنها غير موجودة — ربما تم نقلها أو حذفها.", link: "الصفحة الرئيسية" },
};

export default function NotFoundPage() {
  const [lang, setLang] = useState("so");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (["da", "en", "so", "ar"].includes(urlLang)) {
        setLang(urlLang);
      } else {
        const stored = window.localStorage.getItem("selectedLanguage");
        if (["da", "en", "so", "ar"].includes(stored)) setLang(stored);
      }
    } catch (e) {}
  }, []);

  const t = TEXT[lang] || TEXT.so;
  const isRtl = lang === "ar";

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "110px 20px 32px", gap: "14px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{t.title}</h1>
      <p style={{ fontSize: "15px", color: "#475569", maxWidth: 420, margin: 0, lineHeight: 1.6 }}>{t.body}</p>
      <Link
        href="/"
        style={{ marginTop: "8px", padding: "12px 22px", borderRadius: "999px", background: "#0D9488", color: "#fff", border: "none", fontWeight: 700, fontSize: "14px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
      >
        {t.link}
      </Link>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Ekstra sikkerhedsnet: fanger uventede fejl der ellers ville give en helt
// hvid, tom side (fx hvis localStorage kaster i en browser med blokeret
// storage, eller en anden uforudset fejl). Holdes bevidst simpel og uden
// afhængighed af sitets egne sprogdata-filer — den skal selv kunne vise sig
// korrekt, uanset hvad der gik galt andetsteds i appen.
const TEXT = {
  da: { title: "Noget gik galt", body: "Siden stødte på en uventet fejl. Prøv at genindlæse siden.", retry: "Prøv igen", home: "Til forsiden" },
  en: { title: "Something went wrong", body: "The page ran into an unexpected error. Try reloading the page.", retry: "Try again", home: "Go to homepage" },
  so: { title: "Wax baa khaldamay", body: "Boggu wuxuu la kulmay khalad lama filaan ah. Isku day inaad dib u soo rartid boggan.", retry: "Isku day mar kale", home: "Tag bogga hore" },
  ar: { title: "حدث خطأ ما", body: "واجهت الصفحة خطأ غير متوقع. حاول إعادة تحميل الصفحة.", retry: "حاول مرة أخرى", home: "الصفحة الرئيسية" },
};

export default function ErrorBoundary({ error, reset }) {
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
    if (error) console.error(error);
  }, [error]);

  const t = TEXT[lang] || TEXT.so;
  const isRtl = lang === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "32px 20px", gap: "14px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{t.title}</h1>
      <p style={{ fontSize: "15px", color: "#475569", maxWidth: 420, margin: 0, lineHeight: 1.6 }}>{t.body}</p>
      <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{ padding: "12px 22px", borderRadius: "999px", background: "#0D9488", color: "#fff", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
        >
          {t.retry}
        </button>
        <Link
          href="/"
          style={{ padding: "12px 22px", borderRadius: "999px", background: "#fff", color: "#0D9488", border: "1.5px solid #0D9488", fontWeight: 700, fontSize: "14px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
        >
          {t.home}
        </Link>
      </div>
    </div>
  );
}

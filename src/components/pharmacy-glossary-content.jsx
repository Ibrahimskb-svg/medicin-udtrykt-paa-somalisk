"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { formatRevisedDate } from "../lib/format-revised-date";
import { LAST_REVISED_ISO } from "../data/last-revised.generated";
import { LegalLangNav } from "./legal-lang-nav";
import { SECTION_COLORS } from "./legal-section";
import { pharmacyGlossary } from "../data/pharmacy-glossary";

const REVISED_PREFIX = { da: "Sidst opdateret", en: "Last updated", so: "La cusbooneysiiyay", ar: "آخر تحديث" };

const TITLE = {
  da: "Forstå dit apoteksbesøg",
  en: "Understand your pharmacy visit",
  so: "Faham booqashadaada farmashiyaha",
  ar: "افهم زيارتك للصيدلية",
};

const SUBTITLE = {
  da: "En ordliste over de danske ord, du møder på recepten og på apoteket — forklaret enkelt, så du ved, hvad de betyder, næste gang du hører dem.",
  en: "A glossary of the Danish words you'll meet on your prescription and at the pharmacy — explained simply, so you know what they mean next time you hear them.",
  so: "Waa liis ku saabsan ereyada Deenish ee aad ku arki doonto warqadda daawada iyo farmashiyaha — oo si fudud loo sharaxay, si aad u ogaato waxay macneeyaan markaad mar dambe maqasho.",
  ar: "قائمة بالكلمات الدنماركية التي ستقابلها في وصفتك الطبية وفي الصيدلية — موضحة ببساطة، لتعرف معناها في المرة القادمة التي تسمعها فيها.",
};

const SEARCH_PLACEHOLDER = { da: "Søg et ord…", en: "Search a word…", so: "Raadi ereyga…", ar: "ابحث عن كلمة…" };
const EMPTY_RESULT = {
  da: "Ingen ord matcher din søgning.",
  en: "No words match your search.",
  so: "Ereyna kuma jiraan raadintaada.",
  ar: "لا توجد كلمات تطابق بحثك.",
};
const BACK_LABEL = { da: "← Til forsiden", en: "← To the homepage", so: "← Ku laabo bogga hore", ar: "← إلى الصفحة الرئيسية" };
const DISCLAIMER = {
  da: "Denne ordliste er en generel forklaring, ikke en officiel juridisk tekst. Reglerne (fx tilskud) kan ændre sig — spørg altid dit eget apotek om detaljer, der gælder præcis din situation.",
  en: "This glossary is a general explanation, not an official legal text. The rules (e.g. reimbursement) can change — always ask your own pharmacy about details that apply to your exact situation.",
  so: "Liiskani waa sharaxaad guud, mana aha qoraal sharci oo rasmi ah. Xeerarka (tusaale, kaalmada lacageed) way is bedbeddeli karaan — had iyo jeer weydii farmashiyahaaga faahfaahin ku saabsan xaaladdaada gaarka ah.",
  ar: "هذه القائمة شرح عام، وليست نصًا قانونيًا رسميًا. القواعد (مثل الدعم المالي) قد تتغير — اسأل دائمًا صيدليتك عن التفاصيل التي تنطبق على حالتك بالضبط.",
};

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7.5" /><path d="m20 20-4.2-4.2" />
    </svg>
  );
}

export function PharmacyGlossaryContent({ initialLanguage }) {
  const { language, updateLanguage } = useLanguageRouting({ initialLanguage });
  const isRtl = language === "ar";
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pharmacyGlossary;
    return pharmacyGlossary.filter((entry) => {
      const term = (entry.term[language] ?? entry.term.da).toLowerCase();
      const explanation = (entry.explanation[language] ?? entry.explanation.da).toLowerCase();
      return term.includes(q) || explanation.includes(q);
    });
  }, [query, language]);

  return (
    <main dir={isRtl ? "rtl" : "ltr"} style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 24px 80px", fontFamily: "system-ui, sans-serif", color: "#1e293b", lineHeight: 1.8 }}>
      <Link
        href={{ pathname: "/", query: { lang: language } }}
        style={{ display: "inline-block", marginBottom: "20px", fontSize: "13px", fontWeight: 700, color: "#0D9488", textDecoration: "none" }}
      >
        {BACK_LABEL[language] ?? BACK_LABEL.so}
      </Link>

      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0D9488", marginBottom: "8px" }}>{TITLE[language] ?? TITLE.so}</h1>
      <p style={{ fontSize: "13px", color: "#556173", marginBottom: "4px" }}>
        {REVISED_PREFIX[language] ?? REVISED_PREFIX.so}: {formatRevisedDate(LAST_REVISED_ISO, language)}
      </p>
      <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, margin: "14px 0 28px" }}>
        {SUBTITLE[language] ?? SUBTITLE.so}
      </p>

      <LegalLangNav language={language} onChange={updateLanguage} />

      <div
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          borderRadius: "14px", border: "1.5px solid #e2e8f0", background: "#fff",
          padding: "11px 14px", marginBottom: "24px",
        }}
      >
        <span style={{ color: "#94a3b8", display: "flex" }}><SearchIcon /></span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={SEARCH_PLACEHOLDER[language] ?? SEARCH_PLACEHOLDER.so}
          style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", background: "transparent", color: "#0f172a" }}
        />
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: "14px", color: "#94a3b8" }}>{EMPTY_RESULT[language] ?? EMPTY_RESULT.so}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px" }}>
          {filtered.map((entry, i) => {
            const color = SECTION_COLORS[i % SECTION_COLORS.length];
            return (
              <div
                key={entry.id}
                style={{
                  borderRadius: "16px", border: "1.5px solid #e2e8f0", background: "#fff",
                  padding: "16px 18px", borderInlineStart: `4px solid ${color}`,
                }}
              >
                <h3 style={{ fontSize: "16px", fontWeight: 800, color, margin: "0 0 6px" }}>
                  {entry.term[language] ?? entry.term.da}
                </h3>
                <p style={{ fontSize: "14px", color: "#334155", margin: 0 }}>
                  {entry.explanation[language] ?? entry.explanation.da}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
        {DISCLAIMER[language] ?? DISCLAIMER.so}
      </p>
    </main>
  );
}

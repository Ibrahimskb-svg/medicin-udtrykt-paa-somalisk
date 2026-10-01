"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { formatRevisedDate } from "../lib/format-revised-date";
import { LAST_REVISED_ISO } from "../data/last-revised.generated";
import { LegalLangNav } from "./legal-lang-nav";
import { SECTION_COLORS } from "./legal-section";
import { pharmacyGlossary } from "../data/pharmacy-glossary";
import { PharmacyFlashcards } from "./pharmacy-flashcards";

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

const TAB_LABELS = {
  da: { list: "Liste", cards: "Flashcards" },
  en: { list: "List", cards: "Flashcards" },
  so: { list: "Liiska", cards: "Kaararka barashada" },
  ar: { list: "القائمة", cards: "بطاقات تعليمية" },
};

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7.5" /><path d="m20 20-4.2-4.2" />
    </svg>
  );
}

function ListIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function CardsIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="13" height="16" rx="2.5" transform="rotate(-8 9.5 13)" />
      <rect x="7" y="3" width="13" height="16" rx="2.5" />
    </svg>
  );
}

export function PharmacyGlossaryContent({ initialLanguage, initialView }) {
  const { language, updateLanguage } = useLanguageRouting({ initialLanguage });
  const isRtl = language === "ar";
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState(initialView === "cards" ? "cards" : "list");
  const tabText = TAB_LABELS[language] ?? TAB_LABELS.so;

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
        style={{ display: "inline-block", marginBottom: "20px", fontSize: "13px", fontWeight: 700, color: "#0B7A70", textDecoration: "none" }}
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
        role="tablist"
        style={{
          display: "flex", gap: "6px", borderRadius: "16px", background: "#f0fdfa",
          border: "1.5px solid #99f6e4", padding: "5px", marginBottom: "22px",
        }}
      >
        {[
          { key: "list", label: tabText.list, Icon: ListIcon },
          { key: "cards", label: tabText.cards, Icon: CardsIcon },
        ].map(({ key, label, Icon }) => {
          const active = viewMode === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setViewMode(key)}
              className="hover-lift"
              style={{
                flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px",
                borderRadius: "12px", border: "none", padding: "10px 12px", fontSize: "13.5px", fontWeight: 700,
                cursor: "pointer", minHeight: "42px", transition: "all 0.2s",
                background: active ? "linear-gradient(135deg,#0D9488,#0284C7)" : "transparent",
                color: active ? "#fff" : "#0f766e",
                boxShadow: active ? "0 4px 14px rgba(13,148,136,0.30)" : "none",
              }}
            >
              <Icon size={15} color={active ? "#fff" : "#0f766e"} />
              {label}
            </button>
          );
        })}
      </div>

      {viewMode === "list" ? (
        <>
          <div
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              borderRadius: "14px", border: "1.5px solid #e2e8f0", background: "#fff",
              padding: "11px 14px", marginBottom: "24px",
            }}
          >
            <span style={{ color: "#5B6B80", display: "flex" }}><SearchIcon /></span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={SEARCH_PLACEHOLDER[language] ?? SEARCH_PLACEHOLDER.so}
              style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", background: "transparent", color: "#0f172a" }}
            />
          </div>

          {filtered.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#5B6B80" }}>{EMPTY_RESULT[language] ?? EMPTY_RESULT.so}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px" }}>
              {filtered.map((entry, i) => {
                const color = SECTION_COLORS[i % SECTION_COLORS.length];
                return (
                  <div
                    key={entry.id}
                    className="hover-lift"
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
        </>
      ) : (
        <div style={{ marginBottom: "32px" }}>
          <PharmacyFlashcards language={language} />
        </div>
      )}

      <p style={{ fontSize: "11.5px", color: "#5B6B80", lineHeight: 1.6, margin: 0 }}>
        {DISCLAIMER[language] ?? DISCLAIMER.so}
      </p>
    </main>
  );
}

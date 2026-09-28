"use client";
import { useState } from "react";
import { COUNTER_CARD_CATEGORIES } from "../data/counter-cards";
import { ModalShell, LANG_THEME } from "./modal-shell";
import { FlagIcon } from "./flag-icon";
import { getLanguageName, languages } from "../lib/site";

const TEXTS = {
  da: {
    title: "Skranke-kort",
    intro: "Store, todelte kort til at spørge eller vise noget direkte til kunden — vælg en kategori, så et kort, og vend det.",
    back: "Tilbage",
    tapToReveal: "Tryk for at vise på kundens sprog",
    tapToHide: "Tryk for at vende tilbage",
    yes: "Ja",
    no: "Nej",
    showLanguage: "Vis på:",
    arNotice: "Arabisk er endnu ikke tjekket af en modersmålstalende.",
    pageOf: (i, n) => `${i} af ${n}`,
  },
  en: {
    title: "Counter cards",
    intro: "Big, two-sided cards to ask or show something directly to the customer — pick a category, then a card, and flip it.",
    back: "Back",
    tapToReveal: "Tap to show in the customer's language",
    tapToHide: "Tap to flip back",
    yes: "Yes",
    no: "No",
    showLanguage: "Show in:",
    arNotice: "Arabic hasn't been checked by a native speaker yet.",
    pageOf: (i, n) => `${i} of ${n}`,
  },
  so: {
    title: "Kaararka Su'aalaha Farmashiyaha",
    intro: "Kaararka waaweyn ee laba-dhinac leh, ee lagu weydiiyo ama lagu tuso wax si toos ah kadhka — dooro qayb, dooro kaarka, oo rog.",
    back: "Dib u noqo",
    tapToReveal: "Riix si loo tuso luuqadda kadhka",
    tapToHide: "Riix si dib loogu laabto",
    yes: "Haa",
    no: "Maya",
    showLanguage: "Ku tus:",
    arNotice: "Af-Caraabiga wali lama hubin oo lama gudbin qof ku hadla af-Carabi ahaan hooyo.",
    pageOf: (i, n) => `${i} ee ${n}`,
  },
  ar: {
    title: "بطاقات الصيدلية",
    intro: "بطاقات كبيرة ذات وجهين لسؤال أو إظهار شيء مباشرة للعميل — اختر فئة، ثم بطاقة، واقلبها.",
    back: "رجوع",
    tapToReveal: "اضغط للعرض بلغة العميل",
    tapToHide: "اضغط للعودة",
    yes: "نعم",
    no: "لا",
    showLanguage: "اعرض بـ:",
    arNotice: "لم تتم مراجعة اللغة العربية بعد من قبل متحدث أصلي.",
    pageOf: (i, n) => `${i} من ${n}`,
  },
};

const CATEGORY_STYLE = {
  rose: { bg: "#FFF1F2", color: "#BE123C", ring: "#FECDD3" },
  sky: { bg: "#F0F9FF", color: "#0369A1", ring: "#BAE6FD" },
  amber: { bg: "#FFFBEB", color: "#B45309", ring: "#FDE68A" },
};

function SpeechBubbleIcon({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8" /><path d="M8 13h5" />
    </svg>
  );
}

function ShieldIcon({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z" /><path d="M9.5 12l1.8 1.8L15 10" />
    </svg>
  );
}
function ClockIcon({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
    </svg>
  );
}
function AlertIcon({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  );
}
const CATEGORY_ICON = { shield: ShieldIcon, clock: ClockIcon, alert: AlertIcon };

function ChevronIcon({ dir = "left", size = 20, color = "currentColor" }) {
  const d = dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function CounterCardsModal({ language, onClose }) {
  const isRtl = language === "ar";
  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const t = TEXTS[language] ?? TEXTS.so;
  const [categoryId, setCategoryId] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [revealLang, setRevealLang] = useState("so");

  const category = COUNTER_CARD_CATEGORIES.find((c) => c.id === categoryId) || null;
  const phrase = category ? category.phrases[pageIndex] : null;

  function openCategory(cat) {
    setCategoryId(cat.id);
    setPageIndex(0);
    setFlipped(false);
  }

  function goToPage(next) {
    setPageIndex(next);
    setFlipped(false);
  }

  const iconEl = <SpeechBubbleIcon size={22} color="rgba(255,255,255,0.95)" />;

  return (
    <ModalShell title={t.title} iconEl={iconEl} onClose={onClose} isRtl={isRtl}>
      {!category ? (
        <>
          <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, margin: "0 0 18px", textAlign: isRtl ? "right" : "left" }}>
            {t.intro}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {COUNTER_CARD_CATEGORIES.map((cat) => {
              const style = CATEGORY_STYLE[cat.color];
              const Icon = CATEGORY_ICON[cat.icon];
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => openCategory(cat)}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "16px 18px", borderRadius: "18px", border: `1.5px solid ${style.ring}`,
                    background: style.bg, cursor: "pointer", textAlign: isRtl ? "right" : "left",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 48, height: 48, borderRadius: "50%", background: style.color, flexShrink: 0,
                    }}
                  >
                    <Icon size={24} color="#fff" />
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 800, fontSize: "16px", color: style.color }}>
                      {cat.label[language] ?? cat.label.so}
                    </span>
                    <span style={{ display: "block", fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                      {cat.phrases.length}
                    </span>
                  </span>
                  <ChevronIcon dir={isRtl ? "left" : "right"} color={style.color} />
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setCategoryId(null)}
            style={{
              display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px",
              background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: theme.primary, padding: 0,
            }}
          >
            <ChevronIcon dir={isRtl ? "right" : "left"} size={16} color={theme.primary} /> {t.back}
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>{t.showLanguage}</span>
            {languages.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setRevealLang(code)}
                aria-pressed={revealLang === code}
                title={getLanguageName(language, code)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: "50%",
                  background: revealLang === code ? theme.primary : "transparent",
                  border: revealLang === code ? "none" : "1.5px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                <FlagIcon language={code} size={18} />
              </button>
            ))}
          </div>
          {revealLang === "ar" && (
            <p style={{ fontSize: "11px", color: "#b45309", textAlign: "center", margin: "0 0 14px" }}>{t.arNotice}</p>
          )}

          <div
            onClick={() => setFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }}
            style={{
              minHeight: "220px", borderRadius: "22px", padding: "28px 22px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
              background: flipped ? theme.primary : "#fff",
              border: `1.5px solid ${flipped ? theme.primary : "#e2e8f0"}`,
              cursor: "pointer", marginBottom: "14px",
            }}
          >
            {!flipped ? (
              <>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>{phrase.da}</span>
                <span style={{ marginTop: "14px", fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>{t.tapToReveal}</span>
              </>
            ) : (
              <>
                <span dir={revealLang === "ar" ? "rtl" : "ltr"} style={{ fontSize: "30px", fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                  {phrase[revealLang] ?? phrase.so}
                </span>
                <span style={{ marginTop: "14px", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{t.tapToHide}</span>
              </>
            )}
          </div>

          {flipped && category.id === "sikkerhed" && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              <div style={{ flex: 1, padding: "16px", borderRadius: "16px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", textAlign: "center", fontSize: "18px", fontWeight: 800, color: "#166534" }}>
                {t.yes}
              </div>
              <div style={{ flex: 1, padding: "16px", borderRadius: "16px", background: "#fef2f2", border: "1.5px solid #fecaca", textAlign: "center", fontSize: "18px", fontWeight: 800, color: "#991b1b" }}>
                {t.no}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <button
              type="button"
              onClick={() => goToPage(Math.max(0, pageIndex - 1))}
              disabled={pageIndex === 0}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "50%",
                border: "1.5px solid #e2e8f0", background: "#fff", cursor: pageIndex === 0 ? "default" : "pointer",
                opacity: pageIndex === 0 ? 0.35 : 1,
              }}
              aria-label={t.back}
            >
              <ChevronIcon dir={isRtl ? "right" : "left"} color="#475569" />
            </button>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8" }}>
              {t.pageOf(pageIndex + 1, category.phrases.length)}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(category.phrases.length - 1, pageIndex + 1))}
              disabled={pageIndex === category.phrases.length - 1}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "50%",
                border: "1.5px solid #e2e8f0", background: "#fff", cursor: pageIndex === category.phrases.length - 1 ? "default" : "pointer",
                opacity: pageIndex === category.phrases.length - 1 ? 0.35 : 1,
              }}
              aria-label={t.pageOf(pageIndex + 2, category.phrases.length)}
            >
              <ChevronIcon dir={isRtl ? "left" : "right"} color="#475569" />
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

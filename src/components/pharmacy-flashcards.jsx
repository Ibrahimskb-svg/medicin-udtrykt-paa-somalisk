"use client";
import { useEffect, useState } from "react";
import { pharmacyGlossary } from "../data/pharmacy-glossary";
import { SECTION_COLORS } from "./legal-section";
import { FlagIcon } from "./flag-icon";

const LABELS = {
  da: {
    open: "Åbn",
    close: "Luk",
    prev: "Forrige",
    next: "Næste",
    shuffle: "Bland kortene",
    swap: "Byt retning",
    progress: (n, t) => `Kort ${n} af ${t}`,
    doneTitle: "Du er igennem alle kortene!",
    doneDesc: "Vil du prøve igen i en ny rækkefølge?",
    restart: "Start forfra",
  },
  en: {
    open: "Open",
    close: "Close",
    prev: "Previous",
    next: "Next",
    shuffle: "Shuffle cards",
    swap: "Swap direction",
    progress: (n, t) => `Card ${n} of ${t}`,
    doneTitle: "You've been through all the cards!",
    doneDesc: "Want to try again in a new order?",
    restart: "Start over",
  },
  so: {
    open: "Fur",
    close: "Xir",
    prev: "Hore",
    next: "Xiga",
    shuffle: "Isku qas kaararka",
    swap: "Beddel jihada",
    progress: (n, t) => `Kaarka ${n} / ${t}`,
    doneTitle: "Waad soo dhammaysay dhammaan kaararka!",
    doneDesc: "Ma rabtaa inaad mar kale isku daydo hab kala duwan?",
    restart: "Dib u bilow",
  },
  ar: {
    open: "افتح",
    close: "أغلق",
    prev: "السابق",
    next: "التالي",
    shuffle: "خلط البطاقات",
    swap: "تبديل الاتجاه",
    progress: (n, t) => `البطاقة ${n} من ${t}`,
    doneTitle: "لقد أتممت جميع البطاقات!",
    doneDesc: "هل تريد المحاولة مرة أخرى بترتيب جديد؟",
    restart: "ابدأ من جديد",
  },
};

function ShuffleIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h3.5L14 18h3.5" />
      <path d="M14 6h3.5L21 10" />
      <path d="m17.5 3 3.5 3-3.5 3" />
      <path d="M3 18h3.5L10 13" />
      <path d="M17.5 21 21 18l-3.5-3" />
    </svg>
  );
}

function SwapIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v13" />
      <path d="m3 13 4 4 4-4" />
      <path d="M17 20V7" />
      <path d="m21 11-4-4-4 4" />
    </svg>
  );
}

function OpenCloseIcon({ size = 12, color = "currentColor", flipped = false }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: flipped ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function directionLangs(language, reversed) {
  const base = language === "da" ? ["so", "da"] : ["da", language];
  return reversed ? [base[1], base[0]] : base;
}

function shuffled(arr) {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function PharmacyFlashcards({ language }) {
  const isRtl = language === "ar";
  const t = LABELS[language] ?? LABELS.so;
  const [reversed, setReversed] = useState(false);
  const [order, setOrder] = useState(() => pharmacyGlossary.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [language]);

  const [frontLang, backLang] = directionLangs(language, reversed);
  const total = order.length;
  const done = index >= total;
  const entryIdx = done ? null : order[index];
  const entry = done ? null : pharmacyGlossary[entryIdx];
  const color = SECTION_COLORS[(entryIdx ?? 0) % SECTION_COLORS.length];

  function goNext() {
    setFlipped(false);
    setIndex((i) => i + 1);
  }
  function goPrev() {
    setFlipped(false);
    setIndex((i) => Math.max(0, i - 1));
  }
  function shuffle() {
    setOrder(shuffled(pharmacyGlossary.map((_, i) => i)));
    setIndex(0);
    setFlipped(false);
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{ maxWidth: 420, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => {
            setReversed((v) => !v);
            setFlipped(false);
          }}
          className="hover-lift"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", padding: "8px 14px", fontSize: 12.5, fontWeight: 700, color: "#334155", minHeight: 38 }}
        >
          <SwapIcon size={14} />
          {t.swap}
        </button>
        <button
          type="button"
          onClick={shuffle}
          className="hover-lift"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", padding: "8px 14px", fontSize: 12.5, fontWeight: 700, color: "#334155", minHeight: 38 }}
        >
          <ShuffleIcon size={14} />
          {t.shuffle}
        </button>
      </div>

      {!done ? (
        <>
          <div style={{ position: "relative" }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute", inset: "14px 10px -10px 10px", borderRadius: 22,
                background: `${color}30`, transform: "rotate(-3deg)",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute", inset: "7px 5px -5px 5px", borderRadius: 23,
                background: `${color}55`, transform: "rotate(2deg)",
              }}
            />
          <div style={{ perspective: 1400, position: "relative" }}>
            <div
              role="button"
              tabIndex={0}
              aria-label={flipped ? t.close : t.open}
              onClick={() => setFlipped((f) => !f)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setFlipped((f) => !f);
                } else if (e.key === "ArrowRight") {
                  if (index < total - 1) goNext();
                } else if (e.key === "ArrowLeft") {
                  goPrev();
                }
              }}
              style={{
                position: "relative",
                height: 260,
                cursor: "pointer",
                outline: "none",
                transformStyle: "preserve-3d",
                transition: "transform 0.5s cubic-bezier(.4,.2,.2,1)",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 24,
                  backfaceVisibility: "hidden",
                  background: `linear-gradient(135deg, ${color}, ${color}cc), radial-gradient(circle at 25% 18%, rgba(255,255,255,0.35), transparent 55%)`,
                  backgroundBlendMode: "overlay, normal",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  boxShadow: `0 20px 45px ${color}55`,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <FlagIcon language={frontLang} size={32} style={{ border: "2px solid rgba(255,255,255,0.65)" }} />
                <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{entry.term[frontLang]}</span>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999,
                    background: "rgba(255,255,255,0.22)", border: "1.5px solid rgba(255,255,255,0.5)",
                    padding: "6px 16px", fontSize: 12.5, color: "#fff", fontWeight: 700,
                  }}
                >
                  <OpenCloseIcon size={12} color="#fff" />
                  {t.open}
                </span>
              </div>

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 24,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: "#fff",
                  border: `2px solid ${color}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: `0 20px 45px ${color}30`,
                  padding: 24,
                  textAlign: "center",
                  overflowY: "auto",
                }}
              >
                <FlagIcon language={backLang} size={32} />
                <span style={{ fontSize: 22, fontWeight: 800, color }}>{entry.term[backLang]}</span>
                <span style={{ fontSize: 13, lineHeight: 1.65, color: "#475569" }}>{entry.explanation[backLang]}</span>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999,
                    background: `${color}18`, border: `1.5px solid ${color}40`,
                    padding: "6px 16px", fontSize: 12.5, color, fontWeight: 700,
                  }}
                >
                  <OpenCloseIcon size={12} color={color} flipped />
                  {t.close}
                </span>
              </div>
            </div>
          </div>
          </div>

          <div style={{ marginTop: 22, height: 6, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
            <div
              style={{
                height: "100%", borderRadius: 999, background: color,
                width: `${((index + 1) / total) * 100}%`,
                transition: "width 0.4s ease, background 0.3s ease",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
            <button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              className="hover-lift"
              style={{ borderRadius: 999, border: "1.5px solid #e2e8f0", background: "#fff", padding: "9px 16px", fontSize: 13, fontWeight: 700, color: index === 0 ? "#cbd5e1" : "#334155", minHeight: 40, cursor: index === 0 ? "default" : "pointer" }}
            >
              {isRtl ? "→" : "←"} {t.prev}
            </button>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#64748b" }}>{t.progress(index + 1, total)}</span>
            <button
              type="button"
              onClick={goNext}
              className="hover-lift"
              style={{ borderRadius: 999, border: "none", background: color, padding: "9px 16px", fontSize: 13, fontWeight: 700, color: "#fff", minHeight: 40, boxShadow: `0 4px 14px ${color}50` }}
            >
              {t.next} {isRtl ? "←" : "→"}
            </button>
          </div>
        </>
      ) : (
        <div
          className="reveal-on-scroll"
          style={{
            borderRadius: 24,
            border: "2px solid #99f6e4",
            background: "linear-gradient(135deg,#f0fdfa,#e0f2fe)",
            padding: "36px 24px",
            textAlign: "center",
            boxShadow: "0 16px 40px rgba(13,148,136,0.14)",
          }}
        >
          <span style={{ fontSize: 40 }} aria-hidden="true">🎉</span>
          <h3 style={{ marginTop: 10, fontSize: 18, fontWeight: 800, color: "#0f766e" }}>{t.doneTitle}</h3>
          <p style={{ marginTop: 6, fontSize: 13.5, color: "#0d9488" }}>{t.doneDesc}</p>
          <button
            type="button"
            onClick={shuffle}
            className="hover-lift"
            style={{ marginTop: 16, borderRadius: 999, border: "none", background: "#0D9488", padding: "10px 22px", fontSize: 13.5, fontWeight: 700, color: "#fff", minHeight: 42 }}
          >
            {t.restart}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { COUNTER_CARD_CATEGORIES } from "../data/counter-cards";
import { ModalShell, LANG_THEME } from "./modal-shell";
import { FlagIcon } from "./flag-icon";
import { getLanguageName, getUsualDosingHint, languages } from "../lib/site";

const TEXTS = {
  da: {
    title: "Skranke-kort",
    intro: "Store, todelte kort til at spørge eller vise noget direkte til kunden — vælg en kategori, så et kort, og vend det.",
    pdfBtn: "Gem alle kort som PDF (backup)",
    pdfFileTitle: "Skranke-kort — Somalimed.dk",
    back: "Tilbage",
    tapToReveal: "Tryk for at vise på kundens sprog",
    tapToHide: "Tryk for at vende tilbage",
    yes: "Ja",
    no: "Nej",
    showLanguage: "Vis på:",
    arNotice: "Arabisk er endnu ikke tjekket af en modersmålstalende.",
    pageOf: (i, n) => `${i} af ${n}`,
    forMedicine: "Til",
    usualDosing: "Sædvanligvis (fra medicinens egen side)",
    close: "Luk",
  },
  en: {
    title: "Counter cards",
    intro: "Big, two-sided cards to ask or show something directly to the customer — pick a category, then a card, and flip it.",
    pdfBtn: "Save all cards as PDF (backup)",
    pdfFileTitle: "Counter cards — Somalimed.dk",
    back: "Back",
    tapToReveal: "Tap to show in the customer's language",
    tapToHide: "Tap to flip back",
    yes: "Yes",
    no: "No",
    showLanguage: "Show in:",
    arNotice: "Arabic hasn't been checked by a native speaker yet.",
    pageOf: (i, n) => `${i} of ${n}`,
    forMedicine: "For",
    usualDosing: "Usually (from the medicine's own page)",
    close: "Close",
  },
  so: {
    title: "Kaararka Su'aalaha Farmashiyaha",
    intro: "Kaararka waaweyn ee laba-dhinac leh, ee lagu weydiiyo ama lagu tuso wax si toos ah kadhka — dooro qayb, dooro kaarka, oo rog.",
    pdfBtn: "Kaydi dhammaan kaararka sida PDF (backup)",
    pdfFileTitle: "Kaararka Su'aalaha Farmashiyaha — Somalimed.dk",
    back: "Dib u noqo",
    tapToReveal: "Riix si loo tuso luuqadda kadhka",
    tapToHide: "Riix si dib loogu laabto",
    yes: "Haa",
    no: "Maya",
    showLanguage: "Ku tus:",
    arNotice: "Af-Caraabiga wali lama hubin oo lama gudbin qof ku hadla af-Carabi ahaan hooyo.",
    pageOf: (i, n) => `${i} ee ${n}`,
    forMedicine: "Waxaa loogu talagalay",
    usualDosing: "Sida caadiga ah (ka socota bogga daawada)",
    close: "Xir",
  },
  ar: {
    title: "بطاقات الصيدلية",
    intro: "بطاقات كبيرة ذات وجهين لسؤال أو إظهار شيء مباشرة للعميل — اختر فئة، ثم بطاقة، واقلبها.",
    pdfBtn: "احفظ جميع البطاقات كملف PDF (نسخة احتياطية)",
    pdfFileTitle: "بطاقات الصيدلية — Somalimed.dk",
    back: "رجوع",
    tapToReveal: "اضغط للعرض بلغة العميل",
    tapToHide: "اضغط للعودة",
    yes: "نعم",
    no: "لا",
    showLanguage: "اعرض بـ:",
    arNotice: "لم تتم مراجعة اللغة العربية بعد من قبل متحدث أصلي.",
    pageOf: (i, n) => `${i} من ${n}`,
    forMedicine: "لدواء",
    usualDosing: "عادة (من صفحة الدواء نفسها)",
    close: "إغلاق",
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

export function CounterCardsModal({ language, onClose, medicineSlug, medicineName }) {
  const isRtl = language === "ar";
  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const t = TEXTS[language] ?? TEXTS.so;
  // Åbnet fra en medicinside: hop direkte til Doseringsbesked for den
  // medicin i stedet for at vise kategorivalget først.
  const [categoryId, setCategoryId] = useState(medicineSlug ? "dosering" : null);
  const [pageIndex, setPageIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const usualDosingHint = medicineSlug ? getUsualDosingHint(medicineSlug, language) : null;
  // Standard er et andet sprog end sitets eget — ellers viser forside og
  // bagside det samme, og "vend kortet" ser ud som om intet sker.
  const [revealLang, setRevealLang] = useState(() => languages.find((l) => l !== language) || "da");
  const [answer, setAnswer] = useState(null);

  const category = COUNTER_CARD_CATEGORIES.find((c) => c.id === categoryId) || null;
  const phrase = category ? category.phrases[pageIndex] : null;
  const categoryStyle = category ? CATEGORY_STYLE[category.color] : null;

  function openCategory(cat) {
    setCategoryId(cat.id);
    setPageIndex(0);
    setFlipped(false);
    setAnswer(null);
  }

  function goToPage(next) {
    setPageIndex(next);
    setFlipped(false);
    setAnswer(null);
  }

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [15, 23, 42];
  }

  // jsPDF's standardskrifttype har ingen arabiske glyffer, så almindelig
  // pdf.text() med arabisk tekst ville vise tomt/forvrænget. Løsning:
  // indlejrer en rigtig arabisk skrifttype (Amiri) i selve PDF'en og
  // "reshaper" teksten (forbinder bogstaverne korrekt, som arabisk skrift
  // kræver) — så arabisk bliver ægte, kopierbar PDF-tekst, ligesom de andre
  // 3 sprog, i stedet for et billede.
  async function saveAllCardsPdf() {
    const [{ default: jsPDF }, { AMIRI_ARABIC_BASE64 }, { default: ArabicReshaper }] = await Promise.all([
      import("jspdf"),
      import("../data/amiri-font-base64"),
      import("arabic-reshaper"),
    ]);
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    pdf.addFileToVFS("Amiri-Regular.ttf", AMIRI_ARABIC_BASE64);
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    const primaryRgb = hexToRgb(theme.primary);
    let y = margin;

    const ensureSpace = (height) => {
      if (y + height > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
    };

    pdf.setTextColor(...primaryRgb);
    pdf.setFontSize(17);
    if (language === "ar") {
      const arTitle = t.pdfFileTitle.replace(/\s*—\s*Somalimed\.dk$/, "");
      pdf.setFont("helvetica", "bold");
      pdf.text("Somalimed.dk", margin, y + 14);
      pdf.setFont("Amiri", "normal");
      pdf.text(ArabicReshaper.convertArabic(arTitle), margin + contentWidth, y + 14, { align: "right" });
    } else {
      pdf.setFont("helvetica", "bold");
      pdf.text(t.pdfFileTitle, margin, y + 14);
    }
    y += 34;

    COUNTER_CARD_CATEGORIES.forEach((cat) => {
      const style = CATEGORY_STYLE[cat.color];
      const styleRgb = hexToRgb(style.color);
      const styleBgRgb = hexToRgb(style.bg);

      ensureSpace(40);
      pdf.setFillColor(...styleBgRgb);
      pdf.rect(margin, y, contentWidth, 28, "F");
      pdf.setTextColor(...styleRgb);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(cat.label.da, margin + 10, y + 19);
      y += 40;

      cat.phrases.forEach((ph) => {
        const daLines = pdf.setFont("helvetica", "bold").setFontSize(12).splitTextToSize(ph.da, contentWidth);
        const soLines = pdf.setFont("helvetica", "normal").setFontSize(10.5).splitTextToSize(`SO: ${ph.so}`, contentWidth);
        const enLines = pdf.setFont("helvetica", "normal").setFontSize(10.5).splitTextToSize(`EN: ${ph.en}`, contentWidth);
        const arShaped = ArabicReshaper.convertArabic(ph.ar);
        const arLines = pdf.setFont("Amiri", "normal").setFontSize(12).splitTextToSize(arShaped, contentWidth);
        const blockHeight = daLines.length * 15 + soLines.length * 13 + enLines.length * 13 + arLines.length * 16 + 16;
        ensureSpace(blockHeight);

        pdf.setTextColor(15, 23, 42);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text(daLines, margin, y + 12);
        y += daLines.length * 15 + 3;

        pdf.setTextColor(71, 85, 105);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10.5);
        pdf.text(soLines, margin, y + 10);
        y += soLines.length * 13 + 2;
        pdf.text(enLines, margin, y + 10);
        y += enLines.length * 13 + 4;

        pdf.setFont("Amiri", "normal");
        pdf.setFontSize(12);
        pdf.text(arLines, margin + contentWidth, y + 12, { align: "right" });
        y += arLines.length * 16 + 12;
      });
      y += 6;
    });

    pdf.save("Somalimed-skranke-kort.pdf");
  }

  const iconEl = <SpeechBubbleIcon size={22} color="rgba(255,255,255,0.95)" />;

  return (
    <ModalShell title={t.title} iconEl={iconEl} onClose={onClose} isRtl={isRtl} closeLabel={t.close}>
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
                  className="hover-lift"
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
          <button
            type="button"
            onClick={saveAllCardsPdf}
            className="hover-lift"
            style={{
              width: "100%", marginTop: "14px", padding: "13px 18px", borderRadius: "14px",
              border: `1.5px solid ${theme.border}`, background: theme.soft, color: theme.primary,
              fontWeight: 700, fontSize: "13.5px", cursor: "pointer",
            }}
          >
            {t.pdfBtn}
          </button>
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

          {medicineName && (
            <div
              style={{
                borderRadius: "14px", padding: "12px 14px", marginBottom: "14px",
                background: theme.soft, border: `1.5px solid ${theme.border}`, textAlign: isRtl ? "right" : "left",
              }}
            >
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: theme.primary }}>
                {t.forMedicine} {medicineName}
              </p>
              {usualDosingHint && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", lineHeight: 1.5, color: "#475569" }}>
                  <span style={{ fontWeight: 700 }}>{t.usualDosing}:</span> {usualDosingHint}
                </p>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>{t.showLanguage}</span>
            {/* Eget sprog udelades bevidst: forsiden viser altid dit eget
                sprog, så et flag for samme sprog ville gøre bagsiden
                identisk med forsiden og "vend kortet" ville se ud som om
                intet skete. */}
            {languages.filter((code) => code !== language).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setRevealLang(code)}
                aria-pressed={revealLang === code}
                aria-label={getLanguageName(language, code)}
                title={getLanguageName(language, code)}
                className="hover-lift"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: "50%",
                  background: revealLang === code ? theme.primary : categoryStyle.bg,
                  border: revealLang === code ? "none" : `1.5px solid ${categoryStyle.ring}`,
                  cursor: "pointer",
                }}
              >
                <FlagIcon language={code} size={18} />
              </button>
            ))}
          </div>
          {(revealLang === "ar" || language === "ar") && (
            <p style={{ fontSize: "11px", color: "#b45309", textAlign: "center", margin: "0 0 14px" }}>{t.arNotice}</p>
          )}

          <div className="flip-card-outer" style={{ height: "240px", marginBottom: "14px" }}>
            <div
              className={`flip-card-inner${flipped ? " is-flipped" : ""}`}
              onClick={() => setFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              aria-label={flipped ? t.tapToHide : t.tapToReveal}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }}
              style={{ cursor: "pointer" }}
            >
              <div
                className="flip-card-face"
                style={{
                  borderRadius: "22px", padding: "28px 22px", textAlign: "center",
                  background: categoryStyle.bg, border: `2px solid ${categoryStyle.ring}`,
                }}
              >
                <span dir={isRtl ? "rtl" : "ltr"} style={{ fontSize: "20px", fontWeight: 800, color: categoryStyle.color, lineHeight: 1.4 }}>
                  {phrase[language] ?? phrase.so}
                </span>
                <span style={{ marginTop: "14px", fontSize: "12px", fontWeight: 700, color: "#64748b" }}>{t.tapToReveal}</span>
              </div>
              <div
                className="flip-card-face flip-card-back"
                style={{
                  borderRadius: "22px", padding: "28px 22px", textAlign: "center",
                  background: theme.primary, border: `2px solid ${theme.primary}`,
                }}
              >
                <span dir={revealLang === "ar" ? "rtl" : "ltr"} style={{ fontSize: "30px", fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                  {phrase[revealLang] ?? phrase.so}
                </span>
                <span style={{ marginTop: "14px", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{t.tapToHide}</span>
              </div>
            </div>
          </div>

          {flipped && category.id === "sikkerhed" && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              <button
                type="button"
                onClick={() => setAnswer(answer === "yes" ? null : "yes")}
                aria-pressed={answer === "yes"}
                className="hover-lift"
                style={{
                  flex: 1, padding: "16px", borderRadius: "16px", textAlign: "center", fontSize: "18px", fontWeight: 800,
                  cursor: "pointer",
                  background: answer === "yes" ? "#16a34a" : "#f0fdf4",
                  border: `1.5px solid ${answer === "yes" ? "#16a34a" : "#bbf7d0"}`,
                  color: answer === "yes" ? "#fff" : "#166534",
                }}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => setAnswer(answer === "no" ? null : "no")}
                aria-pressed={answer === "no"}
                className="hover-lift"
                style={{
                  flex: 1, padding: "16px", borderRadius: "16px", textAlign: "center", fontSize: "18px", fontWeight: 800,
                  cursor: "pointer",
                  background: answer === "no" ? "#dc2626" : "#fef2f2",
                  border: `1.5px solid ${answer === "no" ? "#dc2626" : "#fecaca"}`,
                  color: answer === "no" ? "#fff" : "#991b1b",
                }}
              >
                {t.no}
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <button
              type="button"
              onClick={() => goToPage(Math.max(0, pageIndex - 1))}
              disabled={pageIndex === 0}
              className="hover-lift"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "50%",
                border: `1.5px solid ${categoryStyle.ring}`, background: categoryStyle.bg, cursor: pageIndex === 0 ? "default" : "pointer",
                opacity: pageIndex === 0 ? 0.35 : 1,
              }}
              aria-label={t.back}
            >
              <ChevronIcon dir={isRtl ? "right" : "left"} color={categoryStyle.color} />
            </button>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8" }}>
              {t.pageOf(pageIndex + 1, category.phrases.length)}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(category.phrases.length - 1, pageIndex + 1))}
              disabled={pageIndex === category.phrases.length - 1}
              className="hover-lift"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "50%",
                border: `1.5px solid ${categoryStyle.ring}`, background: categoryStyle.bg, cursor: pageIndex === category.phrases.length - 1 ? "default" : "pointer",
                opacity: pageIndex === category.phrases.length - 1 ? 0.35 : 1,
              }}
              aria-label={t.pageOf(pageIndex + 2, category.phrases.length)}
            >
              <ChevronIcon dir={isRtl ? "left" : "right"} color={categoryStyle.color} />
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

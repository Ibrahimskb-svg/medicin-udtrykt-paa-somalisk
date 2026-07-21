"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

import { LanguageSelect } from "./language-select";
import { InhalerGuide } from "./inhaler-guide";
import { MyListModal } from "./my-list-modal";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { applyLanguageToDocument } from "../lib/language";
import { getMyList, toggleMyList, subscribeMyList } from "../lib/my-list";
import {
  arabicAudioLabel,
  sectionIcons,
  sectionStyles,
  uiText,
} from "../lib/site";

// ── 1. KONSTANTER ─────────────────────────────────────────────────────────────

const TPI_MODAL_TITLE = {
  da: "Korrekt inhalationsteknik",
  en: "Correct inhaler technique",
  so: "Farsamada saxda ah ee buufinta",
  ar: "تقنية الاستنشاق الصحيحة",
};

const SECTION_ICON_COLORS = {
  use:      { bg: "#bbf7d0", color: "#065f46", border: "#16a34a" },
  dose:     { bg: "#bae6fd", color: "#0369a1", border: "#0284c7" },
  side:     { bg: "#fde68a", color: "#92400e", border: "#d97706" },
  interact: { bg: "#ddd6fe", color: "#5b21b6", border: "#7c3aed" },
  warn:     { bg: "#fecaca", color: "#991b1b", border: "#dc2626" },
  ramadan:  { bg: "#e9d5ff", color: "#6b21a8", border: "#9333ea" },
  food:     { bg: "#bbf7d0", color: "#166534", border: "#16a34a" },
  store:    { bg: "#cbd5e1", color: "#1e293b", border: "#475569" },
};

const overviewLabel = {
  da: "Overblik",
  en: "Overview",
  so: "Guudmar",
  ar: "نظرة عامة",
};

const LAST_REVISED = {
  da: "Sidst revideret: 13. juli 2026",
  en: "Last revised: 13 July 2026",
  so: "La cusbooneysiiyay: 13 Luulyo 2026",
  ar: "آخر مراجعة: 13 يوليو 2026",
};

const EMERGENCY = {
  da: { label: "Nødsituationer", poison: "Giftlinjen – ring ved mistanke om forgiftning", emergency: "Akut nødsituation" },
  en: { label: "Emergencies", poison: "Poison Helpline – call if you suspect poisoning", emergency: "Emergency" },
  so: { label: "Xaaladaha degdegga ah", poison: "Khadka Sunta – wac haddii qof sun ku sumoobay", emergency: "Xaalad degdeg ah" },
  ar: { label: "حالات الطوارئ", poison: "خط السموم – اتصل عند الاشتباه بالتسمم", emergency: "طوارئ" },
};

const SHARE_LABELS = {
  da: { whatsapp: "Del på WhatsApp", print: "Udskriv siden", qr: "QR-kode", addToList: "Tilføj til min liste", onList: "På din liste" },
  en: { whatsapp: "Share on WhatsApp", print: "Print page", qr: "QR code", addToList: "Add to my list", onList: "On your list" },
  so: { whatsapp: "La wadaag WhatsApp", print: "Daabac bogga", qr: "Koodhka QR", addToList: "Ku dar liiskaaga", onList: "Wuxuu ku jiraa liiskaaga" },
  ar: { whatsapp: "مشاركة عبر واتساب", print: "طباعة الصفحة", qr: "رمز QR", addToList: "أضف إلى قائمتي", onList: "في قائمتك" },
};

const QR_LABELS = {
  da: {
    title: "QR-kode",
    instructions: "Udskriv denne kode og sæt den på medicinæsken, eller kopiér billedet ind i jeres eget system.",
    print: "Udskriv etiket",
    copy: "Kopiér billede",
    copied: "Kopieret!",
    sms: "Send via sms",
    close: "Luk",
  },
  en: {
    title: "QR code",
    instructions: "Print this code and attach it to the medicine box, or copy the image into your own system.",
    print: "Print label",
    copy: "Copy image",
    copied: "Copied!",
    sms: "Send via SMS",
    close: "Close",
  },
  so: {
    title: "Koodhka QR",
    instructions: "Daabac koodhkan oo ku dhig sanduuqa daawada, ama koobiyee sawirka oo geli nidaamkiinna.",
    print: "Daabac summad",
    copy: "Koobiyee sawirka",
    copied: "Waa la koobiyeeyay!",
    sms: "U dir qoraal",
    close: "Xir",
  },
  ar: {
    title: "رمز QR",
    instructions: "اطبع هذا الرمز وضعه على علبة الدواء، أو انسخ الصورة إلى نظامكم الخاص.",
    print: "طباعة الملصق",
    copy: "نسخ الصورة",
    copied: "تم النسخ!",
    sms: "إرسال كرسالة نصية",
    close: "إغلاق",
  },
};

// ── 2. IKONER ──────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

// Samme streg-ikon-stil (Lucide, 18px, stroke-width 2) som sectionIcons i lib/site.js —
// piktogram-chips genbruger nogle af de eksisterende ikoner samt tre nye (sol, sprøjte, stigende kurve).
const PICTOGRAM_ICON_STYLE = {
  amount:    { bg: "#dcfce7", color: "#166534", border: "#16a34a", svg: sectionIcons.use },
  frequency: { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6", svg: sectionIcons.dose },
  morning:   { bg: "#fef3c7", color: "#92400e", border: "#f59e0b", svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>` },
  evening:   { bg: "#ede9fe", color: "#5b21b6", border: "#8b5cf6", svg: sectionIcons.ramadan },
  food:      { bg: "#ffedd5", color: "#9a3412", border: "#f97316", svg: sectionIcons.food },
  repeat:    { bg: "#e0e7ff", color: "#3730a3", border: "#6366f1", svg: sectionIcons.interact },
  warn:      { bg: "#fee2e2", color: "#991b1b", border: "#ef4444", svg: sectionIcons.warn },
  injection: { bg: "#ccfbf1", color: "#0f766e", border: "#14b8a6", svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>` },
  trending:  { bg: "#fce7f3", color: "#9d174d", border: "#ec4899", svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>` },
};

function DosagePictogram({ chips, isRtl }) {
  return (
    <div
      className="mb-4 flex flex-wrap gap-2"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {chips.map((chip, i) => {
        const style = PICTOGRAM_ICON_STYLE[chip.type] || PICTOGRAM_ICON_STYLE.frequency;
        return (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 rounded-full border-2 py-1.5 pl-1.5 pr-4 text-[14px] font-bold shadow-sm"
            style={{ background: style.bg, borderColor: style.border, color: style.color }}
          >
            <span
              aria-hidden="true"
              className="inline-flex shrink-0 items-center justify-center rounded-full"
              style={{ width: 27, height: 27, background: style.border, color: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
              dangerouslySetInnerHTML={{ __html: style.svg.replace(/width="18"/, 'width="15"').replace(/height="18"/, 'height="15"') }}
            />
            {chip.text}
          </span>
        );
      })}
    </div>
  );
}

// ── 3. LYDFIL-KNAP ────────────────────────────────────────────────────────────

function AudioButton({ label, tone = "primary", onClick }) {
  const isPrimary = tone === "primary";
  const color = isPrimary ? "var(--accent1)" : "var(--accent2)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-3 rounded-xl border-2 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition duration-200 hover:shadow-md"
      style={{ borderColor: color, color }}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: color }}>
        <PlayIcon />
      </span>
      {label}
    </button>
  );
}

// ── 4. STATISKE INHALATOR-SVG'ER ──────────────────────────────────────────────

function VentolineSVG() {
  return (
    <div style={{ position: "relative", width: 160, height: 200, margin: "0 auto" }}>
      <svg viewBox="0 0 160 200" width="160" height="200">
        <rect x="55" y="40" width="50" height="90" rx="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5"/>
        <rect x="68" y="30" width="24" height="14" rx="6" fill="#0284c7"/>
        <rect x="50" y="125" width="60" height="30" rx="10" fill="#bae6fd" stroke="#0284c7" strokeWidth="2"/>
      </svg>
    </div>
  );
}

function SymbicortSVG() {
  return (
    <div style={{ position: "relative", width: 160, height: 210, margin: "0 auto" }}>
      <svg viewBox="0 0 160 210" width="160" height="210">
        <rect x="52" y="30" width="56" height="110" rx="18" fill="#fff7ed" stroke="#ea580c" strokeWidth="2.5"/>
        <rect x="52" y="128" width="56" height="18" rx="8" fill="#dc2626"/>
        <rect x="58" y="142" width="44" height="28" rx="10" fill="#fed7aa" stroke="#ea580c" strokeWidth="2"/>
      </svg>
    </div>
  );
}

// ── 5. HOVED-KOMPONENT ────────────────────────────────────────────────────────

export function MedicinePage({ medicine, initialLang }) {
  const [modalTab, setModalTab] = useState(null);
  const [activeInhaler, setActiveInhaler] = useState(medicine.slug === "symbicort" ? "symbicort" : "ventoline");
  const [showSomaliAudio, setShowSomaliAudio] = useState(false);
  const [showArabicAudio, setShowArabicAudio] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrCopied, setQrCopied] = useState(false);
  const [inMyList, setInMyList] = useState(false);
  const somaliAudioRef = useRef(null);
  const arabicAudioRef = useRef(null);

  const { language, updateLanguage } = useLanguageRouting({ initialLanguage: initialLang });
  const data = useMemo(() => medicine.translations[language] || medicine.translations.so, [language, medicine]);
  const chromeText = useMemo(() => uiText[language] || uiText.so, [language]);
  const isRtl = language === "ar";
  const qrText = QR_LABELS[language] ?? QR_LABELS.da;
  const shareText = SHARE_LABELS[language] ?? SHARE_LABELS.da;
  const pageUrl = `https://www.somalimed.dk/${medicine.slug}?lang=${language}`;

  useEffect(() => {
    setInMyList(getMyList().includes(medicine.slug));
    return subscribeMyList((list) => setInMyList(list.includes(medicine.slug)));
  }, [medicine.slug]);

  async function openQr() {
    setQrOpen(true);
    setQrCopied(false);
    const dataUrl = await QRCode.toDataURL(pageUrl, { width: 320, margin: 2 });
    setQrDataUrl(dataUrl);
  }

  function printQr() {
    const win = window.open("", "_blank", "width=380,height=520");
    if (!win) return;
    win.document.write(`
      <html><head><title>${data.drugName}</title>
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:center;padding:24px;}
        img{width:220px;height:220px;}
        h1{font-size:16px;margin:14px 0 4px;}
        p{font-size:11px;color:#64748b;margin:0;}
      </style>
      </head><body>
        <img src="${qrDataUrl}" alt="QR" />
        <h1>${data.drugName}</h1>
        <p>Somalimed.dk</p>
        <script>window.onload=function(){window.print();};</script>
      </body></html>
    `);
    win.document.close();
  }

  async function copyQrImage() {
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2000);
    } catch (e) {
      // Clipboard-API for billeder er ikke understøttet i alle browsere —
      // brugeren kan i stedet højreklikke billedet og vælge "Kopiér billede".
    }
  }

  // Lyt efter navbar-events (TPI-modal)
  useEffect(() => {
    const handler = (e) => {
      setModalTab(e.detail);
    };
    window.addEventListener("somalimed-tab", handler);
    return () => window.removeEventListener("somalimed-tab", handler);
  }, []);

  // Luk QR-modal med Escape (tastaturtilgængelighed)
  useEffect(() => {
    if (!qrOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setQrOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [qrOpen]);

  // Nulstil lyd og side-titel ved sprogskift
  useEffect(() => {
    applyLanguageToDocument(language, data.pageTitle || data.hdrTitle);
    setShowSomaliAudio(false);
    setShowArabicAudio(false);
    if (somaliAudioRef.current) {
      somaliAudioRef.current.pause();
      somaliAudioRef.current.currentTime = 0;
    }
    if (arabicAudioRef.current) {
      arabicAudioRef.current.pause();
      arabicAudioRef.current.currentTime = 0;
    }
  }, [data, language]);

  useScrollReveal([language, medicine.slug, modalTab, showSomaliAudio, showArabicAudio]);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }} className="min-h-screen">

      {/* ── QR-KODE MODAL ── */}
      {qrOpen && (
        <div
          onClick={() => setQrOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={qrText.title}
          style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" }}
          className="sm:items-center sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background:"#f8fafc", borderRadius:"28px 28px 0 0", width:"100%", maxWidth:"420px", direction: isRtl ? "rtl" : "ltr", overflow:"hidden" }}
            className="sm:rounded-[28px] shadow-2xl"
          >
            <div style={{ background:"linear-gradient(135deg,#0D9488,#0284C7)", padding:"20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"white", fontWeight:800, fontSize:"18px" }}>{qrText.title}</span>
              <button onClick={() => setQrOpen(false)} aria-label={qrText.close} style={{ color:"white", background:"rgba(255,255,255,0.2)", border:"none", width:36, height:36, borderRadius:"50%", cursor:"pointer", fontWeight:"bold" }}>✕</button>
            </div>

            <div style={{ padding:"28px 24px", textAlign:"center" }}>
              <div style={{
                display:"inline-block", padding:"16px", borderRadius:"20px",
                background:"#fff", border:"2px solid #e2e8f0",
                boxShadow:"0 8px 24px rgba(13,148,136,0.15)",
              }}>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt={`QR – ${data.drugName}`} width={220} height={220} style={{ display:"block", width:220, height:220 }} />
                ) : (
                  <div style={{ width:220, height:220, display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", fontSize:"13px" }} aria-live="polite">…</div>
                )}
              </div>

              <p style={{ fontWeight:800, fontSize:"16px", margin:"16px 0 2px", color:"var(--text)" }}>{data.drugName}</p>
              <p style={{ fontSize:"12px", color:"#94a3b8", margin:"0 0 18px" }}>Somalimed.dk</p>
              <p style={{ fontSize:"13px", color:"#64748b", lineHeight:1.6, margin:"0 0 20px" }}>{qrText.instructions}</p>

              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                <button
                  onClick={printQr}
                  disabled={!qrDataUrl}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    padding:"12px", borderRadius:"12px", border:"none",
                    background:"#0D9488", color:"#fff", fontWeight:700, fontSize:"14px",
                    cursor: qrDataUrl ? "pointer" : "default", opacity: qrDataUrl ? 1 : 0.6,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  {qrText.print}
                </button>

                <button
                  onClick={copyQrImage}
                  disabled={!qrDataUrl}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    padding:"12px", borderRadius:"12px",
                    border:"1.5px solid var(--border)", background:"var(--surface)", color:"var(--text)",
                    fontWeight:700, fontSize:"14px", cursor: qrDataUrl ? "pointer" : "default",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  {qrCopied ? qrText.copied : qrText.copy}
                </button>

                <a
                  href={`sms:?body=${encodeURIComponent(`${data.drugName} – Somalimed\n${pageUrl}`)}`}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    padding:"12px", borderRadius:"12px",
                    border:"1.5px solid var(--border)", background:"var(--surface)", color:"var(--text)",
                    fontWeight:700, fontSize:"14px", textDecoration:"none",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {qrText.sms}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TPI-MODAL (inhalationsteknik) ── */}
      {modalTab === "mylist" && <MyListModal language={language} onClose={() => setModalTab(null)} />}

      {modalTab === "tpi" && (
        <div
          onClick={() => setModalTab(null)}
          style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)" }}
          className="sm:items-center sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background:"#f8fafc", borderRadius:"28px 28px 0 0", width:"100%", maxWidth:"600px", direction: isRtl ? "rtl" : "ltr" }}
            className="sm:rounded-[28px] shadow-2xl overflow-hidden"
          >
            <div style={{ background:"#0D9488", padding:"20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"white", fontWeight:800, fontSize:"18px" }}>{TPI_MODAL_TITLE[language]}</span>
              <button onClick={() => setModalTab(null)} style={{ color:"white", background:"rgba(255,255,255,0.2)", border:"none", width:36, height:36, borderRadius:"50%", cursor:"pointer", fontWeight:"bold" }}>✕</button>
            </div>
            <div style={{ padding:"24px", textAlign:"center" }}>
              <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
                <button onClick={() => setActiveInhaler("ventoline")} style={{ flex:1, padding:"12px", borderRadius:"12px", border:"none", fontWeight:700, background: activeInhaler === "ventoline" ? "#0D9488" : "#f1f5f9", color: activeInhaler === "ventoline" ? "white" : "#64748b" }}>Ventoline</button>
                <button onClick={() => setActiveInhaler("symbicort")} style={{ flex:1, padding:"12px", borderRadius:"12px", border:"none", fontWeight:700, background: activeInhaler === "symbicort" ? "#0D9488" : "#f1f5f9", color: activeInhaler === "symbicort" ? "white" : "#64748b" }}>Symbicort</button>
              </div>
              <div style={{ background:"white", padding:"30px", borderRadius:"24px", border:"1px solid #e2e8f0" }}>
                {activeInhaler === "ventoline" ? <VentolineSVG /> : <SymbicortSVG />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO BANNER ── */}
      <div style={{ background: "var(--heroBg)" }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Link
            className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/25"
            href={{ pathname: "/", query: { lang: language } }}
          >
            <BackIcon />
            {data.backLabel}
          </Link>

          <div className="flex items-start gap-4">
            <div
              className="hidden shrink-0 items-center justify-center rounded-2xl border p-3 sm:flex"
              style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.25)", width: 64, height: 64 }}
            >
              <div
                className="h-10 w-10 [&>svg]:h-10 [&>svg]:w-10 [&>svg]:text-white [&>svg_path]:stroke-white [&>svg_circle]:stroke-white"
                dangerouslySetInnerHTML={{ __html: medicine.iconSvg }}
              />
            </div>

            <div>
              <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-white/90">
                {chromeText.medicinePill}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl" style={{ lineHeight: 1.1 }}>
                {data.drugName}
              </h1>
              <p className="mt-1.5 text-sm font-medium text-white/75">{data.drugForm}</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">{data.hdrSubtitle}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">{data.badgeText}</span>
                <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">{chromeText.heroFormatValue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <LanguageSelect label={data.langLabel} onChange={updateLanguage} value={language} />

        {/* ── SHARE + PRINT ── */}
        <div className="no-print" style={{
          display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px",
          justifyContent: isRtl ? "flex-end" : "flex-start",
          direction: isRtl ? "rtl" : "ltr",
        }}>
          <a
            href={"https://wa.me/?text=" + encodeURIComponent((data.drugName || medicine.slug) + " – Somalimed\nhttps://www.somalimed.dk/" + medicine.slug)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px",
              background: "#25D366", color: "#fff",
              fontWeight: 700, fontSize: "13px", textDecoration: "none",
              border: "none", cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.122 1.528 5.855L.057 23.886a.75.75 0 0 0 .918.919l6.086-1.453A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 0 1-5.116-1.41l-.367-.217-3.793.906.924-3.7-.239-.381A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            {(SHARE_LABELS[language] ?? SHARE_LABELS.da).whatsapp}
          </a>
          <button
            onClick={() => window.print()}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px",
              background: "var(--surface)", color: "var(--text)",
              fontWeight: 600, fontSize: "13px",
              border: "1.5px solid var(--border)", cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            {(SHARE_LABELS[language] ?? SHARE_LABELS.da).print}
          </button>
          <button
            onClick={openQr}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px",
              background: "var(--surface)", color: "var(--text)",
              fontWeight: 600, fontSize: "13px",
              border: "1.5px solid var(--border)", cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              <line x1="14" y1="14" x2="14" y2="17"/><line x1="14" y1="20" x2="14" y2="21"/><line x1="17" y1="14" x2="21" y2="14"/><line x1="17" y1="17" x2="21" y2="17"/><line x1="17" y1="20" x2="21" y2="20"/><line x1="20" y1="17" x2="20" y2="21"/>
            </svg>
            {(SHARE_LABELS[language] ?? SHARE_LABELS.da).qr}
          </button>
          <button
            onClick={() => toggleMyList(medicine.slug)}
            aria-pressed={inMyList}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px",
              background: inMyList ? "#0D9488" : "var(--surface)",
              color: inMyList ? "#fff" : "var(--text)",
              fontWeight: 600, fontSize: "13px",
              border: inMyList ? "1.5px solid #0D9488" : "1.5px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {inMyList ? <path d="M20 6 9 17l-5-5" /> : <><path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" /><path d="M4.5 6h.01" /><path d="M4.5 12h.01" /><path d="M4.5 18h.01" /></>}
            </svg>
            {inMyList ? shareText.onList : shareText.addToList}
          </button>
        </div>

        {/* ── SOMALI LYDFIL ── */}
        {medicine.audio.so && language === "so" ? (
          <div className="mb-6">
            {!showSomaliAudio ? (
              <AudioButton label={data.audioLabel || "Dhageyso codkan"} onClick={() => setShowSomaliAudio(true)} />
            ) : (
              <div className="reveal-on-scroll rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border)" }}>
                <audio className="w-full" controls preload="none" ref={somaliAudioRef} src={`/${medicine.audio.so}`} />
              </div>
            )}
          </div>
        ) : null}

        {/* ── ARABISK LYDFIL ── */}
        {medicine.audio.ar && language === "ar" ? (
          <div className="mb-6">
            {!showArabicAudio ? (
              <AudioButton label={arabicAudioLabel} tone="secondary" onClick={() => setShowArabicAudio(true)} />
            ) : (
              <div className="reveal-on-scroll rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border)" }}>
                <audio className="w-full" controls preload="none" ref={arabicAudioRef} src={`/${medicine.audio.ar}`} />
              </div>
            )}
          </div>
        ) : null}

        {/* ── OVERBLIK + IBRAHIM ── */}
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section
            className="reveal-on-scroll rounded-2xl border px-6 py-5 text-[15px] leading-7"
            style={{ background: "var(--soft)", borderColor: "var(--softBorder)", color: "var(--text)" }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {overviewLabel[language] || overviewLabel.da}
            </p>
            {data.introBox}
          </section>

          <section
            className="reveal-on-scroll rounded-2xl border px-6 py-5"
            style={{ background: "#FFFBF0", borderColor: "#E8C96A" }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "#92671B" }}>
              {data.ibrahimTitle}
            </p>
            <p className="text-[15px] leading-7" style={{ color: "#5C3D0A" }}>
              {data.ibrahimText}
            </p>
          </section>
        </div>

        {/* ── INHALATIONSTEKNIK (kun Ventoline + Symbicort) ── */}
        {(medicine.slug === "ventoline" || medicine.slug === "symbicort") && (
          <InhalerGuide slug={medicine.slug} language={language} />
        )}

        {/* ── SEKTIONSKORT (Brug, Dosis, Bivirkninger osv.) ── */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {medicine.sections.map((section) => {
            const list = data[section.listKey] || [];
            const iconSvg = sectionIcons[section.variant];
            const iconColor = SECTION_ICON_COLORS[section.variant] || { bg: "#f1f5f9", color: "#334155", border: "#475569" };

            return (
              <section
                className={`reveal-on-scroll rounded-2xl border border-transparent px-6 py-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${sectionStyles[section.variant] || "bg-slate-50"}`}
                key={section.listKey}
              >
                <div className="mb-5 flex items-center gap-4">
                  <span
                    className="inline-flex shrink-0 items-center justify-center rounded-full"
                    style={{ width: 52, height: 52, background: iconColor.bg, border: `2px solid ${iconColor.border}` }}
                  >
                    {iconSvg ? (
                      <span
                        style={{ color: iconColor.color, display: "flex", alignItems: "center", justifyContent: "center" }}
                        dangerouslySetInnerHTML={{
                          __html: iconSvg
                            .replace('width="18"', 'width="24"')
                            .replace('height="18"', 'height="24"')
                            .replace('stroke-width="2"', 'stroke-width="2.2"'),
                        }}
                      />
                    ) : (
                      <span style={{ color: iconColor.color, fontSize: 20, fontWeight: 900 }}>{section.icon || "•"}</span>
                    )}
                  </span>
                  <h3 className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>
                    {data[section.titleKey]}
                  </h3>
                </div>

                {section.variant === "dose" && medicine.dosagePictogram?.[language] && (
                  <DosagePictogram chips={medicine.dosagePictogram[language]} isRtl={isRtl} />
                )}

                <ul className="space-y-3 pl-1 text-[15px] leading-7" style={{ color: "var(--text)" }}>
                  {list.map((item, index) => (
                    <li key={`${section.listKey}-${index}`} className="flex items-start gap-3">
                      <span
                        className="mt-[10px] shrink-0 rounded-full"
                        style={{ width: 9, height: 9, background: iconColor.border, flexShrink: 0 }}
                      />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* ── KILDER ── */}
        <section
          className="reveal-on-scroll mt-6 rounded-2xl border bg-white px-6 py-5"
          style={{ borderColor: "var(--border)", borderLeft: "4px solid var(--sourceBorderAccent)" }}
        >
          <h3 className="mb-1.5 text-base font-bold" style={{ color: "var(--text)" }}>
            {data.sourcesTitle}
          </h3>
          <p className="mb-4 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
            {data.sourcesText}
          </p>
          <ul className="space-y-2.5 pl-5 text-sm">
            {(data.sourcesList || []).map((item) => (
              <li key={item.href}>
                <a
                  className="font-semibold hover:underline"
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ color: "var(--link)" }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ── FOOTER-NOTE ── */}
        <footer
          className="mt-8 border-t px-2 pt-6 text-center text-sm leading-6"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          {data.footerNote}

          {/* Emergency numbers */}
          <div style={{
            marginTop: "20px", padding: "14px 18px", borderRadius: "10px",
            background: "#fff5f5", border: "1.5px solid #fca5a5",
            display: "flex", alignItems: "flex-start", gap: "10px",
            textAlign: language === "ar" ? "right" : "left",
            direction: language === "ar" ? "rtl" : "ltr",
          }}>
            <span style={{ fontSize: "20px", flexShrink: 0 }}>🚨</span>
            <div>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "13px", color: "#991b1b" }}>
                {(EMERGENCY[language] ?? EMERGENCY.da).label}
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#7f1d1d", lineHeight: 1.7 }}>
                {(EMERGENCY[language] ?? EMERGENCY.da).poison}:{" "}
                <a href="tel:82121212" style={{ fontWeight: 700, color: "#dc2626", textDecoration: "none" }}>82 12 12 12</a>
                {"  ·  "}
                {(EMERGENCY[language] ?? EMERGENCY.da).emergency}:{" "}
                <a href="tel:112" style={{ fontWeight: 700, color: "#dc2626", textDecoration: "none" }}>112</a>
              </p>
            </div>
          </div>

          {/* Revision date badge */}
          <div style={{ marginTop: "18px", display: "flex", justifyContent: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "7px 18px", borderRadius: "999px",
              background: "linear-gradient(135deg, #e6faf6 0%, #d1f5ec 100%)",
              border: "1.5px solid #5eead4",
              color: "#0f766e", fontSize: "12px", fontWeight: 700,
              letterSpacing: "0.02em",
              boxShadow: "0 1px 4px rgba(13,148,136,0.10)",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              {LAST_REVISED[language] ?? LAST_REVISED.da}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { LanguageSelect } from "./language-select";
import { InhalerGuide } from "./inhaler-guide";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { applyLanguageToDocument } from "../lib/language";
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
  da: { whatsapp: "Del på WhatsApp", print: "Udskriv siden" },
  en: { whatsapp: "Share on WhatsApp", print: "Print page" },
  so: { whatsapp: "La wadaag WhatsApp", print: "Daabac bogga" },
  ar: { whatsapp: "مشاركة عبر واتساب", print: "طباعة الصفحة" },
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
  const somaliAudioRef = useRef(null);
  const arabicAudioRef = useRef(null);

  const { language, updateLanguage } = useLanguageRouting({ initialLanguage: initialLang });
  const data = useMemo(() => medicine.translations[language] || medicine.translations.so, [language, medicine]);
  const chromeText = useMemo(() => uiText[language] || uiText.so, [language]);
  const isRtl = language === "ar";

  // Lyt efter navbar-events (TPI-modal)
  useEffect(() => {
    const handler = (e) => {
      setModalTab(e.detail);
    };
    window.addEventListener("somalimed-tab", handler);
    return () => window.removeEventListener("somalimed-tab", handler);
  }, []);

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

      {/* ── TPI-MODAL (inhalationsteknik) ── */}
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
        <div style={{
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

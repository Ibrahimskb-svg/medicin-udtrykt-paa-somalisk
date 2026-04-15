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
        </footer>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { LanguageSelect } from "./language-select";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { applyLanguageToDocument } from "../lib/language";
import {
  arabicAudioLabel,
  sectionIcons,
  sectionIconStyles,
  sectionStyles,
  uiText,
} from "../lib/site";

// Farver til cirklerne — matcher sektionerne
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
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full text-white"
        style={{ background: color }}
      >
        <PlayIcon />
      </span>
      {label}
    </button>
  );
}

export function MedicinePage({ medicine, initialLang }) {
  const [showSomaliAudio, setShowSomaliAudio] = useState(false);
  const [showArabicAudio, setShowArabicAudio] = useState(false);
  const somaliAudioRef = useRef(null);
  const arabicAudioRef = useRef(null);
  const { language, updateLanguage } = useLanguageRouting({ initialLanguage: initialLang });
  const data = useMemo(() => medicine.translations[language] || medicine.translations.so, [language, medicine]);
  const chromeText = useMemo(() => uiText[language] || uiText.so, [language]);

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

  useScrollReveal([language, medicine.slug, showSomaliAudio, showArabicAudio]);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }} className="min-h-screen">

      {/* Hero banner */}
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
              <p className="mt-1.5 text-sm font-medium text-white/75">
                {data.drugForm}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                {data.hdrSubtitle}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">
              {data.badgeText}
            </span>
            <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">
              {chromeText.heroFormatValue}
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">

        <LanguageSelect label={data.langLabel} onChange={updateLanguage} value={language} />

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

        {medicine.audio.ar && language === "ar" ? (
          <div className="mb-6">
            {!showArabicAudio ? (
              <AudioButton label={arabicAudioLabel} onClick={() => setShowArabicAudio(true)} tone="secondary" />
            ) : (
              <div className="reveal-on-scroll rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border)" }}>
                <audio className="w-full" controls preload="none" ref={arabicAudioRef} src={`/${medicine.audio.ar}`} />
              </div>
            )}
          </div>
        ) : null}

        {/* Intro + Ibrahim boxes */}
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section
            className="reveal-on-scroll rounded-2xl border px-6 py-5 text-[15px] leading-7"
            style={{ background: "var(--soft)", borderColor: "var(--softBorder)", color: "var(--text)" }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Overblik
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

        {/* Info section cards */}
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
                {/* Header: cirkel-ikon + titel */}
                <div className="mb-5 flex items-center gap-4">
                  <span
                    className="inline-flex shrink-0 items-center justify-center rounded-full"
                    style={{
                      width: 52,
                      height: 52,
                      background: iconColor.bg,
                      border: `2px solid ${iconColor.border}`,
                    }}
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
                      <span style={{ color: iconColor.color, fontSize: 20, fontWeight: 900 }}>
                        {section.icon || "•"}
                      </span>
                    )}
                  </span>

                  <h3 className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>
                    {data[section.titleKey]}
                  </h3>
                </div>

                {/* Punkter med tydelig farvet prik */}
                <ul className="space-y-3 pl-1 text-[15px] leading-7" style={{ color: "var(--text)" }}>
                  {list.map((item, index) => (
                    <li
                      key={`${section.listKey}-${index}`}
                      className="flex items-start gap-3"
                    >
                      {/* Større og skarpere prik */}
                      <span
                        className="mt-[10px] shrink-0 rounded-full"
                        style={{
                          width: 9,
                          height: 9,
                          background: iconColor.border,
                          flexShrink: 0,
                        }}
                      />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Sources */}
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

        {/* Footer note */}
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

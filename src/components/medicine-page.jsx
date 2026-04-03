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

function SectionIcon({ type }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "clock") return (
    <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
  if (type === "warning") return (
    <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  );
  if (type === "alert") return (
    <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  );
  if (type === "shield") return (
    <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  );
  if (type === "pill") return (
    <svg {...props}><path d="m10.5 20.5-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><line x1="8.5" y1="12.5" x2="15.5" y2="5.5"/></svg>
  );
  if (type === "moon") return (
    <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  );
  if (type === "food") return (
    <svg {...props}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
  );
  if (type === "box") return (
    <svg {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
  );
  return <span>•</span>;
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

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {medicine.sections.map((section) => {
            const list = data[section.listKey] || [];
            return (
              <section
                className={`reveal-on-scroll rounded-2xl border border-transparent px-6 py-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${sectionStyles[section.variant] || "bg-slate-50"}`}
                key={section.listKey}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${sectionIconStyles[section.variant] || "bg-slate-200 text-slate-700"}`}
                  >
                    <SectionIcon type={sectionIcons[section.variant]} />
                  </span>
                  <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>
                    {data[section.titleKey]}
                  </h3>
                </div>
                <ul className="space-y-2.5 pl-5 text-[15px] leading-7" style={{ color: "var(--text)" }}>
                  {list.map((item, index) => (
                    <li key={`${section.listKey}-${index}`} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

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

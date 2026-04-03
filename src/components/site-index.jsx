"use client";

import {
  AirVent,
  Pill,
  PillBottle,
  SprayCan,
  Syringe,
  Tablets,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LanguageSelect } from "./language-select";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { applyLanguageToDocument } from "../lib/language";
import { getIndexData, uiText } from "../lib/site";

const indexData = getIndexData();

// ── Category accent colors (one per English category) ──────────────────────
const CATEGORY_STYLE = {
  "high blood pressure":          { color: "#DC2626", bg: "#FEF2F2" }, // red — pressure
  "blood pressure & palpitations":{ color: "#E11D48", bg: "#FFF1F2" }, // rose — heart rhythm
  "blood thinner":                { color: "#7C3AED", bg: "#F5F3FF" }, // violet — anticoagulant
  "blood clot prevention":        { color: "#6D28D9", bg: "#EDE9FE" }, // purple — clot
  "cholesterol":                  { color: "#D97706", bg: "#FFFBEB" }, // amber — lipid
  "diabetes":                     { color: "#0284C7", bg: "#F0F9FF" }, // sky — insulin/water
  "asthma":                       { color: "#0D9488", bg: "#F0FDFA" }, // teal — lungs/air
  "depression & anxiety":         { color: "#8B5CF6", bg: "#F5F3FF" }, // violet — mental
  "psychosis & bipolar":          { color: "#A855F7", bg: "#FAF5FF" }, // purple — mental
  "epilepsy & bipolar":           { color: "#7C3AED", bg: "#F5F3FF" }, // violet — neuro
  "sleep":                        { color: "#4F46E5", bg: "#EEF2FF" }, // indigo — night
  "insomnia":                     { color: "#6366F1", bg: "#EEF2FF" }, // indigo — night
  "pain relief":                  { color: "#059669", bg: "#ECFDF5" }, // emerald — relief
  "pain and fever":               { color: "#F59E0B", bg: "#FFFBEB" }, // amber — fever
  "pain and inflammation":        { color: "#EF4444", bg: "#FEF2F2" }, // red — inflammation
  "stomach acid and heartburn":   { color: "#10B981", bg: "#ECFDF5" }, // emerald — stomach
};
const DEFAULT_STYLE = { color: "#0D9488", bg: "#F0FDFA" };

const LIBRARY_CAPSULE_SLUGS = new Set([
  "amlodipin",
  "atorvastatin",
  "enalapril",
  "lamotrigin",
  "losartan",
  "zopiclon",
]);

const LIBRARY_ROUND_TABLET_SLUGS = new Set([
  "eliquis",
  "marevan",
  "melatonin",
  "metformin",
  "metoprolol",
  "paracetamol",
  "quetiapin",
  "sertralin",
  "xarelto",
]);

const LIBRARY_OVAL_TABLET_SLUGS = new Set([
  "diclofenac",
  "hjertemagnyl",
  "ibuprofen",
  "morfin_tablet",
  "naproxen",
  "pantoprazol",
]);

// ── Category icons — SVG per medicine type ─────────────────────────────────
function CategoryIcon({ englishCat, color, size = 20 }) {
  const s = { width: size, height: size };
  const p = { fill: "none", stroke: color, strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round" };

  switch (englishCat) {

    case "high blood pressure":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Heart */}
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          {/* Small up-arrow above heart */}
          <path d="M12 3V1M11 2l1-1 1 1" strokeWidth="1.5" />
        </svg>
      );

    case "blood pressure & palpitations":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Heart */}
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          {/* Pulse line across the heart */}
          <path d="M5 10h2.5l1.5-2 2 4 1.5-2H17" strokeWidth="1.4" />
        </svg>
      );

    case "blood thinner":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Blood drop */}
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0Z" />
          {/* Horizontal "thinning" line */}
          <path d="M8.5 14.5h7" strokeWidth="2" />
        </svg>
      );

    case "blood clot prevention":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Shield */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {/* Checkmark */}
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "cholesterol":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Two wavy vessel/artery lines */}
          <path d="M2 9.5c2-2.5 4 0 6 0s4-2.5 6 0 4 2.5 6 0" />
          <path d="M2 14.5c2-2.5 4 0 6 0s4-2.5 6 0 4 2.5 6 0" />
          {/* Plaque buildup dot */}
          <circle cx="8" cy="9.5" r="1.8" fill={color} stroke="none" />
        </svg>
      );

    case "diabetes":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Water/insulin drop */}
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0Z" />
          {/* Glucose cross inside */}
          <path d="M12 9v6M9 12h6" strokeWidth="1.6" />
        </svg>
      );

    case "asthma":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Left lung */}
          <path d="M7 8V4H5C3.9 4 3 5.1 3 6.3v6.4C3 15 4.3 17 6 17h1V8" />
          {/* Right lung */}
          <path d="M17 8V4h2c1.1 0 2 1.1 2 2.3v6.4C21 15 19.7 17 18 17h-1V8" />
          {/* Trachea/stem */}
          <path d="M7 8h10M12 4v4" />
        </svg>
      );

    case "depression & anxiety":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Brain outline */}
          <path d="M12 5a2.5 2.5 0 0 0-5 .5C5 6 3.5 7.5 3.5 9.5c0 1.5.7 2.8 1.8 3.6A3.5 3.5 0 0 0 9 19h3" />
          <path d="M12 5a2.5 2.5 0 0 1 5 .5c2 .5 3.5 2 3.5 4 0 1.5-.7 2.8-1.8 3.6A3.5 3.5 0 0 1 15 19h-3" />
          {/* Wave indicating mood/signal */}
          <path d="M9 22l1-3h4l1 3" strokeWidth="1.4" />
        </svg>
      );

    case "psychosis & bipolar":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Brain outline */}
          <path d="M12 5a2.5 2.5 0 0 0-5 .5C5 6 3.5 7.5 3.5 9.5c0 1.5.7 2.8 1.8 3.6A3.5 3.5 0 0 0 9 19h3" />
          <path d="M12 5a2.5 2.5 0 0 1 5 .5c2 .5 3.5 2 3.5 4 0 1.5-.7 2.8-1.8 3.6A3.5 3.5 0 0 1 15 19h-3" />
          <path d="M12 19v2" />
          {/* Two poles — bipolar */}
          <circle cx="10" cy="21.5" r="0.6" fill={color} stroke="none" />
          <circle cx="14" cy="21.5" r="0.6" fill={color} stroke="none" />
        </svg>
      );

    case "epilepsy & bipolar":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Brain outline */}
          <path d="M12 5a2.5 2.5 0 0 0-5 .5C5 6 3.5 7.5 3.5 9.5c0 1.5.7 2.8 1.8 3.6A3.5 3.5 0 0 0 9 19h3" />
          <path d="M12 5a2.5 2.5 0 0 1 5 .5c2 .5 3.5 2 3.5 4 0 1.5-.7 2.8-1.8 3.6A3.5 3.5 0 0 1 15 19h-3" />
          {/* Lightning bolt — epilepsy */}
          <path d="M13 9l-2.5 4h3.5l-2.5 4" strokeWidth="1.6" />
        </svg>
      );

    case "sleep":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Moon */}
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          {/* Small stars */}
          <path d="M17 4l.5 1 .5-1-.5-1z" fill={color} stroke="none" />
          <path d="M20 7l.4.8.4-.8-.4-.8z" fill={color} stroke="none" />
        </svg>
      );

    case "insomnia":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Crescent moon */}
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          {/* "Z z" suggesting sleeplessness */}
          <path d="M15 9h3l-3 3h3" strokeWidth="1.3" />
        </svg>
      );

    case "pain relief":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Pill/capsule */}
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          {/* Dividing line */}
          <path d="m8.5 8.5 7 7" />
        </svg>
      );

    case "pain and fever":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Thermometer body */}
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
          {/* Mercury fill suggestion */}
          <path d="M12 18a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill={color} stroke="none" />
        </svg>
      );

    case "pain and inflammation":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Flame */}
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );

    case "stomach acid and heartburn":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          {/* Stomach shape */}
          <path d="M6 4c0-1 .9-2 2-2s2 1 2 2v7c0 2.5 1.5 4.5 4 4.5s4-2 4-4.5V5" />
          {/* Acid bubbles */}
          <circle cx="10.5" cy="17" r="1" fill={color} stroke="none" />
          <circle cx="13.5" cy="19" r="0.7" fill={color} stroke="none" />
          <circle cx="8" cy="19.5" r="0.8" fill={color} stroke="none" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      );
  }
}

function LibraryMedicineIcon({ slug, color, size = 18 }) {
  const iconProps = {
    color,
    size,
    strokeWidth: 2,
    absoluteStrokeWidth: true,
  };

  if (slug === "insulin") {
    return <PillBottle {...iconProps} />;
  }

  if (slug === "morfin_injektion") {
    return <Syringe {...iconProps} />;
  }

  if (slug === "symbicort") {
    return <AirVent {...iconProps} />;
  }

  if (slug === "ventoline") {
    return <SprayCan {...iconProps} />;
  }

  if (LIBRARY_CAPSULE_SLUGS.has(slug)) {
    return <Pill {...iconProps} />;
  }

  if (LIBRARY_OVAL_TABLET_SLUGS.has(slug)) {
    return <Tablets {...iconProps} />;
  }

  if (LIBRARY_ROUND_TABLET_SLUGS.has(slug)) {
    return <Pill {...iconProps} />;
  }

  return <Pill {...iconProps} />;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function SiteIndex({ initialLang }) {
  const { language, updateLanguage } = useLanguageRouting({ initialLanguage: initialLang });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const text = useMemo(() => indexData.translations[language] || indexData.translations.so, [language]);
  const chromeText = useMemo(() => uiText[language] || uiText.so, [language]);

  useEffect(() => {
    applyLanguageToDocument(language, text.pageTitle);
  }, [language, text.pageTitle]);

  const categories = useMemo(() => {
    const values = indexData.items
      .map((item) => indexData.subtitles[item.slug]?.[language] || indexData.subtitles[item.slug]?.so || "")
      .filter(Boolean);
    return [...new Set(values)];
  }, [language]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return indexData.items.filter((item) => {
      const subtitle = indexData.subtitles[item.slug]?.[language] || indexData.subtitles[item.slug]?.so || "";
      const matchesCategory = activeCategory === "all" || subtitle === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        subtitle.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, language, searchTerm]);

  useScrollReveal([language, activeCategory, searchTerm]);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }} className="min-h-screen">

      {/* ── Hero banner ── */}
      <div style={{ background: "var(--heroBg)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/90">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" />
            </svg>
            {chromeText.heroEyebrow}
          </div>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl" style={{ lineHeight: 1.1 }}>
            {text.hdrTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            {text.hdrSubtitle}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="text-lg font-black text-white">{indexData.items.length}</span>
              {chromeText.medicinesStat}
            </span>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-lg font-black text-white">4</span>
              {chromeText.languagesStat}
            </span>
            <span className="text-white/40">·</span>
            <span>{chromeText.heroFormatValue}</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">

        {/* ── Language pills ── */}
        <div className="reveal-on-scroll">
          <LanguageSelect label={text.langLabel} onChange={updateLanguage} value={language} />
        </div>

        {/* ── Search + Category row ── */}
        <div className="reveal-on-scroll mb-7 flex flex-col gap-3 sm:flex-row sm:items-end">
          {/* Search */}
          <label className="flex-1" htmlFor="medSearch">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {chromeText.searchLabel}
            </span>
            <div
              className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-3.5 transition-shadow duration-200 focus-within:shadow-lg"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="shrink-0" style={{ color: "var(--text-muted)" }}><SearchIcon /></span>
              <input
                id="medSearch"
                className="flex-1 bg-transparent text-base outline-none"
                style={{ color: "var(--text)" }}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={chromeText.searchPlaceholder}
                value={searchTerm}
              />
              {searchTerm && (
                <button type="button" className="shrink-0 rounded-full p-1 text-sm transition hover:bg-gray-100" style={{ color: "var(--text-muted)" }} onClick={() => setSearchTerm("")}>
                  ✕
                </button>
              )}
            </div>
          </label>

          {/* Category dropdown */}
          <label className="sm:w-52" htmlFor="catSelect">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {chromeText.categoryLabel}
            </span>
            <select
              id="catSelect"
              className="w-full appearance-none rounded-2xl border bg-white px-4 py-3.5 text-sm font-medium outline-none transition-shadow duration-200 focus:shadow-lg"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235A6A7A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                paddingRight: "40px",
              }}
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              <option value="all">{chromeText.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
        </div>

        {/* ── Section heading ── */}
        <div className="reveal-on-scroll mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {chromeText.libraryEyebrow}
            </p>
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--text)" }}>
              {text.pickTitle}
            </h2>
          </div>
          {filteredItems.length > 0 && (
            <span className="shrink-0 text-sm" style={{ color: "var(--text-muted)" }}>
              {filteredItems.length} {chromeText.medicinesStat.toLowerCase()}
            </span>
          )}
        </div>

        {/* ── Medicine cards ── */}
        {filteredItems.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => {
              const subtitle =
                (indexData.subtitles[item.slug] &&
                  (indexData.subtitles[item.slug][language] || indexData.subtitles[item.slug].so)) || "";

              // Always use English key for consistent icon/color lookup
              const englishCat = indexData.subtitles[item.slug]?.en || "";
              const style = CATEGORY_STYLE[englishCat] || DEFAULT_STYLE;

              return (
                <li className="reveal-on-scroll" key={item.slug} style={{ transitionDelay: `${Math.min(index * 40, 200)}ms` }}>
                  <Link
                    className="group flex h-full overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ borderColor: "var(--border)" }}
                    href={{ pathname: `/${item.href}`, query: { lang: language } }}
                  >
                    {/* Left colored accent bar */}
                    <div className="w-1.5 shrink-0" style={{ background: style.color }} />

                    <div className="flex flex-1 flex-col p-5">
                      {/* Medicine icon + category */}
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                          style={{ background: style.bg, borderColor: `${style.color}22` }}
                        >
                          <LibraryMedicineIcon slug={item.slug} color={style.color} size={20} />
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: style.bg, color: style.color }}
                        >
                          {subtitle || chromeText.medicinePill}
                        </span>
                      </div>

                      {/* Medicine name */}
                      <h3 className="mt-3 text-xl font-bold" style={{ color: "var(--text)" }}>
                        {item.name}
                      </h3>

                      {/* CTA */}
                      <div
                        className="mt-auto flex items-center justify-between border-t pt-4"
                        style={{ borderColor: "var(--border)", marginTop: "1rem" }}
                      >
                        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                          {chromeText.openDetails}
                        </span>
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-white transition duration-300 group-hover:scale-110"
                          style={{ background: style.color }}
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <section className="reveal-on-scroll rounded-2xl border bg-white px-8 py-12 text-center" style={{ borderColor: "var(--border)" }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--bg)" }}>
              <SearchIcon />
            </div>
            <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>{chromeText.noResultsTitle}</h3>
            <p className="mt-2" style={{ color: "var(--text-muted)" }}>{chromeText.noResultsBody}</p>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mx-auto max-w-6xl border-t px-4 pb-14 pt-8 text-center text-sm leading-7" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        <span>{text.footer1}</span>
        {text.footer2 ? <><br />{text.footer2}</> : null}
        <br /><br />
        <strong style={{ color: "var(--text)" }}>{text.footerStrong}</strong>
        {text.footer3 ? <><br />{text.footer3}</> : null}
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LanguageSelect } from "./language-select";
import { useLanguageRouting } from "../hooks/use-language-routing";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { applyLanguageToDocument } from "../lib/language";
import { getIndexData, uiText } from "../lib/site";

const indexData = getIndexData();

const ICON_BASE = "https://raw.githubusercontent.com/Ibrahimskb-svg/medicin-udtrykt-paa-somalisk/main/public/icons/";

// ── Translated display names ───────────────────────────────────────────────
const SLUG_DISPLAY_NAMES = {
  morfin_injektion: { da:"Morfin (injektion)", en:"Morphine (injection)", ar:"مورفين (حقن)", so:"Morfin (irbad)" },
  morfin_tablet:    { da:"Morfin (tablet)",    en:"Morphine (tablet)",    ar:"مورفين (قرص)", so:"Morfin (kiniin)" },
};
function getDisplayName(slug, language, fallback) {
  const t = SLUG_DISPLAY_NAMES[slug];
  if (!t) return fallback;
  return t[language] ?? t.so ?? fallback;
}

// ── GitHub icon per slug ───────────────────────────────────────────────────
// Hver slug får sit eget ikon fra /public/icons/
const SLUG_ICON = {
  amlodipin:        "blood-pressure.png",
  enalapril:        "blood-pressure.png",
  losartan:         "blood-pressure.png",
  metoprolol:       "blood-pressure.png",
  eliquis:          "line.png",
  marevan:          "line.png",
  xarelto:          "line.png",
  hjertemagnyl:     "line.png",
  atorvastatin:     "cholesterol.png",
  metformin:        "blood-test.png",
  insulin:          "blood-test.png",
  ventoline:        "lungs.png",
  symbicort:        "lungs.png",
  sertralin:        "mental-health.png",
  quetiapin:        "mental-health.png",
  lamotrigin:       "brain.png",
  melatonin:        "nighttime.png",
  zopiclon:         "nighttime.png",
  paracetamol:      "download.png",
  ibuprofen:        "download.png",
  diclofenac:       "download.png",
  naproxen:         "download.png",
  morfin_tablet:    "download.png",
  morfin_injektion: "download.png",
  pantoprazol:      "stomach.png",
};

// ── Category accent colors per slug ───────────────────────────────────────
const SLUG_STYLE = {
  amlodipin:        { color:"#DC2626", bg:"#FEF2F2" },
  enalapril:        { color:"#DC2626", bg:"#FEF2F2" },
  losartan:         { color:"#DC2626", bg:"#FEF2F2" },
  metoprolol:       { color:"#E11D48", bg:"#FFF1F2" },
  eliquis:          { color:"#7C3AED", bg:"#F5F3FF" },
  marevan:          { color:"#7C3AED", bg:"#F5F3FF" },
  xarelto:          { color:"#7C3AED", bg:"#F5F3FF" },
  hjertemagnyl:     { color:"#6D28D9", bg:"#EDE9FE" },
  atorvastatin:     { color:"#D97706", bg:"#FFFBEB" },
  metformin:        { color:"#0284C7", bg:"#F0F9FF" },
  insulin:          { color:"#0284C7", bg:"#F0F9FF" },
  ventoline:        { color:"#0D9488", bg:"#F0FDFA" },
  symbicort:        { color:"#0D9488", bg:"#F0FDFA" },
  sertralin:        { color:"#8B5CF6", bg:"#F5F3FF" },
  quetiapin:        { color:"#A855F7", bg:"#FAF5FF" },
  lamotrigin:       { color:"#7C3AED", bg:"#F5F3FF" },
  melatonin:        { color:"#4F46E5", bg:"#EEF2FF" },
  zopiclon:         { color:"#6366F1", bg:"#EEF2FF" },
  paracetamol:      { color:"#F59E0B", bg:"#FFFBEB" },
  ibuprofen:        { color:"#EF4444", bg:"#FEF2F2" },
  diclofenac:       { color:"#EF4444", bg:"#FEF2F2" },
  naproxen:         { color:"#EF4444", bg:"#FEF2F2" },
  morfin_tablet:    { color:"#059669", bg:"#ECFDF5" },
  morfin_injektion: { color:"#059669", bg:"#ECFDF5" },
  pantoprazol:      { color:"#10B981", bg:"#ECFDF5" },
};
const DEFAULT_STYLE = { color:"#0D9488", bg:"#F0FDFA" };

// ── Category pills — grupperet på OVERSAT navn så ingen dubletter ──────────
// Vi bruger det oversatte navn som nøgle og samler alle engelske cats under det
const CATEGORY_PILL_ICON = {
  // dansk label → ikon + farve
  "forhøjet blodtryk":        { icon:"blood-pressure.png", color:"#DC2626", bg:"#FEF2F2" },
  "blodtryk & hjertebanken":  { icon:"blood-pressure.png", color:"#E11D48", bg:"#FFF1F2" },
  "blodfortyndende":          { icon:"line.png",           color:"#7C3AED", bg:"#F5F3FF" },
  "blodpropforebyggelse":     { icon:"line.png",           color:"#6D28D9", bg:"#EDE9FE" },
  "kolesterol":               { icon:"cholesterol.png",    color:"#D97706", bg:"#FFFBEB" },
  "diabetes":                 { icon:"blood-test.png",     color:"#0284C7", bg:"#F0F9FF" },
  "astma":                    { icon:"lungs.png",          color:"#0D9488", bg:"#F0FDFA" },
  "depression & angst":       { icon:"mental-health.png",  color:"#8B5CF6", bg:"#F5F3FF" },
  "psykose & bipolar":        { icon:"mental-health.png",  color:"#A855F7", bg:"#FAF5FF" },
  "epilepsi & bipolar":       { icon:"brain.png",          color:"#7C3AED", bg:"#F5F3FF" },
  "søvn":                     { icon:"nighttime.png",      color:"#4F46E5", bg:"#EEF2FF" },
  "søvnløshed":               { icon:"nighttime.png",      color:"#6366F1", bg:"#EEF2FF" },
  "smertestillende":          { icon:"download.png",       color:"#059669", bg:"#ECFDF5" },
  "smerter og feber":         { icon:"download.png",       color:"#F59E0B", bg:"#FFFBEB" },
  "smerter og betændelse":    { icon:"download.png",       color:"#EF4444", bg:"#FEF2F2" },
  "mavesyre og halsbrand":    { icon:"stomach.png",        color:"#10B981", bg:"#ECFDF5" },
  // somalisk
  "dhiig-karka":              { icon:"blood-pressure.png", color:"#DC2626", bg:"#FEF2F2" },
  "dhiig-karka & wadne garaac":{ icon:"blood-pressure.png",color:"#E11D48", bg:"#FFF1F2" },
  "dhiig-khafiifiye":         { icon:"line.png",           color:"#7C3AED", bg:"#F5F3FF" },
  "dhiig-xinjir ka hortag":   { icon:"line.png",           color:"#6D28D9", bg:"#EDE9FE" },
  "kolestarool":              { icon:"cholesterol.png",    color:"#D97706", bg:"#FFFBEB" },
  "sonkoroow":                { icon:"blood-test.png",     color:"#0284C7", bg:"#F0F9FF" },
  "neef-mareenka":            { icon:"lungs.png",          color:"#0D9488", bg:"#F0FDFA" },
  "niyad-jab & welwel":       { icon:"mental-health.png",  color:"#8B5CF6", bg:"#F5F3FF" },
  "cilad dhimirka & laba-cirifood":{ icon:"mental-health.png", color:"#A855F7", bg:"#FAF5FF" },
  "suuxdin & laba-cirifood":  { icon:"brain.png",          color:"#7C3AED", bg:"#F5F3FF" },
  "hurdo":                    { icon:"nighttime.png",      color:"#4F46E5", bg:"#EEF2FF" },
  "hurdo la'aan":             { icon:"nighttime.png",      color:"#6366F1", bg:"#EEF2FF" },
  "xanuun baabi'iye":         { icon:"download.png",       color:"#059669", bg:"#ECFDF5" },
  "xanuun & qandho":          { icon:"download.png",       color:"#F59E0B", bg:"#FFFBEB" },
  "xanuun & barar":           { icon:"download.png",       color:"#EF4444", bg:"#FEF2F2" },
  "gaastriga iyo laab-jeexa": { icon:"stomach.png",        color:"#10B981", bg:"#ECFDF5" },
  // engelsk
  "high blood pressure":      { icon:"blood-pressure.png", color:"#DC2626", bg:"#FEF2F2" },
  "blood pressure & palpitations":{ icon:"blood-pressure.png", color:"#E11D48", bg:"#FFF1F2" },
  "blood thinner":            { icon:"line.png",           color:"#7C3AED", bg:"#F5F3FF" },
  "blood clot prevention":    { icon:"line.png",           color:"#6D28D9", bg:"#EDE9FE" },
  "cholesterol":              { icon:"cholesterol.png",    color:"#D97706", bg:"#FFFBEB" },
  "diabetes":                 { icon:"blood-test.png",     color:"#0284C7", bg:"#F0F9FF" },
  "asthma":                   { icon:"lungs.png",          color:"#0D9488", bg:"#F0FDFA" },
  "depression & anxiety":     { icon:"mental-health.png",  color:"#8B5CF6", bg:"#F5F3FF" },
  "psychosis & bipolar":      { icon:"mental-health.png",  color:"#A855F7", bg:"#FAF5FF" },
  "epilepsy & bipolar":       { icon:"brain.png",          color:"#7C3AED", bg:"#F5F3FF" },
  "sleep":                    { icon:"nighttime.png",      color:"#4F46E5", bg:"#EEF2FF" },
  "insomnia":                 { icon:"nighttime.png",      color:"#6366F1", bg:"#EEF2FF" },
  "pain relief":              { icon:"download.png",       color:"#059669", bg:"#ECFDF5" },
  "pain and fever":           { icon:"download.png",       color:"#F59E0B", bg:"#FFFBEB" },
  "pain and inflammation":    { icon:"download.png",       color:"#EF4444", bg:"#FEF2F2" },
  "stomach acid and heartburn":{ icon:"stomach.png",       color:"#10B981", bg:"#ECFDF5" },
  // arabisk
  "ارتفاع ضغط الدم":         { icon:"blood-pressure.png", color:"#DC2626", bg:"#FEF2F2" },
  "ضغط الدم وخفقان القلب":   { icon:"blood-pressure.png", color:"#E11D48", bg:"#FFF1F2" },
  "مميع للدم":               { icon:"line.png",           color:"#7C3AED", bg:"#F5F3FF" },
  "الوقاية من الجلطات":      { icon:"line.png",           color:"#6D28D9", bg:"#EDE9FE" },
  "الكوليسترول":             { icon:"cholesterol.png",    color:"#D97706", bg:"#FFFBEB" },
  "السكري":                  { icon:"blood-test.png",     color:"#0284C7", bg:"#F0F9FF" },
  "الربو":                   { icon:"lungs.png",          color:"#0D9488", bg:"#F0FDFA" },
  "الاكتئاب والقلق":         { icon:"mental-health.png",  color:"#8B5CF6", bg:"#F5F3FF" },
  "الذهان وثنائي القطب":     { icon:"mental-health.png",  color:"#A855F7", bg:"#FAF5FF" },
  "الصرع وثنائي القطب":      { icon:"brain.png",          color:"#7C3AED", bg:"#F5F3FF" },
  "النوم":                   { icon:"nighttime.png",      color:"#4F46E5", bg:"#EEF2FF" },
  "الأرق":                   { icon:"nighttime.png",      color:"#6366F1", bg:"#EEF2FF" },
  "مسكن ألم":                { icon:"download.png",       color:"#059669", bg:"#ECFDF5" },
  "ألم وحمى":                { icon:"download.png",       color:"#F59E0B", bg:"#FFFBEB" },
  "ألم والتهاب":             { icon:"download.png",       color:"#EF4444", bg:"#FEF2F2" },
  "حموضة المعدة وحرقة المعدة":{ icon:"stomach.png",      color:"#10B981", bg:"#ECFDF5" },
};

function getPillMeta(label) {
  return CATEGORY_PILL_ICON[label] || { icon:"download.png", color:"#0D9488", bg:"#F0FDFA" };
}

// Stort begyndelsesbogstav på første ord
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Byg unikke category pills — ingen dubletter baseret på oversat label
function buildCategoryPills(language) {
  const seen = new Set();
  const pills = [];
  for (const item of indexData.items) {
    const label = indexData.subtitles[item.slug]?.[language]
      || indexData.subtitles[item.slug]?.so
      || "";
    if (!label || seen.has(label)) continue;
    seen.add(label);
    pills.push({ label, language });
  }
  return pills;
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
  const [searchTerm, setSearchTerm]     = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const text       = useMemo(() => indexData.translations[language] || indexData.translations.so, [language]);
  const chromeText = useMemo(() => uiText[language] || uiText.so, [language]);

  useEffect(() => {
    applyLanguageToDocument(language, text.pageTitle);
  }, [language, text.pageTitle]);

  // Nulstil kategori når sprog skifter
  useEffect(() => { setActiveCategory("all"); }, [language]);

  const categoryPills = useMemo(() => buildCategoryPills(language), [language]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return indexData.items.filter((item) => {
      const subtitle    = indexData.subtitles[item.slug]?.[language] || indexData.subtitles[item.slug]?.so || "";
      const matchesCat  = activeCategory === "all" || subtitle === activeCategory;
      const displayName = getDisplayName(item.slug, language, item.name);
      const matchSearch =
        !query ||
        displayName.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        subtitle.toLowerCase().includes(query);
      return matchesCat && matchSearch;
    });
  }, [activeCategory, language, searchTerm]);

  useScrollReveal([language, activeCategory, searchTerm]);

  return (
    <div style={{ background:"var(--bg)", color:"var(--text)" }} className="min-h-screen">

      {/* ── Hero ── */}
      <div style={{ background:"var(--heroBg)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white/90">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>
            </svg>
            {chromeText.heroEyebrow}
          </div>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl" style={{ lineHeight:1.1 }}>
            {text.hdrTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{text.hdrSubtitle}</p>
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

        {/* ── Søgefelt — UÆNDRET ── */}
        <div className="reveal-on-scroll mb-6">
          <label htmlFor="medSearch">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest" style={{ color:"var(--text-muted)" }}>
              {chromeText.searchLabel}
            </span>
            <div
              className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-3.5 transition-shadow duration-200 focus-within:shadow-lg"
              style={{ borderColor:"var(--border)" }}
            >
              <span className="shrink-0" style={{ color:"var(--text-muted)" }}><SearchIcon /></span>
              <input
                id="medSearch"
                className="flex-1 bg-transparent text-base outline-none"
                style={{ color:"var(--text)" }}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={chromeText.searchPlaceholder}
                value={searchTerm}
              />
              {searchTerm && (
                <button type="button" className="shrink-0 rounded-full p-1 text-sm transition hover:bg-gray-100" style={{ color:"var(--text-muted)" }} onClick={() => setSearchTerm("")}>✕</button>
              )}
            </div>
          </label>
        </div>

        {/* ── Category pills — ingen dubletter, rigtige ikoner og farver ── */}
        <div className="reveal-on-scroll mb-7">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest" style={{ color:"var(--text-muted)" }}>
            {chromeText.categoryLabel}
          </span>
          <div className="flex flex-wrap gap-2.5">

            {/* Alle */}
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                borderRadius:"999px", border:"1.5px solid",
                padding:"8px 18px", fontSize:"14px", fontWeight:600,
                lineHeight:1, cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap",
                ...(activeCategory === "all"
                  ? { background:"#1a1a1a", color:"#ffffff", borderColor:"#1a1a1a", boxShadow:"0 2px 8px rgba(0,0,0,0.18)" }
                  : { background:"var(--surface,#fff)", color:"var(--text)", borderColor:"var(--border)" })
              }}
            >
              <span style={{ width:10, height:10, borderRadius:"50%", display:"inline-block", flexShrink:0, background: activeCategory === "all" ? "#fff" : "#888" }} />
              {capitalize(chromeText.allCategories)}
            </button>

            {/* Én pill per unik oversat kategori */}
            {categoryPills.map(({ label }) => {
              const isActive = activeCategory === label;
              const meta     = getPillMeta(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveCategory(isActive ? "all" : label)}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:"8px",
                    borderRadius:"999px", border:"1.5px solid",
                    padding:"8px 18px", fontSize:"14px", fontWeight:600,
                    lineHeight:1, cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap",
                    ...(isActive
                      ? { background:meta.color, color:"#ffffff", borderColor:meta.color, boxShadow:`0 2px 12px ${meta.color}50` }
                      : { background:meta.bg,    color:meta.color, borderColor:`${meta.color}40` })
                  }}
                >
                  <img
                    src={`${ICON_BASE}${meta.icon}`}
                    alt=""
                    style={{
                      width:22, height:22, objectFit:"contain", flexShrink:0,
                      filter: isActive ? "brightness(0) invert(1)" : "none",
                      mixBlendMode: isActive ? "normal" : "multiply",
                    }}
                    onError={(e) => { e.currentTarget.style.display="none"; }}
                  />
                  {capitalize(label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Section heading ── */}
        <div className="reveal-on-scroll mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest" style={{ color:"var(--text-muted)" }}>
              {chromeText.libraryEyebrow}
            </p>
            <h2 className="text-2xl font-extrabold" style={{ color:"var(--text)" }}>{text.pickTitle}</h2>
          </div>
          {filteredItems.length > 0 && (
            <span className="shrink-0 text-sm" style={{ color:"var(--text-muted)" }}>
              {filteredItems.length} {chromeText.medicinesStat.toLowerCase()}
            </span>
          )}
        </div>

        {/* ── Medicine cards — GitHub-ikoner i stedet for Lucide ── */}
        {filteredItems.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => {
              const subtitle    = indexData.subtitles[item.slug]?.[language] || indexData.subtitles[item.slug]?.so || "";
              const style       = SLUG_STYLE[item.slug] || DEFAULT_STYLE;
              const iconFile    = SLUG_ICON[item.slug]  || "download.png";
              const displayName = getDisplayName(item.slug, language, item.name);

              return (
                <li className="reveal-on-scroll" key={item.slug} style={{ transitionDelay:`${Math.min(index * 40, 200)}ms` }}>
                  <Link
                    className="group flex h-full overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ borderColor:"var(--border)" }}
                    href={{ pathname:`/${item.href}`, query:{ lang:language } }}
                  >
                    {/* Farvet streg i venstre side */}
                    <div className="w-1.5 shrink-0" style={{ background:style.color }} />

                    <div className="flex flex-1 flex-col p-5">
                      {/* GitHub-ikon + kategori-badge */}
                      <div className="flex items-center gap-3">
                        <span
                          className="flex shrink-0 items-center justify-center rounded-2xl border shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                          style={{ width:64, height:64, background:style.bg, borderColor:`${style.color}22` }}
                        >
                          <img
                            src={`${ICON_BASE}${iconFile}`}
                            alt=""
                            style={{ width:44, height:44, objectFit:"contain", mixBlendMode:"multiply" }}
                            onError={(e) => { e.currentTarget.style.display="none"; }}
                          />
                        </span>
                        <span
                          className="rounded-full font-semibold"
                          style={{ background:style.bg, color:style.color, fontSize:"15px", padding:"7px 15px" }}
                        >
                          {capitalize(subtitle) || capitalize(chromeText.medicinePill)}
                        </span>
                      </div>

                      {/* Medicinnavn */}
                      <h3 className="mt-3 text-xl font-bold" style={{ color:"var(--text)" }}>
                        {displayName}
                      </h3>

                      {/* CTA */}
                      <div
                        className="mt-auto flex items-center justify-between border-t pt-4"
                        style={{ borderColor:"var(--border)", marginTop:"1rem" }}
                      >
                        <span className="text-sm font-medium" style={{ color:"var(--text-muted)" }}>
                          {chromeText.openDetails}
                        </span>
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-white transition duration-300 group-hover:scale-110"
                          style={{ background:style.color }}
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
          <section className="reveal-on-scroll rounded-2xl border bg-white px-8 py-12 text-center" style={{ borderColor:"var(--border)" }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background:"var(--bg)" }}>
              <SearchIcon />
            </div>
            <h3 className="text-xl font-bold" style={{ color:"var(--text)" }}>{chromeText.noResultsTitle}</h3>
            <p className="mt-2" style={{ color:"var(--text-muted)" }}>{chromeText.noResultsBody}</p>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mx-auto max-w-6xl border-t px-4 pb-14 pt-8 text-center text-sm leading-7" style={{ borderColor:"var(--border)", color:"var(--text-muted)" }}>
        <span>{text.footer1}</span>
        {text.footer2 ? <><br />{text.footer2}</> : null}
        <br /><br />
        <strong style={{ color:"var(--text)" }}>{text.footerStrong}</strong>
        {text.footer3 ? <><br />{text.footer3}</> : null}
      </footer>
    </div>
  );
}

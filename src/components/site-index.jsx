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

const CATEGORY_STYLE = {
  "high blood pressure": { color: "#DC2626", bg: "#FEF2F2" },
  "blood pressure & palpitations": { color: "#E11D48", bg: "#FFF1F2" },
  "blood thinner": { color: "#7C3AED", bg: "#F5F3FF" },
  "blood clot prevention": { color: "#6D28D9", bg: "#EDE9FE" },
  "cholesterol": { color: "#D97706", bg: "#FFFBEB" },
  "diabetes": { color: "#0284C7", bg: "#F0F9FF" },
  "asthma": { color: "#0D9488", bg: "#F0FDFA" },
  "depression & anxiety": { color: "#8B5CF6", bg: "#F5F3FF" },
  "psychosis & bipolar": { color: "#A855F7", bg: "#FAF5FF" },
  "epilepsy & bipolar": { color: "#7C3AED", bg: "#F5F3FF" },
  "sleep": { color: "#4F46E5", bg: "#EEF2FF" },
  "insomnia": { color: "#6366F1", bg: "#EEF2FF" },
  "pain relief": { color: "#059669", bg: "#ECFDF5" },
  "pain and fever": { color: "#F59E0B", bg: "#FFFBEB" },
  "pain and inflammation": { color: "#EF4444", bg: "#FEF2F2" },
  "stomach acid and heartburn": { color: "#10B981", bg: "#ECFDF5" },
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

function LibraryMedicineIcon({ slug, color, size = 18 }) {
  const iconProps = {
    color,
    size,
    strokeWidth: 2,
    absoluteStrokeWidth: true,
  };

  if (slug === "insulin") return <PillBottle {...iconProps} />;
  if (slug === "morfin_injektion") return <Syringe {...iconProps} />;
  if (slug === "symbicort") return <AirVent {...iconProps} />;
  if (slug === "ventoline") return <SprayCan {...iconProps} />;
  if (LIBRARY_CAPSULE_SLUGS.has(slug)) return <Pill {...iconProps} />;
  if (LIBRARY_OVAL_TABLET_SLUGS.has(slug)) return <Tablets {...iconProps} />;
  if (LIBRARY_ROUND_TABLET_SLUGS.has(slug)) return <Pill {...iconProps} />;
  return <Pill {...iconProps} />;
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function SiteIndex({ initialLang }) {
  const { language, updateLanguage } = useLanguageRouting({
    initialLanguage: initialLang,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const text = useMemo(
    () => indexData.translations[language] || indexData.translations.so,
    [language]
  );
  const chromeText = useMemo(() => uiText[language] || uiText.so, [language]);

  useEffect(() => {
    applyLanguageToDocument(language, text.pageTitle);
  }, [language, text.pageTitle]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return indexData.items.filter((item) => {
      const subtitle =
        indexData.subtitles[item.slug]?.[language] ||
        indexData.subtitles[item.slug]?.so ||
        "";
      const matchesCategory =
        activeCategory === "all" || subtitle === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        subtitle.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, language, searchTerm]);

  useScrollReveal([language, activeCategory, searchTerm]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const subtitle =
              indexData.subtitles[item.slug]?.[language] ||
              indexData.subtitles[item.slug]?.so ||
              "";
            const englishCat = indexData.subtitles[item.slug]?.en || "";
            const style = CATEGORY_STYLE[englishCat] || DEFAULT_STYLE;

            return (
              <li key={item.slug}>
                <Link
                  className="group flex h-full overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg"
                  href={{ pathname: `/${item.href}`, query: { lang: language } }}
                >
                  <div className="w-1.5" style={{ background: style.color }} />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: style.color }}
                      >
                        <LibraryMedicineIcon
                          slug={item.slug}
                          color="#fff"
                          size={22}
                        />
                      </span>

                      <span
                        className="rounded-full px-3 py-1 text-base font-semibold"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {subtitle}
                      </span>
                    </div>

                    {/* ✅ HER ER DEN ENESTE ÆNDRING */}
                    <h3 className="mt-4 text-3xl font-bold leading-tight">
                      {item.name}
                    </h3>

                    <div className="mt-auto flex items-center justify-between border-t pt-4">
                      <span className="text-lg font-medium text-gray-500">
                        {chromeText.openDetails}
                      </span>

                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white"
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
      </main>
    </div>
  );
}

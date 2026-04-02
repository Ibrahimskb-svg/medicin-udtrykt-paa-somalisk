import { siteData } from "../data/site-data";

export const languages = ["so", "da", "en", "ar"];
export const rtlLanguages = new Set(["ar"]);
export const arabicAudioLabel = "\u0627\u0633\u062a\u0645\u0639 \u0625\u0644\u0649 \u0627\u0644\u062a\u0633\u062c\u064a\u0644";

export const languageLabels = {
  so: "Somali",
  da: "Dansk",
  en: "English",
  ar: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
};

export const languageThemes = {
  so: {
    accent1: "#0D9488",
    accent2: "#0284C7",
    accent: "#0D9488",
    flash: "#CCFBF1",
    badgeBg: "#CCFBF1",
    badgeText: "#0F766E",
    soft: "#F0FDFA",
    softBorder: "#99F6E4",
    link: "#0284C7",
    drugIconBg: "#F0FDFA",
    drugIconBorder: "#99F6E4",
    langBarAccent: "#0D9488",
    sourceBorderAccent: "#0D9488",
  },
  da: {
    accent1: "#1D4ED8",
    accent2: "#0D9488",
    accent: "#1D4ED8",
    flash: "#DBEAFE",
    badgeBg: "#DBEAFE",
    badgeText: "#1E40AF",
    soft: "#EFF6FF",
    softBorder: "#BFDBFE",
    link: "#1D4ED8",
    drugIconBg: "#EFF6FF",
    drugIconBorder: "#BFDBFE",
    langBarAccent: "#1D4ED8",
    sourceBorderAccent: "#1D4ED8",
  },
  en: {
    accent1: "#0D9488",
    accent2: "#7C3AED",
    accent: "#0D9488",
    flash: "#F0FDFA",
    badgeBg: "#F0FDFA",
    badgeText: "#0F766E",
    soft: "#F0FDFA",
    softBorder: "#99F6E4",
    link: "#7C3AED",
    drugIconBg: "#F5F3FF",
    drugIconBorder: "#C4B5FD",
    langBarAccent: "#0D9488",
    sourceBorderAccent: "#7C3AED",
  },
  ar: {
    accent1: "#B45309",
    accent2: "#DC2626",
    accent: "#B45309",
    flash: "#FEF3C7",
    badgeBg: "#FEF3C7",
    badgeText: "#78350F",
    soft: "#FFFBEB",
    softBorder: "#FDE68A",
    link: "#B45309",
    drugIconBg: "#FFFBEB",
    drugIconBorder: "#FDE68A",
    langBarAccent: "#B45309",
    sourceBorderAccent: "#DC2626",
  },
};

export const uiText = {
  so: {
    navbarTitle: "somalimed",
    heroEyebrow: "Hagitaan fudud oo casri ah",
    heroFormatLabel: "Qaab",
    heroFormatValue: "Qoraal kooban, cod iyo sharaxaad sahlan",
    heroFocusLabel: "Ujeeddo",
    heroFocusValue: "Helitaanka xogta daawada si degdeg ah oo kalsooni leh",
    libraryEyebrow: "Maktabad",
    medicinePill: "Daawo",
    openDetails: "Fur faahfaahinta",
    nowLabel: "Hadda",
    searchLabel: "Raadi",
    searchPlaceholder: "Raadi magaca daawada ama qaybta...",
    categoryLabel: "Qayb",
    allCategories: "Dhammaan",
    clearFilters: "Nadiifi",
    noResultsTitle: "Wax natiijo ah lama helin",
    noResultsBody: "Isku day magac kale ama ka saar filtarrada.",
    medicinesStat: "Daawooyin",
    languagesStat: "Luuqado",
  },
  da: {
    navbarTitle: "somalimed",
    heroEyebrow: "En moderne og enkel guide",
    heroFormatLabel: "Format",
    heroFormatValue: "Korte forklaringer, lyd og let sprog",
    heroFocusLabel: "Fokus",
    heroFocusValue: "Hurtig og tryg adgang til somalimed",
    libraryEyebrow: "Bibliotek",
    medicinePill: "Medicin",
    openDetails: "\u00c5bn detaljer",
    nowLabel: "Nu",
    searchLabel: "S\u00f8g",
    searchPlaceholder: "S\u00f8g efter medicin eller kategori...",
    categoryLabel: "Kategori",
    allCategories: "Alle",
    clearFilters: "Nulstil",
    noResultsTitle: "Ingen resultater",
    noResultsBody: "Pr\u00f8v et andet s\u00f8geord eller fjern filtrene.",
    medicinesStat: "Mediciner",
    languagesStat: "Sprog",
  },
  en: {
    navbarTitle: "somalimed",
    heroEyebrow: "A modern and simple guide",
    heroFormatLabel: "Format",
    heroFormatValue: "Short explanations, audio and plain language",
    heroFocusLabel: "Focus",
    heroFocusValue: "Fast and reliable access to somalimed",
    libraryEyebrow: "Library",
    medicinePill: "Medicine",
    openDetails: "Open details",
    nowLabel: "Now",
    searchLabel: "Search",
    searchPlaceholder: "Search medicine or category...",
    categoryLabel: "Category",
    allCategories: "All",
    clearFilters: "Reset",
    noResultsTitle: "No results found",
    noResultsBody: "Try another keyword or remove the filters.",
    medicinesStat: "Medicines",
    languagesStat: "Languages",
  },
  ar: {
    navbarEyebrow: "\u062f\u0644\u064a\u0644 \u0631\u0642\u0645\u064a",
    navbarTitle: "\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0623\u062f\u0648\u064a\u0629",
    heroEyebrow: "\u062f\u0644\u064a\u0644 \u062d\u062f\u064a\u062b \u0648\u0628\u0633\u064a\u0637",
    heroFormatLabel: "\u0627\u0644\u0623\u0633\u0644\u0648\u0628",
    heroFormatValue: "\u0634\u0631\u062d \u0645\u062e\u062a\u0635\u0631 \u0648\u0635\u0648\u062a \u0648\u0644\u063a\u0629 \u0633\u0647\u0644\u0629",
    heroFocusLabel: "\u0627\u0644\u062a\u0631\u0643\u064a\u0632",
    heroFocusValue: "\u0648\u0635\u0648\u0644 \u0633\u0631\u064a\u0639 \u0648\u0645\u0648\u062b\u0648\u0642 \u0625\u0644\u0649 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062f\u0648\u0627\u0621",
    libraryEyebrow: "\u0627\u0644\u0645\u0643\u062a\u0628\u0629",
    medicinePill: "\u062f\u0648\u0627\u0621",
    openDetails: "\u0627\u0641\u062a\u062d \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644",
    nowLabel: "\u0627\u0644\u0622\u0646",
    searchLabel: "\u0628\u062d\u062b",
    searchPlaceholder: "\u0627\u0628\u062d\u062b \u0639\u0646 \u062f\u0648\u0627\u0621 \u0623\u0648 \u0641\u0626\u0629...",
    categoryLabel: "\u0627\u0644\u0641\u0626\u0629",
    allCategories: "\u0627\u0644\u0643\u0644",
    clearFilters: "\u0625\u0639\u0627\u062f\u0629 \u0636\u0628\u0637",
    noResultsTitle: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c",
    noResultsBody: "\u062c\u0631\u0628 \u0643\u0644\u0645\u0629 \u0623\u062e\u0631\u0649 \u0623\u0648 \u0623\u0632\u0644 \u0627\u0644\u0641\u0644\u0627\u062a\u0631.",
    medicinesStat: "\u0623\u062f\u0648\u064a\u0629",
    languagesStat: "\u0644\u063a\u0627\u062a",
  },
};

export const sectionIcons = {
  use: "Med",
  dose: "Tid",
  side: "Obs",
  interact: "Mix",
  warn: "!",
  ramadan: "Ram",
  food: "Mad",
  store: "Gem",
};

export const sectionStyles = {
  use: "bg-emerald-50/90",
  dose: "bg-sky-50/90",
  side: "bg-amber-50/90",
  interact: "bg-violet-50/90",
  warn: "bg-rose-50/90",
  ramadan: "bg-fuchsia-50/90",
  food: "bg-green-50/90",
  store: "bg-slate-50/90",
};

export const sectionIconStyles = {
  use: "bg-emerald-100 text-emerald-700",
  dose: "bg-sky-100 text-sky-700",
  side: "bg-amber-100 text-amber-700",
  interact: "bg-violet-100 text-violet-700",
  warn: "bg-rose-100 text-rose-700",
  ramadan: "bg-fuchsia-100 text-fuchsia-700",
  food: "bg-green-100 text-green-700",
  store: "bg-slate-200 text-slate-700",
};

export function getIndexData() {
  return siteData.index;
}

export function getMedicine(slug) {
  return siteData.medicines.find((item) => item.slug === slug) ?? null;
}

export function getMedicineSlugs() {
  return siteData.medicines.map((item) => item.slug);
}

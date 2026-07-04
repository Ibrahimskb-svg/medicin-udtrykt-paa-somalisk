import { siteData } from "../data/site-data";

export const languages = ["so", "da", "en", "ar"];
export const rtlLanguages = new Set(["ar"]);
export const arabicAudioLabel = "استمع إلى التسجيل";

export const languageLabels = {
  so: "Somalisk",
  da: "Dansk",
  en: "Engelsk",
  ar: "Arabisk",
};

export const languageThemes = {
  so: {
    accent1: "#00a676",
    accent2: "#0b6b57",
    accent: "#00a676",
    flash: "#d1fae5",
    badgeBg: "#d1fae5",
    badgeText: "#0b6b57",
    soft: "#ecfdf5",
    softBorder: "#6ee7b7",
    link: "#00a676",
    drugIconBg: "#ecfdf5",
    drugIconBorder: "#6ee7b7",
    langBarAccent: "#00a676",
    sourceBorderAccent: "#0b6b57",
    heroBg: "linear-gradient(135deg, #0A7A73 0%, #0D9488 50%, #0E7FC0 100%)",
  },
  da: {
    accent1: "#0ea5e9",
    accent2: "#60a5fa",
    accent: "#0ea5e9",
    flash: "#e0f2fe",
    badgeBg: "#e0f2fe",
    badgeText: "#0369a1",
    soft: "#f0f9ff",
    softBorder: "#bae6fd",
    link: "#0ea5e9",
    drugIconBg: "#f0f9ff",
    drugIconBorder: "#bae6fd",
    langBarAccent: "#0ea5e9",
    sourceBorderAccent: "#60a5fa",
    heroBg: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #60a5fa 100%)",
  },
  en: {
    accent1: "#7f1d1d",
    accent2: "#b91c1c",
    accent: "#7f1d1d",
    flash: "#fee2e2",
    badgeBg: "#fee2e2",
    badgeText: "#7f1d1d",
    soft: "#fef2f2",
    softBorder: "#fecaca",
    link: "#b91c1c",
    drugIconBg: "#fef2f2",
    drugIconBorder: "#fecaca",
    langBarAccent: "#7f1d1d",
    sourceBorderAccent: "#b91c1c",
    heroBg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #b91c1c 100%)",
  },
  ar: {
    accent1: "#c2410c",
    accent2: "#fb923c",
    accent: "#c2410c",
    flash: "#ffedd5",
    badgeBg: "#ffedd5",
    badgeText: "#9a3412",
    soft: "#fff7ed",
    softBorder: "#fed7aa",
    link: "#c2410c",
    drugIconBg: "#fff7ed",
    drugIconBorder: "#fed7aa",
    langBarAccent: "#c2410c",
    sourceBorderAccent: "#fb923c",
    heroBg: "linear-gradient(135deg, #431407 0%, #c2410c 50%, #fb923c 100%)",
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
    openDetails: "Åbn detaljer",
    nowLabel: "Nu",
    searchLabel: "Søg",
    searchPlaceholder: "Søg efter medicin eller kategori...",
    categoryLabel: "Kategori",
    allCategories: "Alle",
    clearFilters: "Nulstil",
    noResultsTitle: "Ingen resultater",
    noResultsBody: "Prøv et andet søgeord eller fjern filtrene.",
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
    navbarEyebrow: "دليل رقمي",
    navbarTitle: "somalimed",
    heroEyebrow: "دليل حديث وبسيط",
    heroFormatLabel: "الأسلوب",
    heroFormatValue: "شرح مختصر وصوت ولغة سهلة",
    heroFocusLabel: "التركيز",
    heroFocusValue: "وصول سريع وموثوق إلى معلومات الدواء",
    libraryEyebrow: "المكتبة",
    medicinePill: "دواء",
    openDetails: "افتح التفاصيل",
    nowLabel: "الان",
    searchLabel: "بحث",
    searchPlaceholder: "ابحث عن دواء أو فئة...",
    categoryLabel: "الفئة",
    allCategories: "الكل",
    clearFilters: "إعادة ضبط",
    noResultsTitle: "لا توجد نتائج",
    noResultsBody: "جرب كلمة أخرى أو أزل الفلاتر.",
    medicinesStat: "أدوية",
    languagesStat: "لغات",
  },
};

export const sectionIcons = {
  use: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
    <path d="m8.5 8.5 7 7"/>
  </svg>`,
  dose: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>`,
  side: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>`,
  interact: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m17 2 4 4-4 4"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <path d="m7 22-4-4 4-4"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>`,
  warn: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>`,
  ramadan: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>`,
  food: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>`,
  store: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>`,
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

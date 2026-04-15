import { languageThemes, languages, rtlLanguages } from "./site";

const LANGUAGE_STORAGE_KEY = "selectedLanguage";
const LANGUAGE_EVENT_NAME = "app-language-change";

export function isValidLanguage(lang) {
  return languages.includes(lang);
}

export function getLanguageFromSearchParams(searchParams) {
  return isValidLanguage(searchParams?.lang) ? searchParams.lang : "so";
}

export function getStoredLanguage() {
  if (typeof window === "undefined") return null;
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isValidLanguage(storedLanguage) ? storedLanguage : null;
}

export function resolveInitialLanguage(initialLanguage, urlLanguage) {
  if (isValidLanguage(urlLanguage)) return urlLanguage;
  if (isValidLanguage(initialLanguage)) return initialLanguage;
  return getStoredLanguage() || "so";
}

export function applyLanguageToDocument(lang, pageTitle) {
  const safeLanguage = isValidLanguage(lang) ? lang : "so";
  const theme = languageThemes[safeLanguage] || languageThemes.so;

  document.documentElement.lang = safeLanguage;
  document.documentElement.dir = rtlLanguages.has(safeLanguage) ? "rtl" : "ltr";
  document.title = pageTitle;

  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
}

export function notifyLanguageChange(lang) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT_NAME, { detail: { language: lang } }));
}

export function subscribeToLanguageChange(handler) {
  if (typeof window === "undefined") return () => {};

  const listener = (event) => {
    handler(event.detail?.language || getStoredLanguage() || "so");
  };

  window.addEventListener(LANGUAGE_EVENT_NAME, listener);
  window.addEventListener("popstate", listener);

  return () => {
    window.removeEventListener(LANGUAGE_EVENT_NAME, listener);
    window.removeEventListener("popstate", listener);
  };
}

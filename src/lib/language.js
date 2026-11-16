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
  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isValidLanguage(storedLanguage) ? storedLanguage : null;
  } catch (e) {
    // localStorage kan kaste (Safari "Bloker alle cookies", nogle
    // administrerede browsere, fuld storage-kvote) — denne funktion kaldes
    // fra useLanguageRouting's useEffect, som kører på HVER side, så en
    // ufanget fejl her ville gøre hele siden hvid for den besøgende.
    return null;
  }
}

export function resolveInitialLanguage(initialLanguage, urlLanguage) {
  // Et eksplicit ?lang= i adressen vinder altid. Ellers skal et gemt
  // sprogvalg vinde over `initialLanguage` — den er bare serverens eget
  // gæt (typisk "so" som fast standard), når der IKKE var noget ?lang= i
  // adressen, og må derfor ikke overtrumfe et bogmærket/delt/direkte
  // indtastet link uden ?lang=, som ellers nulstillede sproget hver gang.
  if (isValidLanguage(urlLanguage)) return urlLanguage;
  const stored = getStoredLanguage();
  if (stored) return stored;
  if (isValidLanguage(initialLanguage)) return initialLanguage;
  return "so";
}

export function applyLanguageToDocument(lang, pageTitle) {
  const safeLanguage = isValidLanguage(lang) ? lang : "so";
  const theme = languageThemes[safeLanguage] || languageThemes.so;

  document.documentElement.lang = safeLanguage;
  document.documentElement.dir = rtlLanguages.has(safeLanguage) ? "rtl" : "ltr";
  if (pageTitle) document.title = pageTitle;

  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
  } catch (e) {}
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

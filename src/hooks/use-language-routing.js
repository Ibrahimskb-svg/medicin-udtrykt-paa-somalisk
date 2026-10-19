"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { applyLanguageToDocument, notifyLanguageChange, resolveInitialLanguage } from "../lib/language";

export function useLanguageRouting({ initialLanguage }) {
  const router = useRouter();
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resolvedLanguage = resolveInitialLanguage(initialLanguage, params.get("lang"));
    setLanguage(resolvedLanguage);
    // Sætter altid lang/dir på <html> — sider der selv kalder
    // applyLanguageToDocument (med en sidetitel) gør det igen lige efter,
    // hvilket er harmløst, men sider der IKKE gjorde det (ordliste,
    // cookiepolitik, persondatapolitik) fik ellers aldrig rettet
    // skærmlæser-sproget/retningen ved sprogskift.
    applyLanguageToDocument(resolvedLanguage);
    notifyLanguageChange(resolvedLanguage);
  }, [initialLanguage]);

  function updateLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", nextLanguage);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    applyLanguageToDocument(nextLanguage);
    notifyLanguageChange(nextLanguage);
  }

  return {
    language,
    updateLanguage,
  };
}

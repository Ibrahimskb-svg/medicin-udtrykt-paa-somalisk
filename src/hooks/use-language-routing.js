"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { notifyLanguageChange, resolveInitialLanguage } from "../lib/language";

export function useLanguageRouting({ initialLanguage }) {
  const router = useRouter();
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resolvedLanguage = resolveInitialLanguage(initialLanguage, params.get("lang"));
    setLanguage(resolvedLanguage);
  }, [initialLanguage]);

  function updateLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", nextLanguage);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    notifyLanguageChange(nextLanguage);
  }

  return {
    language,
    updateLanguage,
  };
}

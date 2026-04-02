"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getStoredLanguage, subscribeToLanguageChange } from "../lib/language";
import { uiText } from "../lib/site";

export function AppNavbar() {
  const [language, setLanguage] = useState("so");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLanguage(params.get("lang") || getStoredLanguage() || "so");
    return subscribeToLanguageChange(setLanguage);
  }, []);

  const text = uiText[language] || uiText.so;

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-white/90 backdrop-blur-md" style={{ borderBottom: "1px solid rgba(13,148,136,0.13)" }}>
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
          <Link
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            href={{ pathname: "/", query: { lang: language } }}
          >
            {/* somalimed-icon.svg */}
            <Image
              src="/somalimed-icon.svg"
              alt="somalimed logo"
              width={36}
              height={36}
              className="rounded-xl"
              priority
            />
            {/* Wordmark */}
            <span
              className="text-[25px] font-extrabold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #0A7A73 0%, #0D9488 50%, #0E7FC0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {text.navbarTitle}
            </span>
          </Link>
        </div>
      </nav>

      {/* Gradient accent line */}
      <div style={{ height: "2px", background: "linear-gradient(to right, #0D9488, #0284C7, #7C3AED)" }} />
    </header>
  );
}

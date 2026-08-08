"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { resolveInitialLanguage, subscribeToLanguageChange } from "../lib/language";
import { LANG_THEME } from "./modal-shell";

// Forstørrer/formindsker HELE siden (ikke kun tekst) via CSS "zoom" — samme
// effekt som browserens egen indbyggede zoom, så layout, billeder og
// afstande skalerer proportionalt i stedet for kun skriftstørrelsen.
// Uafhængig af navbar/faner, virker ens på alle sider, og husker valget i
// browseren. Trin på 10 procentpoint, fra 50% til 500%.
const MIN_ZOOM = 50;
const MAX_ZOOM = 500;
const STEP = 10;
const DEFAULT_ZOOM = 100;
const STORAGE_KEY = "somalimed-zoom-level";

// theme.primary (so/ar) er for lys til at bruges som selve tekstfarven eller
// som baggrund under hvid tekst — kun 3.74:1 / 3.19:1 mod hvid, under WCAG AA's
// krav på 4.5:1 for normal tekststørrelse. Disse mørkere nuancer bruges kun her,
// hvor farven bærer tekst — kanter/skygger andre steder i komponenten beholder
// den lysere theme.primary, som er fin til dekorative formål.
const TEXT_SAFE_PRIMARY = { so: "#0F766E", da: "#2563EB", en: "#92400E", ar: "#B45309" };

const LABELS = {
  // "caption" er en altid-synlig tekst (ikke kun tooltip/aria-label) — en
  // tooltip virker slet ikke på mobil/touch, og en ældre eller
  // ikke-tech-vant bruger skal kunne se med det samme hvad knappen gør,
  // uden at skulle gætte ud fra kun "−"/"+"-symboler.
  da: { caption: "Forstør / formindsk siden", zoomOut: "Formindsk siden", zoomIn: "Forstør siden", reset: "Nulstil til 100%" },
  en: { caption: "Enlarge / shrink page", zoomOut: "Shrink page", zoomIn: "Enlarge page", reset: "Reset to 100%" },
  so: { caption: "Weynee / Yaree bogga", zoomOut: "Yaree bogga", zoomIn: "Weynee bogga", reset: "Dib ugu celi 100%" },
  ar: { caption: "تكبير / تصغير الصفحة", zoomOut: "تصغير الصفحة", zoomIn: "تكبير الصفحة", reset: "إعادة الضبط إلى 100%" },
};

function clamp(v) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));
}

export default function TextZoomControl() {
  const pathname = usePathname();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [language, setLanguage] = useState("so");

  useEffect(() => {
    // Samme kilde til sandhed som resten af sitet (useLanguageRouting): URL'ens
    // "?lang="-parameter vinder, med gemt sprog/"so" som fallback — ikke kun
    // det gemte sprog alene, ellers matcher knappen ikke den sprogversion man
    // rent faktisk kigger på.
    const params = new URLSearchParams(window.location.search);
    setLanguage(resolveInitialLanguage(null, params.get("lang")));
    const unsubscribe = subscribeToLanguageChange(setLanguage);
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    if (stored >= MIN_ZOOM && stored <= MAX_ZOOM) setZoom(stored);
    return unsubscribe;
  }, []);

  // Zoom-effekten holdes i sync med React-state via useEffect i stedet for at
  // sætte den direkte inde i klik-handlerne — det sikrer at DOM'en og den
  // viste procent aldrig kan komme ud af trit, uanset hvor hurtigt der klikkes.
  useEffect(() => {
    document.documentElement.style.zoom = `${zoom}%`;
    window.localStorage.setItem(STORAGE_KEY, String(zoom));
  }, [zoom]);

  function zoomOut() {
    // Funktionel opdatering (prev => ...) i stedet for at læse zoom fra
    // closure — ellers ville hurtige gentagne klik (før React når at
    // re-rendere) alle regne ud fra det samme, forældede niveau.
    setZoom((prev) => clamp(prev - STEP));
  }
  function zoomIn() {
    setZoom((prev) => clamp(prev + STEP));
  }
  function reset() {
    setZoom(DEFAULT_ZOOM);
  }

  const t = LABELS[language] ?? LABELS.so;
  const isRtl = language === "ar";
  const active = zoom !== DEFAULT_ZOOM;
  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const textSafe = TEXT_SAFE_PRIMARY[language] ?? TEXT_SAFE_PRIMARY.so;

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "76px",
        [isRtl ? "left" : "right"]: "12px",
        zIndex: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "8px 10px 6px",
        borderRadius: "16px",
        background: "#ffffff",
        border: `1.5px solid ${active ? theme.primary : theme.border}`,
        boxShadow: active ? `0 4px 14px ${theme.primary}33` : "0 2px 10px rgba(15,23,42,0.10)",
        direction: "ltr",
      }}
    >
      <span
        className="sm-zoom-caption"
        style={{
          fontSize: "10.5px",
          fontWeight: 700,
          color: textSafe,
          whiteSpace: "nowrap",
          direction: isRtl ? "rtl" : "ltr",
        }}
      >
        {t.caption}
      </span>
      <style>{`
        @media (max-width: 480px) {
          .sm-zoom-caption { display: none; }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          aria-label={t.zoomOut}
          title={t.zoomOut}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "26px", height: "26px", borderRadius: "50%", border: "none",
            background: "transparent", color: zoom <= MIN_ZOOM ? "#cbd5e1" : textSafe,
            fontSize: "16px", fontWeight: 700, cursor: zoom <= MIN_ZOOM ? "default" : "pointer",
          }}
        >
          −
        </button>

        <button
          type="button"
          onClick={reset}
          aria-label={`${t.caption} — ${t.reset}`}
          title={t.reset}
          style={{
            minWidth: "44px",
            padding: "6px 4px",
            borderRadius: "999px",
            border: "none",
            background: active ? textSafe : "transparent",
            color: active ? "#ffffff" : "#64748b",
            fontWeight: 700,
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          {zoom}%
        </button>

        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          aria-label={t.zoomIn}
          title={t.zoomIn}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "26px", height: "26px", borderRadius: "50%", border: "none",
            background: "transparent", color: zoom >= MAX_ZOOM ? "#cbd5e1" : textSafe,
            fontSize: "16px", fontWeight: 700, cursor: zoom >= MAX_ZOOM ? "default" : "pointer",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

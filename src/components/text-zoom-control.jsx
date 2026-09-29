"use client";
import { useEffect, useRef, useState } from "react";
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
  da: { caption: "Forstør / formindsk siden", zoomOut: "Formindsk siden", zoomIn: "Forstør siden", reset: "Nulstil til 100%", toggle: "Åbn/luk sidezoom" },
  en: { caption: "Enlarge / shrink page", zoomOut: "Shrink page", zoomIn: "Enlarge page", reset: "Reset to 100%", toggle: "Open/close page zoom" },
  so: { caption: "Weynee / Yaree bogga", zoomOut: "Yaree bogga", zoomIn: "Weynee bogga", reset: "Dib ugu celi 100%", toggle: "Fur/xir weynaynta bogga" },
  ar: { caption: "تكبير / تصغير الصفحة", zoomOut: "تصغير الصفحة", zoomIn: "تكبير الصفحة", reset: "إعادة الضبط إلى 100%", toggle: "فتح/إغلاق تكبير الصفحة" },
};

function clamp(v) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));
}

function ZoomIcon({ size = 17, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20" y1="20" x2="15.8" y2="15.8" />
      <line x1="7.5" y1="10.5" x2="13.5" y2="10.5" />
      <line x1="10.5" y1="7.5" x2="10.5" y2="13.5" />
    </svg>
  );
}

export default function TextZoomControl() {
  const pathname = usePathname();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [language, setLanguage] = useState("so");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

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

  // Panelet er skjult som standard og åbnes kun på klik — det er derfor den
  // lille rund knap ikke længere kolliderer visuelt med forsidens hero (som
  // før, hvor hele den brede pille med synlig tekst altid lå oven på heroets
  // afrundede hjørne). Luk igen ved klik udenfor eller Escape, som andre
  // dropdowns på sitet (fx navbarens Kontakt-menu).
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

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
  const sideProp = isRtl ? "left" : "right";

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        top: "84px",
        [sideProp]: "14px",
        zIndex: 400,
        direction: "ltr",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={active ? `${t.toggle} — ${zoom}%` : t.toggle}
        title={t.caption}
        className="hover-lift"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: `1.5px solid ${active ? theme.primary : "rgba(15,23,42,0.10)"}`,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: textSafe,
          cursor: "pointer",
          boxShadow: active ? `0 4px 14px ${theme.primary}40` : "0 2px 10px rgba(15,23,42,0.16)",
        }}
      >
        <ZoomIcon size={17} color={textSafe} />
        {active && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-2px",
              [sideProp]: "-2px",
              width: "11px",
              height: "11px",
              borderRadius: "50%",
              background: textSafe,
              border: "2px solid #fff",
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            [sideProp]: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "10px 12px 8px",
            borderRadius: "16px",
            background: "#ffffff",
            border: `1.5px solid ${active ? theme.primary : theme.border}`,
            boxShadow: "0 12px 30px rgba(15,23,42,0.20)",
          }}
        >
          <span
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

          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              aria-label={t.zoomOut}
              title={t.zoomOut}
              className="hover-lift"
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
              className="hover-lift"
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
              className="hover-lift"
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
      )}
    </div>
  );
}

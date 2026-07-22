"use client";
import { useMemo, useState } from "react";
import { PHARMACIES } from "../data/pharmacies";
import { ModalShell, LANG_THEME } from "./modal-shell";

const TEXTS = {
  da: {
    title: "Find apotek",
    intro: "Apoteker hvor personalet taler dit sprog — så du kan tale direkte med dem om din medicin, uden tolk.",
    searchPlaceholder: "Søg by eller postnummer…",
    filterAll: "Alle sprog",
    empty: "Ingen apoteker fundet endnu. Listen udvides løbende.",
    call: "Ring",
    askFor: "Spørg efter",
    langLabels: { so: "Somali", ar: "Arabisk", da: "Dansk", en: "Engelsk" },
  },
  en: {
    title: "Find a pharmacy",
    intro: "Pharmacies where staff speak your language — so you can talk directly to them about your medicine, without an interpreter.",
    searchPlaceholder: "Search city or postal code…",
    filterAll: "All languages",
    empty: "No pharmacies added yet. The list is growing.",
    call: "Call",
    askFor: "Ask for",
    langLabels: { so: "Somali", ar: "Arabic", da: "Danish", en: "English" },
  },
  so: {
    title: "Raadi farmashi",
    intro: "Farmashiyada shaqaalaha ku hadla afkaaga — si aad ugu hadasho tooska ah daawadaada, adigoon turjubaan u baahnayn.",
    searchPlaceholder: "Raadi magaalada ama koodhka boostada…",
    filterAll: "Dhammaan luqadaha",
    empty: "Wali lama darin farmashi. Liiska si joogto ah ayaa loo balaadhinayaa.",
    call: "Wac",
    askFor: "Weydii",
    langLabels: { so: "Soomaali", ar: "Carabi", da: "Deenish", en: "Ingiriisi" },
  },
  ar: {
    title: "ابحث عن صيدلية",
    intro: "صيدليات يتحدث موظفوها لغتك — لتتمكن من التحدث معهم مباشرة عن دوائك، دون الحاجة لمترجم.",
    searchPlaceholder: "ابحث بالمدينة أو الرمز البريدي…",
    filterAll: "كل اللغات",
    empty: "لم تتم إضافة أي صيدليات بعد. القائمة تتوسع باستمرار.",
    call: "اتصال",
    askFor: "اسأل عن",
    langLabels: { so: "الصومالية", ar: "العربية", da: "الدنماركية", en: "الإنجليزية" },
  },
};

function PinIcon({ size = 22, color = "rgba(255,255,255,0.95)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function PharmacyFinderModal({ language, onClose }) {
  const isRtl = language === "ar";
  const theme = LANG_THEME[language] ?? LANG_THEME.so;
  const t = TEXTS[language] ?? TEXTS.so;
  const [query, setQuery] = useState("");
  const [langFilter, setLangFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PHARMACIES.filter((p) => {
      const matchesQuery = !q || p.city.toLowerCase().includes(q) || p.postalCode.includes(q) || p.name.toLowerCase().includes(q);
      const matchesLang = langFilter === "all" || p.languages.includes(langFilter);
      return matchesQuery && matchesLang;
    });
  }, [query, langFilter]);

  const iconEl = <PinIcon size={22} />;

  return (
    <ModalShell title={t.title} iconEl={iconEl} onClose={onClose} isRtl={isRtl}>
      <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, margin: "0 0 22px", textAlign: isRtl ? "right" : "left" }}>
        {t.intro}
      </p>

      <div
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          borderRadius: "14px", border: "1.5px solid #e2e8f0", background: "#fff",
          padding: "11px 14px", marginBottom: "12px",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", background: "transparent", color: "#0f172a" }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
        {["all", "so", "ar"].map((code) => {
          const active = langFilter === code;
          const label = code === "all" ? t.filterAll : t.langLabels[code];
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLangFilter(code)}
              style={{
                padding: "7px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700,
                border: active ? `1.5px solid ${theme.primary}` : "1.5px solid #e2e8f0",
                background: active ? theme.primary : "#fff",
                color: active ? "#fff" : "#475569",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 8px", textAlign: isRtl ? "right" : "left" }}>{t.empty}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((p, i) => (
            <li
              key={i}
              style={{
                borderRadius: "14px", border: `1.5px solid ${theme.border}`, background: theme.soft,
                padding: "14px 16px", textAlign: isRtl ? "right" : "left",
              }}
            >
              <p style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", margin: "0 0 2px" }}>{p.name}</p>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px" }}>{p.city}{p.postalCode ? ` — ${p.postalCode}` : ""}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                {p.languages.map((l) => (
                  <span
                    key={l}
                    style={{
                      fontSize: "11.5px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px",
                      background: theme.primary, color: "#fff",
                    }}
                  >
                    {t.langLabels[l] || l}
                  </span>
                ))}
              </div>
              {p.phone && (
                <a
                  href={`tel:${p.phone.replace(/\s/g, "")}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
                    background: "#fff", border: `1.5px solid ${theme.primary}`, color: theme.primary,
                    textDecoration: "none",
                  }}
                >
                  <PhoneIcon size={14} color={theme.primary} /> {t.call}: {p.phone}
                </a>
              )}
              {p.contactFirstNames?.length > 0 && (
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "8px 0 0" }}>
                  {t.askFor}: {p.contactFirstNames.join(isRtl ? "، " : ", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </ModalShell>
  );
}

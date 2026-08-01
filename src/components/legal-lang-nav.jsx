"use client";
import { LANG_THEME } from "./modal-shell";

const LANG_NAMES = { da: "Dansk", en: "English", so: "Soomaali", ar: "العربية" };
const LANG_ORDER = ["da", "en", "so", "ar"];

// Rigtig sprogskifter til de juridiske sider (cookie- og persondatapolitik) —
// IKKE bare anker-links der hopper ned til et blandet dokument. Trykker man
// på et sprog, vises kun det sprogs tekst, ligesom resten af sitet.
export function LegalLangNav({ language, onChange }) {
  return (
    <nav
      aria-label="Vælg sprog / Choose language"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        margin: "0 0 32px",
        padding: "12px 14px",
        borderRadius: "14px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      {LANG_ORDER.map((l) => {
        const theme = LANG_THEME[l] ?? LANG_THEME.so;
        const active = l === language;
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            aria-pressed={active}
            style={{
              padding: "5px 13px",
              borderRadius: "999px",
              fontSize: "12.5px",
              fontWeight: 700,
              color: active ? "#ffffff" : theme.primary,
              background: active ? theme.primary : theme.soft,
              border: `1.5px solid ${theme.primary}`,
              cursor: "pointer",
            }}
          >
            {LANG_NAMES[l]}
          </button>
        );
      })}
    </nav>
  );
}

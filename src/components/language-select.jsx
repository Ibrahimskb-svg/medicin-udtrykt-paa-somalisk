import { languageFlags, languageLabels, languages } from "../lib/site";

export function LanguageSelect({ label, value, onChange }) {
  return (
    <div className="no-print mb-5 sm:mb-6">
      <p
        className="mb-2 sm:mb-3 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <div className="flex gap-1.5">
        {languages.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            className="rounded-2xl text-xs font-semibold transition duration-200 flex-1 flex flex-col items-center justify-center gap-0.5"
            style={
              code === value
                ? {
                    padding: "8px 4px",
                    minHeight: "58px",
                    background: "var(--accent1)",
                    color: "#ffffff",
                    border: "2px solid var(--accent1)",
                  }
                : {
                    padding: "8px 4px",
                    minHeight: "58px",
                    background: "var(--surface)",
                    color: "var(--text)",
                    border: "2px solid var(--border)",
                  }
            }
          >
            <span style={{ fontSize: "22px", lineHeight: 1 }} aria-hidden="true">{languageFlags[code]}</span>
            <span>{languageLabels[code]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

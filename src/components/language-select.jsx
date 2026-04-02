import { languageLabels, languages } from "../lib/site";

export function LanguageSelect({ label, value, onChange }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {languages.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            className="rounded-full px-4 py-2 text-sm font-semibold transition duration-200"
            style={
              code === value
                ? {
                    background: "var(--accent1)",
                    color: "#ffffff",
                    border: "2px solid var(--accent1)",
                  }
                : {
                    background: "var(--surface)",
                    color: "var(--text)",
                    border: "2px solid var(--border)",
                  }
            }
          >
            {languageLabels[code]}
          </button>
        ))}
      </div>
    </div>
  );
}
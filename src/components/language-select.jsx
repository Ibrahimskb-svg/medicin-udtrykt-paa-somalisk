import { languageLabels, languages } from "../lib/site";
export function LanguageSelect({ label, value, onChange }) {
  return (
    <div className="mb-5 sm:mb-6">
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
            className="rounded-full text-xs font-semibold transition duration-200 flex-1"
            style={
              code === value
                ? {
                    padding: "10px 4px",
                    minHeight: "44px",
                    background: "var(--accent1)",
                    color: "#ffffff",
                    border: "2px solid var(--accent1)",
                  }
                : {
                    padding: "10px 4px",
                    minHeight: "44px",
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

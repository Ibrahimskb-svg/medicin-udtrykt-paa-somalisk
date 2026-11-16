"use client";

// Udtrukket fra severity-check-modal.jsx, fordi LevelBadge bruges ALTID
// synligt (på selve siden, ikke kun inde i modalen) på både forsiden og
// medicin-siderne — men severity-check-modal.jsx importerer data-tunge
// funktioner fra ../lib/site (getIndexData, getMedicine), som derfor
// ellers blev trukket med ind i hver eneste sides startpakke, bare for at
// vise denne lille farve-badge. Nu er badge'en sin egen, data-fri fil.
const LEVEL_COLORS = {
  green: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", ring: "#16a34a" },
  orange: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", ring: "#ea580c" },
  red: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", ring: "#dc2626" },
};

// Tre visuelt forskellige ikon-former (ikke bare tre farver på samme form) —
// så niveauet kan genkendes selv uden farve: hak (grøn), trekant (orange),
// cirkel (rød) — samme streg-ikon-stil (stroke, rundede hjørner) som resten
// af sitets ikoner (PinIcon, MailIcon m.fl.), i stedet for et fladt tegn.
function LevelIconShape({ level, size }) {
  const inner = size * 0.56;
  if (level === "green") {
    return (
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (level === "orange") {
    return (
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5 22 20H2Z" />
        <line x1="12" y1="10" x2="12" y2="14.5" />
        <circle cx="12" cy="17.3" r="0.15" fill="#fff" stroke="#fff" strokeWidth="2.6" />
      </svg>
    );
  }
  return (
    <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <line x1="12" y1="7.5" x2="12" y2="13" />
      <circle cx="12" cy="16.3" r="0.15" fill="#fff" stroke="#fff" strokeWidth="2.6" />
    </svg>
  );
}

export function LevelBadge({ level, size = 34 }) {
  const c = LEVEL_COLORS[level];
  return (
    <span
      aria-hidden="true"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: c.ring, boxShadow: `0 2px 8px ${c.ring}66`,
      }}
    >
      <LevelIconShape level={level} size={size} />
    </span>
  );
}

export { LEVEL_COLORS };

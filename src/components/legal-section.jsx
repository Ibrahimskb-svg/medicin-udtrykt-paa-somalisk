"use client";

// Samme farvepalette som sitets medicin-kategorier (SLUG_STYLE i site-index.jsx)
// — genbruges her så de juridiske sider føles som en del af det samme site,
// i stedet for et løsrevet, gråt dokument. Roterer pr. sektion, ikke pr. sprog.
export const SECTION_COLORS = ["#DC2626", "#7C3AED", "#D97706", "#0284C7", "#0D9488", "#8B5CF6"];

export function Section({ title, color, index, children }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span
          aria-hidden="true"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "26px", height: "26px", borderRadius: "50%",
            background: color, color: "#fff", fontSize: "12.5px", fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {index}
        </span>
        <h3 style={{ fontSize: "17px", fontWeight: 800, color, margin: 0 }}>{title}</h3>
      </div>
      <div style={{ fontSize: "14px", color: "#334155", paddingInlineStart: "36px" }}>{children}</div>
    </div>
  );
}

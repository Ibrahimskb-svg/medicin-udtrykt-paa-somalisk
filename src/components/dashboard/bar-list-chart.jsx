"use client";

export const COUNTRY_NAMES_DA = {
  Denmark: "Danmark",
  Somalia: "Somalia",
  Sweden: "Sverige",
  Norway: "Norge",
  Germany: "Tyskland",
  "United Kingdom": "Storbritannien",
  "United States": "USA",
  "United Arab Emirates": "De Forenede Arabiske Emirater",
  "Saudi Arabia": "Saudi-Arabien",
  Netherlands: "Holland",
  Finland: "Finland",
  Kenya: "Kenya",
  Ethiopia: "Etiopien",
  Canada: "Canada",
};

export function BarListChart({ items, color = "#0D9488", translateNames = false }) {
  if (!items || items.length === 0) {
    return <p style={{ color: "#5A6A7A", fontSize: "13px" }}>Ingen data endnu.</p>;
  }

  const maxVal = Math.max(1, ...items.map((d) => d.users));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.map((item, i) => {
        const pct = (item.users / maxVal) * 100;
        const label = translateNames ? COUNTRY_NAMES_DA[item.name] || item.name : item.name;
        return (
          <div key={i}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12.5px",
                color: "#0F1923",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontWeight: 600 }}>{label}</span>
              <span style={{ color: "#5A6A7A", fontVariantNumeric: "tabular-nums" }}>{item.users}</span>
            </div>
            <div style={{ background: "#F0F4F8", borderRadius: "999px", height: "10px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.max(pct, 3)}%`,
                  height: "100%",
                  background: color,
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

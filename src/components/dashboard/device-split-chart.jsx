"use client";
import { useState } from "react";

const DEVICE_LABELS = {
  desktop: "Computer",
  mobile: "Mobil",
  tablet: "Tablet",
};

// First three slots of the validated categorical palette (colorblind-safe, all-pairs).
const DEVICE_COLORS = {
  desktop: "#2a78d6",
  mobile: "#eb6834",
  tablet: "#1baf7a",
};
const FALLBACK_COLOR = "#898781";

export function DeviceSplitChart({ items }) {
  const [hoverKey, setHoverKey] = useState(null);

  if (!items || items.length === 0) {
    return <p style={{ color: "#5A6A7A", fontSize: "13px" }}>Ingen data endnu.</p>;
  }

  const total = items.reduce((sum, d) => sum + d.users, 0) || 1;

  return (
    <div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "22px",
          borderRadius: "999px",
          overflow: "hidden",
          background: "#F0F4F8",
        }}
      >
        {items.map((item, i) => {
          const pct = (item.users / total) * 100;
          const color = DEVICE_COLORS[item.name] || FALLBACK_COLOR;
          return (
            <div
              key={item.name}
              onMouseEnter={() => setHoverKey(item.name)}
              onMouseLeave={() => setHoverKey(null)}
              style={{
                width: `${pct}%`,
                background: color,
                marginLeft: i === 0 ? 0 : "2px",
                opacity: hoverKey && hoverKey !== item.name ? 0.55 : 1,
                transition: "opacity 0.12s ease",
              }}
              title={`${DEVICE_LABELS[item.name] || item.name}: ${pct.toFixed(0)}%`}
            />
          );
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "14px" }}>
        {items.map((item) => {
          const pct = (item.users / total) * 100;
          const color = DEVICE_COLORS[item.name] || FALLBACK_COLOR;
          return (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "12.5px", color: "#0F1923", fontWeight: 600 }}>
                {DEVICE_LABELS[item.name] || item.name}
              </span>
              <span style={{ fontSize: "12.5px", color: "#5A6A7A" }}>{pct.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

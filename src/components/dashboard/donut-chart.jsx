"use client";
import { useState } from "react";

// First slots of the validated categorical palette (colorblind-safe, all-pairs for the first 3;
// slots 4-6 kept for channel-mix which is identity, not a value scale).
const PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"];

const SIZE = 160;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

export function DonutChart({ items, labelMap = {}, unit }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!items || items.length === 0) {
    return <p style={{ color: "#5A6A7A", fontSize: "13px" }}>Ingen data endnu.</p>;
  }

  const total = items.reduce((sum, d) => sum + (d.value ?? 0), 0) || 1;
  let cumulative = 0;
  const segments = items.map((item, i) => {
    const pct = (item.value ?? 0) / total;
    const dash = pct * CIRC;
    const offset = cumulative * CIRC;
    cumulative += pct;
    return { ...item, pct, dash, offset, color: PALETTE[i % PALETTE.length] };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ flexShrink: 0 }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#F0F4F8" strokeWidth={STROKE} />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={seg.color}
            strokeWidth={STROKE}
            strokeDasharray={`${Math.max(seg.dash - 2, 0)} ${CIRC - seg.dash + 2}`}
            strokeDashoffset={-seg.offset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.35}
            style={{ transition: "opacity 0.12s ease" }}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}
        <text
          x={SIZE / 2}
          y={unit && hoverIdx === null ? SIZE / 2 : SIZE / 2 + 5}
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#0F1923"
        >
          {hoverIdx !== null ? `${Math.round(segments[hoverIdx].pct * 100)}%` : total}
        </text>
        {unit && hoverIdx === null && (
          <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle" fontSize="10" fill="#898781">
            {unit}
          </text>
        )}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "7px", flex: 1, minWidth: "140px" }}>
        {segments.map((seg, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{ display: "flex", alignItems: "center", gap: "8px", opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.5 }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "3px", background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12.5px", color: "#0F1923", fontWeight: 600, flex: 1 }}>
              {labelMap[seg.name] || seg.name}
            </span>
            <span style={{ fontSize: "12.5px", color: "#5A6A7A", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(seg.pct * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

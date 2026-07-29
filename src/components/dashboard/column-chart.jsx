"use client";
import { useState } from "react";

const HEIGHT = 220;
const PAD_LEFT = 34;
const PAD_RIGHT = 8;
const PAD_TOP = 24;
const PAD_BOTTOM = 46;
const BAR_GAP = 10;

export function ColumnChart({ items, color = "#0D9488", unit, legend }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!items || items.length === 0) {
    return <p style={{ color: "#5A6A7A", fontSize: "13px" }}>Ingen data endnu.</p>;
  }

  const width = Math.max(320, items.length * 64);
  const maxVal = Math.max(1, ...items.map((d) => d.value));
  const niceMax = Math.ceil(maxVal / 4) * 4 || 4;
  const plotW = width - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const barW = Math.min(40, plotW / items.length - BAR_GAP);

  const y = (v) => PAD_TOP + plotH - (v / niceMax) * plotH;

  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const val = (niceMax / gridSteps) * i;
    return { val, yy: y(val) };
  });

  return (
    <div>
      {unit && (
        <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#898781" }}>antal {unit}</p>
      )}
      <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${HEIGHT}`} style={{ width: "100%", minWidth: `${width}px`, height: "auto", display: "block" }}>
        {gridLines.map((g, i) => (
          <line key={i} x1={PAD_LEFT} x2={width - PAD_RIGHT} y1={g.yy} y2={g.yy} stroke="#e1e0d9" strokeWidth="1" />
        ))}
        {gridLines.map((g, i) => (
          <text key={`t${i}`} x={PAD_LEFT - 8} y={g.yy + 4} textAnchor="end" fontSize="10" fill="#898781">
            {Math.round(g.val)}
          </text>
        ))}

        {items.map((item, i) => {
          const slotW = plotW / items.length;
          const cx = PAD_LEFT + slotW * i + slotW / 2;
          const barH = plotH - (y(item.value) - PAD_TOP);
          const isHover = hoverIdx === i;
          return (
            <g key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
              <rect
                x={cx - barW / 2}
                y={y(item.value)}
                width={barW}
                height={Math.max(barH, 1)}
                rx="4"
                fill={item.color || color}
                opacity={hoverIdx === null || isHover ? 1 : 0.55}
                style={{ transition: "opacity 0.12s ease" }}
              />
              <text x={cx} y={y(item.value) - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F1923">
                {item.value}
              </text>
              <foreignObject x={cx - slotW / 2 + 2} y={HEIGHT - PAD_BOTTOM + 8} width={slotW - 4} height={PAD_BOTTOM - 8}>
                <div
                  title={item.name}
                  style={{
                    fontSize: "10.5px",
                    color: "#5A6A7A",
                    lineHeight: 1.3,
                    textAlign: "center",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.name}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
      </div>
      {legend && legend.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "10px" }}>
          {legend.map((entry) => (
            <div key={entry.label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ width: 10, height: 10, borderRadius: "3px", background: entry.color, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", color: "#5A6A7A", fontWeight: 600 }}>{entry.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

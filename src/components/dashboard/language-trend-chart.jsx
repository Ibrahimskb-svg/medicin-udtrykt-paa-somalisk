"use client";
import { useState } from "react";

const WIDTH = 640;
const HEIGHT = 200;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

const SERIES = [
  { key: "so", label: "Somalisk", color: "#0D9488" },
  { key: "da", label: "Dansk", color: "#2563EB" },
  { key: "en", label: "Engelsk", color: "#92400E" },
  { key: "ar", label: "Arabisk", color: "#D97706" },
];

export function LanguageTrendChart({ data }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!data || data.length === 0) {
    return <p style={{ color: "#5A6A7A", fontSize: "13px" }}>Ingen data endnu.</p>;
  }

  const maxVal = Math.max(1, ...data.flatMap((d) => SERIES.map((s) => d[s.key] || 0)));
  const niceMax = Math.ceil(maxVal / 5) * 5 || 5;
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (i) => PAD_LEFT + (i / (data.length - 1 || 1)) * plotW;
  const y = (v) => PAD_TOP + plotH - (v / niceMax) * plotH;

  const linePaths = SERIES.map((s) => ({
    ...s,
    d: data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[s.key] || 0)}`).join(" "),
  }));

  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const val = (niceMax / gridSteps) * i;
    return { val, yy: y(val) };
  });

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDist = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(x(i) - relX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIdx(closest);
  }

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {gridLines.map((g, i) => (
          <line key={i} x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={g.yy} y2={g.yy} stroke="#e1e0d9" strokeWidth="1" />
        ))}
        {gridLines.map((g, i) => (
          <text key={`t${i}`} x={PAD_LEFT - 8} y={g.yy + 4} textAnchor="end" fontSize="10" fill="#898781">
            {Math.round(g.val)}
          </text>
        ))}

        {linePaths.map((s) => (
          <path key={s.key} d={s.d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}

        {hovered && (
          <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={PAD_TOP} y2={PAD_TOP + plotH} stroke="#c3c2b7" strokeWidth="1" />
        )}
        {hovered &&
          SERIES.map((s) => (
            <circle key={s.key} cx={x(hoverIdx)} cy={y(hovered[s.key] || 0)} r="3.5" fill={s.color} stroke="#fff" strokeWidth="1.5" />
          ))}

        {data.map((d, i) =>
          i % 5 === 0 || i === data.length - 1 ? (
            <text key={`x${i}`} x={x(i)} y={HEIGHT - 6} textAnchor="middle" fontSize="9.5" fill="#898781">
              {d.date.slice(5)}
            </text>
          ) : null
        )}
      </svg>

      {hovered && (
        <div
          style={{
            position: "absolute",
            left: `${Math.min(85, Math.max(15, (x(hoverIdx) / WIDTH) * 100))}%`,
            top: 0,
            transform: "translate(-50%, -110%)",
            background: "#0F1923",
            color: "#fff",
            fontSize: "11.5px",
            padding: "7px 10px",
            borderRadius: "8px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "2px" }}>{hovered.date}</div>
          {SERIES.map((s) => (
            <div key={s.key}>
              <span style={{ color: s.color }}>●</span> {s.label}: {hovered[s.key] || 0}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "10px" }}>
        {SERIES.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ width: 10, height: 10, borderRadius: "3px", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#5A6A7A", fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

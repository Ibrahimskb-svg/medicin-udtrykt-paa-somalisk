"use client";
import { useState } from "react";

const WIDTH = 640;
const HEIGHT = 200;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export function TrendLineChart({ data, color = "#0D9488" }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!data || data.length === 0) {
    return <p style={{ color: "#5A6A7A", fontSize: "13px" }}>Ingen data endnu.</p>;
  }

  const maxVal = Math.max(1, ...data.map((d) => d.users));
  const niceMax = Math.ceil(maxVal / 5) * 5 || 5;
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (i) => PAD_LEFT + (i / (data.length - 1 || 1)) * plotW;
  const y = (v) => PAD_TOP + plotH - (v / niceMax) * plotH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.users)}`).join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1)} ${PAD_TOP + plotH} L ${x(0)} ${PAD_TOP + plotH} Z`;

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
          <line
            key={i}
            x1={PAD_LEFT}
            x2={WIDTH - PAD_RIGHT}
            y1={g.yy}
            y2={g.yy}
            stroke="#e1e0d9"
            strokeWidth="1"
          />
        ))}
        {gridLines.map((g, i) => (
          <text key={`t${i}`} x={PAD_LEFT - 8} y={g.yy + 4} textAnchor="end" fontSize="10" fill="#898781">
            {Math.round(g.val)}
          </text>
        ))}

        <path d={areaPath} fill={color} opacity="0.1" stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {hovered && (
          <>
            <line
              x1={x(hoverIdx)}
              x2={x(hoverIdx)}
              y1={PAD_TOP}
              y2={PAD_TOP + plotH}
              stroke="#c3c2b7"
              strokeWidth="1"
            />
            <circle cx={x(hoverIdx)} cy={y(hovered.users)} r="4" fill={color} stroke="#fff" strokeWidth="2" />
          </>
        )}

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
            left: `${(x(hoverIdx) / WIDTH) * 100}%`,
            top: 0,
            transform: "translate(-50%, -110%)",
            background: "#0F1923",
            color: "#fff",
            fontSize: "12px",
            padding: "5px 9px",
            borderRadius: "7px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <strong>{hovered.users}</strong> · {hovered.date}
        </div>
      )}
    </div>
  );
}

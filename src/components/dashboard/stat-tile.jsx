import { formatCompact } from "../../lib/format-number";

export function StatTile({ label, value, hint, accent = "#0D9488", deltaPct, deltaLabel }) {
  const hasDelta = typeof deltaPct === "number";
  const deltaColor = deltaPct > 0 ? "#006300" : deltaPct < 0 ? "#e34948" : "#5A6A7A";

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #DDE3EA",
        borderRadius: "14px",
        padding: "18px 20px",
        flex: "1 1 160px",
        minWidth: "150px",
      }}
    >
      <p style={{ fontSize: "12.5px", color: "#5A6A7A", margin: "0 0 8px 0", fontWeight: 600 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px", flexWrap: "wrap" }}>
        <p
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#0F1923",
            margin: 0,
            lineHeight: 1.1,
            fontVariantNumeric: "proportional-nums",
          }}
        >
          {typeof value === "number" ? formatCompact(value) : value}
        </p>
        {hasDelta && (
          <span style={{ fontSize: "12.5px", fontWeight: 700, color: deltaColor }}>
            {deltaPct > 0 ? "↑" : deltaPct < 0 ? "↓" : "→"} {Math.abs(deltaPct).toFixed(0)}%
          </span>
        )}
      </div>
      {hint && (
        <p style={{ fontSize: "12px", color: accent, margin: "6px 0 0 0", fontWeight: 600 }}>{hint}</p>
      )}
      {hasDelta && deltaLabel && (
        <p style={{ fontSize: "11px", color: "#898781", margin: hint ? "2px 0 0 0" : "6px 0 0 0" }}>
          {deltaLabel}
        </p>
      )}
    </div>
  );
}

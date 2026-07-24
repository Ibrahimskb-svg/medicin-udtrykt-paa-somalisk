import { formatCompact } from "../../lib/format-number";

export function StatTile({ label, value, hint, accent = "#0D9488" }) {
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
      {hint && (
        <p style={{ fontSize: "12px", color: accent, margin: "6px 0 0 0", fontWeight: 600 }}>{hint}</p>
      )}
    </div>
  );
}

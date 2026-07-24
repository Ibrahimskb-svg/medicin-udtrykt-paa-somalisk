"use client";
import { useEffect, useState } from "react";
import { StatTile } from "./stat-tile";
import { TrendLineChart } from "./trend-line-chart";
import { BarListChart } from "./bar-list-chart";
import { DeviceSplitChart } from "./device-split-chart";
import { formatCompact, formatDuration, formatThousands } from "../../lib/format-number";

function Card({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #DDE3EA",
        borderRadius: "16px",
        padding: "22px",
        flex: "1 1 320px",
        minWidth: "280px",
      }}
    >
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0F1923", margin: "0 0 2px 0" }}>{title}</h2>
      {subtitle && (
        <p style={{ fontSize: "12.5px", color: "#5A6A7A", margin: "0 0 16px 0" }}>{subtitle}</p>
      )}
      {!subtitle && <div style={{ height: "16px" }} />}
      {children}
    </div>
  );
}

export function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("fetch-failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/dashboard-auth", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #F0F4F8)", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0F1923", margin: "0 0 4px 0" }}>
              Statistik-dashboard
            </h1>
            <p style={{ fontSize: "13px", color: "#5A6A7A", margin: 0 }}>
              Besøgstal for Somalimed, hentet fra Google Analytics.
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: "9px",
              border: "1.5px solid #DDE3EA",
              background: "#fff",
              color: "#5A6A7A",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Log ud
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #f3caca",
              borderRadius: "12px",
              padding: "16px 18px",
              color: "#b03030",
              fontSize: "13.5px",
            }}
          >
            Kunne ikke hente data fra Google Analytics. Tjek at servicekontoen har adgang, og prøv at
            genindlæse siden.
          </div>
        )}

        {!data && !error && (
          <p style={{ color: "#5A6A7A", fontSize: "14px" }}>Henter data…</p>
        )}

        {data && data.ok && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
              <StatTile label="Besøgende (28 dage)" value={data.totals28d.users} hint="Sidste 4 uger" />
              <StatTile label="Sidevisninger (28 dage)" value={data.totals28d.pageviews} />
              <StatTile label="Sessioner (28 dage)" value={data.totals28d.sessions} />
              <StatTile
                label="Gns. besøgstid"
                value={formatDuration(data.totals28d.avgSessionSeconds)}
              />
              <StatTile
                label="Besøgende i alt"
                value={data.allTime.users}
                hint={`${formatCompact(data.allTime.pageviews)} sidevisninger`}
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
              <Card title="Besøgende de sidste 30 dage" subtitle="Daglige aktive brugere">
                <TrendLineChart data={data.timeseries} />
              </Card>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
              <Card title="Top lande" subtitle="Besøgende, sidste 28 dage">
                <BarListChart items={data.countries} translateNames />
              </Card>
              <Card title="Top byer" subtitle="Besøgende, sidste 28 dage">
                <BarListChart items={data.cities} color="#0284C7" />
              </Card>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <Card title="Enhedstype" subtitle="Mobil vs. computer vs. tablet">
                <DeviceSplitChart items={data.devices} />
              </Card>
            </div>

            <p style={{ fontSize: "11.5px", color: "#898781", marginTop: "24px" }}>
              Sidst opdateret: {new Date(data.generatedAt).toLocaleString("da-DK")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

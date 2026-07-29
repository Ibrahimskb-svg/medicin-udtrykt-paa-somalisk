"use client";
import { useEffect, useState } from "react";
import { StatTile } from "./stat-tile";
import { TrendLineChart } from "./trend-line-chart";
import { BarListChart, COUNTRY_NAMES_DA } from "./bar-list-chart";
import { DonutChart } from "./donut-chart";
import { ColumnChart } from "./column-chart";
import { formatCompact, formatDuration, formatThousands } from "../../lib/format-number";

const DEVICE_LABELS = { desktop: "Computer", mobile: "Mobil", tablet: "Tablet" };
const CHANNEL_LABELS = {
  "Organic Search": "Google-søgning",
  Direct: "Direkte besøg",
  Referral: "Henvisning fra andre sider",
  "Organic Social": "Sociale medier",
  "Paid Search": "Betalt søgning",
  Unassigned: "Ukendt kilde",
  Email: "E-mail",
};
const LOYALTY_LABELS = { new: "Nye besøgende", returning: "Tilbagevendende", "(not set)": "Ukendt", "": "Ukendt" };
const LANGUAGE_LABELS = {
  da: "Dansk", "da-dk": "Dansk", danish: "Dansk",
  en: "Engelsk", "en-us": "Engelsk", "en-gb": "Engelsk", english: "Engelsk",
  so: "Somali", "so-so": "Somali", somali: "Somali",
  ar: "Arabisk", "ar-sa": "Arabisk", "ar-qa": "Arabisk", "ar-ae": "Arabisk", arabic: "Arabisk",
};

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

const REFRESH_INTERVAL_MS = 120_000;

export function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetch("/api/analytics")
        .then((res) => {
          if (!res.ok) throw new Error("fetch-failed");
          return res.json();
        })
        .then((json) => {
          if (!cancelled) {
            setData(json);
            setError(false);
          }
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    }

    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                background: "#FFFFFF",
                border: "1px solid #DDE3EA",
                borderRadius: "12px",
                padding: "12px 18px",
                marginBottom: "14px",
                width: "fit-content",
              }}
            >
              <span style={{ position: "relative", width: "10px", height: "10px", flexShrink: 0 }}>
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#0ca30c",
                    animation: "sm-pulse-ring 2s ease-out infinite",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#0ca30c",
                  }}
                />
              </span>
              <span style={{ fontSize: "13.5px", color: "#0F1923" }}>
                <strong>{data.activeNow}</strong> aktive på siden lige nu
                {data.activeNowRows && data.activeNowRows.length > 0 && (
                  <span style={{ color: "#5A6A7A", fontWeight: 400 }}>
                    {" — "}
                    {data.activeNowRows
                      .map(
                        (r) =>
                          `${r.users} fra ${COUNTRY_NAMES_DA[r.country] || r.country} (${DEVICE_LABELS[r.device] || r.device})`
                      )
                      .join(", ")}
                  </span>
                )}
              </span>
              <style>{`
                @keyframes sm-pulse-ring {
                  0% { transform: scale(1); opacity: 0.6; }
                  100% { transform: scale(2.6); opacity: 0; }
                }
              `}</style>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
              <StatTile
                label="Besøgende (28 dage)"
                value={data.totals28d.users}
                hint="Sidste 4 uger"
                deltaPct={data.growth28d?.users ?? null}
                deltaLabel="vs. forrige 4 uger"
              />
              <StatTile
                label="Sidevisninger (28 dage)"
                value={data.totals28d.pageviews}
                deltaPct={data.growth28d?.pageviews ?? null}
                deltaLabel="vs. forrige 4 uger"
              />
              <StatTile
                label="Sessioner (28 dage)"
                value={data.totals28d.sessions}
                deltaPct={data.growth28d?.sessions ?? null}
                deltaLabel="vs. forrige 4 uger"
              />
              <StatTile
                label="Gns. besøgstid"
                value={formatDuration(data.totals28d.avgSessionSeconds)}
              />
              <StatTile
                label="Engagement rate"
                value={`${Math.round((data.totals28d.engagementRate || 0) * 100)}%`}
                hint="Andel der bruger siden aktivt"
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

                <button
                  onClick={() => setShowTable((v) => !v)}
                  style={{
                    marginTop: "14px",
                    background: "none",
                    border: "none",
                    color: "#0D9488",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showTable ? "Skjul tabel" : "Vis som tabel"}
                </button>

                {showTable && (
                  <div style={{ marginTop: "12px", maxHeight: "260px", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "6px 8px",
                              color: "#5A6A7A",
                              fontWeight: 600,
                              borderBottom: "1px solid #DDE3EA",
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                            }}
                          >
                            Dato
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "6px 8px",
                              color: "#5A6A7A",
                              fontWeight: 600,
                              borderBottom: "1px solid #DDE3EA",
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                            }}
                          >
                            Besøgende
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "6px 8px",
                              color: "#5A6A7A",
                              fontWeight: 600,
                              borderBottom: "1px solid #DDE3EA",
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                            }}
                          >
                            Ændring vs. dagen før
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.timeseries
                          .map((d, i) => {
                            const prev = data.timeseries[i - 1];
                            let changePct = null;
                            if (prev) {
                              changePct =
                                prev.users === 0
                                  ? d.users === 0
                                    ? 0
                                    : null
                                  : ((d.users - prev.users) / prev.users) * 100;
                            }
                            return { ...d, changePct };
                          })
                          .slice()
                          .reverse()
                          .map((d) => (
                            <tr key={d.date}>
                              <td style={{ padding: "6px 8px", borderBottom: "1px solid #F0F4F8", color: "#0F1923" }}>
                                {d.date}
                              </td>
                              <td
                                style={{
                                  padding: "6px 8px",
                                  borderBottom: "1px solid #F0F4F8",
                                  textAlign: "right",
                                  fontVariantNumeric: "tabular-nums",
                                  color: "#0F1923",
                                  fontWeight: 600,
                                }}
                              >
                                {d.users}
                              </td>
                              <td
                                style={{
                                  padding: "6px 8px",
                                  borderBottom: "1px solid #F0F4F8",
                                  textAlign: "right",
                                  fontVariantNumeric: "tabular-nums",
                                  fontWeight: 600,
                                  color:
                                    d.changePct === null
                                      ? "#898781"
                                      : d.changePct > 0
                                        ? "#006300"
                                        : d.changePct < 0
                                          ? "#e34948"
                                          : "#898781",
                                }}
                              >
                                {d.changePct === null
                                  ? "–"
                                  : `${d.changePct > 0 ? "+" : ""}${d.changePct.toFixed(0)}%`}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
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

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
              <Card title="Enhedstype" subtitle="Besøgende, sidste 28 dage">
                <DonutChart
                  items={data.devices.map((d) => ({ name: d.name, value: d.users }))}
                  labelMap={DEVICE_LABELS}
                  unit="besøgende"
                />
              </Card>
              <Card title="Trafikkilder" subtitle="Sessioner, sidste 28 dage">
                <DonutChart
                  items={(data.sources || []).map((s) => ({ name: s.name, value: s.sessions }))}
                  labelMap={CHANNEL_LABELS}
                  unit="sessioner"
                />
              </Card>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
              <Card
                title="Mest besøgte sider"
                subtitle="Antal sidevisninger pr. side, sidste 28 dage — ikke antal personer (én person kan se en side flere gange)"
              >
                <ColumnChart
                  items={(data.topPages || []).map((p) => ({
                    name: p.name,
                    value: p.views,
                    color: p.name === "Forsiden" ? "#0284C7" : "#0D9488",
                  }))}
                  unit="visninger"
                  legend={[
                    { label: "Forsiden", color: "#0284C7" },
                    { label: "Medicinside", color: "#0D9488" },
                  ]}
                />
              </Card>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <Card title="Nye vs. tilbagevendende" subtitle="Besøgende, sidste 28 dage">
                <DonutChart
                  items={(data.loyalty || []).map((l) => ({ name: l.name, value: l.users }))}
                  labelMap={LOYALTY_LABELS}
                  unit="besøgende"
                />
              </Card>
              <Card
                title="Sprog på sitet"
                subtitle="Sidevisninger fordelt på Somalisk/Dansk/Engelsk/Arabisk, sidste 28 dage"
              >
                <DonutChart
                  items={(data.siteLanguages || []).map((l) => ({ name: l.name, value: l.views }))}
                  unit="visninger"
                />
              </Card>
              <Card
                title="Sprog (browser/OS)"
                subtitle="Besøgendes browsersprog, sidste 28 dage — viser rækkevidde, ikke hvilket sprog de læser siden på"
              >
                <DonutChart
                  items={(data.languages || []).map((l) => ({
                    name: LANGUAGE_LABELS[l.name?.toLowerCase()] || l.name,
                    value: l.users,
                  }))}
                  unit="besøgende"
                />
              </Card>
            </div>

            <p style={{ fontSize: "11.5px", color: "#898781", marginTop: "24px" }}>
              Sidst opdateret: {new Date(data.generatedAt).toLocaleString("da-DK")} · opdateres automatisk
              hvert 2. minut
            </p>
          </>
        )}
      </div>
    </div>
  );
}

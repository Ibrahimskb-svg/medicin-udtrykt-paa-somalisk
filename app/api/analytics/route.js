import { NextResponse } from "next/server";
import { getAnalyticsClient, getProperty } from "../../../src/lib/analytics-client";
import { isValidSession, DASHBOARD_COOKIE } from "../../../src/lib/dashboard-auth";
import { getIndexData } from "../../../src/lib/site";

function rowsOf(report) {
  return report?.rows || [];
}

// Maps a GA4 pagePath (e.g. "/amlodipin") to a single, language-independent
// label — GA4's pageTitle varies per visitor language, which fragmented this
// list into duplicates (same page, different titles) instead of one row per page.
function pagePathToLabel(path) {
  const slug = path.replace(/^\//, "").split("?")[0];
  if (!slug) return "Forsiden";
  const item = getIndexData().items.find((i) => i.slug === slug);
  return item ? item.name : slug;
}

function toDateLabel(yyyymmdd) {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

export async function GET(request) {
  const cookie = request.cookies.get(DASHBOARD_COOKIE)?.value;
  if (!isValidSession(cookie)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const client = getAnalyticsClient();
    const property = getProperty();

    // GA4 batchRunReports caps at 5 requests per call, so the long-range
    // all-time totals go in a separate single runReport call.
    const [response] = await client.batchRunReports({
      property,
      requests: [
        {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
        },
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "averageSessionDuration" },
            { name: "engagementRate" },
          ],
        },
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          dimensions: [{ name: "country" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 8,
        },
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          dimensions: [{ name: "city" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 8,
        },
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        },
      ],
    });

    const [timeseriesReport, totalsReport, countryReport, cityReport, deviceReport] = response.reports;

    const [allTimeReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "2024-01-01", endDate: "today" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    });

    const [realtimeReport] = await client.runRealtimeReport({
      property,
      dimensions: [{ name: "country" }, { name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
    });

    // Prior 28-day window immediately before the current one, for period-over-period growth.
    const [previousPeriodReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "55daysAgo", endDate: "28daysAgo" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    });

    const [sourceReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    });

    const [topPagesReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 12,
    });

    const [loyaltyReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
      dimensions: [{ name: "newVsReturning" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    });

    const [languageReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
      dimensions: [{ name: "language" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 6,
    });

    // Hvilket af sitets 4 sprog (so/da/en/ar) folk faktisk læser siden på —
    // udledt af "?lang="-parameteren i URL'en, da GA4's egen "language"-dimension
    // kun viser browserens/OS'ets sprog, ikke sprogvalget inde på siden selv.
    const [siteLanguageReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePathPlusQueryString" }],
      metrics: [{ name: "screenPageViews" }],
      limit: 10000,
    });

    const timeseries = rowsOf(timeseriesReport).map((row) => ({
      date: toDateLabel(row.dimensionValues[0].value),
      users: Number(row.metricValues[0].value),
    }));

    const totalsRow = rowsOf(totalsReport)[0];
    const totals28d = totalsRow
      ? {
          users: Number(totalsRow.metricValues[0].value),
          sessions: Number(totalsRow.metricValues[1].value),
          pageviews: Number(totalsRow.metricValues[2].value),
          avgSessionSeconds: Number(totalsRow.metricValues[3].value),
          engagementRate: Number(totalsRow.metricValues[4].value),
        }
      : { users: 0, sessions: 0, pageviews: 0, avgSessionSeconds: 0, engagementRate: 0 };

    const countries = rowsOf(countryReport).map((row) => ({
      name: row.dimensionValues[0].value,
      users: Number(row.metricValues[0].value),
    }));

    const cities = rowsOf(cityReport).map((row) => ({
      name: row.dimensionValues[0].value,
      users: Number(row.metricValues[0].value),
    }));

    const devices = rowsOf(deviceReport).map((row) => ({
      name: row.dimensionValues[0].value,
      users: Number(row.metricValues[0].value),
    }));

    const allTimeRow = rowsOf(allTimeReport)[0];
    const allTime = allTimeRow
      ? {
          users: Number(allTimeRow.metricValues[0].value),
          pageviews: Number(allTimeRow.metricValues[1].value),
        }
      : { users: 0, pageviews: 0 };

    const activeNowRows = rowsOf(realtimeReport).map((row) => ({
      country: row.dimensionValues[0].value,
      device: row.dimensionValues[1].value,
      users: Number(row.metricValues[0].value),
    }));
    const activeNow = activeNowRows.reduce((sum, r) => sum + r.users, 0);

    const prevRow = rowsOf(previousPeriodReport)[0];
    const previous28d = prevRow
      ? {
          users: Number(prevRow.metricValues[0].value),
          sessions: Number(prevRow.metricValues[1].value),
          pageviews: Number(prevRow.metricValues[2].value),
        }
      : { users: 0, sessions: 0, pageviews: 0 };

    function growthPct(current, previous) {
      if (previous === 0) return current === 0 ? 0 : null;
      return ((current - previous) / previous) * 100;
    }

    const growth28d = {
      users: growthPct(totals28d.users, previous28d.users),
      sessions: growthPct(totals28d.sessions, previous28d.sessions),
      pageviews: growthPct(totals28d.pageviews, previous28d.pageviews),
    };

    const sources = rowsOf(sourceReport).map((row) => ({
      name: row.dimensionValues[0].value,
      sessions: Number(row.metricValues[0].value),
    }));

    const topPagesByLabel = new Map();
    for (const row of rowsOf(topPagesReport)) {
      const label = pagePathToLabel(row.dimensionValues[0].value);
      const views = Number(row.metricValues[0].value);
      topPagesByLabel.set(label, (topPagesByLabel.get(label) || 0) + views);
    }
    const topPages = [...topPagesByLabel.entries()]
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    const loyalty = rowsOf(loyaltyReport).map((row) => ({
      name: row.dimensionValues[0].value,
      users: Number(row.metricValues[0].value),
    }));

    // GA4's "language" dimension is the visitor's browser/OS language (a proxy for
    // audience reach), not the in-site language toggle the site itself doesn't track yet.
    const languages = rowsOf(languageReport).map((row) => ({
      name: row.dimensionValues[0].value,
      users: Number(row.metricValues[0].value),
    }));

    const SITE_LANG_LABELS = { so: "Somalisk", da: "Dansk", en: "Engelsk", ar: "Arabisk" };
    const siteLangCounts = { so: 0, da: 0, en: 0, ar: 0 };
    for (const row of rowsOf(siteLanguageReport)) {
      const path = row.dimensionValues[0].value;
      const views = Number(row.metricValues[0].value);
      const match = /[?&]lang=(so|da|en|ar)\b/.exec(path);
      const lang = match ? match[1] : "so"; // "so" er sitets standardsprog uden "?lang="-parameter
      siteLangCounts[lang] += views;
    }
    const siteLanguages = Object.entries(siteLangCounts)
      .map(([code, views]) => ({ name: SITE_LANG_LABELS[code], views }))
      .filter((l) => l.views > 0)
      .sort((a, b) => b.views - a.views);

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      timeseries,
      totals28d,
      previous28d,
      growth28d,
      countries,
      cities,
      devices,
      allTime,
      activeNow,
      activeNowRows,
      sources,
      topPages,
      loyalty,
      languages,
      siteLanguages,
    });
  } catch (err) {
    console.error("GA4 analytics fetch failed:", err);
    return NextResponse.json({ ok: false, error: "ga4-fetch-failed" }, { status: 500 });
  }
}

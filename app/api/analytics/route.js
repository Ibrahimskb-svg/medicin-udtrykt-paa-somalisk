import { NextResponse } from "next/server";
import { getAnalyticsClient, getProperty } from "../../../src/lib/analytics-client";
import { isValidSession, DASHBOARD_COOKIE } from "../../../src/lib/dashboard-auth";

function rowsOf(report) {
  return report?.rows || [];
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
      dimensions: [{ name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 8,
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
        }
      : { users: 0, sessions: 0, pageviews: 0, avgSessionSeconds: 0 };

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

    const activeNow = Number(rowsOf(realtimeReport)[0]?.metricValues[0]?.value || 0);

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

    const topPages = rowsOf(topPagesReport).map((row) => ({
      name: row.dimensionValues[0].value,
      views: Number(row.metricValues[0].value),
    }));

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
      sources,
      topPages,
    });
  } catch (err) {
    console.error("GA4 analytics fetch failed:", err);
    return NextResponse.json({ ok: false, error: "ga4-fetch-failed" }, { status: 500 });
  }
}

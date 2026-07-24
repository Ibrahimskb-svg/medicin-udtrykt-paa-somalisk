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

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      timeseries,
      totals28d,
      countries,
      cities,
      devices,
      allTime,
    });
  } catch (err) {
    console.error("GA4 analytics fetch failed:", err);
    return NextResponse.json({ ok: false, error: "ga4-fetch-failed" }, { status: 500 });
  }
}

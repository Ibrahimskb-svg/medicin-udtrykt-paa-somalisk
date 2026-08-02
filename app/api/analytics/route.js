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

    // Anden batch (samme 5-forespørgsel-loft pr. kald): browser, styresystem,
    // tidspunkt på døgnet, ugedag, og landingsside — alle anonyme, aggregerede
    // GA4-standarddimensioner, ingen persondata.
    const [response2] = await client.batchRunReports({
      property,
      requests: [
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          dimensions: [{ name: "browser" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 6,
        },
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          dimensions: [{ name: "operatingSystem" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 6,
        },
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          dimensions: [{ name: "hour" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ dimension: { dimensionName: "hour" } }],
        },
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          dimensions: [{ name: "dayOfWeek" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ dimension: { dimensionName: "dayOfWeek" } }],
        },
        {
          dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
          dimensions: [{ name: "landingPage" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 12,
        },
      ],
    });
    const [browserReport, osReport, hourReport, dayOfWeekReport, landingPageReport] = response2.reports;

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

    // Samme sprog-udledning, men dag for dag, så vi kan se om fordelingen
    // mellem sprogene ændrer sig over tid (ikke kun et snapshot).
    const [siteLanguageTrendReport] = await client.runReport({
      property,
      dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }, { name: "pagePathPlusQueryString" }],
      metrics: [{ name: "screenPageViews" }],
      limit: 100000,
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

    // Mest læste medicinside pr. sprog — samme rækker som siteLanguages, bare
    // grupperet på (sprog, side) i stedet for kun sprog. "Forsiden" tælles ikke
    // med, da spørgsmålet er hvilken medicin der læses mest, ikke forsiden.
    const pagesByLang = { so: new Map(), da: new Map(), en: new Map(), ar: new Map() };
    for (const row of rowsOf(siteLanguageReport)) {
      const path = row.dimensionValues[0].value;
      const views = Number(row.metricValues[0].value);
      const match = /[?&]lang=(so|da|en|ar)\b/.exec(path);
      const lang = match ? match[1] : "so";
      const label = pagePathToLabel(path);
      if (label === "Forsiden") continue;
      const bucket = pagesByLang[lang];
      bucket.set(label, (bucket.get(label) || 0) + views);
    }
    const topPageByLanguage = Object.entries(pagesByLang)
      .map(([code, pages]) => {
        const sorted = [...pages.entries()].sort((a, b) => b[1] - a[1]);
        if (sorted.length === 0) return null;
        return { lang: SITE_LANG_LABELS[code], name: sorted[0][0], views: sorted[0][1] };
      })
      .filter(Boolean);

    // Sprogfordeling dag for dag, så man kan se om andelen af fx somalisk/arabisk
    // stiger eller falder over tid, i stedet for kun et snapshot af de sidste 28 dage.
    const trendByDate = new Map();
    for (const row of rowsOf(siteLanguageTrendReport)) {
      const date = toDateLabel(row.dimensionValues[0].value);
      const path = row.dimensionValues[1].value;
      const views = Number(row.metricValues[0].value);
      const match = /[?&]lang=(so|da|en|ar)\b/.exec(path);
      const lang = match ? match[1] : "so";
      if (!trendByDate.has(date)) trendByDate.set(date, { date, so: 0, da: 0, en: 0, ar: 0 });
      trendByDate.get(date)[lang] += views;
    }
    const siteLanguageTrend = [...trendByDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));

    // Søgeord der gav 0 resultater — fortæller hvilken medicin folk leder efter,
    // som endnu ikke er på siden. Kører isoleret fra batch'en: kræver at en
    // "search_term"-custom dimension (event-scope) er oprettet i GA4 admin
    // (Admin → Custom definitions), ellers fejler kaldet — men skal ikke vælte
    // resten af dashboardet, hvis det endnu ikke er sat op.
    let noResultSearches = [];
    let noResultSearchesUnavailable = false;
    try {
      const [noResultReport] = await client.runReport({
        property,
        dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
        dimensions: [{ name: "customEvent:search_term" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "search_no_results" } },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 25,
      });
      noResultSearches = rowsOf(noResultReport)
        .map((row) => ({ term: row.dimensionValues[0].value, count: Number(row.metricValues[0].value) }))
        .filter((r) => r.term && r.term !== "(not set)");
    } catch (err) {
      console.error("GA4 no-result-search fetch failed (custom dimension may not be registered yet):", err.message);
      noResultSearchesUnavailable = true;
    }

    const browsers = rowsOf(browserReport).map((row) => ({
      name: row.dimensionValues[0].value,
      users: Number(row.metricValues[0].value),
    }));

    const operatingSystems = rowsOf(osReport).map((row) => ({
      name: row.dimensionValues[0].value,
      users: Number(row.metricValues[0].value),
    }));

    // GA4's "hour" dimension er i property'ens rapporteringstidszone (samme
    // tidszone som resten af dashboardet allerede viser tal i).
    const hourCounts = Array(24).fill(0);
    for (const row of rowsOf(hourReport)) {
      const h = Number(row.dimensionValues[0].value);
      if (h >= 0 && h < 24) hourCounts[h] = Number(row.metricValues[0].value);
    }
    const byHour = hourCounts.map((sessions, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, sessions }));

    // GA4's "dayOfWeek": 0 = søndag … 6 = lørdag. Vist i dansk uge-rækkefølge
    // (mandag først).
    const DAY_NAMES = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
    const dayCounts = Array(7).fill(0);
    for (const row of rowsOf(dayOfWeekReport)) {
      const d = Number(row.dimensionValues[0].value);
      if (d >= 0 && d < 7) dayCounts[d] = Number(row.metricValues[0].value);
    }
    const byDayOfWeek = [1, 2, 3, 4, 5, 6, 0].map((d) => ({ day: DAY_NAMES[d], sessions: dayCounts[d] }));

    const landingPagesByLabel = new Map();
    for (const row of rowsOf(landingPageReport)) {
      const rawPath = row.dimensionValues[0].value;
      // GA4 returner "(not set)" når landingssiden ikke kunne bestemmes for
      // sessionen (fx visse app-links eller målingshuller) — vis det på dansk.
      const label = rawPath === "(not set)" ? "Ukendt" : pagePathToLabel(rawPath);
      const sessions = Number(row.metricValues[0].value);
      landingPagesByLabel.set(label, (landingPagesByLabel.get(label) || 0) + sessions);
    }
    const landingPages = [...landingPagesByLabel.entries()]
      .map(([name, sessions]) => ({ name, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 8);

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
      topPageByLanguage,
      siteLanguageTrend,
      noResultSearches,
      noResultSearchesUnavailable,
      browsers,
      operatingSystems,
      byHour,
      byDayOfWeek,
      landingPages,
    });
  } catch (err) {
    console.error("GA4 analytics fetch failed:", err);
    return NextResponse.json({ ok: false, error: "ga4-fetch-failed" }, { status: 500 });
  }
}

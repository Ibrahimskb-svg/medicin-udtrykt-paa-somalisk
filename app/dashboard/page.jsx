import { cookies } from "next/headers";
import { isValidSession, DASHBOARD_COOKIE } from "../../src/lib/dashboard-auth";
import { DashboardLogin } from "../../src/components/dashboard/dashboard-login";
import { AnalyticsDashboard } from "../../src/components/dashboard/analytics-dashboard";

export const metadata = {
  title: "Statistik-dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const authed = isValidSession(cookieStore.get(DASHBOARD_COOKIE)?.value);

  if (!authed) {
    return <DashboardLogin />;
  }

  return <AnalyticsDashboard />;
}

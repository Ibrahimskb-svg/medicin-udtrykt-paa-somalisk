"use client";

import { usePathname } from "next/navigation";
import { AppNavbar } from "./app-navbar";

export function LayoutShell({ children }) {
  const pathname = usePathname();
  const isPrivateDashboard = pathname?.startsWith("/dashboard");

  return (
    <>
      {!isPrivateDashboard && <AppNavbar />}
      {children}
    </>
  );
}

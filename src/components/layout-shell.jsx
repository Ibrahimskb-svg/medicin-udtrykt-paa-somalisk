"use client";

import { usePathname } from "next/navigation";

import { AppNavbar } from "./app-navbar";

export function LayoutShell({ children }) {
  const pathname = usePathname();
  const showDefaultNavbar = pathname !== "/";

  return (
    <>
      {showDefaultNavbar ? <AppNavbar /> : null}
      {children}
    </>
  );
}

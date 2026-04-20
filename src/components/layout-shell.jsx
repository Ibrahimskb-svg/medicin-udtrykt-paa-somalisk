"use client";

import { AppNavbar } from "./app-navbar";

export function LayoutShell({ children }) {
  return (
    <>
      <AppNavbar />
      {children}
    </>
  );
}

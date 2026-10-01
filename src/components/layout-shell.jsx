"use client";

import { usePathname } from "next/navigation";
import { AppNavbar } from "./app-navbar";

export function LayoutShell({ children }) {
  const pathname = usePathname();
  const isPrivateDashboard = pathname?.startsWith("/dashboard");

  return (
    <>
      {!isPrivateDashboard && <AppNavbar />}
      {/* Zoom-widgettens forstør/formindsk skal kun ramme selve sideindholdet —
          ikke navbaren, som skal forblive i fast størrelse uanset zoom-niveau.
          --page-zoom sættes af TextZoomControl; 100% er default/dashboard. */}
      <div style={{ zoom: "var(--page-zoom, 100%)" }}>{children}</div>
    </>
  );
}

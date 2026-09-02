"use client";

import { useEffect, useState } from "react";
import { PreviewAccessProvider } from "@/context/PreviewAccessContext";
import { DesktopSidebar } from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

function Shell({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("orvix.sidebarCollapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("orvix.sidebarCollapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DesktopSidebar collapsed={collapsed} onToggleCollapse={toggle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }) {
  return (
    <PreviewAccessProvider>
      <Shell>{children}</Shell>
    </PreviewAccessProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AccessProvider, useAccess } from "@/context/AccessContext";
import { DesktopSidebar } from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

function Shell({ children }) {
  const { persona, isPending } = useAccess();
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

  if (isPending || !persona) {
    return <div className="min-h-screen bg-slate-50" />;
  }

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
    <AccessProvider>
      <Shell>{children}</Shell>
    </AccessProvider>
  );
}

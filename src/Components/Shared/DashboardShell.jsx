"use client";

import { useEffect, useState } from "react";
import { AccessProvider, useAccess } from "@/context/AccessContext";
import { DesktopSidebar } from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

function useTableCardLabels(enabled) {
  useEffect(() => {
    if (!enabled) return;
    const root = document.querySelector("main");
    if (!root) return;

    const stamp = () => {
      root.querySelectorAll("table").forEach((table) => {
        const headers = [...table.querySelectorAll("thead th")].map((th) =>
          th.textContent.replace(/\s+/g, " ").trim()
        );
        table.querySelectorAll("tbody tr").forEach((tr) => {
          [...tr.children]
            .filter((el) => el.tagName === "TD")
            .forEach((td, index) => {
              if (td.hasAttribute("colspan")) {
                td.removeAttribute("data-label");
                return;
              }
              if (headers[index]) td.setAttribute("data-label", headers[index]);
            });
        });
      });
    };

    stamp();
    const observer = new MutationObserver(stamp);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled]);
}

function Shell({ children }) {
  const { persona, isPending } = useAccess();
  const [collapsed, setCollapsed] = useState(false);
  useTableCardLabels(Boolean(persona) && !isPending);

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <span className="orvix-spinner orvix-spinner-lg" />
          <p className="text-sm">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DesktopSidebar collapsed={collapsed} onToggleCollapse={toggle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-3 md:p-5">{children}</main>
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

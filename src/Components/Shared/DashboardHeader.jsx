"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "@gravity-ui/icons";
import { PAGE_META } from "@/lib/navigation";
import { useAccess } from "@/context/AccessContext";
import { MobileNav } from "./Sidebar";

const MOCK_NOTIFICATIONS = [
  { id: "1", title: "Pending resource request", body: "30 hygiene kits requested for Dhaka Warehouse.", time: "12m" },
  { id: "2", title: "Attendance reminder", body: "2 field workers have not checked in today.", time: "1h" },
  { id: "3", title: "Low stock alert", body: "Water Jug 20L is below reorder level.", time: "3h" },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const { persona } = useAccess();
  const [openNotes, setOpenNotes] = useState(false);
  const meta = PAGE_META[pathname]
    ?? (pathname.startsWith("/workers/") && pathname !== "/workers/new"
      ? { title: "Worker Details", eyebrow: "Operations" }
      : pathname.startsWith("/suppliers/") && pathname !== "/suppliers/new"
        ? { title: "Supplier", eyebrow: "Procurement" }
        : pathname.startsWith("/purchases/orders/") && pathname !== "/purchases/orders/new"
          ? { title: "Purchase Order", eyebrow: "Procurement" }
          : pathname.startsWith("/purchases/") && pathname !== "/purchases/receiving" && pathname !== "/purchases/orders"
            ? { title: "Purchase", eyebrow: "Procurement" }
            : { title: "ORVIX", eyebrow: "Workspace" });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-dashed border-slate-300 bg-white px-5">
      <MobileNav />

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">{meta.eyebrow}</p>
        <h1 className="truncate text-base font-semibold text-slate-900">{meta.title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {persona?.roleLabel && (
          <span className="max-w-[160px] truncate rounded-full border border-[#2075fe]/20 bg-[#2075fe]/10 px-3 py-1 text-xs font-semibold text-[#2075fe] sm:max-w-none">
            {persona.roleLabel}
          </span>
        )}

        <div className="relative">
        <button
          type="button"
          onClick={() => setOpenNotes((value) => !value)}
          className="relative inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#2075fe]" />
        </button>
        {openNotes && (
          <div className="absolute top-12 right-0 w-80 overflow-hidden rounded-xl border border-dashed border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <Link href="/notifications" onClick={() => setOpenNotes(false)} className="text-xs font-medium text-[#2075fe]">
                View all
              </Link>
            </div>
            <ul>
              {MOCK_NOTIFICATIONS.map((item) => (
                <li key={item.id} className="border-b border-slate-100 px-4 py-3 last:border-0">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.body}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{item.time} ago</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}

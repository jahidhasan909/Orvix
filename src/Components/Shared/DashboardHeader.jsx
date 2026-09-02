"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown } from "@gravity-ui/icons";
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
  const meta = PAGE_META[pathname] ?? { title: "ORVIX", eyebrow: "Workspace" };

  if (!persona) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:px-6">
      <MobileNav />

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">{meta.eyebrow}</p>
        <h1 className="truncate text-base font-semibold text-slate-900">{meta.title}</h1>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        <span className="max-w-[220px] truncate text-xs font-medium text-slate-600">
          {persona.orgName}
          <span className="text-slate-400"> · {persona.roleLabel}</span>
        </span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenNotes((value) => !value)}
          className="relative inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-violet-500" />
        </button>
        {openNotes && (
          <div className="absolute top-12 right-0 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <Link href="/notifications" onClick={() => setOpenNotes(false)} className="text-xs font-medium text-violet-600">
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

      <Link
        href="/profile"
        className="hidden items-center gap-2 rounded-lg border border-slate-200 py-1 pr-2 pl-1 hover:bg-slate-50 sm:flex"
      >
        <span className="flex size-8 items-center justify-center rounded-md bg-violet-100 text-[11px] font-semibold text-violet-700">
          {persona.initials}
        </span>
        <span className="hidden min-w-0 lg:block">
          <span className="block max-w-[120px] truncate text-xs font-semibold text-slate-800">{persona.name}</span>
          <span className="block max-w-[120px] truncate text-[11px] text-slate-400">
            {persona.designationLabel ?? persona.roleLabel}
          </span>
        </span>
        <ChevronDown className="size-3 text-slate-400" />
      </Link>
    </header>
  );
}

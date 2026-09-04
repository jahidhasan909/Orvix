"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccess } from "@/context/AccessContext";
import { DESIGNATIONS, ROLES } from "@/lib/navigation";

const PLATFORM_CARDS = [
  { label: "Registered NGOs", value: "12", href: "/platform/ngos" },
  { label: "Platform admins", value: "4", href: "/platform/users" },
  { label: "Modules in review", value: "3", href: "/platform/modules" },
  { label: "Open audit events", value: "18", href: "/platform/audit-logs" },
];

const ATTENDANCE_LABELS = {
  present: "Present",
  absent: "Absent",
  leave: "Leave",
  holiday: "Holiday",
  unmarked: "Unmarked",
};

export default function DashboardPage() {
  const { persona } = useAccess();
  const [ngoStats, setNgoStats] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    if (persona.role !== ROLES.NGO_ADMIN) return;
    fetch("/api/ngo/dashboard")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return;
        setNgoStats(data);
      })
      .catch(() => {});
  }, [persona.role]);

  useEffect(() => {
    if (persona.role !== ROLES.WORKER) return;
    fetch("/api/me/overview")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return;
        setOverview(data);
      })
      .catch(() => {});
  }, [persona.role]);

  const ngoCards = [
    { label: "Active projects", value: ngoStats?.projects ?? "…", href: "/projects" },
    { label: "Workers", value: ngoStats?.workers ?? "…", href: "/workers" },
    { label: "Pending requests", value: ngoStats?.pendingRequests ?? "…", href: "/resource-requests" },
    { label: "Low stock items", value: ngoStats?.lowStock ?? "…", href: "/inventory" },
  ];

  const cards =
    persona.role === ROLES.PLATFORM_ADMIN
      ? PLATFORM_CARDS
      : persona.role === ROLES.NGO_ADMIN
        ? ngoCards
        : persona.designation === DESIGNATIONS.DATA_ENTRY_OFFICER
          ? [
              { label: "Assigned forms", value: overview?.forms ?? "…", href: "/data-entry" },
              { label: "Open records", value: overview?.queuedRecords ?? "…", href: "/data-entry" },
              { label: "Notifications", value: overview?.unreadNotifications ?? "…", href: "/notifications" },
              { label: "My profile", value: "Open", href: "/profile" },
            ]
          : [
              { label: "My attendance", value: overview ? ATTENDANCE_LABELS[overview.attendance] || overview.attendance : "…", href: "/attendance/me" },
              { label: "Assigned sites", value: overview?.assignedSites ?? "…", href: "/my-assignments" },
              { label: "Open requests", value: overview?.pendingRequests ?? "…", href: "/resource-requests" },
              { label: "Notifications", value: overview?.unreadNotifications ?? "…", href: "/notifications" },
            ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome, {persona.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {persona.orgName}
          {persona.designationLabel ? ` · ${persona.designationLabel}` : ` · ${persona.roleLabel}`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#2176fe]/40 hover:bg-[#2176fe]/5"
          >
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-800">Workspace</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Modules in the sidebar follow your role, enabled NGO modules, and assigned permissions.
        </p>
      </div>
    </div>
  );
}

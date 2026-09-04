"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NgoDashboardCharts, PlatformDashboardCharts } from "@/Components/Dashboard/DashboardCharts";
import { useAccess } from "@/context/AccessContext";
import { ROLES, homePath } from "@/lib/navigation";

export default function DashboardPage() {
  const { persona } = useAccess();
  const router = useRouter();
  const [ngoStats, setNgoStats] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    if (persona.role === ROLES.WORKER) {
      router.replace(homePath(persona));
    }
  }, [persona, router]);

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
    if (persona.role !== ROLES.PLATFORM_ADMIN) return;
    fetch("/api/platform/overview")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return;
        setPlatformStats(data);
      })
      .catch(() => {});
  }, [persona.role]);

  if (persona.role === ROLES.WORKER) {
    return (
      <p className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
        <span className="orvix-spinner" />
        Opening your workspace…
      </p>
    );
  }

  const cards =
    persona.role === ROLES.PLATFORM_ADMIN
      ? [
          { label: "Registered NGOs", value: platformStats?.ngos ?? "…", href: "/platform/ngos" },
          { label: "Active NGOs", value: platformStats?.activeNgos ?? "…", href: "/platform/ngos" },
          { label: "Workers", value: platformStats?.workers ?? "…", href: "/platform/reports" },
          { label: "Audit events", value: platformStats?.auditEvents ?? "…", href: "/platform/audit-logs" },
        ]
      : [
          { label: "Active projects", value: ngoStats?.projects ?? "…", href: "/projects" },
          { label: "Workers", value: ngoStats?.workers ?? "…", href: "/workers" },
          { label: "Pending requests", value: ngoStats?.pendingRequests ?? "…", href: "/resource-requests" },
          { label: "Low stock items", value: ngoStats?.lowStock ?? "…", href: "/inventory" },
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

      {persona.role === ROLES.NGO_ADMIN ? <NgoDashboardCharts charts={ngoStats?.charts} /> : null}
      {persona.role === ROLES.PLATFORM_ADMIN ? <PlatformDashboardCharts charts={platformStats?.charts} /> : null}
    </div>
  );
}

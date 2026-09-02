"use client";

import Link from "next/link";
import { useAccess } from "@/context/AccessContext";
import { DESIGNATIONS, ROLES } from "@/lib/navigation";

const PLATFORM_CARDS = [
  { label: "Registered NGOs", value: "12", href: "/platform/ngos" },
  { label: "Platform admins", value: "4", href: "/platform/users" },
  { label: "Modules in review", value: "3", href: "/platform/modules" },
  { label: "Open audit events", value: "18", href: "/platform/audit-logs" },
];

const NGO_CARDS = [
  { label: "Active projects", value: "8", href: "/projects" },
  { label: "Workers", value: "46", href: "/workers" },
  { label: "Pending requests", value: "5", href: "/resource-requests" },
  { label: "Low stock items", value: "2", href: "/inventory" },
];

const WORKER_CARDS = [
  { label: "My attendance", value: "Present", href: "/attendance/me" },
  { label: "Assigned sites", value: "2", href: "/my-assignments" },
  { label: "Open requests", value: "1", href: "/resource-requests" },
  { label: "Notifications", value: "3", href: "/notifications" },
];

const DATA_ENTRY_CARDS = [
  { label: "Assigned forms", value: "2", href: "/data-entry" },
  { label: "Records in queue", value: "192", href: "/data-entry" },
  { label: "Notifications", value: "3", href: "/notifications" },
  { label: "My profile", value: "Open", href: "/profile" },
];

export default function DashboardPage() {
  const { persona } = useAccess();
  const cards =
    persona.role === ROLES.PLATFORM_ADMIN
      ? PLATFORM_CARDS
      : persona.role === ROLES.NGO_ADMIN
        ? NGO_CARDS
        : persona.designation === DESIGNATIONS.DATA_ENTRY_OFFICER
          ? DATA_ENTRY_CARDS
          : WORKER_CARDS;

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
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-violet-200 hover:bg-violet-50/40"
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/ngo/workers")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load workers.");
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Workers / Employees</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Create accounts for this NGO only. Designations are not roles — permissions and assignments control access.
          </p>
        </div>
        <Link
          href="/workers/new"
          className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc]"
        >
          Add Worker
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-700">Workers in this NGO</p>
          <p className="text-xs text-slate-400">{loading ? <span className="inline-flex items-center gap-2"><span className="orvix-spinner" />Loading…</span> : `${items.length} total`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Employee ID</th>
                <th className="px-5 py-3 font-semibold">Designation</th>
                <th className="px-5 py-3 font-semibold">Projects / Sites</th>
                <th className="px-5 py-3 font-semibold">Salary</th>
                <th className="px-5 py-3 font-semibold">MFA</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                    No workers yet. Add the first employee for this organization.
                  </td>
                </tr>
              ) : (
                items.map((worker) => (
                  <tr key={worker.id} className="group border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{worker.name}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{worker.email}</p>
                        </div>
                        <Link
                          href={`/workers/${worker.id}`}
                          className="shrink-0 rounded-lg bg-[#2075fe] px-3 py-1.5 text-xs font-semibold text-white opacity-100 transition-opacity hover:bg-[#1a63dc] sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{worker.employeeId || "—"}</td>
                    <td className="px-5 py-4 text-slate-600">{worker.designationLabel}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {[...worker.assignedProjects, ...worker.assignedSites].join(", ") || "Unassigned"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {worker.salary
                        ? `${worker.salary.basicSalary} · ${worker.salary.salaryType === "daily" ? "Daily" : "Monthly"}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{worker.mfaEnabled ? "True" : "False"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          worker.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {worker.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

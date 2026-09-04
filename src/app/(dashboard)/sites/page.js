"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/Components/Projects/ProjectForm";

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ngo/sites")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load sites.");
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
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sites</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Field locations under this NGO’s projects. Workers only see sites assigned to them.
          </p>
        </div>
        <Link
          href="/sites/new"
          className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc]"
        >
          Add Site
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-700">Sites in this NGO</p>
          <p className="text-xs text-slate-400">{loading ? <span className="inline-flex items-center gap-2"><span className="orvix-spinner" />Loading…</span> : `${items.length} total`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Dates</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">
                    No sites yet. Create a project first, then add a site under it.
                  </td>
                </tr>
              ) : (
                items.map((site) => (
                  <tr key={site.id} className="group border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{site.name}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                            {site.description || "No description"}
                          </p>
                        </div>
                        <Link
                          href={`/sites/${site.id}`}
                          className="shrink-0 rounded-lg bg-[#2075fe] px-3 py-1.5 text-xs font-semibold text-white opacity-100 transition-opacity hover:bg-[#1a63dc] sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{site.projectName || "—"}</td>
                    <td className="px-5 py-4 text-slate-600">{site.location || "—"}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {site.startDate || site.endDate ? `${site.startDate || "—"} → ${site.endDate || "—"}` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={site.status} />
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

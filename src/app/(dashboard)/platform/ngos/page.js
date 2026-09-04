"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryLabel, NGO_MODULE_OPTIONS } from "@/lib/ngo-catalog";

function moduleSummary(enabledModules) {
  const ids = new Set(enabledModules ?? []);
  const count = NGO_MODULE_OPTIONS.filter((option) =>
    option.modules.some((moduleId) => ids.has(moduleId))
  ).length;
  return `${count} module group${count === 1 ? "" : "s"}`;
}

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/platform/ngos")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load NGOs.");
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
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">NGOs</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Create an NGO, enable its modules, and assign the first NGO Admin. That admin can only manage this organization.
          </p>
        </div>
        <Link
          href="/platform/ngos/new"
          className="rounded-lg bg-[#2075fe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a63dc]"
        >
          Create NGO
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-700">Registered NGOs</p>
          <p className="text-xs text-slate-400">{loading ? <span className="inline-flex items-center gap-2"><span className="orvix-spinner" />Loading…</span> : `${items.length} total`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">NGO</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">NGO Admin</th>
                <th className="px-5 py-3 font-semibold">Modules</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-400">
                    No NGOs yet. Create the first organization to assign an NGO Admin.
                  </td>
                </tr>
              ) : (
                items.map((ngo) => {
                  const admin = ngo.users?.[0];
                  return (
                    <tr key={ngo.id} className="group border-t border-slate-100 hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{ngo.name}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{ngo.code ?? ngo.id}</p>
                          </div>
                          <Link
                            href={`/platform/ngos/${ngo.id}`}
                            className="shrink-0 rounded-lg bg-[#2075fe] px-3 py-1.5 text-xs font-semibold text-white opacity-100 transition-opacity hover:bg-[#1a63dc] sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{categoryLabel(ngo.category, ngo.categoryOther)}</td>
                      <td className="px-5 py-4">
                        {admin ? (
                          <>
                            <p className="text-slate-800">{admin.name}</p>
                            <p className="text-xs text-slate-400">{admin.email}</p>
                          </>
                        ) : (
                          <span className="text-slate-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{moduleSummary(ngo.enabledModules)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ngo.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {ngo.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

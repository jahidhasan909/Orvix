"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DESIGNATION_PERMISSIONS, WORKER_DESIGNATIONS, WORKER_PERMISSIONS, designationLabel } from "@/lib/worker-catalog";

export default function Page() {
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/ngo/workers")
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load workers.");
        setWorkers(data.items ?? []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const permissionLabel = (id) => WORKER_PERMISSIONS.find((row) => row.id === id)?.label || id;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Permissions / Designations</h2>
        <p className="mt-1 text-sm text-slate-500">
          Designations are not roles. Default module access comes from the designation; extra permissions are set on each worker.
        </p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {WORKER_DESIGNATIONS.map((designation) => {
        const assigned = workers.filter((row) => row.designation === designation.id);
        const defaults = DESIGNATION_PERMISSIONS[designation.id] ?? [];
        return (
          <section key={designation.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">{designation.label}</h3>
              <p className="text-xs text-slate-400">{loading ? "…" : `${assigned.length} workers`}</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Default access: {defaults.length ? defaults.map(permissionLabel).join(", ") : "None"}
            </p>
            {assigned.length ? (
              <ul className="mt-4 divide-y divide-slate-100 text-sm">
                {assigned.map((row) => (
                  <li key={row.id} className="flex justify-between py-2">
                    <Link href={`/workers/${row.id}`} className="font-medium text-[#2075fe]">{row.name}</Link>
                    <span className="text-slate-500">{designationLabel(row.designation, row.designationOther)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No workers with this designation.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

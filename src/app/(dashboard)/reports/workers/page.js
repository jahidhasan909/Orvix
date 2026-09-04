"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/ngo/reports?kind=workers")
      .then(async (response) => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "Could not load report.");
        setData(json);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const designations = Object.entries(data?.byDesignation ?? {});

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Workers Report</h2>
        <p className="mt-1 text-sm text-slate-500">Workforce composition for this NGO.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Total workers</p>
          <p className="mt-2 text-2xl font-semibold">{data?.total ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Assigned to a project</p>
          <p className="mt-2 text-2xl font-semibold">{data?.assigned ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Statuses</p>
          <p className="mt-2 text-sm">{(data?.byStatus ?? []).map((row) => `${row.id}: ${row.count}`).join(" · ") || "—"}</p>
        </div>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">By designation</p>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {designations.length === 0 ? <li className="py-3 text-slate-400">No workers.</li> : designations.map(([label, count]) => (
            <li key={label} className="flex justify-between py-2"><span>{label}</span><span>{count}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

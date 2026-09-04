"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/ngo/reports?kind=operations")
      .then(async (response) => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "Could not load report.");
        setData(json);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const cards = [
    { label: "Workers", value: data?.workers ?? 0 },
    { label: "Sites", value: data?.sites ?? 0 },
    { label: "Pending requests", value: data?.pendingRequests ?? 0 },
    { label: "Open purchase orders", value: data?.openOrders ?? 0 },
    { label: "Pending leave", value: data?.pendingLeave ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Operations Report</h2>
        <p className="mt-1 text-sm text-slate-500">Program and site snapshot for this NGO.</p>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Projects by status</p>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {(data?.projects ?? []).length === 0 ? <li className="py-3 text-slate-400">No projects.</li> : data.projects.map((row) => (
            <li key={row.id} className="flex justify-between py-2 capitalize"><span>{row.id}</span><span>{row.count}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
